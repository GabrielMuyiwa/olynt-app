import db from "./firebaseAdmin";
import { ethers } from "ethers";
import stakingAbi from "../../Context/StakingDapp.json";

const DAILY_LIMIT = 10;
const COOLDOWN = 30;
const MAX_TASKS_PER_DAY = 20;

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const stakingContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_STAKING_DAPP,
  stakingAbi.abi,
  adminWallet
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === "GET") {
      const { wallet, type } = req.query;

      if (type === "all") {
        const tasksSnap = await db.collection("tasks").get();

        let completedTasks = {};
        if (wallet) {
          const userRef = db.collection("users").doc(wallet);
          const userSnap = await userRef.get();
          if (userSnap.exists) {
            completedTasks = userSnap.data().tasks || {};
          }
        }

        const tasks = [];
        tasksSnap.forEach((doc) => {
          const data = doc.data();
          const isCompleted = completedTasks[doc.id]?.completed;
          if (data.active && !isCompleted) {
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
        return res.json({ taskBalance: 0, referralBalance: 0 });
      }

      const data = snap.data();

      return res.json({
        taskBalance: data.taskBalance || 0,
        referralBalance: data.referralBalance || 0,
      });
    }

    if (method === "POST") {
      const { action, wallet, taskId, referrer } = req.body;

      if (!wallet) {
        return res.status(400).json({ error: "Missing wallet" });
      }

      if (!taskId) {
        return res.status(400).json({ error: "Missing taskId" });
      }

      if (!action) {
        return res.status(400).json({ error: "Missing action" });
      }

      const taskRef = db.collection("tasks").doc(taskId);
      const userRef = db.collection("users").doc(wallet);

      const taskSnap = await taskRef.get();
      if (!taskSnap.exists) {
        return res.status(400).json({ error: "Task not found" });
      }

      const task = taskSnap.data();

      if (!task.active) {
        return res.status(400).json({ error: "Task disabled" });
      }

      const now = Date.now();

      if (action === "start") {
        await db.runTransaction(async (tx) => {
          const userSnap = await tx.get(userRef);

          let userData = userSnap.exists
            ? userSnap.data()
            : {
                taskBalance: 0,
                tasks: {},
                lastAction: 0,
                dailyEarning: 0,
                dailyCount: 0,
                lastReset: now,
              };

          if (now - (userData.lastReset || now) > 86400000) {
            userData.dailyEarning = 0;
            userData.dailyCount = 0;
            userData.lastReset = now;
          }

          if (userData.tasks?.[taskId]?.completed) {
            throw new Error("Already completed");
          }

          if ((now - (userData.lastAction || 0)) / 1000 < COOLDOWN) {
            throw new Error("Slow down — cooldown active");
          }

          if (!userData.referrer && referrer) {
            userData.referrer = referrer;
          }

          userData.lastAction = now;
          userData.tasks = {
            ...(userData.tasks || {}),
            [taskId]: {
              startedAt: now,
              completed: false,
            },
          };

          tx.set(userRef, userData, { merge: true });
        });

        return res.json({ success: true });
      }

      if (action === "verify") {
        const result = await db.runTransaction(async (tx) => {
          const userSnap = await tx.get(userRef);

          if (!userSnap.exists) {
            throw new Error("Task not started");
          }

          const userData = userSnap.data();
          const taskData = userData.tasks?.[taskId];

          if (!taskData || !taskData.startedAt) {
            throw new Error("Task not started");
          }

          if (taskData.completed) {
            throw new Error("Already claimed");
          }

          const timeSpent = (now - taskData.startedAt) / 1000;

          if (timeSpent < task.duration) {
            throw new Error("Too fast — bot suspected");
          }

          if ((userData.dailyEarning || 0) + task.reward > DAILY_LIMIT) {
            throw new Error("Daily earning limit reached");
          }

          if ((userData.dailyCount || 0) >= MAX_TASKS_PER_DAY) {
            throw new Error("Daily task limit reached");
          }

          userData.tasks[taskId].completed = true;
          userData.taskBalance = (userData.taskBalance || 0) + task.reward;
          userData.dailyEarning = (userData.dailyEarning || 0) + task.reward;
          userData.dailyCount = (userData.dailyCount || 0) + 1;

          tx.set(userRef, userData, { merge: true });

          if (userData.referrer) {
            const refRef = db.collection("users").doc(userData.referrer);
            const refSnap = await tx.get(refRef);
            const refData = refSnap.exists ? refSnap.data() : {};
            const referralReward = task.reward * 0.1;

            tx.set(
              refRef,
              {
                referralEarnings: (refData.referralEarnings || 0) + referralReward,
                referralBalance: (refData.referralBalance || 0) + referralReward,
                totalReferralEarned: (refData.totalReferralEarned || 0) + referralReward,
              },
              { merge: true }
            );
          }

          return {
            success: true,
            reward: task.reward,
          };
        });

        //const rewardWei = ethers.utils.parseUnits(result.reward.toString(), 18);
        //await stakingContract.creditTaskReward(wallet, rewardWei);

        return res.json(result);
      }

      return res.status(400).json({ error: "Invalid action" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Something went wrong",
    });
  }
}