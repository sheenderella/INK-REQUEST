import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFileExport, FaAngleLeft, FaAngleRight, FaSave, FaTimes } from 'react-icons/fa';
import './accountManagement.css';

const AccountManagement = () => {
  const initUsers = [
    { id: '1', first_name: 'John', last_name: 'Doe', username: 'johndoe', email: 'john@example.com', role: 'Employee', department: 'IT' },
    { id: '2', first_name: 'Jane', last_name: 'Smith', username: 'janesmith', email: 'jane@example.com', role: 'Supervisor', department: 'HR' },
    { id: '3', first_name: 'Alice', last_name: 'Brown', username: 'aliceb', email: 'alice@example.com', role: 'Admin', department: 'Finance' }
  ];

  const [users, setUsers] = useState(initUsers);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', username: '', email: '', password: '', role: 'Employee', department: '' });

  const handleChange = (e, field, setter, data) =>
    setter({ ...data, [field]: e.target.value });

  const saveEdit = () => {
    setUsers(users.map(u => u.id === editingId ? editData : u));
    setEditingId(null);
  };

  const saveNew = () => {
    setUsers([...users, { ...newUser, id: Date.now().toString() }]);
    setNewUser({ first_name: '', last_name: '', username: '', email: '', password: '', role: 'Employee', department: '' });
    setShowPopup(false);
  };

  return (
    <div className="am-wrapper">
      <div className="am-card">
        <h2 className="am-title">Account Management</h2>
        <div className="am-toolbar">
          <div className="am-input-group am-search">
            <FaSearch className="am-icon" />
            <input type="text" placeholder="Search" className="am-input" />
          </div>
          <div className="am-input-group am-filter">
            <select className="am-input">
              <option value="">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button className="am-btn am-btn-danger"><FaTrash className="am-icon" /></button>
          <button className="am-btn am-btn-secondary"><FaFileExport className="am-icon" /></button>
          <button className="am-btn am-btn-success" onClick={() => setShowPopup(true)}><FaPlus className="am-icon" /></button>
        </div>
        <div className="am-table-responsive">
          <table className="am-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th style={{ display: editingId ? 'table-cell' : 'none' }}>Password</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={editingId === u.id ? 'am-editing' : ''}>
                  <td><input type="checkbox" /></td>
                  {['first_name','last_name','username','email'].map(field => (
                    <td key={field}>
                      {editingId === u.id ? (
                        <input
                          type={field === 'email' ? 'email' : 'text'}
                          value={editData[field]}
                          onChange={e => handleChange(e, field, setEditData, editData)}
                          className="am-input"
                        />
                      ) : u[field]}
                    </td>
                  ))}
                  {editingId === u.id ? (
                    <td>
                      <input
                        type="password"
                        placeholder="New Password"
                        value={editData.password}
                        onChange={e => handleChange(e, 'password', setEditData, editData)}
                        className="am-input"
                      />
                    </td>
                  ) : (
                    <td style={{ display: editingId ? 'table-cell' : 'none' }}></td>
                  )}
                  <td>
                    {editingId === u.id ? (
                      <select value={editData.role} onChange={e => handleChange(e, 'role', setEditData, editData)} className="am-input">
                        <option value="Employee">Employee</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : u.role}
                  </td>
                  <td>
                    {editingId === u.id ? (
                      <input type="text" value={editData.department} onChange={e => handleChange(e, 'department', setEditData, editData)} className="am-input" />
                    ) : u.department}
                  </td>
                  <td>
                    {editingId === u.id ? (
                      <>
                        <button className="am-btn am-btn-success" onClick={saveEdit}><FaSave className="am-icon" /></button>
                        <button className="am-btn am-btn-secondary" onClick={() => setEditingId(null)}><FaTimes className="am-icon" /></button>
                      </>
                    ) : (
                      <>
                        <button className="am-btn am-btn-primary" onClick={() => { setEditingId(u.id); setEditData({ ...u, password: '' }); }}>
                          <FaEdit className="am-icon" />
                        </button>
                        <button className="am-btn am-btn-danger"><FaTrash className="am-icon" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="am-pagination">
          <ul className="pagination">
            <li className="page-item disabled"><button className="page-link"><FaAngleLeft /></button></li>
            <li className="page-item active"><button className="page-link">1</button></li>
            <li className="page-item"><button className="page-link">2</button></li>
            <li className="page-item"><button className="page-link"><FaAngleRight /></button></li>
          </ul>
        </div>
      </div>
      {showPopup && (
        <div className="am-popup-overlay">
          <div className="am-popup">
            <h3>Add New User</h3>
            {['first_name','last_name','username','email','password','department'].map(field => (
              <div className="am-form-group" key={field}>
                <label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                  value={newUser[field]}
                  onChange={e => handleChange(e, field, setNewUser, newUser)}
                  className="am-input"
                />
              </div>
            ))}
            <div className="am-form-group">
              <label>Role</label>
              <select value={newUser.role} onChange={e => handleChange(e, 'role', setNewUser, newUser)} className="am-input">
                <option value="Employee">Employee</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="am-popup-actions">
              <button className="am-btn am-btn-success" onClick={saveNew}><FaSave className="am-icon" /> Save</button>
              <button className="am-btn am-btn-secondary" onClick={() => setShowPopup(false)}><FaTimes className="am-icon" /> Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
