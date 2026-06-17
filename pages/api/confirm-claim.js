// pages/api/confirm-claim.js
import db from "./firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { wallet, amount } = req.body;
    if (!wallet || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, error: "Missing data" });
    }

    const claimAmount = Number(amount);
    if (claimAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }

    const userRef = db.collection("users").doc(wallet);
    const userSnap = await userRef.get();

    let currentTaskBalance = 0;
    if (userSnap.exists) {
      const userData = userSnap.data();
      currentTaskBalance = Number(userData.taskBalance || 0);
    }

    const newTaskBalance = Math.max(currentTaskBalance - claimAmount, 0);

    await userRef.set(
      { taskBalance: newTaskBalance },
      { merge: true }
    );

    return res.status(200).json({
      success: true,
      newTaskBalance,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Server error" });
  }
}