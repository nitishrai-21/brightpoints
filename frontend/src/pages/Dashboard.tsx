//src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../api/client";
import TeacherView from "./TeacherView";
import StudentView from "./StudentView";
import AddPointsModal from "../components/AddPointsModal";
import CreateHouseModal from "../components/CreateHouseModal";

export default function Dashboard() {
  const [houses, setHouses] = useState<any[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);

  const [logs, setLogs] = useState<any[]>([]);

  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showCreateHouse, setShowCreateHouse] = useState(false);

  const [isTeacher, setIsTeacher] = useState(true);

  useEffect(() => {
    loadHouses();
  }, []);

  useEffect(() => {
    if (selectedHouse) {
      loadLogs(selectedHouse.id);
    }
  }, [selectedHouse]);

  const loadHouses = async () => {
    const res = await api.get("/houses");
    setHouses(res.data);

    if (res.data.length > 0) {
      setSelectedHouse(res.data[0]);
    }
  };

  const loadLogs = async (houseId: number) => {
    const res = await api.get(`/points/${houseId}`);
    setLogs(res.data);
  };

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div className="header-title">BrightPoints</div>

        <div className="header-actions">
          <button
            className={`toggle ${isTeacher ? "active" : ""}`}
            onClick={() => setIsTeacher(true)}
          >
            <span className="toggle-icon">👩‍🏫</span>
            Teacher View
          </button>

          <button
            className={`toggle ${!isTeacher ? "active" : ""}`}
            onClick={() => setIsTeacher(false)}
          >
            <span className="toggle-icon">👨‍🎓</span>
            Student View
          </button>
        </div>
        <div className="user">
          <div className="avatar">S</div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {houses.length === 0 ? (
        <div className="container">
          <div className="card center">
            <h2>No houses yet</h2>
            <p>Create your first house to get started</p>

            <button
              className="add-btn"
              onClick={() => setShowCreateHouse(true)}
            >
              + Create House
            </button>
          </div>
        </div>
      ) : (
        <>
          {isTeacher ? (
            <TeacherView
              houses={houses}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              onAddPoints={() => setShowAddPoints(true)}
              onCreateHouse={() => setShowCreateHouse(true)}
              logs={logs}
            />
          ) : (
            <StudentView houses={houses} />
          )}
        </>
      )}

      {/* MODALS */}
      {showAddPoints && selectedHouse && (
        <AddPointsModal
          houseId={selectedHouse.id}
          onClose={() => setShowAddPoints(false)}
        />
      )}

      {showCreateHouse && (
        <CreateHouseModal
          onClose={() => setShowCreateHouse(false)}
          onCreated={loadHouses}
        />
      )}
    </>
  );
}
