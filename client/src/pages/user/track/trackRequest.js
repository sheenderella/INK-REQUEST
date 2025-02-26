import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import './trackRequest.css';

const TrackRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
      setMessage('No token or user session found. Please login again.');
      navigate('/login');
      return;
    }

    // Fetch the user's ink requests
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ink/requests/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setRequests(response.data); // Set the fetched ink requests
      } catch (error) {
        setMessage('Failed to fetch ink requests.');
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, [navigate]);

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
        <h2 className="form-title">Track Ink Request</h2>

        {message && <p className="form-message">{message}</p>}

        <div className="track-result mt-4">
          <table className="table table-bordered table-black-white">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Supervisor Approval</th>
                <th scope="col">Admin Approval</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request._id}>
                    <td>{new Date(request.request_date).toLocaleDateString()}</td>
                    <td>{request.supervisor_approval}</td>
                    <td>{request.admin_approval}</td>
                    <td>{request.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
