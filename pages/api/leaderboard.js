import db from "./firebaseAdmin";   // or "./firebaseAdmin" in same folder

export default async function handler(req, res) {
  try {
    const q = db
      .collection("users")
      .orderBy("referralCount", "desc")
      .limit(20);

    const snapshot = await q.get();

    const leaderboard = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      leaderboard.push({
        wallet: doc.id,
        referralCount: data.referralCount || 0,
        referralEarnings: data.referralEarnings || 0,
      });
    });

    return res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}