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


     <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: "radial-gradient(circle, #d3d3d3 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }}
    >
      <div className="card p-4 shadow-lg" style={{ width: '500px', border: 'none', borderRadius: '15px' }}>
      <h2 className="text-center mb-4 text-white">login</h2>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
          <label className="form-label text-white text-start d-block">username: </label>
          <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
          <label className="form-label text-white text-start d-block">password: </label>
          <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-secondary w-100">LOGIN</button>
          </form>
      </div>
    </div>

  );
};

export default Login;
