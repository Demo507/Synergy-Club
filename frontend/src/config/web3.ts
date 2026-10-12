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

// Read-only contract (no wallet needed)
export const readContract = () =>
  new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, new ethers.JsonRpcProvider(RPC_URL));

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
