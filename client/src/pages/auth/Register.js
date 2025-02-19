import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility of password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle visibility of confirm password
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // Create user data object from form values
    const userData = {
      first_name: firstName,  // Make sure to use the correct field names for your backend
      middle_name: middleName,
      last_name: lastName,
      department: department,
      email: email,
      password: password,
      role: 'user',  // You can adjust this depending on how you want to handle user roles
    };
  
    try {
      // Make the POST request to your server's /api/users route
      await axios.post('http://localhost:8000/api/users', userData);
  
      // Handle success: show success message and redirect to login page
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      // Handle error: show failure message
      alert('Registration failed. Please try again.');
      console.error(error);  // Log error for debugging
    }
  };
  

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white text-black">
      <div className="card bg-white text-black p-4 shadow-lg" style={{ width: '700px' }}>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <div className="row mb-3">
            <div className="col-4">
              <label className="form-label">First Name: </label>
              <input
                type="text"
                className="form-control border-black"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="col-4">
              <label className="form-label">Middle Name: </label>
              <input
                type="text"
                className="form-control border-black"
                placeholder="Middle name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div className="col-4">
              <label className="form-label">Last Name: </label>
              <input
                type="text"
                className="form-control border-black"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Department, email, password, and confirm password fields */}
          <div className="mb-3">
            <label className="form-label">Department: </label>
            <input
              type="text"
              className="form-control border-black"
              placeholder="Enter department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email: </label>
            <input
              type="email"
              className="form-control border-black"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

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
