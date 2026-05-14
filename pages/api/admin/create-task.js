import db from "../firebaseAdmin"; // ✅ from pages/api/admin/create-task.js

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
    const { id, title, reward, duration, type, url } = req.body;

    if (!id || !title) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const docRef = db.collection("tasks").doc(id);
    await docRef.set({
      title,
      reward: Number(reward),
      duration: Number(duration),
      type,
      url: url || "",
      active: true,
      createdAt: Date.now(),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}