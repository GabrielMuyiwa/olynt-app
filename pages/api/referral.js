import db from "./firebaseAdmin";   // Admin SDK Firestore

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { referrer, referee } = req.body;

    if (!referrer || !referee) {
      return res.status(400).json({
        error: "Missing params",
      });
    }

    // prevent self-referral
    if (referrer.toLowerCase() === referee.toLowerCase()) {
      return res.status(400).json({
        error: "Self referral not allowed",
      });
    }

    // Admin SDK: get referee doc
    const refereeRef = db.collection("users").doc(referee);
    const refereeSnap = await refereeRef.get();

    // already referred before
    if (refereeSnap.exists && refereeSnap.data().referrer) {
      return res.json({
        success: true,
        message: "Already referred",
      });
    }

    // save referee
    await refereeRef.set(
      {
        referrer,
      },
      { merge: true }
    );

    // update referrer stats
    const referrerRef = db.collection("users").doc(referrer);
    const referrerSnap = await referrerRef.get();

    let referralCount = 0;

    if (referrerSnap.exists) {
      referralCount = referrerSnap.data().referralCount || 0;
    }

    await referrerRef.set(
      {
        referralCount: referralCount + 1,
      },
      { merge: true }
    );

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}




/*
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://grainfi-farm.firebaseio.com'
  });
} else {
  admin.app(); // Use the default app if it's already initialized
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { referrerWallet, referredWallet } = req.body;

    try {
      // Check if the referrer exists in Firestore
      const referrerDoc = await db.collection('users').doc(referrerWallet).get();
      if (!referrerDoc.exists) {
        return res.status(400).json({ message: "Referrer wallet not found." });
      }

      // Create or update the referred user's data
      const referredRef = db.collection('users').doc(referredWallet);
      const referredDoc = await referredRef.get();

      if (!referredDoc.exists) {
        // If the referred user does not exist, create a new record
        await referredRef.set({
          wallet: referredWallet,
          referredBy: referrerWallet,
          points: 0, // Initial points for the referred user
        });
      } else {
        // If the user already exists, just update the referral
        await referredRef.update({
          referredBy: referrerWallet,
        });
      }

      // Reward the referrer with points (this can be adjusted as needed)
      const referrerRef = db.collection('users').doc(referrerWallet);
      await referrerRef.update({
        points: admin.firestore.FieldValue.increment(10), // Add points to referrer
      });

      res.status(200).json({ message: "Referral successfully tracked!" });
    } catch (error) {
      res.status(500).json({ message: "Error processing referral", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
*/