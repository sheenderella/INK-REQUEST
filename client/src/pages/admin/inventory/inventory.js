import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import './inventory.css';
import SideNav from '../../../components/SideNav';
import PaginationSlider from '../../../components/PaginationSlider';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [inkModels, setInkModels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ ink_model: '', color: '', quantity: '', volume: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [newInventory, setNewInventory] = useState({ ink_model: '', color: '', quantity: '', volume: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("authToken");
  const userId = sessionStorage.getItem("userId");

  // Fetch user data for sidebar
  useEffect(() => {
    if (!token || !userId) {
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      })
      .then(response => setUser(response.data))
      .catch(error => console.error("Error fetching user data:", error));
  }, [navigate, token, userId]);

  const fetchInventory = useCallback(() => {
    axios.get('http://localhost:8000/api/inventory', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setInventory(res.data))
      .catch(err => console.error('Error fetching inventory:', err));
  }, [token]);

  const fetchInkModels = useCallback(() => {
    axios.get('http://localhost:8000/api/inks/models', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setInkModels(res.data))
      .catch(err => console.error('Error fetching ink models:', err));
  }, [token]);

  useEffect(() => {
    fetchInventory();
    fetchInkModels();
  }, [fetchInventory, fetchInkModels]);

  const handleChange = (e, field, setter) => {
    setter(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleInkModelChange = (e, setter) => {
    const newInkModel = e.target.value;
    setter(prev => {
      const selectedModel = inkModels.find(model => model._id.toString() === newInkModel);
      const newColor = selectedModel && selectedModel.colors && selectedModel.colors.length > 0
        ? selectedModel.colors[0]
        : '';
      return { ...prev, ink_model: newInkModel, color: newColor };
    });
  };

  const saveEdit = () => {
    const payload = {
      ink_model_id: editData.ink_model,
      color: editData.color,
      quantity: editData.quantity,
      volume: editData.volume
    };
    axios.put(`http://localhost:8000/api/inventory/${editingId}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setEditingId(null);
        fetchInventory();
      })
      .catch(err => console.error(err));
  };

  const deleteInventory = (id) => {
    axios.delete(`http://localhost:8000/api/inventory/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchInventory())
      .catch(err => console.error(err));
  };

  const saveNew = () => {
    const payload = {
      ink_model_id: newInventory.ink_model,
      color: newInventory.color,
      quantity: newInventory.quantity,
      volume: newInventory.volume
    };
    axios.post('http://localhost:8000/api/inventory', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setNewInventory({ ink_model: '', color: '', quantity: '', volume: '' });
        setShowPopup(false);
        fetchInventory();
      })
      .catch(err => console.error(err));
  };

  const getColorsForInkModel = (inkModelId) => {
    const model = inkModels.find(im => im._id.toString() === inkModelId);
    return model ? model.colors : [];
  };

  const filteredInventory = inventory.filter(item => {
    let inkModelStr = '';
    if (item.ink_model) {
      if (typeof item.ink_model === 'string') {
        inkModelStr = item.ink_model;
      } else if (typeof item.ink_model === 'object' && item.ink_model.ink_name) {
        inkModelStr = item.ink_model.ink_name;
      }
    }
    return (
      inkModelStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.color && item.color.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Function to render a full table for a given page of data
  const renderTablePage = (pageData) => (
    <table className="am-table">
      <thead>
        <tr>
          <th>Ink Model</th>
          <th>Color</th>
          <th>Quantity</th>
          <th>Volume</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pageData.map(item => (
          <tr key={item._id} className={editingId === item._id ? 'am-editing' : ''}>
            <td>
              {editingId === item._id ? (
                <select
                  value={editData.ink_model}
                  onChange={e => handleInkModelChange(e, setEditData)}
                  className="am-input"
                >
                  <option value="">Select Ink Model</option>
                  {inkModels.map(model => (
                    <option key={model._id} value={model._id}>
                      {model.ink_name}
                    </option>
                  ))}
                </select>
              ) : (
                typeof item.ink_model === 'object'
                  ? item.ink_model.ink_name
                  : item.ink_model
              )}
            </td>
            <td>
              {editingId === item._id ? (
                <select
                  value={editData.color}
                  onChange={e => handleChange(e, 'color', setEditData)}
                  className="am-input"
                >
                  <option value="">Select Color</option>
                  {getColorsForInkModel(editData.ink_model).map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              ) : (
                item.color
              )}
            </td>
            <td>
              {editingId === item._id ? (
                <input
                  type="text"
                  value={editData.quantity}
                  onChange={e => handleChange(e, 'quantity', setEditData)}
                  className="am-input"
                />
              ) : (
                item.quantity
              )}
            </td>
            <td>
              {editingId === item._id ? (
                <input
                  type="text"
                  value={editData.volume}
                  onChange={e => handleChange(e, 'volume', setEditData)}
                  className="am-input"
                />
              ) : (
                item.volume
              )}
            </td>
            <td>
              {editingId === item._id ? (
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
                      setEditingId(item._id);
                      setEditData({
                        ink_model: typeof item.ink_model === 'object'
                          ? item.ink_model._id
                          : item.ink_model,
                        color: item.color,
                        quantity: item.quantity,
                        volume: item.volume
                      });
                    }}
                  >
                    <FaEdit className="am-icon" />
                  </button>
                  <button className="am-btn am-btn-danger" onClick={() => deleteInventory(item._id)}>
                    <FaTrash className="am-icon" />
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="d-flex" style={{ height: "100vh", alignItems: "center", position: "relative", zIndex: 1 }}>
      <SideNav user={user} />
      <div className="content" style={{ height: "50vh" }}>
        <h2 className="dashboard-title"> inventory </h2>
        <div className="am-toolbar">
          <div className="am-input-group am-search">
            <input
              type="text"
              placeholder="Search by Ink Model or Color"
              className="am-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="am-btn am-btn-success" onClick={() => setShowPopup(true)}>
            <FaPlus className="am-icon" />
          </button>
        </div>
        {/* Use PaginationSlider to display 6 rows per page */}
        <PaginationSlider
          items={filteredInventory}
          rowsPerPage={6}
          renderPage={renderTablePage}
        />
      </div>
      {showPopup && (
        <div className="am-popup-overlay">
          <div className="am-popup">
            <h3>Add New Inventory</h3>
            <div className="am-form-group">
              <label>Ink Model</label>
              <select
                value={newInventory.ink_model}
                onChange={e => handleInkModelChange(e, setNewInventory)}
                className="am-input"
              >
                <option value="">Select Ink Model</option>
                {inkModels.map(model => (
                  <option key={model._id} value={model._id}>
                    {model.ink_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="am-form-group">
              <label>Color</label>
              <select
                value={newInventory.color}
                onChange={e => handleChange(e, 'color', setNewInventory)}
                className="am-input"
              >
                <option value="">Select Color</option>
                {newInventory.ink_model &&
                  getColorsForInkModel(newInventory.ink_model).map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
              </select>
            </div>
            <div className="am-form-group">
              <label>Quantity</label>
              <input
                type="text"
                value={newInventory.quantity}
                onChange={e => handleChange(e, 'quantity', setNewInventory)}
                className="am-input"
              />
            </div>
            <div className="am-form-group">
              <label>Volume</label>
              <input
                type="text"
                value={newInventory.volume}
                onChange={e => handleChange(e, 'volume', setNewInventory)}
                className="am-input"
              />
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

export default InventoryManagement;
