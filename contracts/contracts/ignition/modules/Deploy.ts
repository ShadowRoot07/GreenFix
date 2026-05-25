import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m: any) => {
  // 1. Desplegar MockUSDC
  const usdc = m.contract("MockUSDC");

  // 2. Desplegar Factory con USDC como parámetro
  const factory = m.contract("GreenFixFactory", [
    usdc,                    // _usdc
    1000,                    // platform fee (10%)
    3 * 24 * 3600,           // voting duration
    1 * 24 * 3600,           // grace period
    7 * 24 * 3600,           // claim period
    m.getAccount(0),         // fee collector (tu wallet)
  ]);

  return { usdc, factory };
});

export default DeployModule;