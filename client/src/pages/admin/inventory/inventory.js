import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import './inventory.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [inkModels, setInkModels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ ink_model: '', color: '', quantity: '', volume: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [newInventory, setNewInventory] = useState({ ink_model: '', color: '', quantity: '', volume: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  const fetchInventory = useCallback(() => {
    axios.get('http://localhost:8000/api/inventory', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setInventory(res.data))
      .catch(err => console.error('Error fetching inventory:', err));
  }, [token]);

  const fetchInkModels = useCallback(() => {
    axios.get('http://localhost:8000/api/inks/models', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        console.log('Fetched ink models:', res.data);
        setInkModels(res.data);
      })
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
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        setEditingId(null);
        fetchInventory();
      })
      .catch(err => console.error(err));
  };

  const deleteInventory = (id) => {
    axios.delete(`http://localhost:8000/api/inventory/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
      headers: {
        Authorization: `Bearer ${token}`
      }
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

  return (
    <div className="am-wrapper">
      <div className="am-card">
        <h2 className="am-title">Inventory</h2>
        <div className="am-toolbar">
          <div className="am-input-group am-search">
            <FaSearch className="am-icon" />
            <input
              type="text"
              placeholder="Search by Ink Model or Color"
              className="am-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="am-btn am-btn-danger">
            <FaTrash className="am-icon" />
          </button>

          <button className="am-btn am-btn-success" onClick={() => setShowPopup(true)}>
            <FaPlus className="am-icon" />
          </button>
        </div>
        <div className="am-table-responsive">
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
              {filteredInventory.map(item => (
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
        </div>
        <div className="am-pagination">
          <ul className="pagination">
            <li className="page-item disabled">
              <button className="page-link">
                <FaAngleLeft />
              </button>
            </li>
            <li className="page-item active">
              <button className="page-link">1</button>
            </li>
            <li className="page-item">
              <button className="page-link">2</button>
            </li>
            <li className="page-item">
              <button className="page-link">
                <FaAngleRight />
              </button>
            </li>
          </ul>
        </div>
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
