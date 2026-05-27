import { ethers } from "ethers";
import { NETWORK_INFO, CONTRACTS } from "./contractsConfig";
import GreenFixFactoryABI from "./abis/GreenFixFactory.json";
import GreenFixProjectABI from "./abis/GreenFixProject.json";
import MockUSDCABI from "./abis/MockUSDC.json";

// ─── CONEXIÓN WALLET ───
export async function connectMetaMask() {
  if (!window.ethereum) throw new Error("MetaMask no está instalado");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

export async function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask no está instalado");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

// ─── FACTORY ───
export async function getFactoryContract() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, GreenFixFactoryABI.abi, signer);
}

// ─── USDC ───
export async function getUSDCContract() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.USDC_ADDRESS, MockUSDCABI.abi, signer);
}

// ─── CREAR PROYECTO ───
export async function createProject(fundingGoal, interestBps, durationDays, repaymentInterval, metadataURI) {
  const factory = await getFactoryContract();
  const usdc = await getUSDCContract();
  const signer = await getSigner();
  
  const guarantee = ethers.parseUnits(String(Number(fundingGoal) * 0.05), 6);
  
  // 1. Aprobar USDC para la garantía
  const tx1 = await usdc.approve(CONTRACTS.FACTORY_ADDRESS, guarantee);
  await tx1.wait();
  
  // 2. Crear proyecto
  const tx2 = await factory.createProject(
    ethers.parseUnits(fundingGoal, 6),
    interestBps,
    durationDays,
    repaymentInterval,
    metadataURI
  );
  const receipt = await tx2.wait();
  
  // Obtener dirección del proyecto
  const event = receipt.logs.find(log => {
    try { return factory.interface.parseLog(log); } catch { return null; }
  });
  const projectAddress = event?.args?.projectAddress;
  
  // 3. Depositar garantía
  const project = new ethers.Contract(projectAddress, GreenFixProjectABI.abi, signer);
  await usdc.approve(projectAddress, guarantee);
  await project.depositGuarantee();
  
  return { txHash: receipt.hash, projectAddress };
}
// ─── INVERTIR ───
export async function invest(projectAddress, amount) {
  const signer = await getSigner();
  const project = new ethers.Contract(projectAddress, GreenFixProjectABI.abi, signer);
  const usdc = await getUSDCContract();
  
  const parsedAmount = ethers.parseUnits(String(amount), 6);
  
  // 1. Aprobar USDC
  const tx1 = await usdc.approve(projectAddress, parsedAmount);
  await tx1.wait();
  
  // 2. Invertir
  const tx2 = await project.invest(parsedAmount);
  await tx2.wait();
  
  return tx2.hash;
}

// ─── VOTAR ───
export async function vote(projectAddress, milestoneId, support) {
  const signer = await getSigner();
  const project = new ethers.Contract(projectAddress, GreenFixProjectABI.abi, signer);
  
  const tx = await project.vote(milestoneId, support);
  await tx.wait();
  
  return tx.hash;
}