import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PrinterModel.css';

const PrinterModelManagement = () => {
  const [printerModels, setPrinterModels] = useState([]);
  const [inks, setInks] = useState([]);
  const [newPrinterModel, setNewPrinterModel] = useState({
    printer_name: '',
    compatible_inks: ''
  });

  const token = localStorage.getItem('token');

  const fetchPrinterModels = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/printers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrinterModels(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch printer models!', { position: 'top-right' });
    }
  }, [token]);

  const fetchInks = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/inks/models', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInks(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch inks!', { position: 'top-right' });
    }
  }, [token]);

  useEffect(() => {
    fetchPrinterModels();
    fetchInks();
  }, [fetchPrinterModels, fetchInks]);

  const addPrinterModel = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/api/printers',
        { ...newPrinterModel, compatible_inks: [newPrinterModel.compatible_inks] }, // Ensure it's an array
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 201) {
        toast.success('Printer model added successfully!', { position: 'top-right' });
        fetchPrinterModels();
        setNewPrinterModel({ printer_name: '', compatible_inks: '' });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Printer model already exists!', { position: 'top-right' });
      } else {
        toast.error('Failed to add printer model!', { position: 'top-right' });
      }
    }
  };

  const deletePrinterModel = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/printers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Printer model deleted successfully!', { position: 'top-right' });
      fetchPrinterModels();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete printer model!', { position: 'top-right' });
    }
  };

  return (
    <div className="custom-card p-4">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="text-center">
        <h2 className="mb-3 custom-title">Add Printer Model</h2>
        <p className="mb-4 custom-text">Fill out the details below to add a new printer model.</p>
      </div>

      <form onSubmit={addPrinterModel}>
        <div className="custom-form-group mb-3">
          <label className="form-label field-label">Printer Model:</label>
          <input
            type="text"
            className="form-control custom-input"
            value={newPrinterModel.printer_name}
            onChange={(e) => setNewPrinterModel({ ...newPrinterModel, printer_name: e.target.value })}
            required
          />
        </div>

        <div className="custom-form-group mb-3">
          <label className="form-label field-label">Compatible Ink:</label>
          <select
            className="form-select custom-select"
            value={newPrinterModel.compatible_inks}
            onChange={(e) => setNewPrinterModel({ ...newPrinterModel, compatible_inks: e.target.value })}
            required
          >
            <option value="" disabled>Select Ink</option>
            {inks.map(ink => (
              <option key={ink._id} value={ink._id}>{ink.ink_name}</option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary mt-3 custom-button">
            <FaSave className="me-2" /> Save
          </button>
        </div>
      </form>

      <div className="mt-4">
        <h2 className="mb-3 text-center custom-title">Existing Printer Models</h2>
        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Printer Model</th>
                <th>Compatible Ink</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {printerModels.map(model => (
                <tr key={model._id}>
                  <td>{model.printer_name}</td>
                  <td>{model.compatible_inks.map(ink => ink.ink_name).join(', ')}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deletePrinterModel(model._id)}>
                      <FaTrash className="me-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {printerModels.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center">No printer models available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrinterModelManagement;
