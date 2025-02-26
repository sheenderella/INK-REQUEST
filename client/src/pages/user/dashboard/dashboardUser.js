import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaClipboardList, FaSearch } from 'react-icons/fa';
import './dashboardUser.css';

const DashboardUser = () => {
  const navigate = useNavigate();

  // Check if the token and userId exist on initial load
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');  // Get from sessionStorage
    const userId = sessionStorage.getItem('userId');    // Get from sessionStorage
    
    if (!token || !userId) {
      navigate('/'); // Redirect to login if no token or userId found
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

  const handleLogout = () => {
    sessionStorage.removeItem('authToken'); 
    sessionStorage.removeItem('userId');    
    navigate('/'); 
  };

  // Get userId from sessionStorage for displaying
  const userId = sessionStorage.getItem('userId');  

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2 className="dashboard-title">INK REQUEST</h2>
        {/* <p>User ID: {userId}</p> Display userId */}
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
