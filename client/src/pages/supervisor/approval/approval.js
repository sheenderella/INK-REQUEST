import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTimes } from 'react-icons/fa';

const RequestApprovalTable = () => {
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

    // Fetch requests that are approved by the supervisor
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/ink/supervisor/requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setRequests(response.data); // Set the fetched requests
      } catch (error) {
        setMessage('Failed to fetch requests.');
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, [navigate]);

  // Approve a request
  const handleApprove = async (requestId) => {
    try {
      await axios.put(`http://localhost:8000/api/ink/request/approve/${requestId}`, null, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        }
      });

      setMessage('Request approved successfully!');
      setRequests(requests.map((request) => 
        request._id === requestId ? { ...request, status: 'Approved' } : request
      ));
    } catch (error) {
      setMessage('Failed to approve request.');
      console.error('Error approving request:', error);
    }
  };

  // Reject a request
  const handleReject = async (requestId) => {
    try {
      await axios.put(`http://localhost:8000/api/ink/request/reject/${requestId}`, null, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        }
      });

      setMessage('Request rejected successfully!');
      setRequests(requests.map((request) => 
        request._id === requestId ? { ...request, status: 'Rejected' } : request
      ));
    } catch (error) {
      setMessage('Failed to reject request.');
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="mt-4 text-center">Approved Ink Request Table</h2>
      {message && <p className="alert alert-info">{message}</p>}

      <div className="table-responsive">
        <table className="table table-bordered table-striped mt-3 text-center">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Ink Model</th> {/* Ink Model Column */}
              <th>Ink Color</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.requested_by ? `${request.requested_by.first_name} ${request.requested_by.last_name}` : 'N/A'}</td>
                  <td>{request.requested_by ? request.requested_by.department : 'N/A'}</td>
                  {/* Display the ink model name from the populated data */}
                  <td>{request.ink && request.ink.ink_model ? request.ink.ink_model.ink_name : 'N/A'}</td>
                  <td>{request.ink ? request.ink_type : 'N/A'}</td>
                  <td>{new Date(request.request_date).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'Approved' && (
                      <span className="badge bg-success">Approved</span>
                    )}
                    {request.status === 'Rejected' && (
                      <span className="badge bg-danger">Rejected</span>
                    )}
                    {request.status !== 'Approved' && request.status !== 'Rejected' && (
                      <>
                        <button
                          className="btn btn-success mr-2"
                          onClick={() => handleApprove(request._id)}
                          disabled={request.status === 'Approved' || request.status === 'Rejected'}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request._id)}
                          disabled={request.status === 'Approved' || request.status === 'Rejected'}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No approved requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestApprovalTable;
