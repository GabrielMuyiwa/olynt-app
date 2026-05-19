import React from "react";

export default function TaskModal({
  isOpen,
  task,
  timeLeft,
  canClaim,
  onClose,
  onClaim,
  onOpenUrl,
  claiming,
}) {
  if (!isOpen || !task) return null;

  const isClickTask = task.type === "Click";

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>{task.title || "Task"}</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            X
          </button>
        </div>

        <div style={styles.body}>
          <p>
            <strong>Type:</strong> {task.type}
          </p>
          <p>
            <strong>Duration:</strong> {task.duration} seconds
          </p>

          {isClickTask && (
            <div style={{ marginBottom: "15px" }}>
              <p style={{ marginBottom: 8 }}>
                Click the button below to open the task link and keep it open
                while the timer runs.
              </p>
              <button onClick={onOpenUrl} style={styles.openBtn}>
                Open Task Link
              </button>
            </div>
          )}

          {!canClaim ? (
            <div style={styles.timerBox}>
              <span style={styles.timerLabel}>Time left:</span>
              <span style={styles.timerValue}>{timeLeft}s</span>
            </div>
          ) : (
            <p style={{ color: "green" }}>
              <strong>Time complete. You can claim now.</strong>
            </p>
          )}

          <div style={styles.actions}>
            {!canClaim ? (
              <button style={styles.claimBtnDisabled} disabled>
                Wait for timer...
              </button>
            ) : (
              <button
                onClick={onClaim}
                disabled={claiming}
                style={styles.claimBtn}
              >
                {claiming ? "Claiming..." : "Claim Reward"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "500px",
    background: "#1f2933",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #374151",
  },
  body: {
    padding: "16px",
  },
  timerBox: {
    marginTop: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#111827",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerLabel: {
    fontSize: "14px",
    color: "#9ca3af",
  },
  timerValue: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeBtn: {
    border: "none",
    background: "#4b5563",
    color: "#fff",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  openBtn: {
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  claimBtn: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  claimBtnDisabled: {
    border: "none",
    background: "#6b7280",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "not-allowed",
  },
};