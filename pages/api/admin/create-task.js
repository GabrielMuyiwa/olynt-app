import db from "../firebaseAdmin";

const ADMIN =
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

export default async function handler(req, res) {
  console.log("API HIT");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // =========================
    // ADMIN SECURITY
    // =========================
    const adminWallet =
      req.headers["x-admin-wallet"]?.toLowerCase();

    console.log("Admin wallet:", adminWallet);
    console.log("Expected admin:", ADMIN);

    if (!adminWallet || adminWallet !== ADMIN) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      id,
      title,
      reward,
      duration,
      type,
      url,
    } = req.body;

    console.log("Task data:", req.body);

    if (!id || !title) {
      return res.status(400).json({
        error: "Missing fields",
      });
    }

    const docRef = db
      .collection("tasks")
      .doc(id);

    await docRef.set({
      id,
      title,
      reward: Number(reward || 0),
      duration: Number(duration || 0),
      type: type || "Watch",
      url: url || "",
      active: true,
      createdAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: "Task created",
    });

  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
}