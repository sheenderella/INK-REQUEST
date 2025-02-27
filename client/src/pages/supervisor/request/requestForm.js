import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft } from 'react-icons/fa';
import './requestForm.css';

const RequestForm = () => {
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
      navigate('/'); 
      return;
    }
  
    const payload = {
      printerId: form.printerModel,
      ink_type: form.color[0] || 'black', 
      userId: userId  
    };
  
    try {
      const response = await axios.post('http://localhost:8000/api/ink/request', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      setMessage('Ink request submitted successfully!');
      console.log("Response:", response.data);
  
      navigate(-1);  
  
    } catch (error) {
      if (error.response) {
        setMessage(`Failed to submit the request: ${error.response.data.message || error.response.statusText}`);
        console.error("Error Response:", error.response);
      } else if (error.request) {
        setMessage('No response from the server. Please try again later.');
        console.error("No response received:", error.request);
      } else {
        setMessage(`Failed to submit the request. Error: ${error.message}`);
        console.error("Error:", error);
      }
    }
  };
  
  
  return (
    <div className="form-wrapper">
      <div className="form-card rounded-4">
        <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
        <h2 className="form-title">Ink Request</h2>
        <p className="form-subtitle">Please fill out the form for request</p>
        {message && <p className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
  
            <div className="form-col">
              <label className="form-label">Printer Model:</label>
              <select
                className="form-input rounded-3"
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
          </div>

          <div className="form-section mb-4">
            <label className="form-label">Ink Type:</label><br />
            <div className="form-check me-3">
              <input
                className="form-check-input custom-black-checkbox rounded-3 me-2"
                type="checkbox"
                name="color"
                value="black"
                onChange={handleChange}
              />
              <label className="form-check-label">Black</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input rainbow-checkbox rounded-3 me-2"
                type="checkbox"
                name="color"
                value="colored"
                onChange={handleChange}
              />
              <label className="form-check-label">Colored</label>
            </div>
            {message.includes("Ink type is required") && <p className="error-message">Please select an ink type.</p>}
          </div>

          <button type="submit" className="form-button rounded-3 mt-4"> SUBMIT </button>
        </form>
      </div>
    </div>
  );
};
export default RequestForm;
