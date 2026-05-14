import db from "../firebaseAdmin"; // Admin SDK Firestore

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // =========================
  // ADMIN SECURITY
  // =========================
  const adminWallet = req.headers["x-admin-wallet"]?.toLowerCase();

  if (!adminWallet || adminWallet !== ADMIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { taskId, action } = req.body;

    if (!taskId || !action) {
      return res.status(400).json({ error: "Missing params" });
    }

    const taskRef = db.collection("tasks").doc(taskId);
    const snap = await taskRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    // =========================
    // DISABLE TASK
    // =========================
    if (action === "disable") {
      await taskRef.update({
        active: false,
      });

      return res.json({ success: true });
    }

    // =========================
    // ENABLE TASK
    // =========================
    if (action === "enable") {
      await taskRef.update({
        active: true,
      });

      return res.json({ success: true });
    }

    // =========================
    // DELETE TASK
    // =========================
    if (action === "delete") {
      await taskRef.delete();

      return res.json({ success: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}