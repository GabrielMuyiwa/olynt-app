"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InPagePush from "../Components/InPagePush";
import AAdsBanner from "../Components/AAdsBanner";

export default function ReferralPage() {
  const { address } = useAccount();

  const [stats, setStats] = useState({
    referrals: 0,
    referralEarnings: 0,
    withdrawn: 0,
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && address) {
      setReferralLink(`${window.location.origin}/?ref=${address}`);
    } else {
      setReferralLink("");
    }
  }, [address]);

  const loadData = async () => {
    if (!address) return;

    const res = await fetch(`/api/referral-stats?wallet=${address}`);
    const data = await res.json();

    setStats({
      referrals: data.referrals || 0,
      referralEarnings: data.referralEarnings || 0,
      withdrawn: data.withdrawn || 0,
    });

    const boardRes = await fetch("/api/leaderboard");
    const boardData = await boardRes.json();

    setLeaderboard(boardData.users || []);
  };

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  const withdrawReferral = async () => {
    const res = await fetch("/api/referral-withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: address,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert(`Withdrawn: $${data.withdrawn}`);
      loadData();
    } else {
      alert(data.error);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        color: "#fff",
      }}
    >
      <InPagePush />

      <AAdsBanner />

      <h1>Referral Dashboard</h1>

      <div
        style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <h3>Your Referral Link</h3>

        <p
          style={{
            wordBreak: "break-all",
          }}
        >
          {referralLink || "Loading referral link..."}
        </p>

        <button
          onClick={copyLink}
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Copy Link
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Total Referrals</h3>
          <h1>{stats.referrals}</h1>
        </div>

        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Referral Earnings</h3>
          <h1>${stats.referralEarnings}</h1>
        </div>

        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Total Withdrawn</h3>
          <h1>${stats.withdrawn}</h1>
        </div>
      </div>

      <button
        onClick={withdrawReferral}
        style={{
          marginTop: "30px",
          padding: "14px 24px",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Withdraw Referral Earnings
      </button>

      <div style={{ marginTop: "50px" }}>
        <h2>Top Referrers</h2>

        <div style={{ marginTop: "20px" }}>
          {leaderboard.map((user, index) => (
            <div
              key={index}
              style={{
                background: "#111827",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>#{index + 1}</span>
              <span>
                {user.wallet?.slice(0, 6)}...{user.wallet?.slice(-4)}
              </span>
              <span>{user.referralCount || 0} referrals</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}