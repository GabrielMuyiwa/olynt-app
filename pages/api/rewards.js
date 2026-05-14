import { ethers } from "ethers";
import db from "./firebaseAdmin";  // Admin SDK Firestore


// 🔐 ENV
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// 🚫 SIMPLE RATE LIMIT (memory-based)
const requestMap = new Map();
const RATE_LIMIT_SECONDS = 10;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userAddress, amount } = req.body;

    if (!userAddress || !amount) {
      return res.status(400).json({ error: "Missing params" });
    }

    // =========================
    // 🚫 RATE LIMIT PROTECTION
    // =========================
    const now = Date.now();
    const lastRequest = requestMap.get(userAddress);

    if (lastRequest && now - lastRequest < RATE_LIMIT_SECONDS * 1000) {
      return res.status(429).json({
        error: "Too many requests. Wait a few seconds.",
      });
    }

    requestMap.set(userAddress, now);

    // =========================
    // 🔍 FETCH USER DATA
    // =========================
    const userRef = db.collection("users").doc(userAddress);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.status(400).json({ error: "User not found" });
    }

    const userData = snap.data();
    const dbBalance = userData.taskBalance || 0;

    // =========================
    // 🚫 VALIDATION
    // =========================
    if (dbBalance <= 0) {
      return res.status(400).json({ error: "No rewards" });
    }

    if (Number(amount) !== Number(dbBalance)) {
      return res.status(400).json({
        error: "Invalid amount (tampering detected)",
      });
    }

    // =========================
    // 🔐 SIGN MESSAGE
    // =========================
    const wallet = new ethers.Wallet(PRIVATE_KEY);

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, ethers.utils.parseUnits(amount.toString(), 18)]
    );

    const signature = await wallet.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    // =========================
    // 🔥 RESET BALANCE (IMPORTANT)
    // =========================
    await userRef.update({
      taskBalance: 0,
    });

    // =========================
    // ✅ RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      signature,
      amount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}