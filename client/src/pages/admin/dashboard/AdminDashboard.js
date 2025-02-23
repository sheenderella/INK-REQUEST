import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaBoxOpen, FaUsers, FaClipboardCheck } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const goToInventory = () => {
    navigate('/inventory');
  };

  const goToUserAccounts = () => {
    navigate('/account-management');
  };

  const goToRequestsApproval = () => {
    navigate('/approval');
  };

  // Logout function: call the backend logout API then clear token and navigate to login
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          'http://localhost:8000/api/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error during logout:', error.response?.data || error.message);
      }
      // Remove the token from localStorage regardless of API result
      localStorage.removeItem('token');
    }
    navigate('/');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={20} />
        </button>
      </div>

      <div className="dashboard-buttons">
        <button className="dashboard-button" onClick={goToInventory}>
          <FaBoxOpen size={30} />
          <div className="button-text">Inventory</div>
        </button>
        <button className="dashboard-button" onClick={goToUserAccounts}>
          <FaUsers size={30} />
          <div className="button-text">User Accounts</div>
        </button>
        <button className="dashboard-button" onClick={goToRequestsApproval}>
          <FaClipboardCheck size={30} />
          <div className="button-text">Requests</div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
