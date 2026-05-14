import { db } from "../../../firebase";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// 🔐 YOUR SECRET
const SECRET =
  process.env.ADGATE_SECRET;

export default async function handler(req, res) {

  try {

    // =========================
    // GET ADGATE DATA
    // =========================

    const {
      user_id,
      amount,
      transaction_id,
      secret,
    } = req.query;

    // =========================
    // SECURITY CHECK
    // =========================

    if (secret !== SECRET) {

      return res.status(401).send(
        "Invalid secret"
      );
    }

    if (
      !user_id ||
      !amount ||
      !transaction_id
    ) {
      return res.status(400).send(
        "Missing params"
      );
    }

    // =========================
    // PREVENT DUPLICATES
    // =========================

    const txRef = doc(
      db,
      "adgate_transactions",
      transaction_id
    );

    const txSnap = await getDoc(txRef);

    if (txSnap.exists()) {

      return res.status(200).send(
        "Duplicate ignored"
      );
    }

    // SAVE TX
    await setDoc(txRef, {
      user_id,
      amount: Number(amount),
      transaction_id,
      createdAt: Date.now(),
    });

    // =========================
    // UPDATE USER
    // =========================

    const userRef = doc(
      db,
      "users",
      user_id
    );

    const userSnap = await getDoc(
      userRef
    );

    let userData =
      userSnap.exists()
        ? userSnap.data()
        : {
            taskBalance: 0,
          };

    const newBalance =
      (userData.taskBalance || 0) +
      Number(amount);

    await updateDoc(userRef, {
      taskBalance: newBalance,
    });

    return res.status(200).send(
      "OK"
    );

  } catch (error) {

    console.error(error);

    return res.status(500).send(
      "Server error"
    );
  }
}