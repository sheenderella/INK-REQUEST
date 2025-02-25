import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaClipboardList, FaSearch } from 'react-icons/fa';
import './dashboardUser.css';

const DashboardUser = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  // Check if the token exists on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/'); // Redirect to login if no token found
    } else {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token to get the role
      setUserRole(decodedToken.role);
    }
  }, [navigate]);

  // Navigate to the request form page
  const goToRequestForm = () => {
    navigate('/request');
  };

  // Navigate to the track request page
  const goToTrackRequest = () => {
    navigate('/track-request');
  };

  // Logout function: clear token and navigate to login
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token on logout
    navigate('/'); // Redirect to login after logout
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
