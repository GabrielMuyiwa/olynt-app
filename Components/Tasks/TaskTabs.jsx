export default function TaskTabs({ tabs, active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          style={{
            padding: 10,
            background: active === tab ? "#00b894" : "#222",
            color: "#fff",
            border: "none"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}