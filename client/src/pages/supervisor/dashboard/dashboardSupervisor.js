// dashboardSupervisor.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaClipboardList, FaSearch, FaCheck } from 'react-icons/fa';
import './dashboardSupervisor.css'; // Ensure the CSS styles are applied.

const DashboardSupervisor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/');
    }
  }, [navigate]);

  // Navigate to the request form page
  const goToRequestForm = () => {
    navigate('/request');
  };

  // Navigate to the track request page
  const goToTrackRequest = () => {
    navigate('/TrackSupervisor');
  };

  // Navigate to the ApprovalSupervisor page for approving requests
  const goToApprovalSupervisor = () => {
    navigate('/ApprovalSupervisor');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Supervisor Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={20} />
        </button>
      </div>

      <div className="dashboard-buttons">
        <button className="dashboard-button" onClick={goToRequestForm}>
          <FaClipboardList size={30} />
          <div className="button-text">Request Form</div>
        </button>
        <button className="dashboard-button" onClick={goToTrackRequest}>
          <FaSearch size={30} />
          <div className="button-text">Track My Request</div>
        </button>
        <button className="dashboard-button" onClick={goToApprovalSupervisor}>
          <FaCheck size={30} />
          <div className="button-text">Approve Requests</div>
        </button>
      </div>
    </div>
  );
};

export default DashboardSupervisor;
