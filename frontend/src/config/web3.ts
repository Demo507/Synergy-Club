/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
export const CHAIN_ID = BigInt(11155111); // Sepolia

export const CONTRACT_ABI = [
  "function payRegistrationFee() payable",
  "function completeFinalActivation() payable",
  "function approveApplicant(address applicant)",
  "function expelMember(address member)",
  "function withdrawFunds()",
  "function hasPaidRegistration(address) view returns (bool)",
  "function isApproved(address) view returns (bool)",
  "function isFullyActivated(address) view returns (bool)",
  "function paymentCount() view returns (uint256)",
  "function getPayments(uint256 start, uint256 count) view returns (tuple(address payor, uint64 timestamp, uint8 paymentType, uint128 amount)[])",
];

// Reads go through the user's wallet when it exists (more reliable than a public node),
// and fall back to the public RPC when there is no wallet.
export const readContract = () => {
  const eth = typeof window !== "undefined" ? (window as any).ethereum : undefined;
  const provider = eth
    ? new ethers.BrowserProvider(eth)
    : new ethers.JsonRpcProvider(RPC_URL, 11155111, { staticNetwork: true, batchMaxCount: 1 });
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Ask the wallet to switch to Sepolia (ignored if the user declines)
export async function ensureSepolia() {
  const eth = (window as any).ethereum;
  if (!eth) return;
  try {
    const current = await eth.request({ method: "eth_chainId" });
    if (BigInt(current) !== CHAIN_ID) {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x" + CHAIN_ID.toString(16) }] });
    }
  } catch {
    /* the user can switch the network manually */
  }
}

// Contract connected to the user's wallet, switching MetaMask to Sepolia if needed
export async function writeContract() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask not found");
  let provider = new ethers.BrowserProvider(eth);
  if ((await provider.getNetwork()).chainId !== CHAIN_ID) {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x" + CHAIN_ID.toString(16) }] });
    provider = new ethers.BrowserProvider(eth);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, await provider.getSigner());
}
