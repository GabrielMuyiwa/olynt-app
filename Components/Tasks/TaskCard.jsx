export default function TaskCard({ task, onStart, completed }) {
  return (
    <div style={{
      padding: 15,
      border: "1px solid #333",
      borderRadius: 10,
      marginBottom: 10
    }}>
      <h3>{task.title}</h3>
      <p>Reward: ${task.reward}</p>

      <button
        onClick={() => onStart(task)}
        disabled={completed}
        style={{
          background: completed ? "gray" : "#0984e3",
          color: "#fff",
          padding: 8,
          border: "none"
        }}
      >
        {completed ? "Completed" : "Start Task"}
      </button>
    </div>
  );
}