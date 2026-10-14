import "dotenv/config";

const need = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env var: ${k}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: need("MONGO_URI"),
  JWT_SECRET: need("JWT_SECRET"),
  ADMIN_WALLET: need("ADMIN_WALLET").toLowerCase(),
  CONTRACT_ADDRESS: need("CONTRACT_ADDRESS"),
  RPC_URL: process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
