export default function TaskStats({ earnings }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2>Total Earned: ${earnings.toFixed(2)}</h2>
    </div>
  );
}