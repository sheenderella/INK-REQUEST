import React, { useState } from 'react';
import Pagination from './Pagination';
import { 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaPlus, 
  FaSearch, 
  FaFileExport 
} from 'react-icons/fa';

const AccountManagement = () => {
  // Dummy data for demonstration
  const initialUsers = [
    { _id: '1', first_name: 'John', last_name: 'Doe', username: 'johndoe', email: 'john@example.com', role: 'admin', department: 'IT' },
    { _id: '2', first_name: 'Jane', last_name: 'Smith', username: 'janesmith', email: 'jane@example.com', role: 'editor', department: 'HR' },
    { _id: '3', first_name: 'Alice', last_name: 'Brown', username: 'aliceb', email: 'alice@example.com', role: 'viewer', department: 'Finance' },
    { _id: '4', first_name: 'Bob', last_name: 'Green', username: 'bobg', email: 'bob@example.com', role: 'admin', department: 'Operations' },
    { _id: '5', first_name: 'Charlie', last_name: 'Black', username: 'charlieb', email: 'charlie@example.com', role: 'editor', department: 'Marketing' },
    { _id: '6', first_name: 'Diana', last_name: 'White', username: 'dianaw', email: 'diana@example.com', role: 'viewer', department: 'Sales' },
  ];

  // State management
  const [users, setUsers] = useState(initialUsers);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserData, setEditedUserData] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [newAccount, setNewAccount] = useState({
    _id: (Math.random() * 10000).toFixed(0),
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role: "viewer",
    department: ""
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const roleOptions = ["admin", "editor", "viewer"];

  // --- Search & Filter ---
  const filteredUsers = users.filter(user => {
    const roleMatches = roleFilter ? user.role === roleFilter : true;
    const searchMatches = searchQuery
      ? user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return roleMatches && searchMatches;
  });

  // --- Pagination Calculations ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Edit & Delete ---
  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditedUserData({ ...user, password: "" });
  };

  const handleInputChange = (e, field, isNew = false) => {
    const { value } = e.target;
    if (isNew) {
      setNewAccount({ ...newAccount, [field]: value });
    } else {
      setEditedUserData({ ...editedUserData, [field]: value });
    }
  };

  const handleSave = () => {
    setUsers(users.map(user => user._id === editingUserId ? { ...editedUserData } : user));
    setEditingUserId(null);
  };

  const handleCancel = () => {
    setEditingUserId(null);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setUsers(users.filter(user => user._id !== userId));
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    }
  };

  // --- Add Account ---
  const handleAddClick = () => {
    setAddMode(true);
    setNewAccount({
      _id: (Math.random() * 10000).toFixed(0),
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      role: "viewer",
      department: ""
    });
  };

  const handleAddSave = () => {
    setUsers([...users, newAccount]);
    setAddMode(false);
  };

  const handleAddCancel = () => {
    setAddMode(false);
  };

  // --- Bulk Delete ---
  const handleSelectUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm("Are you sure you want to delete selected accounts?")) {
      setUsers(users.filter(user => !selectedUserIds.includes(user._id)));
      setSelectedUserIds([]);
    }
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ["First Name", "Last Name", "Username", "Email", "Role", "Department"];
    const csvRows = [headers.join(",")];
    filteredUsers.forEach(user => {
      const row = [
        user.first_name,
        user.last_name,
        user.username,
        user.email,
        user.role,
        user.department || ''
      ];
      csvRows.push(row.join(","));
    });
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="am-wrapper">
      <div className="am-card">
        <h2 className="am-title">Account Management</h2>

        {/* Toolbar with Search, Filter, Bulk Delete, Export, and Add */}
        <div className="am-toolbar">
          <div className="am-search">
            <FaSearch className="am-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="am-input"
            />
          </div>
          <div className="am-filter">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="am-input"
            >
              <option value="">All Roles</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <button className="am-btn am-btn-danger" onClick={handleBulkDelete} disabled={selectedUserIds.length === 0}>
            <FaTrash className="am-icon" />
          </button>
          <button className="am-btn am-btn-secondary" onClick={handleExportCSV}>
            <FaFileExport className="am-icon" />
          </button>
          <button className="am-btn am-btn-success" onClick={handleAddClick}>
            <FaPlus className="am-icon" />
          </button>
        </div>

        {/* Accounts Table */}
        <table className="am-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const currentIds = currentUsers.map(user => user._id);
                      setSelectedUserIds([...new Set([...selectedUserIds, ...currentIds])]);
                    } else {
                      const currentIds = currentUsers.map(user => user._id);
                      setSelectedUserIds(selectedUserIds.filter(id => !currentIds.includes(id)));
                    }
                  }}
                  checked={currentUsers.every(user => selectedUserIds.includes(user._id))}
                />
              </th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
              <th>Email</th>
              {(editingUserId || addMode) && <th>Password</th>}
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* New Account Row */}
            {addMode && (
              <tr>
                <td></td>
                <td>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newAccount.first_name}
                    onChange={(e) => handleInputChange(e, 'first_name', true)}
                    className="am-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newAccount.last_name}
                    onChange={(e) => handleInputChange(e, 'last_name', true)}
                    className="am-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Username"
                    value={newAccount.username}
                    onChange={(e) => handleInputChange(e, 'username', true)}
                    className="am-input"
                  />
                </td>
                <td>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAccount.email}
                    onChange={(e) => handleInputChange(e, 'email', true)}
                    className="am-input"
                  />
                </td>
                <td>
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAccount.password}
                    onChange={(e) => handleInputChange(e, 'password', true)}
                    className="am-input"
                  />
                </td>
                <td>
                  <select
                    value={newAccount.role}
                    onChange={(e) => handleInputChange(e, 'role', true)}
                    className="am-input"
                  >
                    {roleOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Department"
                    value={newAccount.department}
                    onChange={(e) => handleInputChange(e, 'department', true)}
                    className="am-input"
                  />
                </td>
                <td>
                  <button className="am-btn am-btn-success" onClick={handleAddSave}>
                    <FaSave className="am-icon" />
                  </button>
                  <button className="am-btn am-btn-secondary" onClick={handleAddCancel}>
                    <FaTimes className="am-icon" />
                  </button>
                </td>
              </tr>
            )}
            {/* Existing User Rows */}
            {currentUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                  />
                </td>
                <td>
                  {editingUserId === user._id ? (
                    <input
                      type="text"
                      value={editedUserData.first_name}
                      onChange={(e) => handleInputChange(e, 'first_name')}
                      className="am-input"
                    />
                  ) : (
                    user.first_name
                  )}
                </td>
                <td>
                  {editingUserId === user._id ? (
                    <input
                      type="text"
                      value={editedUserData.last_name}
                      onChange={(e) => handleInputChange(e, 'last_name')}
                      className="am-input"
                    />
                  ) : (
                    user.last_name
                  )}
                </td>
                <td>
                  {editingUserId === user._id ? (
                    <input
                      type="text"
                      value={editedUserData.username}
                      onChange={(e) => handleInputChange(e, 'username')}
                      className="am-input"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editingUserId === user._id ? (
                    <input
                      type="email"
                      value={editedUserData.email}
                      onChange={(e) => handleInputChange(e, 'email')}
                      className="am-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                {editingUserId === user._id ? (
                  <td>
                    <input
                      type="password"
                      placeholder="Password"
                      value={editedUserData.password}
                      onChange={(e) => handleInputChange(e, 'password')}
                      className="am-input"
                    />
                  </td>
                ) : (
                  <td style={{ display: 'none' }}></td>
                )}
                <td>
                  {editingUserId === user._id ? (
                    <select
                      value={editedUserData.role}
                      onChange={(e) => handleInputChange(e, 'role')}
                      className="am-input"
                    >
                      {roleOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUserId === user._id ? (
                    <input
                      type="text"
                      value={editedUserData.department || ''}
                      onChange={(e) => handleInputChange(e, 'department')}
                      className="am-input"
                    />
                  ) : (
                    user.department || '-'
                  )}
                </td>
                <td>
                  {editingUserId === user._id ? (
                    <>
                      <button className="am-btn am-btn-success" onClick={handleSave}>
                        <FaSave className="am-icon" />
                      </button>
                      <button className="am-btn am-btn-secondary" onClick={handleCancel}>
                        <FaTimes className="am-icon" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="am-btn am-btn-primary" onClick={() => handleEditClick(user)}>
                        <FaEdit className="am-icon" />
                      </button>
                      <button className="am-btn am-btn-danger" onClick={() => handleDelete(user._id)}>
                        <FaTrash className="am-icon" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan={addMode || editingUserId ? 9 : 8} className="am-no-data">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="am-pagination">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
