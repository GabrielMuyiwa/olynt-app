import db from "./firebaseAdmin";

const getDayKeyUTC = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ success: false, error: "Missing wallet" });
    }

    const userRef = db.collection("users").doc(wallet);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    const now = Date.now();
    const todayKey = getDayKeyUTC(now);

    const userData = userSnap.data();
    const lastClaimDate = userData.lastClaimDate || null;
    const lastClaimDayKey = lastClaimDate ? new Date(lastClaimDate).toISOString().slice(0, 10) : null;
    const isToday = lastClaimDayKey === todayKey;
    const alreadyClaimedToday = Boolean(userData.dailyClaimed && isToday);

    if (alreadyClaimedToday) {
      return res.status(400).json({
        success: false,
        error: "Already claimed today",
      });
    }

    const oldStreak = Number(userData.claimStreak || 0);
    const newStreak = oldStreak + 1;

    await userRef.set(
      {
        taskBalance: 0,
        pendingDailyReward: 0,
        dailyClaimed: true,
        lastClaimDate: new Date(now).toISOString(),
        claimStreak: newStreak,
      },
      { merge: true }
    );

    return res.status(200).json({
      success: true,
      newTaskBalance: 0,
      claimStreak: newStreak,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
}