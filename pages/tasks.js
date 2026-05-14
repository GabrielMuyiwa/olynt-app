"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import stakingAbi from "../../context/StakingDapp.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;

const tabs = ["Watch", "Click", "Offers", "Surveys"];

export default function TasksPage() {
  const { address } = useAccount();

  const [activeTab, setActiveTab] = useState("Watch");
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [earnings, setEarnings] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks?type=all");
      const data = await res.json();

      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // =========================
  // GET BALANCE
  // =========================
  const getBalance = async () => {
    if (!address) return;

    const res = await fetch(`/api/tasks?wallet=${address}`);
    const data = await res.json();

    setEarnings(data.taskBalance || 0);
  };

  useEffect(() => {
    if (address) getBalance();
  }, [address]);

  const getLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  // =========================
  // REFERRAL TRACKING (🔥 ADDED)
  // =========================
  useEffect(() => {
    if (!address) return;

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");

    if (!ref) return; // prevent empty calls

    fetch("/api/referral", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: address,
        referrer: ref,
      }),
    });
  }, [address]);

  // =========================
  // START TASK
  // =========================
  const startTask = async (task) => {
    if (!address) return alert("Connect wallet");
    if (completed[task.id]) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        action: "start",
        wallet: address,
        taskId: task.id,
      }),
    });

    if (task.type === "Watch") {
      setTimeout(() => verifyTask(task), task.duration * 1000);
    }

    if (task.type === "Click") {
      window.open(task.url, "_blank");
      setTimeout(() => verifyTask(task), 10000);
    }
  };

  // =========================
  // VERIFY TASK
  // =========================
  const verifyTask = async (task) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        action: "verify",
        wallet: address,
        taskId: task.id,
      }),
    });

    const data = await res.json();

    if (data.reward) {
      alert(`You earned $${data.reward}`);
      setCompleted(prev => ({ ...prev, [task.id]: true }));
      getBalance();
    } else {
      alert(data.error);
    }
  };

  // =========================
  // CLAIM TO BLOCKCHAIN
  // =========================
  const claimRewards = async () => {
    if (!address) return alert("Connect wallet");
    if (earnings <= 0) return alert("No rewards");

    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          userAddress: address,
          amount: earnings,
        }),
      });

      const data = await res.json();

      if (!data.success) return alert(data.error);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        stakingAbi.abi,
        signer
      );

      const amountWei = ethers.utils.parseUnits(
        data.amount.toString(),
        18
      );

      const tx = await contract.claimTaskReward(
        amountWei,
        data.signature
      );

      await tx.wait();

      alert("✅ Claimed on blockchain!");
      setEarnings(0);

    } catch (err) {
      console.error(err);
      alert("❌ Claim failed");
    }
  };

  const withdrawRewards = async () => {
    if (!address) return alert("Connect wallet");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        stakingAbi.abi,
        signer
      );

      const tx = await contract.withdrawTaskReward(0);
      await tx.wait();

      alert("✅ Withdraw successful!");

    } catch (err) {
      console.error(err);
      alert("❌ Withdraw failed");
    }
  };

  const withdrawReferral = async () => {
    if (!address) return alert("Connect wallet");

    try {
      // 1️⃣ GET SIGNATURE FROM BACKEND
      const res = await fetch("/api/referral-withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet: address }),
      });

      const data = await res.json();

      if (!data.success) {
        return alert(data.error);
      }

      const { signature, amount } = data;

      // 2️⃣ CONNECT WALLET
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      stakingAbi.abi,
      signer
    );

    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);

    // 3️⃣ CLAIM INTO CONTRACT
    const tx = await contract.claimTaskReward(
      amountWei,
      signature
    );

    await tx.wait();

    alert("✅ Referral reward claimed!");

  } catch (err) {
    console.error(err);
    alert("❌ Withdraw failed");
  }
};

  const filteredTasks = tasks.filter(
    (t) => t.type === activeTab
  );

  const visibleTasks = filteredTasks.filter(t => t.active);

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h1>Task Center</h1>

      <p>Total Earned: ${earnings.toFixed(2)}</p>

      {/* TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px",
              background: activeTab === tab ? "#00b894" : "#222",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TASK LIST */}
      {visibleTasks.map(task => (
        <div
          key={task.id}
          style={{
            padding: "15px",
            border: "1px solid #333",
            marginBottom: "10px",
            borderRadius: "10px",
          }}
        >
          <h3>{task.title}</h3>
          <p>Reward: ${task.reward}</p>

          <button
            onClick={() => startTask(task)}
            disabled={completed[task.id]}
            style={{
              padding: "8px",
              background: completed[task.id] ? "gray" : "#0984e3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {completed[task.id] ? "Completed" : "Start Task"}
          </button>
        </div>
      ))}

      {/* CLAIM */}
      <div style={{ marginTop: 30 }}>
        <button
          onClick={claimRewards}
          style={{
            padding: "12px",
            background: "#6c5ce7",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Claim Rewards
        </button>

        <div
          style={{
            marginTop: "40px",
            background: "#111",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2 style={{ color: "#fff" }}>🏆 Leaderboard</h2>

          {leaderboard.map((user, index) => (
            <div
              key={user.wallet}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #333",
                color: "#fff",
              }}
            >
              <span>
                #{index + 1} — {user.wallet.slice(0, 6)}...
              </span>

              <span>
                {user.referralCount} referrals
              </span>
            </div>
          ))}
        </div>       

        <button
          onClick={withdrawRewards}
          style={{
            padding: "12px",
            background: "#00cec9",
            color: "#fff",
            border: "none",
            marginLeft: 10,
          }}
        >
          Withdraw Rewards
        </button>
        
        <button 
          onClick={withdrawReferral}
          style={{
            padding: "12px",
            background: "#463a07",
            color: "#fff",
            border: "none",
            marginLeft: 10,
          }}
        >
          Withdraw Referral Rewards
        </button>
      </div>
    </div>
  );
}