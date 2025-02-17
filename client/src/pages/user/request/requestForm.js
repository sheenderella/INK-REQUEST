// src/pages/user/requestForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft } from 'react-icons/fa';
import './requestForm.css';

const RequestForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    printerModel: '',
    inkModel: '',
    color: []
  });

  const [message, setMessage] = useState('');

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
    if (!form.printerModel || !form.inkModel || form.color.length === 0) {
      setMessage('All fields are required!');
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/requests', form);
      setMessage('Ink request submitted successfully!');
    } catch (error) {
      setMessage('Failed to submit the request.');
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
            {['printerModel', 'inkModel'].map((field) => (
              <div className="form-col" key={field}>
                <label className="form-label">{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                <input type="text" className="form-input rounded-3" name={field} value={form[field]} onChange={handleChange} required />
              </div>
            ))}
          </div>
          <div className="form-section mb-4">
            <label className="form-label">Color:</label><br />
            <div className="form-check me-3">
              <input className="form-check-input custom-black-checkbox rounded-3 me-2" type="checkbox" name="color" value="Black" onChange={handleChange} required={form.color.length === 0} />
              <label className="form-check-label">Black</label>
            </div>
            <div className="form-check">
              <input className="form-check-input rainbow-checkbox rounded-3 me-2" type="checkbox" name="color" value="Colored" onChange={handleChange} required={form.color.length === 0} />
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

