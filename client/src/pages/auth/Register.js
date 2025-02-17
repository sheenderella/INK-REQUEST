import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  // State for password visibility toggle
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // State for confirm password visibility toggle
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/auth/register', { firstName, lastName, middleName, department, email, password });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white text-black">
      <div className="card bg-white text-black p-4 shadow-lg" style={{ width: '700px' }}>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-4">
              <label className="form-label">First Name: </label>
              <input type="text" className="form-control border-black" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="col-4">
              <label className="form-label">Middle Name: </label>
              <input type="text" className="form-control border-black" placeholder="Middle name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div className="col-4">
              <label className="form-label">Last Name: </label>
              <input type="text" className="form-control border-black" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Department: </label>
            <input type="text" className="form-control border-black" placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email: </label>
            <input type="email" className="form-control border-black" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div className="mb-3">
            <label className="form-label">Password: </label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-black"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
          </div>

          {/* Confirm Password Input with Show/Hide Toggle */}
          <div className="mb-3">
            <label className="form-label">Confirm Password: </label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control border-black"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-dark w-100 mb-2">REGISTER</button>
          <div className="text-center mt-2">
            <span className="text-muted" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              Already have an account? <strong>Login</strong>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
