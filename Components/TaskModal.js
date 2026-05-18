import React from "react";

export default function TaskModal({
  isOpen,
  task,
  timeLeft,
  canClaim,
  onClose,
  onClaim,
  onOpenUrl,
}) {
  if (!isOpen || !task) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>{task.title || "Task"}</h2>
          <button onClick={onClose} style={styles.closeBtn}>X</button>
        </div>

        <div style={styles.body}>
          <p><strong>Type:</strong> {task.type}</p>
          <p><strong>Duration:</strong> {task.duration} seconds</p>

          {task.url && (
            <div style={{ marginBottom: "15px" }}>
              <button onClick={onOpenUrl} style={styles.openBtn}>
                Open Task Link
              </button>
            </div>
          )}

          {!canClaim ? (
            <p><strong>Time left:</strong> {timeLeft}s</p>
          ) : (
            <p style={{ color: "green" }}>
              <strong>Task complete. You can claim now.</strong>
            </p>
          )}

          <div style={styles.actions}>
            {!canClaim ? (
              <button disabled style={styles.claimBtnDisabled}>Wait...</button>
            ) : (
              <button onClick={onClaim} style={styles.claimBtn}>Claim Reward</button>
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
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #eee",
  },
  body: {
    padding: "16px",
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeBtn: {
    border: "none",
    background: "#eee",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  openBtn: {
    border: "none",
    background: "#0984e3",
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
    background: "#9ca3af",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "not-allowed",
  },
};