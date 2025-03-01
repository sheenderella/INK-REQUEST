import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSave, FaTimes } from 'react-icons/fa';
import SideNav from '../../../components/SideNav'; // Import SideNav
import './accountManagement.css';

const AccountManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('userId');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Redirect to login if no session
  useEffect(() => {
    if (!token || !userId) {
      navigate('/');
      return;
    }

    axios
      .get(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUser(response.data))
      .catch((error) => console.error('Error fetching user data:', error));
  }, [navigate, token, userId, apiUrl]);

  // Fetch users from backend
  const fetchUsers = useCallback(() => {
    axios
      .get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Error fetching users:', err));
  }, [token, apiUrl]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle input changes
  const handleChange = (e, field, setter, data) => {
    setter({ ...data, [field]: e.target.value });
  };

  // Save edited user
  const saveEdit = () => {
    axios
      .put(`${apiUrl}/users/${editingId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchUsers();
        setEditingId(null);
      })
      .catch((err) => console.error('Error updating user:', err));
  };

  // Delete user
  const deleteUser = (id) => {
    axios
      .delete(`${apiUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchUsers())
      .catch((err) => console.error('Error deleting user:', err));
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const roleMatches = roleFilter ? u.role === roleFilter : true;
    return (
      (u.first_name.toLowerCase().includes(searchLower) ||
        u.last_name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)) &&
      roleMatches
    );
  });

  return (
    <div className="d-flex" style={{ height: "100vh", alignItems: "center" }}> 
      <SideNav user={user} /> {/* Add SideNav */}

      <div className="content" style={{ height: "50vh" }}> 
        <h2 className="fw-light">Account Management</h2>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex">
            <div className="input-group me-2">
              <FaSearch className="input-group-text" />
              <input
                type="text"
                placeholder="Search"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="btn btn-success" onClick={() => setShowPopup(true)}>
            <FaPlus className="me-1" /> Add User
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  {['first_name', 'last_name', 'email', 'role', 'department'].map((field) => (
                    <td key={field}>
                      {editingId === user._id ? (
                        <input
                          type="text"
                          value={editData[field] || ''}
                          onChange={(e) => handleChange(e, field, setEditData, editData)}
                          className="form-control"
                        />
                      ) : (
                        user[field]
                      )}
                    </td>
                  ))}
                  <td>
                    {editingId === user._id ? (
                      <>
                        <button className="btn btn-success me-2" onClick={saveEdit}>
                          <FaSave /> Save
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                          <FaTimes /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary me-2"
                          onClick={() => {
                            setEditingId(user._id);
                            setEditData({ ...user });
                          }}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteUser(user._id)}>
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add New User</h3>
            {['first_name', 'last_name', 'email', 'department'].map((field) => (
              <div className="mb-2" key={field}>
                <label>{field.replace('_', ' ')}</label>
                <input
                  type="text"
                  value={editData[field] || ''}
                  onChange={(e) => handleChange(e, field, setEditData, editData)}
                  className="form-control"
                />
              </div>
            ))}
            <div className="mb-2">
              <label>Role</label>
              <select
                value={editData.role || 'employee'}
                onChange={(e) => handleChange(e, 'role', setEditData, editData)}
                className="form-select"
              >
                <option value="employee">Employee</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-success me-2" onClick={saveEdit}>
                <FaSave /> Save
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
