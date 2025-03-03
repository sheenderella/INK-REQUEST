import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import SideNav from "../../../components/SideNav";
import RequestForm from "../../user/request/requestForm";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    const storedUserId = sessionStorage.getItem("userId");

    if (!storedToken || !storedUserId) {
      navigate("/");
      return;
    }

    setToken(storedToken);
    setUserId(storedUserId);

    axios
      .get(`http://localhost:8000/api/users/${storedUserId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
        timeout: 5000,
      })
      .then((response) => setUser(response.data))
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [navigate]);

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:8000/api/ink/admin/requests", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      })
      .then((response) => setPendingRequests(response.data.length || 0))
      .catch((error) => {
        console.error("Error fetching pending requests:", error);
        setPendingRequests(0);
      });
  }, [token]);

  return (
    <div className="d-flex" style={{ height: "100vh", alignItems: "center", position: "relative", zIndex: 1 }}>
      <SideNav user={user} />

      <div className="content" style={{ height: "50vh" }}>
        <h2 className="dashboard-title"> dashboard </h2>

        <div className="d-flex gap-4 mt-4">
          <div className="card bg-black text-white text-center p-4 rounded">
            <h3 className="fw-light">{pendingRequests}</h3>
            <p className="fs-6">Pending Requests</p>
          </div>

          <button
            className="request mt-2 rounded flex flex-col items-center justify-center gap-1"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus text-lg"></i>
            <span>Request Ink</span>
          </button>
          
        </div>
      </div>

      {showModal && token && userId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <RequestForm token={token} userId={userId} setShowModal={setShowModal} />
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;