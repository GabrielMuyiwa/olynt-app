import db from "./firebaseAdmin";   // Admin SDK db
import { ethers } from "ethers";   // remove client Firestore helpers


const PRIVATE_KEY = process.env.PRIVATE_KEY;


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ error: "Wallet required" });
    }

    // ✅ Admin SDK pattern — no "doc(db, ...)"
    const userRef = db.collection("users").doc(wallet);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = snap.data();

    const referralBalance = user.referralEarnings || 0;

    if (referralBalance <= 0) {
      return res.status(400).json({ error: "No referral earnings" });
    }

    // reset referral earnings
    await updateDoc(userRef, {
      referralEarnings: 0,
      totalEarned: (user.totalEarned || 0) + referralBalance,
    });

    return res.json({
      success: true,
      withdrawn: referralBalance,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}