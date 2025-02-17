// src/pages/user/DashboardUser.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboardUser.css'; // Optional custom styling file

const DashboardUser = () => {
  const navigate = useNavigate();

  const handleRequestInk = () => {
    navigate('/request-form'); // Navigate to ink request form page
  };

  const handleTrackRequest = () => {
    navigate('/track-request'); // Navigate to track request page
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the user's authentication token
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-dark p-4">
      <div className="card p-4 shadow-lg" style={{ width: '500px' }}>
        <h2 className="text-center mb-4">Welcome to Your Dashboard</h2>

        <div className="mb-3">
          <button className="btn btn-primary w-100" onClick={handleRequestInk}>
            Request Ink
          </button>
        </div>
        
        <div className="mb-3">
          <button className="btn btn-secondary w-100" onClick={handleTrackRequest}>
            Track Request
          </button>
        </div>
        
        <div>
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
