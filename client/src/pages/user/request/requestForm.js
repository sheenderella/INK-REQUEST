import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './requestForm.css';


const RequestForm = ({ setShowModal }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    printerModel: '',
    color: [] 
  });
  const [message, setMessage] = useState('');  
  const [printers, setPrinters] = useState([]); 

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
      setMessage('No token or user session found. Please login again.');
      navigate('/');
      return;
    }

    const fetchPrinters = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/printers', {
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        });
        setPrinters(response.data); 
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setMessage('Session expired. Please log in again.');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('userId');
          navigate('/login'); 
        } else {
          setMessage('Failed to fetch printers.');
          console.error("Error fetching printers:", error);
        }
      }
    };

    fetchPrinters();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'color') {
      setForm((prev) =>
        checked
          ? { ...prev, color: [...prev.color, value] }
          : { ...prev, color: prev.color.filter((c) => c !== value) }
      );
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!form.printerModel || form.color.length === 0) {
      setMessage('Ink type is required. Please select an ink type.');
      return;
    }
  
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
  
    if (!token || !userId) {
      setMessage('No token or user session found. Please login again.');
      return;
    }
  
    const payloads = form.color.map((color) => ({
      printerId: form.printerModel,
      ink_type: color,
      userId: userId
    }));
  
    try {
      const responses = await Promise.all(
        payloads.map((payload) =>
          axios.post('http://localhost:8000/api/ink/request', payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
  
      setMessage('Ink request submitted successfully!');
      console.log("Responses:", responses);
  
      // Wait for the user to see the message, then close the modal
      setTimeout(() => {
        setShowModal(false); // If using modal, close it instead of navigating
      }, 1500);
    } catch (error) {
      console.error("Error submitting request:", error);
      setMessage(
        error.response?.data?.message || 'Failed to submit the request.'
      );
    }
  };
  
  return (
    <div className="custom-card p-4">
    {/* Centered Title & Description */}
    <div className="text-center">
      <h2 className="mb-3 custom-title">Ink Request</h2>
      <p className="mb-4 custom-text">Please fill out the form for your ink request.</p>
    </div>
  
    {message && (
      <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
        {message}
      </div>
    )}
  
    <form onSubmit={handleSubmit}>

      {/* Printer Model Field */}
      <div className="custom-form-group mb-3">
        <label className="form-label field-label">Printer Model:</label>
        <select
          className="form-select custom-select"
          name="printerModel"
          value={form.printerModel}
          onChange={handleChange}
          required
        >
          <option value="">Select Printer Model</option>
          {printers.length > 0 ? (
            printers.map((printer) => (
              <option key={printer._id} value={printer._id}>
                {printer.printer_name}
              </option>
            ))
          ) : (
            <option value="">No printers available</option>
          )}
        </select>
      </div>
  
{/* Ink Type Field */}
<div className="custom-form-group mb-3">
  <label className="form-label field-label">Ink Type:</label>
  <fieldset>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input custom-checkbox"
        type="checkbox"
        name="color"
        id="inkBlack"
        value="black"
        onChange={handleChange}
      />
      <label className="form-check-label custom-label" htmlFor="inkBlack">
        Black
      </label>
    </div>

    <div className="form-check form-check-inline">
      <input
        className="form-check-input custom-checkbox"
        type="checkbox"
        name="color"
        id="inkColored"
        value="colored"
        onChange={handleChange}
      />
      <label className="form-check-label custom-label" htmlFor="inkColored">
        Colored
      </label>
    </div>
    {message.includes("Ink type is required") && (
      <p className="text-danger mt-2">Please select an ink type.</p>
    )}
  </fieldset>
</div>
  
      {/* Centered Submit Button */}
      <div className="text-center">
        <button type="submit" className="btn btn-primary mt-3 custom-button">
          SUBMIT
        </button>
      </div>

      
    </form>
  </div>
)};
export default RequestForm;
