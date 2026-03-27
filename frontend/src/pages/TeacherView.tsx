// src/pages/TeacherView.tsx
import { useState } from "react";
import PointsLog from "../components/PointsLog";

export default function TeacherView({
  houses,
  selectedHouse,
  setSelectedHouse,
  onAddPoints,
  onCreateHouse,
  logs,
}: any) {
  const [query, setQuery] = useState("");

  const filteredLogs = logs.filter((log: any) =>
    (log.reason || "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="container">
      {/* TOP BAR + HEADER */}
      <div className="top-bar">
        <h2 className="points-header">Points Log</h2>
        <div className="top-bar-right">
          <input
            className="search"
            placeholder="Search"
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="add-btn" onClick={onAddPoints}>
            + Add
          </button>
        </div>
      </div>

      {/* HOUSE TABS (optional, uncomment if needed) */}
      {/* <div className="house-tabs">
        {houses.map((h: any) => (
          <button
            key={h.id}
            className={`tab ${selectedHouse?.id === h.id ? "active" : ""}`}
            onClick={() => setSelectedHouse(h)}
          >
            {h.name}
          </button>
        ))}
        <button className="tab add" onClick={onCreateHouse}>
          + New House
        </button>
      </div> */}

      {/* POINTS LOG / EMPTY STATE */}
      {filteredLogs.length === 0 ? (
        <div className="empty-state">
          <p>No points awarded yet.</p>
        </div>
      ) : (
        <PointsLog logs={filteredLogs} />
      )}
    </div>
  );
}
