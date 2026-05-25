import { ethers } from "ethers";
import { NETWORK_INFO, POLYGON_AMOY_CHAIN_ID } from "./contractsConfig";

export async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error("MetaMask no está instalado");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask no está instalado");
  }

  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getChainId() {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  return Number(network.chainId);
}

export async function isAmoyNetwork() {
  const chainId = await getChainId();
  return chainId === POLYGON_AMOY_CHAIN_ID;
}

export async function switchToAmoy() {
  if (!window.ethereum) {
    throw new Error("MetaMask no está instalado");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK_INFO.chainId }],
    });
  } catch {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [NETWORK_INFO],
    });
  }
}

export async function investOnChain() {
  alert("Preparado para conectar con GreenFixProject.invest()");
}

export async function voteOnChain() {
  alert("Preparado para conectar con GreenFixProject.vote()");
}
