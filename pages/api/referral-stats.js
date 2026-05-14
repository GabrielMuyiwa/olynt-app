import db from "./firebaseAdmin";   // Admin SDK Firestore

export default async function handler(req, res) {
  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({
        error: "Missing wallet",
      });
    }

    // Admin SDK style
    const userRef = db.collection("users").doc(wallet);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.json({
        referrals: 0,
        referralEarnings: 0,
        withdrawn: 0,
      });
    }

    const data = snap.data();

    return res.json({
      referrals: data.referralCount || 0,
      referralEarnings: data.referralEarnings || 0,
      withdrawn: data.withdrawnReferral || 0,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}