"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

const DEFAULT_QUESTIONS = `[
  {
    "id": "q1",
    "question": "What was the main point of the video?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B"
  }
]`;

export default function AdminDashboard() {
  const { address } = useAccount();

  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRewards: 0,
    totalTasks: 0,
    totalReferrals: 0,
    leaderboard: [],
  });

  const [form, setForm] = useState({
    id: "",
    title: "",
    reward: "",
    duration: "",
    type: "Watch",
    url: "",
    destinationUrl: "",
    questions: DEFAULT_QUESTIONS,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // LOAD TASKS (public list)
  const loadTasks = async () => {
    const res = await fetch("/api/tasks?type=all");
    const data = await res.json();
    setTasks(data.tasks || []);
  };

  // LOAD STATS (admin-only API)
  const loadStats = async () => {
    if (!address) return;

    const res = await fetch("/api/admin/stats", {
      headers: {
        "Content-Type": "application/json",
        "x-admin-wallet": address.toLowerCase(),
      },
    });

    const data = await res.json();

    if (res.status === 401) {
      alert("Unauthorized: you are not admin.");
      return;
    }

    setStats(data);
  };

  useEffect(() => {
    if (mounted && address) {
      loadTasks();
      loadStats();
    }
  }, [mounted, address]);

  // =========================
  // HYDRATION‑SAFE MOUNTED GUARD
  // =========================
  if (!mounted) {
    return (
      <div
        style={{
          padding: "30px",
          color: "white",
          background: "#0f172a",
          minHeight: "100vh",
        }}
      >
        <h1>Loading admin...</h1>
      </div>
    );
  }

  // =========================
  // ADMIN-ONLY PAGE GUARD
  // =========================
  if (!address) {
    return (
      <div
        style={{
          padding: "30px",
          color: "white",
          background: "#0f172a",
          minHeight: "100vh",
        }}
      >
        <h1>Connect wallet</h1>
        <p>You must connect the admin wallet to access this page.</p>
      </div>
    );
  }

  if (address.toLowerCase() !== ADMIN) {
    return (
      <div
        style={{
          padding: "30px",
          color: "white",
          background: "#0f172a",
          minHeight: "100vh",
        }}
      >
        <h1>Access denied</h1>
        <p>Only the admin wallet can access this dashboard.</p>
      </div>
    );
  }

  // CREATE TASK (admin API; with x-admin-wallet)
  const createTask = async () => {
    let parsedQuestions = [];
    if (form.type === "Watch") {
      try {
        parsedQuestions = JSON.parse(form.questions || "[]");
        if (!Array.isArray(parsedQuestions)) {
          return alert("Questions must be a JSON array");
        }
      } catch (err) {
        return alert("Invalid questions JSON");
      }
    }

    const res = await fetch("/api/admin/create-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-wallet": address.toLowerCase(),
      },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        reward: Number(form.reward),
        type: form.type,
        duration: Number(form.duration || 0),
        url: form.url,
        destinationUrl: form.destinationUrl,
        questions: form.type === "Watch" ? parsedQuestions : [],
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Task created");
      setForm({
        id: "",
        title: "",
        reward: "",
        duration: "",
        type: "Watch",
        url: "",
        destinationUrl: "",
        questions: DEFAULT_QUESTIONS,
      });
      loadTasks();
      loadStats();
    } else {
      alert(data.error);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        background: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "30px",
        }}
      >
        Admin Dashboard
      </h1>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* USERS */}
        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2>Total Users</h2>
          <h1>{stats.totalUsers}</h1>
        </div>

        {/* REWARDS */}
        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2>Total Rewards</h2>
          <h1>${stats.totalRewards}</h1>
        </div>

        {/* TASKS */}
        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2>Total Tasks</h2>
          <h1>{stats.totalTasks}</h1>
        </div>

        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Total Referrals</h3>
          <h1>{stats.totalReferrals}</h1>
        </div>

        <div
          style={{
            marginTop: "40px",
            background: "#111827",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h2>Top Users</h2>
          {stats.leaderboard?.map((user, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #374151",
              }}
            >
              <span>#{index + 1}</span>
              <span>
                {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
              </span>
              <span>${user.earned}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE TASK */}
      <div
        style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h2>Create Task</h2>
        <input
          placeholder="Task ID"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Reward"
          value={form.reward}
          onChange={(e) => setForm({ ...form, reward: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Duration"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          style={inputStyle}
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          style={inputStyle}
        >
          <option>Watch</option>
          <option>Click</option>
          <option>Offers</option>
          <option>Survey</option>
        </select>
        <input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Destination URL (final page)"
          value={form.destinationUrl}
          onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
          style={inputStyle}
        />

        {form.type === "Watch" && (
          <>
            <label
              style={{
                display: "block",
                marginTop: "12px",
                marginBottom: "6px",
                color: "#9ca3af",
              }}
            >
              Quiz Questions JSON
            </label>
            <textarea
              value={form.questions}
              onChange={(e) => setForm({ ...form, questions: e.target.value })}
              style={{
                ...inputStyle,
                minHeight: "180px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
              }}
              placeholder={`[\n  {\n    "id": "q1",\n    "question": "What was the main point?",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": "B"\n  }\n]`}
            />
          </>
        )}

        <button onClick={createTask} style={buttonStyle}>
          Create Task
        </button>
      </div>

      {/* TASK LIST */}
      <div
        style={{
          background: "#111827",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h2>All Tasks</h2>

        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              border: "1px solid #374151",
              padding: "15px",
              marginTop: "15px",
              borderRadius: "10px",
            }}
          >
            <h3>{task.title}</h3>
            <p>ID: {task.id}</p>
            <p>Reward: ${task.reward}</p>
            <p>Duration: {task.duration}s</p>
            <p>Type: {task.type}</p>
            <p>Status: {task.active ? "🟢 Active" : "🔴 Disabled"}</p>

            {task.url && (
              <p>
                URL:{" "}
                 <a href={task.url} target="_blank" rel="noreferrer">
                  Open
                 </a>
              </p>
            )}

            {task.destinationUrl && (
              <p>
                Destination:{" "}
                <a href={task.destinationUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </p>
            )}

            {task.questions?.length > 0 && (
              <p>Quiz Questions: {task.questions.length}</p>
            )}

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              {/* ENABLE / DISABLE */}
              <button
                onClick={async () => {
                  const action = task.active ? "disable" : "enable";

                  const res = await fetch("/api/admin/manage-task", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-admin-wallet": address.toLowerCase(),
                    },
                    body: JSON.stringify({
                      taskId: task.id,
                      action,
                    }),
                  });

                  const data = await res.json();
                  if (data.success) {
                    loadTasks();
                  } else {
                    alert(data.error);
                  }
                }}
                style={{
                  padding: "10px",
                  background: task.active ? "#dc2626" : "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {task.active ? "Disable" : "Enable"}
              </button>

              {/* DELETE */}
              <button
                onClick={async () => {
                  const confirmDelete = confirm("Delete this task?");
                  if (!confirmDelete) return;

                  const res = await fetch("/api/admin/manage-task", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-admin-wallet": address.toLowerCase(),
                    },
                    body: JSON.stringify({
                      taskId: task.id,
                      action: "delete",
                    }),
                  });

                  const data = await res.json();
                  if (data.success) {
                    loadTasks();
                    loadStats();
                  } else {
                    alert(data.error);
                  }
                }}
                style={{
                  padding: "10px",
                  background: "#7f1d1d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  background: "#1f2937",
  border: "1px solid #374151",
  color: "white",
  borderRadius: "8px",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "12px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};