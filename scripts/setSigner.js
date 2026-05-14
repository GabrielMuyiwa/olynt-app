import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // ✅ Your .env.local loader

import { ethers } from "ethers";
import stakingAbi from "../context/StakingDapp.json" assert { type: "json" };

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  console.log("🔍 RPC_URL:", !!RPC_URL);
  console.log("🔍 PRIVATE_KEY length:", PRIVATE_KEY?.length);
  console.log("🔍 CONTRACT_ADDRESS:", !!CONTRACT_ADDRESS);

  if (!PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY missing in .env.local");
  if (!RPC_URL) throw new Error("❌ RPC_URL missing in .env.local");
  if (!CONTRACT_ADDRESS) throw new Error("❌ CONTRACT_ADDRESS missing in .env.local");

  // ✅ Your ethers v5 provider
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    stakingAbi.abi,
    wallet
  );

  console.log("🌉 Setting signer:", wallet.address);

  // 🔧 FIX: Custom gas for Polygon Amoy (25+ Gwei required)
  const tx = await contract.setSigner(wallet.address, {
    gasPrice: ethers.utils.parseUnits("30", "gwei"),  // 30 Gwei (safe high)
    gasLimit: 200000  // Conservative limit
  });

  await tx.wait();

  console.log("✅ Signer set successfully!");
  console.log("🔗 Tx Hash:", tx.hash);
  console.log("🔗 Explorer:", `https://amoy.polygonscan.com/tx/${tx.hash}`);
}

main().catch((error) => {
  console.error("💥 ERROR:", error);
});