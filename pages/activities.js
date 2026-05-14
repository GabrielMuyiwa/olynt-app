import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth"; // Firebase Auth
import { db } from "../firebase"; // Import Firebase Firestore

// INTERNAL IMPORTS
import {
  Header,
  Footer,
  Statistics,
  Loader,
  Notification,
  ICOSale,
} from "../Components/index";
import {
  CONTRACT_DATA,
  deposit,
  withdraw,
  claimReward,
  addTokenToMetaMask,
} from "../Context/index";

const Activity = () => {
  const { address } = useAccount(); // User's wallet address
  const [loader, setLoader] = useState(false);
  const [poolDetails, setPoolDetails] = useState();
  const [userData, setUserData] = useState(null); // To store the user's Firestore data

  // Function to load contract data using the user's address
  const LOAD_DATA = async () => {
    if (address) {
      setLoader(true);
      const data = await CONTRACT_DATA(address);
      setPoolDetails(data);
      setLoader(false);
    }
  };

  // Load contract data whenever the address changes
  useEffect(() => {
    LOAD_DATA();
  }, [address]);

  // **Firebase Auth Integration:**
  // Sign in anonymously when the wallet is connected
  useEffect(() => {
    if (address) {
      const auth = getAuth();
      signInAnonymously(auth)
        .then(() => {
          console.log("Signed in anonymously with Firebase Auth.");
        })
        .catch((error) => {
          console.error("Firebase auth error:", error);
        });
    }
  }, [address]);

  // **Fetch User Data from Firestore:**
  // Use onSnapshot for real-time updates so the points refresh automatically
  useEffect(() => {
    if (address) {
      const userRef = doc(db, "users", address);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // If the document doesn't exist, initialize with zero points
          setUserData({ points: 0 });
        }
      }, (error) => {
        console.error("Error fetching user data:", error);
      });

      // Clean up the listener on unmount
      return () => unsubscribe();
    }
  }, [address]);

  // Function to track referrals in Firestore
  const processReferral = async (referrerWallet, referredWallet) => {
    try {
      if (!referrerWallet || !referredWallet) return;

      const referrerRef = doc(db, "users", referrerWallet);
      const referrerDoc = await getDoc(referrerRef);

      if (!referrerDoc.exists()) {
        console.log("Referrer does not exist in database.");
        return;
      }

      // Reference the referred user in Firestore
      const referredRef = doc(db, "users", referredWallet);
      const referredDoc = await getDoc(referredRef);

      if (!referredDoc.exists()) {
        // Create referred user record
        await setDoc(referredRef, {
          wallet: referredWallet,
          referredBy: referrerWallet,
          points: 0,
        });
      } else {
        await updateDoc(referredRef, { referredBy: referrerWallet });
      }

      // Reward the referrer
      await updateDoc(referrerRef, { points: increment(10) });

      console.log("Referral successfully processed!");
    } catch (error) {
      console.error("Error processing referral:", error);
    }
  };

  // Capture and process referral codes from the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerWallet = urlParams.get("ref");

    if (referrerWallet && address) {
      processReferral(referrerWallet, address);
    }
  }, [address]);

  // Generate referral link and copy it
  const generateReferralLink = () => {
    if (!address) {
      alert("Please connect your wallet!");
      return;
    }
    const referralLink = `https://www.grainfi.xyz?ref=${address}`;
    navigator.clipboard
      .writeText(referralLink)
      .then(() => alert("Referral link copied to clipboard!"))
      .catch(() => alert("Failed to copy referral link."));
  };

  return (
    <div className="body-backgroundColor">
      <Header page={"activity"} />
      <div className="new-margin"></div>
      
      {/* Display the user's referral points */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        {userData ? (
          <h2>Your Referral Points: {userData.points}</h2>
        ) : (
          <h2>Loading your referral points...</h2>
        )}
      </div>
      
      <Statistics poolDetails={poolDetails} />
      <Notification poolDetails={poolDetails} page={"activity"} />

      <div style={{ padding: "20px" }}>
        <button
          onClick={generateReferralLink}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Generate Referral Link
        </button>
      </div>

      <Footer />
      <ICOSale setLoader={setLoader} />
      {loader && <Loader />}
    </div>
  );
};

export default Activity;
