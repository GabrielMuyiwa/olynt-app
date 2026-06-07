"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import stakingAbi from "../Context/StakingDapp.json";
import TaskModal from "../Components/TaskModal";
import WatchTaskPlayer from "../Components/WatchTaskPlayer";
import AAdsBanner from "../Components/AAdsBanner";
import AdsterraBanner from "../Components/AdsterraBanner";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;
const tabs = ["Watch", "Click", "Offers", "Surveys"];
const STORAGE_KEY = "active_task_session";

const pools = [
  { id: 0, name: "Flexible Pool" },
  { id: 1, name: "30 Days Pool" },
  { id: 2, name: "90 Days Pool" },
];

export default function TasksPage() {
  const { address } = useAccount();

  const [activeTab, setActiveTab] = useState("Watch");
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [earnings, setEarnings] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [watchTaskOpen, setWatchTaskOpen] = useState(false);
  const timerRef = useRef(null);

  const loadTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?type=all&wallet=${address}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (address) loadTasks();
  }, [address]);

  const getBalance = async () => {
    if (!address) return;
    const res = await fetch(`/api/tasks?wallet=${address}`);
    const data = await res.json();
    setEarnings(data.taskBalance || 0);
  };

  useEffect(() => {
    if (address) getBalance();
  }, [address]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const now = Date.now();
      const remaining = Math.ceil((parsed.endTime - now) / 1000);

      if (remaining > 0 && parsed.task) {
        setActiveTask(parsed.task);
        setTimeLeft(remaining);
        setCanClaim(false);
        setClaiming(false);

        if (parsed.task.type === "Click") {
          setIsTaskOpen(true);
        }

        if (parsed.task.type === "Watch") {
          setWatchTaskOpen(true);
        }
      } else {
        clearSession();
      }
    } catch (e) {
      clearSession();
    }
  }, []);

  useEffect(() => {
    if (!isTaskOpen) return;

    if (timerRef.current) clearInterval(timerRef.current);

    if (timeLeft <= 0) {
      setCanClaim(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTaskOpen, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isTaskOpen) {
      setCanClaim(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [timeLeft, isTaskOpen]);

  const getLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  useEffect(() => {
    if (!address) return;

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (!ref) return;

    fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, referrer: ref }),
    });
  }, [address]);

  const saveSession = (task, endTime) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        task,
        endTime,
      })
    );
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const openTaskUrl = () => {
    if (!activeTask) return;

    if (activeTask.type === "Click") {
      const monetagLink = activeTask.url || "https://omg10.com/4/11023405";
      window.open(monetagLink, "_blank");
    }
  };

  const closeTaskModal = () => {
    setIsTaskOpen(false);
    setActiveTask(null);
    setTimeLeft(0);
    setCanClaim(false);
    setClaiming(false);
    if (timerRef.current) clearInterval(timerRef.current);
    clearSession();
  };

  const closeWatchTask = () => {
    setWatchTaskOpen(false);
    setActiveTask(null);
    setTimeLeft(0);
    setCanClaim(false);
    setClaiming(false);
    clearSession();
  };

  const startTask = async (task) => {
    if (!address) return alert("Connect wallet");
    if (completed[task.id]) return;

    if (task.type === "Click") {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          wallet: address,
          taskId: task.id,
        }),
      });

      const endTime = Date.now() + (task.duration || 0) * 1000;

      setActiveTask(task);
      setIsTaskOpen(true);
      setTimeLeft(task.duration || 0);
      setCanClaim(false);
      setClaiming(false);
      saveSession(task, endTime);
      return;
    }

    if (task.type === "Watch") {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          wallet: address,
          taskId: task.id,
        }),
      });

      const endTime = Date.now() + (task.duration || 0) * 1000;

      setActiveTask(task);
      setWatchTaskOpen(true);
      setTimeLeft(task.duration || 0);
      saveSession(task, endTime);
      return;
    }
  };

  const verifyTask = async (task) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify",
        wallet: address,
        taskId: task.id,
      }),
    });

    const data = await res.json();

    if (data.reward) {
      alert(`You earned $${data.reward}`);
      setCompleted((prev) => ({ ...prev, [task.id]: true }));
      getBalance();
      return true;
    }

    alert(data.error || "Task could not be verified");
    return false;
  };

  const claimCurrentTask = async () => {
    if (!activeTask) return;
    if (!canClaim || claiming) return;

    try {
      setClaiming(true);
      const ok = await verifyTask(activeTask);
      if (ok) closeTaskModal();
    } finally {
      setClaiming(false);
    }
  };

  const claimAndStakeRewards = async () => {
    if (!address) return alert("Connect wallet");
    if (earnings <= 0) return alert("No rewards");
    if (!selectedPoolId && selectedPoolId !== 0) return alert("Select a pool");

    try {
      const res = await fetch("/api/claim-and-stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          poolId: selectedPoolId,
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

      const amountWei = ethers.utils.parseUnits(data.amount.toString(), 18);

      const tx = await contract.claimAndStake(
        data.pid,
        amountWei,
        data.poolId,
        data.nonce,
        data.deadline,
        data.signature,
        {
          value: ethers.utils.parseEther(data.fee.toString()),
        }
      );

      await tx.wait();

      alert("✅ Claimed & Staked successfully!");
      setEarnings(0);
      getBalance();
    } catch (err) {
      console.error(err);
      alert("❌ Claim & Stake failed");
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
      const res = await fetch("/api/referral-withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });

      const data = await res.json();
      if (!data.success) return alert(data.error);

      const { signature, amount } = data;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        stakingAbi.abi,
        signer
      );

      const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
      const tx = await contract.claimTaskReward(amountWei, signature);
      await tx.wait();

      alert("✅ Referral reward claimed!");
    } catch (err) {
      console.error(err);
      alert("❌ Withdraw failed");
    }
  };

  const filteredTasks = tasks.filter((t) => t.type === activeTab);
  const visibleTasks = filteredTasks.filter((t) => t.active);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        backgroundColor: "#17142a",
      }}
    >
      <AAdsBanner />
      <AdsterraBanner />

      <h1>Task Center</h1>
      <p>Total Earned: ${earnings.toFixed(2)}</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
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

      {visibleTasks.map((task) => (
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

      {watchTaskOpen && activeTask?.type === "Watch" && (
        <WatchTaskPlayer
          task={activeTask}
          onClose={closeWatchTask}
          onComplete={async () => {
            const ok = await verifyTask(activeTask);
            if (ok) closeWatchTask();
          }}
        />
      )}

      <div style={{ marginTop: 30 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 10, color: "#fff" }}>Choose pool:</label>
          <select
            value={selectedPoolId}
            onChange={(e) => setSelectedPoolId(Number(e.target.value))}
            style={{
              padding: "10px",
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
          >
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={claimAndStakeRewards}
          style={{
            padding: "12px",
            background: "#00b894",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
          }}
        >
          Claim & Stake Rewards
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
              <span>{user.referralCount} referrals</span>
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
            marginTop: 10,
            marginRight: 10,
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
            marginTop: 10,
          }}
        >
          Withdraw Referral Rewards
        </button>
      </div>

      <TaskModal
        isOpen={isTaskOpen}
        task={activeTask}
        timeLeft={timeLeft}
        canClaim={canClaim}
        onClose={closeTaskModal}
        onClaim={claimCurrentTask}
        onOpenUrl={openTaskUrl}
        claiming={claiming}
      />
    </div>
  );
}