import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaSave, FaTimes 
} from 'react-icons/fa';
import './accountManagement.css';

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'employee',
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Fetch users from backend
  const fetchUsers = useCallback(() => {
    axios.get(`${apiUrl}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  }, [token, apiUrl]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle form field changes
  const handleChange = (e, field, setter, data) => {
    setter({ ...data, [field]: e.target.value });
  };

  // Save edited user
  const saveEdit = () => {
    axios.put(`${apiUrl}/users/${editingId}`, editData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchUsers();
        setEditingId(null);
      })
      .catch(err => console.error('Error updating user:', err));
  };

  // Delete user
  const deleteUser = (id) => {
    axios.delete(`${apiUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchUsers())
      .catch(err => console.error('Error deleting user:', err));
  };

  // Save a new user (without username and password field)
  const saveNew = () => {
    axios.post(`${apiUrl}/register`, newUser, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchUsers();
        setNewUser({
          first_name: '',
          last_name: '',
          email: '',
          role: 'employee',
          department: ''
        });
        setShowPopup(false);
      })
      .catch(err => console.error('Error creating user:', err));
  };

  // Filter users based on search term (first name, last name, username, or email)
  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const roleMatches = roleFilter ? u.role === roleFilter : true;
    return (
      (u.first_name.toLowerCase().includes(searchLower) ||
      u.last_name.toLowerCase().includes(searchLower) ||
      u.username.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)) && roleMatches
    );
  });

  return (
    <div className="am-wrapper">
      <div className="am-card">
        <h2 className="am-title">Account Management</h2>
        <div className="am-toolbar">
          <div className="am-input-group am-search">
            <FaSearch className="am-icon" />
            <input 
              type="text" 
              placeholder="Search" 
              className="am-input" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="am-input-group am-filter">
            <select 
              className="am-input" 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="am-btn am-btn-success" onClick={() => setShowPopup(true)}>
            <FaPlus className="am-icon" />
          </button>
        </div>

        <div className="am-table-responsive">
          <table className="am-table">
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
              {filteredUsers.map(user => (
                <tr key={user._id} className={editingId === user._id ? 'am-editing' : ''}>
                  {['first_name', 'last_name', 'username', 'email'].map(field => (
                    <td key={field}>
                      {editingId === user._id ? (
                        <input
                          type={field === 'email' ? 'email' : 'text'}
                          value={editData[field] || ''}
                          onChange={e => handleChange(e, field, setEditData, editData)}
                          className="am-input"
                        />
                      ) : (
                        user[field]
                      )}
                    </td>
                  ))}
                  
                  {/* Always show password field, but not the actual password when editing */}
                  <td>
                    {editingId === user._id ? (
                      <input
                        type="password"
                        placeholder="New Password"
                        value={editData.password || ''}
                        onChange={e => handleChange(e, 'password', setEditData, editData)}
                        className="am-input"
                      />
                    ) : (
                      '********'
                    )}
                  </td>

                  <td>
                    {editingId === user._id ? (
                      <select 
                        value={editData.role || ''} 
                        onChange={e => handleChange(e, 'role', setEditData, editData)}
                        className="am-input"
                      >
                        <option value="employee">Employee</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <input
                        type="text"
                        value={editData.department || ''}
                        onChange={e => handleChange(e, 'department', setEditData, editData)}
                        className="am-input"
                      />
                    ) : (
                      user.department
                    )}
                  </td>
                  <td>
                    {editingId === user._id ? (
                      <>
                        <button className="am-btn am-btn-success" onClick={saveEdit}>
                          <FaSave className="am-icon" />
                        </button>
                        <button className="am-btn am-btn-secondary" onClick={() => setEditingId(null)}>
                          <FaTimes className="am-icon" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="am-btn am-btn-primary" 
                          onClick={() => {
                            setEditingId(user._id);
                            setEditData({ ...user, password: '' });
                          }}
                        >
                          <FaEdit className="am-icon" />
                        </button>
                        <button className="am-btn am-btn-danger" onClick={() => deleteUser(user._id)}>
                          <FaTrash className="am-icon" />
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
        <div className="am-popup-overlay">
          <div className="am-popup">
            <h3>Add New User</h3>
            {['first_name','last_name','email','department'].map(field => (
              <div className="am-form-group" key={field}>
                <label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={newUser[field] || ''}
                  onChange={e => handleChange(e, field, setNewUser, newUser)}
                  className="am-input"
                />
              </div>
            ))}
            <div className="am-form-group">
              <label>Role</label>
              <select value={newUser.role} onChange={e => handleChange(e, 'role', setNewUser, newUser)} className="am-input">
                <option value="employee">Employee</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="am-popup-actions">
              <button className="am-btn am-btn-success" onClick={saveNew}>
                <FaSave className="am-icon" /> Save
              </button>
              <button className="am-btn am-btn-secondary" onClick={() => setShowPopup(false)}>
                <FaTimes className="am-icon" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
