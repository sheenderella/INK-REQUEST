import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTrash, FaEdit } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InkModelManagement = () => {
  const [inks, setInks] = useState([]);
  const [newInk, setNewInk] = useState({ ink_name: '', colors: '' });
  const [editInk, setEditInk] = useState(null);
  const token = localStorage.getItem('token');

  const fetchInks = useCallback(() => {
    if (!token) return;
    
    axios
      .get('http://localhost:8000/api/inks/models', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setInks(res.data))
      .catch(err => {
        console.error("Error fetching inks:", err);
        toast.error("Failed to fetch ink models!", { position: "top-right" });
      });
  }, [token]);

  useEffect(() => {
    fetchInks();
  }, [fetchInks]);

  const addInk = async (e) => {
    e.preventDefault();
  
    const colorsArray = newInk.colors
      .split(',')
      .map(color => color.trim())
      .filter(color => color !== '');
  
    const inkData = { ink_name: newInk.ink_name, colors: colorsArray };
  
    try {
      const response = await axios.post(
        'http://localhost:8000/api/inks/models',
        inkData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );

      if (response.status === 201) {
        fetchInks();
        setNewInk({ ink_name: '', colors: '' });
        toast.success("Ink model added successfully!", { position: "top-right" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add ink model!", { position: "top-right" });
      console.error("Error adding ink:", error.response?.data || error.message);
    }
  };

  const deleteInk = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/inks/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchInks();
      toast.success("Ink model deleted successfully!", { position: "top-right" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete ink model!", { position: "top-right" });
      console.error("Error deleting ink:", error.response?.data || error.message);
    }
  };

  const updateInk = async (e) => {
    e.preventDefault();
  
    const colorsArray = editInk.colors
      .split(',')
      .map(color => color.trim())
      .filter(color => color !== '');
  
    const inkData = { ink_name: editInk.ink_name, colors: colorsArray };
  
    try {
      await axios.put(
        `http://localhost:8000/api/inks/models/${editInk._id}`,
        inkData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchInks();
      setEditInk(null);
      toast.success("Ink model updated successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Failed to update ink model!", { position: "top-right" });
      console.error("Error updating ink:", error.response?.data || error.message);
    }
  };

  const handleEditClick = (ink) => {
    setEditInk({ ...ink, colors: ink.colors.join(', ') });
  };

  return (
    <div className="container my-4">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Add Ink Model Section */}
      <div className="custom-card p-4 mb-4">
        <div className="text-center">
          <h2 className="mb-3 custom-title">Add Ink Model</h2>
          <p className="mb-4 custom-text">Fill out the details below to add a new ink model.</p>
        </div>
        <form onSubmit={addInk}>
          <div className="custom-form-group mb-3">
            <label className="form-label field-label">Ink Name</label>
            <input
              type="text"
              value={newInk.ink_name}
              onChange={e => setNewInk({ ...newInk, ink_name: e.target.value })}
              className="form-control custom-input"
              placeholder="Enter Ink Name"
              required
            />
          </div>
          <div className="custom-form-group mb-3">
            <label className="form-label field-label">Colors (comma separated)</label>
            <input
              type="text"
              value={newInk.colors}
              onChange={e => setNewInk({ ...newInk, colors: e.target.value })}
              className="form-control custom-input"
              placeholder="e.g., Red, Blue, Black"
              required
            />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-success custom-button">
              <FaSave className="me-2" /> Save
            </button>
          </div>
        </form>
      </div>

      {/* Edit Ink Model Section */}
      {editInk && (
        <div className="custom-card p-4 mb-4">
          <div className="text-center">
            <h2 className="mb-3 custom-title">Edit Ink Model</h2>
            <p className="mb-4 custom-text">Update the details below to edit the ink model.</p>
          </div>
          <form onSubmit={updateInk}>
            <div className="custom-form-group mb-3">
              <label className="form-label field-label">Ink Name</label>
              <input
                type="text"
                value={editInk.ink_name}
                onChange={e => setEditInk({ ...editInk, ink_name: e.target.value })}
                className="form-control custom-input"
                placeholder="Enter Ink Name"
                required
              />
            </div>
            <div className="custom-form-group mb-3">
              <label className="form-label field-label">Colors (comma separated)</label>
              <input
                type="text"
                value={editInk.colors}
                onChange={e => setEditInk({ ...editInk, colors: e.target.value })}
                className="form-control custom-input"
                placeholder="e.g., Red, Blue, Black"
                required
              />
            </div>
            <div className="d-flex justify-content-center gap-3">
              <button type="submit" className="btn btn-primary custom-button">
                <FaSave className="me-2" /> Update
              </button>
              <button
                type="button"
                className="btn btn-secondary custom-button"
                onClick={() => setEditInk(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Ink Models Section */}
      <div className="custom-card p-4">
        <h2 className="mb-3 custom-title text-center">Existing Ink Models</h2>
        <div className="table-responsive">
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Ink Name</th>
                <th>Colors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inks.map(ink => (
                <tr key={ink._id}>
                  <td>{ink.ink_name}</td>
                  <td>{ink.colors.join(', ')}</td>
                  <td>
                    <button className="btn btn-warning me-2" onClick={() => handleEditClick(ink)}>
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => deleteInk(ink._id)}>
                      <FaTrash className="me-1" /> Delete
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

export default InkModelManagement;
