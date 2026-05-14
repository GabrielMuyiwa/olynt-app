import db from "../firebaseAdmin"; // Admin SDK Firestore

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

export default async function handler(req, res) {
  // =========================
  // ADMIN SECURITY
  // =========================
  const adminWallet = req.headers["x-admin-wallet"]?.toLowerCase();

  if (!adminWallet || adminWallet !== ADMIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const usersSnap = await db.collection("users").get();

    let totalUsers = 0;
    let totalRewards = 0;
    let totalTasks = 0;
    let totalReferrals = 0;

    let leaderboard = [];

    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();

      totalUsers++;

      totalRewards += Number(data.totalEarned || 0);
      totalTasks += Number(data.dailyCount || 0);
      totalReferrals += Number(data.referrals || 0);

      leaderboard.push({
        wallet: docSnap.id,
        earned: Number(data.totalEarned || 0),
      });
    });

    leaderboard.sort((a, b) => b.earned - a.earned);
    leaderboard = leaderboard.slice(0, 10);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalRewards,
        totalTasks,
        leaderboard,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
}