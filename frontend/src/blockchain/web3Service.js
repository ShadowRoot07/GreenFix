import { ethers } from "ethers";
import { NETWORK_INFO, CONTRACTS } from "./contractsConfig";
import GreenFixFactoryABI from "./abis/GreenFixFactory.json";
import GreenFixProjectABI from "./abis/GreenFixProject.json";
import MockUSDCABI from "./abis/MockUSDC.json";

// USDC y el token del proyecto usan 6 decimales en el MVP.
export const USDC_DECIMALS = 6;

// El orden DEBE coincidir con libraries/ProjectState.sol
export const STATE_LABELS = [
  "Funding",
  "Active",
  "Voting",
  "Refunding",
  "Completed",
  "Cancelled",
  "Defaulted",
];

const FACTORY_ABI = GreenFixFactoryABI.abi;
const PROJECT_ABI = GreenFixProjectABI.abi;
const USDC_ABI = MockUSDCABI.abi;

// ─────────────────────────── Helpers de unidades ───────────────────────────
export const toUSDC = (value) => ethers.parseUnits(String(value), USDC_DECIMALS);
export const fromUSDC = (value) => Number(ethers.formatUnits(value, USDC_DECIMALS));

// ─────────────────────────── Providers / Signer ───────────────────────────
function hasWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Provider de SOLO LECTURA: pega directo al nodo local por RPC.
 * No requiere MetaMask, así el dashboard puede cargar proyectos sin wallet.
 */
export function getReadProvider() {
  return new ethers.JsonRpcProvider(NETWORK_INFO.rpcUrls[0]);
}

export async function getProvider() {
  if (!hasWallet()) throw new Error("MetaMask no está instalado");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

/**
 * Asegura que MetaMask esté en la red local de Hardhat; si no existe, la agrega.
 */
export async function ensureNetwork() {
  if (!hasWallet()) throw new Error("MetaMask no está instalado");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK_INFO.chainId }],
    });
  } catch (switchError) {
    // 4902 = la cadena no está agregada en MetaMask → la añadimos.
    if (switchError.code === 4902 || switchError.code === -32603) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: NETWORK_INFO.chainId,
            chainName: NETWORK_INFO.chainName,
            nativeCurrency: NETWORK_INFO.nativeCurrency,
            rpcUrls: NETWORK_INFO.rpcUrls,
            blockExplorerUrls: NETWORK_INFO.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export async function connectMetaMask() {
  if (!hasWallet()) throw new Error("MetaMask no está instalado");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureNetwork();
  return accounts[0];
}

// ─────────────────────────── Fábricas de contratos ───────────────────────────
async function factoryWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, FACTORY_ABI, signer);
}
function factoryReadOnly() {
  return new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, FACTORY_ABI, getReadProvider());
}
async function usdcWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.USDC_ADDRESS, USDC_ABI, signer);
}
function usdcReadOnly() {
  return new ethers.Contract(CONTRACTS.USDC_ADDRESS, USDC_ABI, getReadProvider());
}
async function projectWithSigner(address) {
  const signer = await getSigner();
  return new ethers.Contract(address, PROJECT_ABI, signer);
}
function projectReadOnly(address) {
  return new ethers.Contract(address, PROJECT_ABI, getReadProvider());
}

// ─────────────────────────── USDC (faucet / balances) ───────────────────────────
export async function getUsdcBalance(address) {
  if (!address) return 0;
  const usdc = usdcReadOnly();
  return fromUSDC(await usdc.balanceOf(address));
}

/** Faucet de demo: acuña USDC de prueba a la cuenta conectada. */
export async function mintUsdc(amount) {
  const usdc = await usdcWithSigner();
  const signer = await getSigner();
  const to = await signer.getAddress();
  const tx = await usdc.mint(to, toUSDC(amount));
  await tx.wait();
  return tx.hash;
}

async function ensureAllowance(usdc, owner, spender, needed) {
  const current = await usdc.allowance(owner, spender);
  if (current < needed) {
    const tx = await usdc.approve(spender, needed);
    await tx.wait();
  }
}

// ─────────────────────────── Crear proyecto ───────────────────────────
/**
 * Crea el proyecto on-chain y deposita la garantía del 5%.
 * @returns {{ txHash: string, projectAddress: string }}
 */
export async function createProject(fundingGoal, interestBps, durationDays, repaymentInterval, metadataURI) {
  const factory = await factoryWithSigner();
  const usdc = await usdcWithSigner();
  const signer = await getSigner();
  const owner = await signer.getAddress();

  const goal = toUSDC(fundingGoal);
  const guarantee = (goal * 5n) / 100n;

  // 1. Crear proyecto
  const txCreate = await factory.createProject(
    goal,
    interestBps,
    durationDays,
    repaymentInterval,
    metadataURI
  );
  const receipt = await txCreate.wait();

  // 2. Extraer la dirección del proyecto del evento ProjectCreated
  let projectAddress = null;
  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);
      if (parsed && parsed.name === "ProjectCreated") {
        projectAddress = parsed.args[2];
        break;
      }
    } catch {
      /* log de otro contrato, ignorar */
    }
  }
  if (!projectAddress) throw new Error("No se pudo obtener la dirección del proyecto");

  // 3. Depositar garantía (approve al proyecto + depositGuarantee)
  const project = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
  await ensureAllowance(usdc, owner, projectAddress, guarantee);
  const txGuarantee = await project.depositGuarantee();
  await txGuarantee.wait();

  return { txHash: receipt.hash, projectAddress };
}

// ─────────────────────────── Acciones de inversor ───────────────────────────
export async function invest(projectAddress, amount) {
  const signer = await getSigner();
  const owner = await signer.getAddress();
  const project = await projectWithSigner(projectAddress);
  const usdc = await usdcWithSigner();

  const parsed = toUSDC(amount);
  await ensureAllowance(usdc, owner, projectAddress, parsed);
  const tx = await project.invest(parsed);
  await tx.wait();
  return tx.hash;
}

export async function vote(projectAddress, milestoneId, support) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.vote(milestoneId, support);
  await tx.wait();
  return tx.hash;
}

export async function claimRewards(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.claimRewards();
  await tx.wait();
  return tx.hash;
}

export async function claimRefund(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.claimRefund();
  await tx.wait();
  return tx.hash;
}

// ─────────────────────────── Acciones de creador ───────────────────────────
export async function finalizeFunding(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.finalizeFunding();
  await tx.wait();
  return tx.hash;
}

export async function requestMilestoneRelease(projectAddress, evidenceURI) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.requestMilestoneRelease(evidenceURI);
  await tx.wait();
  return tx.hash;
}

export async function finalizeVoting(projectAddress, milestoneId) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.finalizeVoting(milestoneId);
  await tx.wait();
  return tx.hash;
}

export async function makeRepayment(projectAddress, repaymentIndex) {
  const signer = await getSigner();
  const owner = await signer.getAddress();
  const project = await projectWithSigner(projectAddress);
  const usdc = await usdcWithSigner();

  const repayment = await project.repayments(repaymentIndex);
  await ensureAllowance(usdc, owner, projectAddress, repayment.amount);
  const tx = await project.makeRepayment(repaymentIndex);
  await tx.wait();
  return tx.hash;
}

export async function cancelFunding(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.cancelFunding();
  await tx.wait();
  return tx.hash;
}

export async function activateRefunds(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.activateRefunds();
  await tx.wait();
  return tx.hash;
}

export async function triggerDefaultVote(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.triggerDefaultVote();
  await tx.wait();
  return tx.hash;
}

// ─────────────────────────── Lecturas on-chain ───────────────────────────
/**
 * Lee el estado completo de un proyecto desde la cadena.
 */
export async function getProjectSummary(projectAddress) {
  const project = projectReadOnly(projectAddress);

  const [stateRaw, totalRaised, currentMilestone, creator, guaranteeDeposited, config, tokenAddress] =
    await Promise.all([
      project.state(),
      project.totalRaised(),
      project.currentMilestone(),
      project.creator(),
      project.guaranteeDeposited(),
      project.config(),
      project.projectToken(),
    ]);

  // Supply total del token del proyecto = total de USDC invertido (mint 1:1).
  // Se usa para calcular el quórum y el peso proporcional de cada voto (ballenas).
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ["function totalSupply() view returns (uint256)"],
    getReadProvider()
  );
  const tokenTotalSupply = fromUSDC(await tokenContract.totalSupply());

  const milestoneCount = Number(await project.getMilestoneCount());
  const milestones = [];
  for (let i = 0; i < milestoneCount; i++) {
    const m = await project.milestones(i);
    milestones.push({
      id: i,
      percentage: Number(m.percentage),
      amount: fromUSDC(m.amount),
      released: m.released,
      votingActive: m.votingActive,
      voteStart: Number(m.voteStart),
      voteEnd: Number(m.voteEnd),
      votesFor: fromUSDC(m.votesFor),
      votesAgainst: fromUSDC(m.votesAgainst),
      evidenceURI: m.evidenceURI,
    });
  }

  const repaymentCount = Number(await project.getRepaymentCount());
  const repayments = [];
  for (let i = 0; i < repaymentCount; i++) {
    const r = await project.repayments(i);
    repayments.push({
      id: i,
      dueDate: Number(r.dueDate),
      amount: fromUSDC(r.amount),
      paid: r.paid,
    });
  }

  const stateIndex = Number(stateRaw);
  const fundingGoal = fromUSDC(config.fundingGoal);

  return {
    contractAddress: projectAddress,
    state: stateIndex,
    status: STATE_LABELS[stateIndex] || "Desconocido",
    creator,
    guaranteeDeposited,
    goal: fundingGoal,
    raised: fromUSDC(totalRaised),
    interest: Number(config.interestBps) / 100,
    currentMilestone: Number(currentMilestone),
    tokenTotalSupply,
    milestones,
    repayments,
  };
}

/**
 * Devuelve los datos del usuario respecto a un proyecto (tokens, claims).
 */
export async function getInvestorPosition(projectAddress, account) {
  if (!account) return { tokens: 0, isInvestor: false, hasClaimedRefund: false };
  const project = projectReadOnly(projectAddress);
  const token = await project.projectToken();
  const tokenContract = new ethers.Contract(
    token,
    ["function balanceOf(address) view returns (uint256)"],
    getReadProvider()
  );
  const [balance, isInvestor, hasClaimedRefund] = await Promise.all([
    tokenContract.balanceOf(account),
    project.isInvestor(account),
    project.hasClaimedRefund(account),
  ]);
  return {
    tokens: fromUSDC(balance),
    isInvestor,
    hasClaimedRefund,
  };
}

/**
 * Lista todos los proyectos creados en el Factory con su estado on-chain.
 */
export async function getAllProjects() {
  const factory = factoryReadOnly();
  const count = Number(await factory.projectCount());

  const projects = [];
  for (let id = 1; id <= count; id++) {
    try {
      const info = await factory.getProject(id);
      const [projectAddress, creator, fundingGoal, createdAt, metadataURI] = info;
      const summary = await getProjectSummary(projectAddress);
      projects.push({
        projectId: id,
        contractAddress: projectAddress,
        creator,
        createdAt: Number(createdAt),
        metadataURI,
        ...summary,
      });
    } catch (e) {
      console.warn(`No se pudo leer el proyecto ${id}:`, e.message);
    }
  }
  return projects;
}
