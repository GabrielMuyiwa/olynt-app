"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

const DEFAULT_QUESTIONS = `[
  {
    "id": "q1",
    "question": "What was the main point of the video?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B"
  }
]`;

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
    questions: DEFAULT_QUESTIONS,
  });

  if (!address || address.toLowerCase() !== ADMIN?.toLowerCase()) {
    return (
      <div style={{ padding: 40, color: "red" }}>
        ❌ Access denied (Admin only)
      </div>
    );
  }

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

  const createTask = async () => {
    if (!form.title || !form.reward) {
      return alert("Fill required fields");
    }

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

    setLoading(true);

    const res = await fetch("/api/admin/tasks", {
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
        questions: form.type === "Watch" ? parsedQuestions : [],
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setLoading(false);
      return alert(data.error || "Task creation failed");
    }

    setForm({
      title: "",
      reward: "",
      type: "Watch",
      duration: "",
      url: "",
      questions: DEFAULT_QUESTIONS,
    });

    await loadTasks();
    setLoading(false);
    alert("✅ Task created");
  };

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
          style={inputStyle}
        />

        <input
          placeholder="Reward (e.g 0.02)"
          value={form.reward}
          onChange={(e) => setForm({ ...form, reward: e.target.value })}
          style={inputStyle}
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          style={inputStyle}
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
          style={inputStyle}
        />

        <input
          placeholder="URL (optional)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          style={inputStyle}
        />

        {form.type === "Watch" && (
          <>
            <label style={{ display: "block", marginTop: 12, marginBottom: 6 }}>
              Quiz Questions JSON
            </label>
            <textarea
              value={form.questions}
              onChange={(e) => setForm({ ...form, questions: e.target.value })}
              style={{
                ...inputStyle,
                minHeight: 180,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
              }}
              placeholder='[
          {
            "id": "q1",
            "question": "What was the main point?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "B"
          }
        ]'
            />
          </>
        )}

        <button onClick={createTask} disabled={loading} style={buttonStyle}>
          {loading ? "Creating..." : "Create Task"}
        </button>
      </div>

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
                <a href={task.url} target="_blank" rel="noreferrer">
                  Open
                </a>
              </p>
            )}

            {task.questions?.length > 0 && (
              <p>Quiz Questions: {task.questions.length}</p>
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