import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaEdit,
  FaTrash,
  FaPlus,
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

  // Fetch inventory and ink models from backend on mount
  useEffect(() => {
    fetchInventory();
    fetchInkModels();
  }, []);

  const fetchInventory = () => {
    axios.get('http://localhost:8000/api/inventory')
      .then(res => setInventory(res.data))
      .catch(err => console.error('Error fetching inventory:', err));
  };

  const fetchInkModels = () => {
    // Use the fixed endpoint for ink models
    axios.get('http://localhost:8000/api/inks/models')
      .then(res => {
        console.log('Fetched ink models:', res.data);
        setInkModels(res.data);
      })
      .catch(err => console.error('Error fetching ink models:', err));
  };

  // Generic change handler using functional updates
  const handleChange = (e, field, setter) => {
    setter(prev => ({ ...prev, [field]: e.target.value }));
  };

  // When an ink model is selected, update the state with its ID and auto-set its first allowed color
  const handleInkModelChange = (e, setter) => {
    const newInkModel = e.target.value;
    setter(prev => {
      const selectedModel = inkModels.find(
        model => model._id.toString() === newInkModel
      );
      const newColor =
        selectedModel && selectedModel.colors && selectedModel.colors.length > 0
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
    axios.put(`http://localhost:8000/api/inventory/${editingId}`, payload)
      .then(() => {
         setEditingId(null);
         fetchInventory();
      })
      .catch(err => console.error(err));
  };

  const deleteInventory = (id) => {
    axios.delete(`http://localhost:8000/api/inventory/${id}`)
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
    axios.post('http://localhost:8000/api/inventory', payload)
      .then(() => {
        setNewInventory({ ink_model: '', color: '', quantity: '', volume: '' });
        setShowPopup(false);
        fetchInventory();
      })
      .catch(err => console.error(err));
  };

  // Returns the allowed colors for a given ink model ID
  const getColorsForInkModel = (inkModelId) => {
    const model = inkModels.find(im => im._id.toString() === inkModelId);
    return model ? model.colors : [];
  };

  // Filter inventory based on search term
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
    <div className="inventory-container">
      <h2>Inventory</h2>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by Ink Model or Color"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setShowPopup(true)}>
          <FaPlus /> Add New Inventory
        </button>
      </div>
      <table className="inventory-table" border="1" cellPadding="5">
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
            <tr key={item._id}>
              <td>
                {editingId === item._id ? (
                  <select
                    value={editData.ink_model}
                    onChange={e => handleInkModelChange(e, setEditData)}
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
                  />
                ) : (
                  item.volume
                )}
              </td>
              <td>
                {editingId === item._id ? (
                  <>
                    <button onClick={saveEdit}>
                      <FaSave /> Save
                    </button>
                    <button onClick={() => setEditingId(null)}>
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => {
                      setEditingId(item._id);
                      setEditData({
                        ink_model: typeof item.ink_model === 'object'
                          ? item.ink_model._id
                          : item.ink_model,
                        color: item.color,
                        quantity: item.quantity,
                        volume: item.volume
                      });
                    }}>
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => deleteInventory(item._id)}>
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <div className="popup">
          <h3>Add New Inventory</h3>
          <div>
            <label>Ink Model: </label>
            <select
              value={newInventory.ink_model}
              onChange={e => handleInkModelChange(e, setNewInventory)}
            >
              <option value="">Select Ink Model</option>
              {inkModels.map(model => (
                <option key={model._id} value={model._id}>
                  {model.ink_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Color: </label>
            <select
              value={newInventory.color}
              onChange={e => handleChange(e, 'color', setNewInventory)}
            >
              <option value="">Select Color</option>
              {newInventory.ink_model &&
                getColorsForInkModel(newInventory.ink_model).map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))
              }
            </select>
          </div>
          <div>
            <label>Quantity: </label>
            <input
              type="text"
              value={newInventory.quantity}
              onChange={e => handleChange(e, 'quantity', setNewInventory)}
            />
          </div>
          <div>
            <label>Volume: </label>
            <input
              type="text"
              value={newInventory.volume}
              onChange={e => handleChange(e, 'volume', setNewInventory)}
            />
          </div>
          <button onClick={saveNew}>Save</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
