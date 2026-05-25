import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Desplegando en Polygon Amoy...\n");

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log("✅ MockUSDC:", await usdc.getAddress());

  const GreenFixFactory = await ethers.getContractFactory("GreenFixFactory");
  const factory = await GreenFixFactory.deploy(
    await usdc.getAddress(),
    1000, 3 * 24 * 3600, 1 * 24 * 3600, 7 * 24 * 3600,
    (await ethers.getSigners())[0].address
  );
  await factory.waitForDeployment();
  console.log("✅ Factory:", await factory.getAddress());

  console.log("\n📋 COPIAR AL FRONTEND:");
  console.log(`USDC_ADDRESS = "${await usdc.getAddress()}"`);
  console.log(`FACTORY_ADDRESS = "${await factory.getAddress()}"`);
}

main().catch(console.error);