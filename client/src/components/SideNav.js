import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaBoxOpen, FaUsers, FaCheck, FaTachometerAlt, FaKey } from "react-icons/fa";
import axios from "axios";
import "./SideNav.css";

const SideNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;

    try {
      await axios.post("http://localhost:8000/api/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="sidebar  text-white d-flex flex-column">
      <h2 className="fw-light">ink request</h2>

      <nav className="nav flex-column">
        {[
          { path: "/admin", label: "dashboard", icon: <FaTachometerAlt /> },
          { path: "/inventory", label: "inventory", icon: <FaBoxOpen /> },
          { path: "/for-approval", label: "ink requests", icon: <FaCheck /> },
          { path: "/account-management", label: "user management", icon: <FaUsers /> },
          { path: "/change-password", label: "change password", icon: <FaKey /> }


        ].map(({ path, label, icon }) => (
          <button
            key={path}
            className={`nav-link ${location.pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            {icon} <span className="ms-2">{label}</span>
          </button>
        ))}
      </nav>

      {/* Grouped container for user info and logout */}
      <div className="sidebar-bottom">
        {user ? (
          <div className="user-info text-left">
            <p className="mb-1 fw-light">
              {user.first_name} {user.last_name}
            </p>
            <small className="text-light fst-italic">
              {user.role ? user.role : user.username}
            </small>
          </div>
        ) : (
          <p className="user-info text-left">Loading...</p>
        )}

        <button className="btn btn-outline-light py-2 w-100" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default SideNav;
