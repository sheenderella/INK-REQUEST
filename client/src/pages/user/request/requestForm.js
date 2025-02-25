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
    color: [] // store multiple selected colors
  });

  const [message, setMessage] = useState('');
  const [printers, setPrinters] = useState([]); // State to store available printers
  useEffect(() => {
    const fetchPrinters = async () => {
      const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
  
      if (!token) {
        setMessage('No token found. Please login again.');
        navigate('/login'); // Redirect to login page if no token is found
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:8000/api/printers', {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          }
        });
        setPrinters(response.data); // Assuming response contains an array of printer data
      } catch (error) {
        // If token is invalid or expired, redirect to login
        if (error.response && error.response.status === 401) {
          setMessage('Session expired. Please log in again.');
          localStorage.removeItem('authToken'); // Remove invalid token
          navigate('/'); // Redirect to login
        } else {
          setMessage('Failed to fetch printers.');
          console.error("Error fetching printers:", error);
        }
      }
    };
  
    fetchPrinters(); // Call the function inside useEffect
  }, [navigate]); // Only rerun if navigate changes
  

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
  
    // Validate the form data before submitting
    if (!form.printerModel || form.color.length === 0) {
      setMessage('All fields are required!');
      return;
    }
  
    const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
  
    if (!token) {
      setMessage('No token found. Please login again.');
      navigate('/'); // Redirect to login if token is not found
      return;
    }
  
    try {
      // Use the full URL for the POST request
      const response = await axios.post('http://localhost:8000/api/ink/request', form, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        }
      });
  
      // Handle success
      setMessage('Ink request submitted successfully!');
      console.log("Response:", response.data);
    } catch (error) {
      // Enhanced error handling for more detailed feedback
      if (error.response) {
        if (error.response.status === 401) {
          setMessage('Session expired. Please log in again.');
          localStorage.removeItem('authToken'); // Remove invalid token
          navigate('/'); // Redirect to login
        } else {
          // If the server returned a response but not a 401
          setMessage(`Failed to submit the request: ${error.response.data.message || error.response.statusText}`);
          console.error("Error Response:", error.response);
        }
      } else if (error.request) {
        // No response received from the server
        setMessage('No response from the server. Please try again later.');
        console.error("No response received:", error.request);
      } else {
        // Something else went wrong (e.g., in request setup)
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
            {/* Printer Model Dropdown */}
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
                    <option key={printer._id} value={printer._id}> {/* Use _id here */}
                      {printer.printer_name} {/* Display the printer name */}
                    </option>
                  ))
                ) : (
                  <option value="">No printers available</option> // If no printers are loaded
                )}
              </select>
            </div>
          </div>

          <div className="form-section mb-4">
            <label className="form-label">Color:</label><br />
            <div className="form-check me-3">
              <input
                className="form-check-input custom-black-checkbox rounded-3 me-2"
                type="checkbox"
                name="color"
                value="Black"
                onChange={handleChange}
              />
              <label className="form-check-label">Black</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input rainbow-checkbox rounded-3 me-2"
                type="checkbox"
                name="color"
                value="Colored"
                onChange={handleChange}
              />
              <label className="form-check-label">Colored</label>
            </div>
          </div>

          <button type="submit" className="form-button rounded-3 mt-4"> SUBMIT </button>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
