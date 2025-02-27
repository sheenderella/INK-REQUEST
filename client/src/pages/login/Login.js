import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Username and password are required.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/api/login', { username, password });
  
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userId', response.data.userId);
        
        setUsername('');
        setPassword('');
  
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else if (response.data.role === 'supervisor') {
          navigate('/dashboardSupervisor');
        } else {
          navigate('/dashboard-user');
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMessage(error?.response?.data?.message || 'An error occurred. Please try again.');
    }
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white text-black">
      <div className="card bg-white text-black p-4 shadow-lg" style={{ width: '500px' }}>
        <h2 className="text-center mb-4">Login</h2>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control border-black"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
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
          <button type="submit" className="btn btn-dark w-100 mb-2">LOGIN</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
