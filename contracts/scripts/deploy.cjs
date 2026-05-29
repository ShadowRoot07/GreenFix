/**
 * Despliegue local de GreenFix sobre el nodo de Hardhat.
 *
 * Hace todo lo necesario para tener el demo funcionando de punta a punta:
 *   1. Despliega MockUSDC (6 decimales, como el USDC real).
 *   2. Reparte USDC de prueba a las primeras cuentas de Hardhat (faucet inicial).
 *   3. Despliega GreenFixFactory con parámetros pensados para una demo local.
 *   4. Sincroniza direcciones y ABIs hacia el frontend automáticamente.
 *   5. Guarda un deployments.json con el resumen del despliegue.
 *
 * Uso:  npm run deploy:local   (equivale a: hardhat run scripts/deploy.cjs --network localhost)
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// ── Parámetros de la demo (en segundos / basis points) ──
const PLATFORM_FEE_BPS = 1000; // 10% de comisión sobre intereses
const VOTING_DURATION = 24 * 60 * 60; // 1 día para votar milestones
const GRACE_PERIOD = 24 * 60 * 60; // 1 día de gracia antes de default
const CLAIM_PERIOD = 7 * 24 * 60 * 60; // 7 días para reclamar reembolsos

// USDC inicial repartido a cada cuenta de prueba (1,000,000 USDC, 6 decimales)
const FAUCET_AMOUNT = 1_000_000n * 1_000_000n;
const FAUCET_ACCOUNTS = 5;

async function main() {
  const { ethers, network } = hre;
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("\n🚀 Desplegando GreenFix en red local:", network.name);
  console.log("👤 Deployer:", deployer.address);

  // 1. MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC:", usdcAddress);

  // 2. Faucet inicial a las primeras cuentas de prueba
  const faucetTargets = signers.slice(0, FAUCET_ACCOUNTS);
  for (const account of faucetTargets) {
    const tx = await usdc.mint(account.address, FAUCET_AMOUNT);
    await tx.wait();
  }
  console.log(
    `💧 Repartidos ${FAUCET_AMOUNT / 1_000_000n} USDC a ${faucetTargets.length} cuentas de prueba`
  );

  // 3. GreenFixFactory
  const GreenFixFactory = await ethers.getContractFactory("GreenFixFactory");
  const factory = await GreenFixFactory.deploy(
    usdcAddress,
    PLATFORM_FEE_BPS,
    VOTING_DURATION,
    GRACE_PERIOD,
    CLAIM_PERIOD,
    deployer.address // feeCollector
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ GreenFixFactory:", factoryAddress);

  // 4. Sincronizar con el frontend
  syncFrontend({ usdcAddress, factoryAddress, chainId: network.config.chainId });

  // 5. Guardar resumen del despliegue
  const deployment = {
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MockUSDC: usdcAddress,
      GreenFixFactory: factoryAddress,
    },
    params: {
      platformFeeBps: PLATFORM_FEE_BPS,
      votingDuration: VOTING_DURATION,
      gracePeriod: GRACE_PERIOD,
      claimPeriod: CLAIM_PERIOD,
    },
    faucetAccounts: faucetTargets.map((a) => a.address),
  };
  fs.writeFileSync(
    path.join(__dirname, "..", "deployments.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n📋 Resumen:");
  console.log("   USDC_ADDRESS    =", usdcAddress);
  console.log("   FACTORY_ADDRESS =", factoryAddress);
  console.log("\n✨ Frontend sincronizado. Listo para 'npm run dev' en /frontend.\n");
}

/**
 * Escribe contractsConfig.js y copia los ABIs compilados al frontend.
 */
function syncFrontend({ usdcAddress, factoryAddress, chainId }) {
  const frontendDir = path.join(__dirname, "..", "..", "frontend", "src", "blockchain");
  const abisDir = path.join(frontendDir, "abis");
  fs.mkdirSync(abisDir, { recursive: true });

  // 4a. contractsConfig.js
  const chainIdHex = "0x" + Number(chainId || 31337).toString(16);
  const configContent = `// ⚠️ Archivo generado automáticamente por contracts/scripts/deploy.cjs
// No editar a mano: se sobreescribe en cada despliegue local.
export const CONTRACTS = {
  FACTORY_ADDRESS: "${factoryAddress}",
  USDC_ADDRESS: "${usdcAddress}",
};

export const NETWORK_INFO = {
  chainId: "${chainIdHex}",
  chainName: "Hardhat Local",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["http://127.0.0.1:8545"],
  blockExplorerUrls: [],
};
`;
  fs.writeFileSync(path.join(frontendDir, "contractsConfig.js"), configContent);
  console.log("🔗 Frontend: contractsConfig.js actualizado");

  // 4b. Copiar ABIs (el artifact completo incluye el campo .abi que usa el frontend)
  const artifacts = {
    "GreenFixFactory.json": "contracts/core/GreenFixFactory.sol/GreenFixFactory.json",
    "GreenFixProject.json": "contracts/core/GreenFixProject.sol/GreenFixProject.json",
    "MockUSDC.json": "contracts/mocks/MockUSDC.sol/MockUSDC.json",
  };
  const artifactsRoot = path.join(__dirname, "..", "artifacts");
  for (const [destName, relPath] of Object.entries(artifacts)) {
    const src = path.join(artifactsRoot, relPath);
    if (!fs.existsSync(src)) {
      console.warn(`⚠️  No se encontró el artifact ${relPath}. ¿Ejecutaste 'npm run compile'?`);
      continue;
    }
    const artifact = JSON.parse(fs.readFileSync(src, "utf8"));
    // Guardamos solo lo que el frontend necesita: abi (+ bytecode por si acaso).
    fs.writeFileSync(
      path.join(abisDir, destName),
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
  }
  console.log("🔗 Frontend: ABIs copiados");
}

main().catch((error) => {
  console.error("❌ Error en el despliegue:", error);
  process.exitCode = 1;
});
