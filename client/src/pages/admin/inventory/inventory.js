import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './inventory.css'; // Custom styling for the inventory page

const Inventory = () => {
  const navigate = useNavigate();
  const [inks, setInks] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [color, setColor] = useState('');
  const [inkModel, setInkModel] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false); // Toggle form visibility

  useEffect(() => {
    // Fetch ink items from the API
    axios
      .get('http://localhost:8000/api/ink')
      .then((response) => setInks(response.data))
      .catch((error) => console.error(error));
  }, [inks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'color') {
      setColor(value);
    } else if (name === 'quantity') {
      setQuantity(value);
    } else {
      setInkModel(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || !color || !inkModel) {
      setMessage('All fields are required!');
      return;
    }

    const newInk = { quantity, color, inkModel };
    try {
      await axios.post('http://localhost:8000/api/ink', newInk);
      setMessage('Ink added successfully!');
      setQuantity('');
      setColor('');
      setInkModel('');
      setShowForm(false); // Hide the form after submission
    } catch (error) {
      setMessage('Failed to add ink.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/ink/${id}`);
      setMessage('Ink deleted successfully!');
    } catch (error) {
      setMessage('Failed to delete ink.');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false); // Close the form
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
        <h2 className="form-title">Ink Inventory</h2>
        {message && (
          <p className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        {/* Add Ink Button (Icon in Upper Right of Header) */}
        <div className="header-actions">
          <FaPlus
            className="add-icon"
            onClick={() => setShowForm(!showForm)} // Toggle form visibility
          />
        </div>

        {/* Add Ink Form Popup */}
        {showForm && (
          <div className="form-popup">
            <div className="form-popup-content">
              <FaTimes className="close-btn" onClick={handleCloseForm} />
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  {['quantity', 'color', 'inkModel'].map((field) => (
                    <div className="form-col" key={field}>
                      <label className="form-label">
                        {field
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                        :
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        name={field}
                        value={field === 'quantity' ? quantity : field === 'color' ? color : inkModel}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="form-button">
                  ADD INK
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <h3 className="mt-4">Inventory List</h3>
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>Quantity</th>
              <th>Color</th>
              <th>Ink Model</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inks.map((ink, index) => (
              <tr key={ink._id} className={index % 2 === 0 ? 'even' : 'odd'}>
                <td>{ink.quantity}</td>
                <td>{ink.color}</td>
                <td>{ink.inkModel}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleDelete(ink._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
