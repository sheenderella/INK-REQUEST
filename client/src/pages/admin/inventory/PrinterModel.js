import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaTrash, FaTimes } from 'react-icons/fa';
import './inventory.css';

const PrinterModelManagement = ({ showPopup, setShowPopup }) => {
  const [printerModels, setPrinterModels] = useState([]);
  const [newPrinterModel, setNewPrinterModel] = useState({
    printer_name: '',
    compatible_inks: [] // Assume compatible inks will be an array of ink model ids
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPrinterModels();
  }, []);

  const fetchPrinterModels = () => {
    axios.get('http://localhost:8000/api/printers', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setPrinterModels(res.data)).catch(err => console.error(err));
  };

  const addPrinterModel = () => {
    axios.post('http://localhost:8000/api/printers', newPrinterModel, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      fetchPrinterModels();
      setNewPrinterModel({ printer_name: '', compatible_inks: [] });
    }).catch(err => console.error(err));
  };

  const deletePrinterModel = (id) => {
    axios.delete(`http://localhost:8000/api/printers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchPrinterModels()).catch(err => console.error(err));
  };

  // Close the popup when clicking on the "Close" button
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="am-popup-overlay">
      <div className="am-popup">
        <h3 className="am-title">Add Printer Model</h3>

        <div className="am-form-group">
          <label>Printer Model Name</label>
          <input
            type="text"
            value={newPrinterModel.printer_name}
            onChange={e => setNewPrinterModel({ ...newPrinterModel, printer_name: e.target.value })}
            className="am-input"
            placeholder="Enter Printer Model Name"
          />
        </div>

        <div className="am-form-group">
          <label>Compatible Inks (comma separated Ink IDs)</label>
          <textarea
            value={newPrinterModel.compatible_inks}
            onChange={e => setNewPrinterModel({ ...newPrinterModel, compatible_inks: e.target.value })}
            className="am-input"
            placeholder="Enter Compatible Ink IDs"
          />
        </div>

        <div className="am-form-actions">
          <button className="am-btn am-btn-success" onClick={addPrinterModel}>
            <FaSave className="am-icon" /> Save
          </button>
          <button className="am-btn am-btn-secondary" onClick={handleClosePopup}>
            <FaTimes className="am-icon" /> Close
          </button>
        </div>

        <h4 className="am-title">Existing Printer Models</h4>
        <div className="am-table-responsive">
          <table className="am-table">
            <thead>
              <tr>
                <th>Printer Model</th>
                <th>Compatible Inks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {printerModels.map(model => (
                <tr key={model._id}>
                  <td>{model.printer_name}</td>
                  <td>{model.compatible_inks.map(ink => ink.ink_name).join(', ')}</td>
                  <td>
                    <button className="am-btn am-btn-danger" onClick={() => deletePrinterModel(model._id)}>
                      <FaTrash className="am-icon" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrinterModelManagement;
