//src/components/AddPointsModal.tsx
import { useState } from "react";
import { api } from "../api/client";

export default function AddPointsModal({ houseId, onClose }: any) {
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [classGroup, setClassGroup] = useState("");

  const submit = async () => {
    await api.post("/points", {
      house_id: houseId,
      points,
      reason,
      class_group: classGroup || null,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add item</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="label">Class</div>
        <input
          className="input"
          onChange={(e) => setClassGroup(e.target.value)}
        />

        <div className="label">Date Awarded</div>
        <input className="input" type="date" />

        <div className="label">Points Awarded</div>
        <input
          className="input"
          type="number"
          onChange={(e) => setPoints(Number(e.target.value))}
        />

        <div className="label">Reason</div>
        <textarea
          className="input"
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-primary" onClick={submit}>
            Submit
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
