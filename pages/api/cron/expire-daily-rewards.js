import db from "../firebaseAdmin";

const getDayKeyUTC = (ms = Date.now()) =>
  new Date(ms).toISOString().slice(0, 10);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const now = Date.now();
    const todayKey = getDayKeyUTC(now);

    const usersSnap = await db.collection("users").get();
    let updated = 0;

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const pendingDailyReward = Number(data.pendingDailyReward || 0);
      const taskBalance = Number(data.taskBalance || 0);

      // Skip users with no reward
      if (pendingDailyReward <= 0 && taskBalance <= 0) continue;

      const dailyWindowDate = data.dailyWindowDate || null;
      const windowDayKey = dailyWindowDate
        ? new Date(dailyWindowDate).toISOString().slice(0, 10)
        : null;

      // If reward belongs to a previous day (not today), expire it
      if (windowDayKey && windowDayKey !== todayKey) {
        await doc.ref.update({
          pendingDailyReward: 0,
          taskBalance: 0,
          dailyClaimed: false,
        });
        updated += 1;
      }
    }

    return res.status(200).json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
}