import { ethers } from "ethers";

async function main() {
  const hre = await import("hardhat");
  console.log("🚀 Desplegando en Polygon Amoy...\n");

  const MockUSDC = await hre.default.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log("✅ MockUSDC:", await usdc.getAddress());

  const GreenFixFactory = await hre.default.ethers.getContractFactory("GreenFixFactory");
  const factory = await GreenFixFactory.deploy(
    await usdc.getAddress(),
    1000, 3 * 24 * 3600, 1 * 24 * 3600, 7 * 24 * 3600,
    (await hre.default.ethers.getSigners())[0].address
  );
  await factory.waitForDeployment();
  console.log("✅ Factory:", await factory.getAddress());
  
  console.log("\nUSDC_ADDRESS =", await usdc.getAddress());
  console.log("FACTORY_ADDRESS =", await factory.getAddress());
}

main().catch(console.error);