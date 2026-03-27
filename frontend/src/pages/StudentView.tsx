//src/pages/StudentView.tsx
export default function StudentView({ houses }: any) {
  const sorted = [...houses].sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="container">
      <h1>Leaderboard</h1>

      {sorted.map((h, i) => (
        <div key={h.id} className="card" style={{ marginBottom: "10px" }}>
          <strong>
            #{i + 1} {h.name}
          </strong>
          <div>{h.total_points} pts</div>
        </div>
      ))}
    </div>
  );
}
