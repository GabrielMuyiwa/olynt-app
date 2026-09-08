import { ethers } from "ethers";
import dotenv from "dotenv";
import db from "./firebaseAdmin";
import stakingAbi from "../../Context/StakingDapp.json";

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set in .env.local");
}

dotenv.config({ path: ".env.local" });

let provider;
let adminWallet;
let stakingContract;

function getContract() {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }
  if (!adminWallet) {
    adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  }
  if (!stakingContract) {
    stakingContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_STAKING_DAPP,
      stakingAbi.abi,
      adminWallet
    );
  }
  return stakingContract;
}

function getSigner() {
  if (!adminWallet) {
    // This will initialize adminWallet via getContract()
    getContract();
  }
  return adminWallet;
}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;
const RPC_URL = process.env.RPC_URL;

//const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
//const signer = new ethers.Wallet(PRIVATE_KEY, provider);
//const stakingContract = new ethers.Contract(
  //CONTRACT_ADDRESS,
  //stakingAbi.abi,
  //provider
//);

const getDayStartUTC = (ms = Date.now()) => {
  const d = new Date(ms);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

const getDayEndUTC = (ms = Date.now()) => {
  const d = new Date(ms);
  d.setUTCHours(23, 59, 59, 999);
  return d.getTime();
};

const getDayKeyUTC = (ms = Date.now()) =>
  new Date(ms).toISOString().slice(0, 10);

const getStreakMultiplier = (streak) => {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.3;
  if (streak >= 7) return 1.2;
  if (streak >= 3) return 1.1;
  return 1.0;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { wallet, poolId, amount } = req.body;

    if (!wallet) {
      return res
        .status(400)
        .json({ success: false, error: "Wallet missing" });
    }

    if (!ethers.utils.isAddress(wallet)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid wallet address" });
    }

    if (
      poolId === undefined ||
      poolId === null ||
      Number.isNaN(Number(poolId))
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Pool missing" });
    }

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid amount" });
    }

    const userRef = db.collection("users").doc(wallet);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res
        .status(400)
        .json({ success: false, error: "User not found" });
    }

    const userData = userSnap.data();
    const now = Date.now();
    const todayKey = getDayKeyUTC(now);
    const todayEnd = getDayEndUTC(now);

    const lastClaimDate = userData.lastClaimDate || null;
    const lastClaimDayKey = lastClaimDate
      ? new Date(lastClaimDate).toISOString().slice(0, 10)
      : null;
    const isToday = lastClaimDayKey === todayKey;
    const dailyClaimed = Boolean(userData.dailyClaimed && isToday);

    if (dailyClaimed) {
      return res.status(400).json({
        success: false,
        error: "You have already claimed today",
      });
    }

    // If we are past today's UTC end, expire any pending reward
    if (now > todayEnd) {
      await userRef.update({
        pendingDailyReward: 0,
        taskBalance: 0,
        dailyClaimed: false,
      });
      return res.status(400).json({
        success: false,
        error: "Daily reward window has expired",
      });
    }

    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);

    if (amountWei.lte(0)) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    const pendingDailyReward = Number(userData.pendingDailyReward || 0);
    const taskBalance = Number(userData.taskBalance || 0);
    const claimable =
      pendingDailyReward > 0 ? pendingDailyReward : taskBalance;

    if (Number(amount) !== Number(claimable)) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount (tampering detected)",
      });
    }

    const nonce = Date.now();
    const deadline = Math.floor(Date.now() / 1000) + 600;
    const pool = Number(poolId);

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [wallet, amountWei, pool, nonce, deadline]
    );

    const signer = getSigner();
    const signature = await signer.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    // For now, simple streak increment; later we can refine with missed-day logic
    const oldStreak = Number(userData.claimStreak || 0);
    const newStreak = oldStreak + 1;
    const multiplier = getStreakMultiplier(newStreak);

    await userRef.update({
      dailyClaimed: true,
      lastClaimDate: new Date(now).toISOString(),
      claimStreak: newStreak,
      pendingDailyReward: 0,
      taskBalance: 0,
    });

    return res.status(200).json({
      success: true,
      pid: pool,
      poolId: pool,
      amount: amountWei.toString(),
      nonce,
      deadline,
      signature,
      fee: "0.000005",
      claimStreak: newStreak,
      streakMultiplier: multiplier,
      windowEndsAt: todayEnd,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
}