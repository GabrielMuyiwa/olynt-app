import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(PRIVATE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { wallet, poolId, amount } = req.body;

    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: "Wallet missing",
      });
    }

    if (poolId === undefined || poolId === null) {
      return res.status(400).json({
        success: false,
        error: "Pool missing",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    const nonce = Date.now();
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [wallet, amountWei, poolId, nonce, deadline]
    );

    const signature = await signer.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    return res.status(200).json({
      success: true,
      pid: poolId,
      poolId,
      amount,
      nonce,
      deadline,
      signature,
      fee: "0.002",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
}