import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaClipboardList, FaSearch } from 'react-icons/fa'; 
import './dashboardUser.css';

const DashboardUser = () => {
  const navigate = useNavigate();

  // Navigate to the request form page
  const goToRequestForm = () => {
    navigate('/request');
  };

  // Navigate to the track request page
  const goToTrackRequest = () => {
    navigate('/track-request');
  };

  // Logout function (redirect to home or login page)
  const handleLogout = () => {
    navigate('/'); // Replace with actual logout logic (e.g., clear session/token)
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2 className="dashboard-title">INK REQUEST</h2>
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
      </div>
    </div>
  );
};

export default DashboardUser;
