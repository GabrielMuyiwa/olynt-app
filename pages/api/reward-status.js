import db from "./firebaseAdmin";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res
        .status(400)
        .json({ success: false, error: "Missing wallet" });
    }

    const userRef = db.collection("users").doc(wallet);
    const userSnap = await userRef.get();

    const now = Date.now();
    const todayKey = getDayKeyUTC(now);
    const todayStart = getDayStartUTC(now);
    const todayEnd = getDayEndUTC(now);

    if (!userSnap.exists) {
      return res.status(200).json({
        success: true,
        dailyClaimed: false,
        claimStreak: 0,
        pendingDailyReward: 0,
        taskBalance: 0,
        lastClaimDate: null,
        dailyWindowDate: null,
        windowEndsAt: todayEnd,
        isExpired: false,
      });
    }

    const userData = userSnap.data();

    const lastClaimDate = userData.lastClaimDate || null;
    const lastClaimDayKey = lastClaimDate
      ? new Date(lastClaimDate).toISOString().slice(0, 10)
      : null;

    const isToday = lastClaimDayKey === todayKey;
    const dailyClaimed = Boolean(userData.dailyClaimed && isToday);
    const claimStreak = Number(userData.claimStreak || 0);

    const pendingDailyReward = Number(userData.pendingDailyReward || 0);
    const taskBalance = Number(userData.taskBalance || 0);

    const dailyWindowDate = userData.dailyWindowDate || null;
    const windowDayKey = dailyWindowDate
      ? new Date(dailyWindowDate).toISOString().slice(0, 10)
      : null;

    // Expired means: reward belongs to a previous day OR we are past today's end
    const belongsToPreviousDay =
      windowDayKey && windowDayKey !== todayKey && pendingDailyReward > 0;

    const isExpired =
      belongsToPreviousDay ||
      (now > todayEnd && pendingDailyReward > 0);

    return res.status(200).json({
      success: true,
      dailyClaimed,
      claimStreak,
      pendingDailyReward,
      taskBalance,
      lastClaimDate,
      dailyWindowDate,
      windowEndsAt: todayEnd,
      isExpired,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
}