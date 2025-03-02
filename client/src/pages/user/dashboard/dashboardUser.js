import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import UserSideNav from "../../../components/UserSideNav.js"; // Ensure correct extension
import "./dashboardUser.css";
import RequestForm from "../../user/request/requestForm";

const DashboardUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch user details using the authToken and userId from sessionStorage
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
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [navigate]);

  const handleLogout = async () => {
    if (!token) return;

    try {
      await axios.post("http://localhost:8000/api/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error during logout:", error.response?.data || error.message);
    }

    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="dashboard-container d-flex" style={{ height: "100vh", alignItems: "center", position: "relative", zIndex: 1 }}>
      {/* Sidebar */}
      <UserSideNav user={user} handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="content" style={{ height: "50vh" }}>
        <h2 className="dashboard-title">USER DASHBOARD</h2>

        <div className="d-flex gap-4 mt-4">
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
            {/* Ensure token and userId are passed properly */}
            <RequestForm token={token} userId={userId} setShowModal={setShowModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardUser;
