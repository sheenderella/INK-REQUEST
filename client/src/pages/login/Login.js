import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import logo from './logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if username and password are entered
    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required.", { position: 'top-right' });
      return;
    }
  
    setLoading(true);
    console.log('Attempting to log in with:', { username, password });
  
    try {
      const response = await axios.post('http://localhost:8000/api/login', { username, password });
      
      // Log the response
      console.log('Login response:', response);
  
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userId', response.data.userId);
        sessionStorage.setItem('role', response.data.role);
  
        setUsername('');
        setPassword('');
  
        toast.success("Login successful!", { position: 'top-right' });
  
        console.log('Login successful, redirecting...');
  
        setTimeout(() => {
          switch (response.data.role) {
            case 'admin':
              console.log('Redirecting to admin dashboard');
              navigate('/admin');
              break;
            case 'supervisor':
              console.log('Redirecting to supervisor dashboard');
              navigate('/dashboardSupervisor');
              break;
            case 'employee':
              console.log('Redirecting to employee dashboard');
              navigate('/dashboard-user');
              break;
            default:
              console.warn("Unknown role received:", response.data.role);
              navigate('/');
          }
        }, 1500);
      } else {
        console.log('No token received from the server.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error(error?.response?.data?.message || 'An error occurred. Please try again.', { position: 'top-right' });
    } finally {
      setLoading(false);
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
      <ToastContainer />
      <div className="card p-4 shadow-lg" style={{ width: '500px', border: 'none', borderRadius: '15px' }}>
        <h2 className="text-center mb-4 text-white">login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white text-start d-block">username:</label>
            <input
              type="text"
              className="form-control"
              placeholder="enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white text-start d-block">password:</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="enter password"
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

          <button
            type="submit"
            className="btn btn-secondary w-100"
            disabled={loading}
          >
            {loading ? 'logging in...' : 'login'}
          </button>

        </form>
      </div>

      <img
        src={logo}
        alt="Company Logo"
        className="position-absolute"
        style={{
          bottom: "20px",
          right: "20px",
          width: "80px",
          height: "auto",
          opacity: 0.8,
          transition: "opacity 0.3s ease-in-out"
        }}
      />
    </div>
  );
};

export default Login;
