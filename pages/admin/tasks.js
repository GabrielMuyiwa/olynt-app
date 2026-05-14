"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

export default function AdminTasks() {
  const { address } = useAccount();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    reward: "",
    type: "Watch",
    duration: "",
    url: "",
  });

  // =========================
  // 🔐 ACCESS CONTROL
  // =========================
  if (!address || address.toLowerCase() !== ADMIN?.toLowerCase()) {
    return (
      <div style={{ padding: 40, color: "red" }}>
        ❌ Access denied (Admin only)
      </div>
    );
  }

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = async () => {
    const res = await fetch("/api/admin/tasks", {
      headers: {
        "x-admin-wallet": address,
      },
    });

    const data = await res.json();
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    if (address) loadTasks();
  }, [address]);

  // =========================
  // CREATE TASK
  // =========================
  const createTask = async () => {
    if (!form.title || !form.reward) {
      return alert("Fill required fields");
    }

    setLoading(true);

    await fetch("/api/admin/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-wallet": address,
      },
      body: JSON.stringify({
        title: form.title,
        reward: Number(form.reward),
        type: form.type,
        duration: Number(form.duration || 0),
        url: form.url,
      }),
    });

    setForm({
      title: "",
      reward: "",
      type: "Watch",
      duration: "",
      url: "",
    });

    await loadTasks();
    setLoading(false);
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;

    await fetch("/api/admin/tasks", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-wallet": address,
      },
      body: JSON.stringify({ id }),
    });

    loadTasks();
  };

  return (
    <div style={{ padding: 30, color: "#fff" }}>
      <h1>🛠 Admin Task Manager</h1>

      {/* ========================= */}
      {/* CREATE TASK */}
      {/* ========================= */}
      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
        }}
      >
        <h2>Create Task</h2>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Reward (e.g 0.02)"
          value={form.reward}
          onChange={(e) => setForm({ ...form, reward: e.target.value })}
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option>Watch</option>
          <option>Click</option>
          <option>Survey</option>
          <option>Offer</option>
        </select>

        <input
          placeholder="Duration (seconds)"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
        />

        <input
          placeholder="URL (optional)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />

        <button onClick={createTask} disabled={loading}>
          {loading ? "Creating..." : "Create Task"}
        </button>
      </div>

      {/* ========================= */}
      {/* TASK LIST */}
      {/* ========================= */}
      <div>
        <h2>All Tasks</h2>

        {tasks.length === 0 && <p>No tasks yet</p>}

        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              border: "1px solid #333",
              padding: 15,
              marginBottom: 10,
              borderRadius: 10,
              background: "#1a1a1a",
            }}
          >
            <h3>{task.title}</h3>
            <p>Reward: ${task.reward}</p>
            <p>Type: {task.type}</p>
            <p>Duration: {task.duration}s</p>

            {task.url && (
              <p>
                URL:{" "}
                <a href={task.url} target="_blank">
                  Open
                </a>
              </p>
            )}

            <button
              onClick={() => deleteTask(task.id)}
              style={{
                background: "red",
                color: "#fff",
                border: "none",
                padding: 8,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}