import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import SideNav from "../../../components/SideNavSuper";
import "./dashboardSupervisor.css";
import RequestForm from "../../user/request/requestForm";

const DashboardSupervisor = () => {
  const navigate = useNavigate();
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
    <div className="d-flex" style={{ height: "100vh", alignItems: "center", position: "relative", zIndex: 1 }}>
      <SideNav user={user} handleLogout={handleLogout} />

      <div className="content" style={{ height: "50vh" }}>
        <h2 className="dashboard-title">dashboard </h2>

        <div className="d-flex gap-4 mt-4 align-items-center">
        <button
            className="btn btn-dark d-flex flex-column align-items-center justify-content-center p-4"
            style={{ height: '150px', width: '150px', borderRadius: '15px' }}
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus text-white" style={{ fontSize: '36px' }}></i> {/* Increased font size */}
            <span className="text-white mt-2">request ink</span>
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

export default DashboardSupervisor;
