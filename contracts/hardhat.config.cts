import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Nodo local de Hardhat (el que se levanta con `npx hardhat node`).
    // chainId 31337 es el por defecto de Hardhat.
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Red en proceso (para tests rápidos sin nodo aparte).
    hardhat: {
      chainId: 31337,
    },
    // Testnet pública (opcional, queda para el futuro).
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
  },
};

export default config;
