import { ethers } from "ethers";
import dotenv from "dotenv";
import db from "./firebaseAdmin";
import stakingAbi from "../../Context/StakingDapp.json";

dotenv.config({ path: ".env.local" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;
const RPC_URL = process.env.RPC_URL;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const stakingContract = new ethers.Contract(CONTRACT_ADDRESS, stakingAbi.abi, provider);

console.log("BACKEND SIGNER ADDRESS:", signer.address);

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

    if (!ethers.utils.isAddress(wallet)) {
      return res.status(400).json({
        success: false,
        error: "Invalid wallet address",
      });
    }

    if (poolId === undefined || poolId === null || Number.isNaN(Number(poolId))) {
      return res.status(400).json({
        success: false,
        error: "Pool missing",
      });
    }

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);

    if (amountWei.lte(0)) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    //const onChainReward = await stakingContract.taskRewards(wallet);
    //if (amountWei.gt(onChainReward)) {
    //  return res.status(400).json({
    //    success: false,
    //    error: "Exceeds reward balance",
    //  });
    //}

    const nonce = Date.now();
    const deadline = Math.floor(Date.now() / 1000) + 600;
    const pool = Number(poolId);

    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [wallet, amountWei, pool, nonce, deadline]
    );

    const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

    const userRef = db.collection("users").doc(wallet);
    const userSnap = await userRef.get();

    let currentTaskBalance = 0;
    let currentReferralBalance = 0;

    if (userSnap.exists) {
      const userData = userSnap.data();
      currentTaskBalance = Number(userData.taskBalance || 0);
      currentReferralBalance = Number(userData.referralBalance || 0);
    }

    //const claimAmount = Number(amount);

    //const newTaskBalance = Math.max(currentTaskBalance - claimAmount, 0);

    //await userRef.set(
      //{
        //taskBalance: newTaskBalance,
      //},
      //{ merge: true }
    //);

    return res.status(200).json({
      success: true,
      pid: pool,
      poolId: pool,
      amount: amountWei.toString(),
      nonce,
      deadline,
      signature,
      fee: "0.002",
      newTaskBalance: currentTaskBalance,
      referralBalance: currentReferralBalance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
}