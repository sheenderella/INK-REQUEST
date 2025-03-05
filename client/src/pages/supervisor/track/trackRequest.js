import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import SideNav from '../../../components/SideNavSuper';
import './trackRequest.css';

const TrackRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
      setMessage('No token or user session found. Please login again.');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ink/requests/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setRequests(response.data);
      } catch (error) {
        setMessage('Failed to fetch ink requests.');
        console.error('Error fetching requests:', error);
      }
    };

    fetchUserData();
    fetchRequests();
  }, [navigate]);

  return (
    <div className="d-flex" style={{ height: '100vh', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <SideNav user={user} />
      <div className="form-wrapper">
        <div className="form-card">
          <h2 className="form-title">Track Ink Request</h2>

          {message && <p className="form-message">{message}</p>}

          <div className="track-result mt-4">
            <table className="table table-bordered table-black-white">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Admin Approval</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td>{new Date(request.request_date).toLocaleDateString()}</td>
                      <td>{request.admin_approval}</td>
                      <td>{request.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
