import db from "./firebaseAdmin";   // Admin SDK Firestore

// 🔐 SECURITY SETTINGS
const DAILY_LIMIT = 0.1;          // max $ per day
const COOLDOWN = 20;              // seconds between tasks
const MAX_TASKS_PER_DAY = 10;

export default async function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    const { wallet, type } = req.query;

    // 🔥 NEW: GET ALL TASKS
    if (type === "all") {
      const tasksSnap = await db.collection("tasks").get();
      const tasks = [];

      tasksSnap.forEach((doc) => {
        const data = doc.data();
        if (data.active) {
          tasks.push({
            id: doc.id,
            ...data,
          });
        }
      });

      return res.json({ tasks });
    }

    if (!wallet) {
      return res.status(400).json({ error: "Missing wallet" });
    }

    const userRef = db.collection("users").doc(wallet);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.json({ taskBalance: 0 });
    }

    return res.json({
      taskBalance: snap.data().taskBalance || 0,
    });
  }

  if (method === "POST") {
    const { action, wallet, taskId } = req.body;

    if (!wallet || !taskId) {
      return res.status(400).json({ error: "Missing params" });
    }

    const taskRef = db.collection("tasks").doc(taskId);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(400).json({
        error: "Task not found",
      });
    }

    const task = taskSnap.data();

    if (!task.active) {
      return res.status(400).json({
        error: "Task disabled",
      });
    }

    const userRef = db.collection("users").doc(wallet);
    const snap = await userRef.get();

    let userData = snap.exists
      ? snap.data()
      : {
          taskBalance: 0,
          tasks: {},
          lastAction: 0,
          dailyEarning: 0,
          dailyCount: 0,
          lastReset: Date.now(),
        };

    const now = Date.now();

    // 🔁 RESET DAILY LIMIT
    if (now - userData.lastReset > 86400000) {
      userData.dailyEarning = 0;
      userData.dailyCount = 0;
      userData.lastReset = now;
    }

    // =========================
    // START TASK
    // =========================
    if (action === "start") {
      if (userData.tasks?.[taskId]?.completed) {
        return res.status(400).json({ error: "Already completed" });
      }

      // 🧠 SAVE REFERRER (FIRST TIME ONLY)
      if (!userData.referrer && req.body.referrer) {
        userData.referrer = req.body.referrer;
      }

      // ⛔ COOLDOWN CHECK
      if ((now - userData.lastAction) / 1000 < COOLDOWN) {
        return res.status(400).json({
          error: "Slow down — cooldown active",
        });
      }

      userData.lastAction = now;

      userData.tasks = {
        ...userData.tasks,
        [taskId]: {
          startedAt: now,
          completed: false,
        },
      };

      await userRef.set(userData, { merge: true });

      return res.json({ success: true });
    }

    // =========================
    // VERIFY TASK
    // =========================
    if (action === "verify") {
      const taskData = userData.tasks?.[taskId];

      if (!taskData || !taskData.startedAt) {
        return res.status(400).json({ error: "Task not started" });
      }

      if (taskData.completed) {
        return res.status(400).json({ error: "Already claimed" });
      }

      // 🎁 REFERRAL BONUS (10%)
      if (userData.referrer) {
        const refRef = db.collection("users").doc(userData.referrer);
        const refSnap = await refRef.get();

        let refData = refSnap.exists
          ? refSnap.data()
          : { referralEarnings: 0 };

        const bonus = task.reward * 0.1;
        await refRef.set(
          {
            referralEarnings: (refData.referralEarnings || 0) + bonus,
          },
          { merge: true }
        );
      }

      const timeSpent = (now - taskData.startedAt) / 1000;

      // ⛔ BOT CHECK
      if (timeSpent < task.duration) {
        return res.status(400).json({
          error: "Too fast — bot suspected",
        });
      }

      // ⛔ DAILY LIMIT
      if (userData.dailyEarning + task.reward > DAILY_LIMIT) {
        return res.status(400).json({
          error: "Daily earning limit reached",
        });
      }

      // ⛔ TASK COUNT LIMIT
      if (userData.dailyCount >= MAX_TASKS_PER_DAY) {
        return res.status(400).json({
          error: "Daily task limit reached",
        });
      }

      // ✅ MARK COMPLETE
      userData.tasks[taskId].completed = true;
      userData.taskBalance += task.reward;
      userData.dailyEarning += task.reward;
      userData.dailyCount += 1;

      // =========================
      // 🔥 REFERRAL REWARD
      // =========================
      if (userData.referrer) {
        const refRef = db.collection("users").doc(userData.referrer);
        const refSnap = await refRef.get();

        if (refSnap.exists) {
          const refData = refSnap.data();
          const referralReward = task.reward * 0.1; // 10%

          await refRef.update({
            referralBalance: (refData.referralBalance || 0) + referralReward,
            totalReferralEarned: (refData.totalReferralEarned || 0) + referralReward,
          });
        }
      }

      await userRef.update({
        tasks: userData.tasks,
        taskBalance: userData.taskBalance,
        dailyEarning: userData.dailyEarning,
        dailyCount: userData.dailyCount,
      });

      return res.json({
        success: true,
        reward: task.reward,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}