import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaSave, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideNav from '../../../components/SideNav';
import PaginationSlider from '../../../components/PaginationSlider';
import './accountManagement.css';

const AccountManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', username: '', email: '', password: '', role: 'employee', department: '' });
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('userId');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
      .catch(() => toast.error('Error fetching user data'));
  }, [navigate, token, userId, apiUrl]);

  const fetchUsers = useCallback(() => {
    axios
      .get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch(() => toast.error('Error fetching users'));
  }, [token, apiUrl]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e, field, setter, data) => {
    setter({ ...data, [field]: e.target.value });
  };

  const saveEdit = () => {
    axios
      .put(`${apiUrl}/users/${editingId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchUsers();
        setEditingId(null);
        toast.success('User updated successfully!');
      })
      .catch(() => toast.error('Error updating user'));
  };

  const deleteUser = (id) => {
    axios
      .delete(`${apiUrl}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchUsers();
        toast.success('User deleted successfully!');
      })
      .catch(() => toast.error('Error deleting user'));
  };

  const handleAddUser = () => {
    axios
      .post(`${apiUrl}/register`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchUsers();
        setShowPopup(false);
        setNewUser({ first_name: '', last_name: '', username: '', email: '', password: '', role: 'employee', department: '' });
        toast.success('User added successfully!');
      })
      .catch(() => toast.error('Error adding user'));
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (u.first_name.toLowerCase().includes(searchLower) ||
        u.last_name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.username.toLowerCase().includes(searchLower)) &&
      (roleFilter ? u.role === roleFilter : true)
    );
  });

  return (
    <div className="d-flex" style={{ height: '100vh', alignItems: 'center' }}>
      <SideNav user={user} />

      <div className="content" style={{ height: '50vh' }}>
        <h2 className="dashboard-title"> User Management </h2>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="input-group search-container">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search Name"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="form-select role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>

          <button className="custom-add-btn" onClick={() => setShowPopup(true)}>+</button>
        </div>

        <PaginationSlider items={filteredUsers} rowsPerPage={5} renderPage={(users) => (
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Password</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    {['first_name', 'last_name', 'username', 'email', 'password', 'role', 'department'].map((field) => (
                      <td key={field}>
                        {editingId === user._id ? (
                          field === 'role' ? (
                            // Role dropdown when editing
                            <select
                              value={editData[field] || ''}
                              onChange={(e) => handleChange(e, field, setEditData, editData)}
                              className="form-control"
                            >
                              <option value="employee">Employee</option>
                              <option value="supervisor">Supervisor</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            // Input for other fields
                            <input
                              type="text"
                              value={editData[field] || ''}
                              onChange={(e) => handleChange(e, field, setEditData, editData)}
                              className="form-control"
                            />
                          )
                        ) : field === 'password' ? (
                          '••••••'
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
                          <button className="btn btn-primary me-2" onClick={() => { setEditingId(user._id); setEditData({ ...user }); }}>
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
        )} />
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
                  value={newUser[field] || ''}
                  onChange={(e) => handleChange(e, field, setNewUser, newUser)}
                  className="form-control"
                />
              </div>
            ))}



            <div className="d-flex justify-content-end">
              <button className="btn btn-success me-2" onClick={handleAddUser}>
                <FaSave /> Save
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AccountManagement;
