import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import SideNav from "../../../components/SideNav"; 
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;

    axios
      .get("http://localhost:8000/api/ink/admin/requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setPendingRequests(response.data.length))
      .catch(() => setPendingRequests(0));
  }, []);

  return (
    <div className="d-flex" style={{ height: "100vh", alignItems: "center" }}> 
      <SideNav user={user} />
  
      <div className="content" style={{ height: "50vh" }}> 
      <h2 className="dashboard-title"> DASHBOARD </h2>

        <div className="d-flex gap-4 mt-4">
          <div className="card bg-black text-white text-center p-4 rounded">
            <h3 className="fw-light">{pendingRequests}</h3>
            <p className="fs-6">Pending Requests</p>
          </div>
          <div className="card bg-black text-white text-center p-4 rounded">
            <h5 className="fw-light">Request Ink</h5>
            <button className="btn btn-light mt-2 rounded">Request Ink</button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default AdminDashboard;
