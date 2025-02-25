import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminDashboard.css';
import { FaSignOutAlt, FaBoxOpen, FaUsers, FaClipboardCheck, FaTachometerAlt, FaBars } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [lowStock, setLowStock] = useState(0);

  // Dummy data for demonstration; replace with actual API calls if necessary.
  useEffect(() => {
    setPendingRequests(5);
    setLowStock(3);
  }, []);

  // Role Check on Page Load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    } else {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token to get the role
      setUserRole(decodedToken.role);
    }
  }, [navigate]);

  // Logout function
  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
    }
    navigate('/'); // Redirect to login after logout
  };

  // Sidebar component
  const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goToDashboard = () => navigate('/admin');
    const goToInventory = () => navigate('/inventory');
    const goToInkRequests = () => navigate('/ink-requests');
    const goToUserManagement = () => navigate('/account-management');

    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    const containerStyle = {
      transition: 'width 0.3s ease',
      height: 'calc(100vh - 40px)', // Adjusted to leave 20px margin top and bottom
      overflow: 'hidden',
      borderRadius: '10px',
      margin: '20px 0'
    };

    const expandedStyle = { width: '250px' };
    const collapsedStyle = { width: '80px' };

    return (
      <div
        className="am-card sidebar-container bg-dark text-white d-flex flex-column"
        style={{ ...containerStyle, ...(isCollapsed ? collapsedStyle : expandedStyle) }}
      >
        <div className="sidebar-header d-flex align-items-center justify-content-between p-2">
          {!isCollapsed && <h4 className="am-title mb-0">INK REQUESTS</h4>}
          <button className="btn btn-link text-white p-0 toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <div className="sidebar-toolbar d-flex flex-column gap-2 p-2">
          <button
            className="btn btn-dark text-white text-start sidebar-btn"
            onClick={goToDashboard}
          >
            <FaTachometerAlt />
            {!isCollapsed && <span className="ms-2 sidebar-text">Dashboard</span>}
          </button>
          <button
            className="btn btn-dark text-white text-start sidebar-btn"
            onClick={goToInventory}
          >
            <FaBoxOpen />
            {!isCollapsed && <span className="ms-2 sidebar-text">Inventory</span>}
          </button>
          <button
            className="btn btn-dark text-white text-start sidebar-btn"
            onClick={goToInkRequests}
          >
            <FaClipboardCheck />
            {!isCollapsed && <span className="ms-2 sidebar-text">Ink Requests</span>}
          </button>
          <button
            className="btn btn-dark text-white text-start sidebar-btn"
            onClick={goToUserManagement}
          >
            <FaUsers />
            {!isCollapsed && <span className="ms-2 sidebar-text">User Management</span>}
          </button>
        </div>
        <div className="mt-auto p-2">
          <button
            className="btn btn-dark text-white w-100 sidebar-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            {!isCollapsed && <span className="ms-2 sidebar-text">Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="am-wrapper d-flex p-3" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="am-card flex-fill p-4" style={{ borderRadius: '10px', marginLeft: '20px' }}>
        <div className="am-toolbar d-flex justify-content-between align-items-center mb-3">
          <h2 className="am-title m-0">Admin Dashboard</h2>
        </div>
        <div className="mt-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card text-center" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <h5 className="card-title">Pending Requests</h5>
                  <p className="card-text display-4">{pendingRequests}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card text-center" style={{ borderRadius: '15px' }}>
                <div className="card-body">
                  <h5 className="card-title">Low Stock Items</h5>
                  <p className="card-text display-4">{lowStock}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
