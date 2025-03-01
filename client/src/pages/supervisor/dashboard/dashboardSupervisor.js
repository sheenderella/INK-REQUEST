import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboardSupervisor.css';
import { 
  FaSignOutAlt, 
  FaTachometerAlt,
  FaClipboardList,
  FaSearch,
  FaCheck,
  FaKey
} from 'react-icons/fa';

const DashboardSupervisor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch user details using the authToken and userId from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/');
    } else {
      axios
        .get(`http://localhost:8000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [navigate]);

  const handleLogout = async () => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      try {
        await axios.post('http://localhost:8000/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error during logout:', error.response?.data || error.message);
      }
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userId');
    }
    navigate('/');
  };

  // Sidebar with supervisor-specific navigation
  const Sidebar = () => {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
        <h2 className="sidebar-title">INK REQUESTS</h2>
        <div className="sidebar-user">
            {user ? (
              <>
                <div className="user-name">{user.first_name} {user.last_name}</div>
                <div className="user-role">{user.role ? user.role : user.username}</div>
              </>
            ) : (
              <div>Loading user...</div>
            )}
          </div>
        </div>
        <div className="sidebar-nav">
          <button onClick={() => navigate('/dashboardSupervisor')} className="sidebar-nav-item">
            <FaTachometerAlt className="me-2" /> Dashboard
          </button>
          <button onClick={() => navigate('/request')} className="sidebar-nav-item">
            <FaClipboardList className="me-2" /> Request Form
          </button>
          <button onClick={() => navigate('/TrackSupervisor')} className="sidebar-nav-item">
            <FaSearch className="me-2" /> Track My Request
          </button>
          <button onClick={() => navigate('/ApprovalSupervisor')} className="sidebar-nav-item">
            <FaCheck className="me-2" /> Approve Requests
          </button>
          <button onClick={() => navigate('/change-password')} className="sidebar-nav-item">
            <FaKey className="me-2" /> Change Password
          </button>
          <div className="sidebar-logout">
            <button onClick={handleLogout} className="sidebar-logout-btn">
              <FaSignOutAlt className="me-2" /> Logout
            </button>
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Supervisor Dashboard</h2>
        </div>
        {/* Supervisor-specific content can be added here */}
      </div>
    </div>
  );
};

export default DashboardSupervisor;
