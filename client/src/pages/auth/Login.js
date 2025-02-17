import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      if (response.data.role === 'admin') navigate('/admin');
      else navigate('/user');
    } catch (error) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white text-black">
      <div className="card bg-white text-black p-4 shadow-lg" style={{ width: '500px' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control border-black" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
          <div className="text-center mt-2">
            <span className="text-muted" style={{ cursor: 'pointer' }} onClick={() => navigate('/register')}>
              Don't have an account? <strong>Register</strong>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
