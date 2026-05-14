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
    // USERS
    const usersSnap = await db.collection("users").get();

    let totalUsers = 0;
    let totalRewards = 0;
    let totalReferrals = 0;

    usersSnap.forEach((doc) => {
      const data = doc.data();

      totalUsers += 1;
      totalRewards += data.taskBalance || 0;
      totalReferrals += data.referralCount || 0;
    });

    // TASKS
    const taskSnap = await db.collection("tasks").get();

    const tasks = [];

    taskSnap.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        rewards: totalRewards,
        referrals: totalReferrals,
        tasks: tasks.length,
      },
      tasks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}