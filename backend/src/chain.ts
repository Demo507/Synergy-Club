import { ethers } from "ethers";
import { env } from "./env";

const ABI = [
  "function hasPaidRegistration(address) view returns (bool)",
  "function isApproved(address) view returns (bool)",
  "function isFullyActivated(address) view returns (bool)",
];

export const club = new ethers.Contract(env.CONTRACT_ADDRESS, ABI, new ethers.JsonRpcProvider(env.RPC_URL));
