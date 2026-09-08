import { ethers } from "ethers";
import db from "./firebaseAdmin";

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set in .env.local");
}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const requestMap = new Map();
const RATE_LIMIT_SECONDS = 10;

const getDayKey = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);
const getDayStart = (ms = Date.now()) => {
  const d = new Date(ms);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};
const getDayEnd = (ms = Date.now()) => getDayStart(ms) + 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userAddress, amount } = req.body;

    if (!userAddress || amount === undefined || amount === null) {
      return res.status(400).json({ error: "Missing params" });
    }

    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const now = Date.now();
    const lastRequest = requestMap.get(userAddress);

    if (lastRequest && now - lastRequest < RATE_LIMIT_SECONDS * 1000) {
      return res.status(429).json({ error: "Too many requests. Wait a few seconds." });
    }

    requestMap.set(userAddress, now);

    const userRef = db.collection("users").doc(userAddress);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.status(400).json({ error: "User not found" });
    }

    const userData = snap.data();
    const dbBalance = Number(userData.taskBalance || 0);
    const pendingDailyReward = Number(userData.pendingDailyReward || 0);
    const dailyClaimed = Boolean(userData.dailyClaimed || false);

    const today = getDayKey(now);
    const windowDate = userData.dailyWindowDate || today;
    const windowEndsAt = Number(userData.dailyWindowEndsAt || getDayEnd(now));

    if (now > windowEndsAt) {
      await userRef.update({
        taskBalance: 0,
        pendingDailyReward: 0,
        dailyClaimed: false,
      });
      return res.status(400).json({ error: "Daily reward expired" });
    }

    if (windowDate !== today) {
      await userRef.update({
        taskBalance: 0,
        pendingDailyReward: 0,
        dailyClaimed: false,
        dailyWindowDate: today,
        dailyWindowOpenedAt: getDayStart(now),
        dailyWindowEndsAt: getDayEnd(now),
      });
      return res.status(400).json({ error: "No active reward window" });
    }

    if (dailyClaimed) {
      return res.status(400).json({ error: "Reward already claimed today" });
    }

    if (dbBalance <= 0 && pendingDailyReward <= 0) {
      return res.status(400).json({ error: "No rewards" });
    }

    const claimAmount = Number(amount);
    const claimable = pendingDailyReward > 0 ? pendingDailyReward : dbBalance;

    if (claimAmount !== Number(claimable)) {
      return res.status(400).json({ error: "Invalid amount (tampering detected)" });
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [userAddress, ethers.utils.parseUnits(claimAmount.toString(), 18)]
    );

    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    await userRef.update({
      taskBalance: 0,
      pendingDailyReward: 0,
      dailyClaimed: true,
      lastClaimAndStakeAt: now,
    });

    return res.status(200).json({
      success: true,
      signature,
      amount: claimAmount,
      dailyWindowDate: today,
      dailyWindowEndsAt: windowEndsAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}