//src/components/CreateHouseModal.tsx
import { useState } from "react";
import { api } from "../api/client";

export default function CreateHouseModal({ onClose, onCreated }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    await api.post("/houses", { name, description });
    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create House</h2>

        <div className="label">Name</div>
        <input className="input" onChange={(e) => setName(e.target.value)} />

        <div className="label">Description</div>
        <textarea
          className="input"
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
