import db from "../firebaseAdmin";  // Admin SDK Firestore


const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

export default async function handler(req, res) {
  const { method } = req;

  const adminWallet = req.headers["x-admin-wallet"]?.toLowerCase();

  // 🔐 ADMIN SECURITY
  if (!adminWallet || adminWallet !== ADMIN) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    // =========================
    // GET ALL TASKS
    // =========================
    if (method === "GET") {
      const snapshot = await db.collection("tasks").get();

      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json({ tasks });
    }

    // =========================
    // CREATE TASK
    // =========================
    if (method === "POST") {
      const { title, reward, type, duration, url, questions } = req.body;

      if (!title || !reward || !type) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const newTask = {
        title,
        reward,
        type,
        duration: duration || 0,
        url: url || "",
        questions: Array.isArray(questions) ? questions : [],
        createdAt: Date.now(),
        active: true,
      };

      const docRef = await db.collection("tasks").add(newTask);
      

      return res.json({
        success: true,
        id: docRef.id,
      });
    }

    // =========================
    // UPDATE TASK
    // =========================
    if (method === "PUT") {
      const { id, updates } = req.body;

      if (!id || !updates) {
        return res.status(400).json({ error: "Missing params" });
      }

      const taskRef = db.collection("tasks").doc(id);
      await taskRef.update(updates);

      return res.json({ success: true });
    }

    // =========================
    // DELETE TASK
    // =========================
    if (method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing id" });
      }

      await db.collection("tasks").doc(id).delete();

      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}