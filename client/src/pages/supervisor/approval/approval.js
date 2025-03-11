import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTimes } from 'react-icons/fa';
import SideNav from '../../../components/SideNavSuper';
import { toast, ToastContainer } from 'react-toastify'; // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importing toast styles

const RequestApprovalTable = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);

  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('userId');

  // Navigate to login if token or userId is missing
  useEffect(() => {
    if (!token || !userId) {
      toast.error('No token or user session found. Please login again.'); // Use toast for error message
      navigate('/login');
      return;
    }

    // Fetch user data and requests simultaneously
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:8000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

        const requestsResponse = await axios.get('http://localhost:8000/api/ink/supervisor/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle empty response (no requests)
        if (requestsResponse.data.length === 0) {
          toast.info('No requests yet for approval.');
        }

        setRequests(requestsResponse.data);
      } catch (error) {
        if (error.response) {
          toast.error(`Error: ${error.response.data.error || 'Something went wrong'}`);
        } else if (error.request) {
          toast.error('No response received from server.');
        } else {
          toast.error('Failed to fetch data.');
        }
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token, userId, navigate]);

  // Approve request handler
  const handleApprove = useCallback(async (requestId) => {
    try {
      const response = await axios.post('http://localhost:8000/api/ink/supervisor', {
        requestId,
        action: 'Approve',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId ? { ...request, status: 'Approved' } : request
        )
      );
      toast.success('Request approved successfully!');
    } catch (error) {
      toast.error('Failed to approve request.');
      console.error('Error approving request:', error);
    }
  }, [token]);

  // Reject request handler
  const handleReject = useCallback(async (requestId) => {
    try {
      const response = await axios.post('http://localhost:8000/api/ink/supervisor', {
        requestId,
        action: 'Reject',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId ? { ...request, status: 'Rejected' } : request
        )
      );
      toast.success('Request rejected successfully!');
    } catch (error) {
      toast.error('Failed to reject request.');
      console.error('Error rejecting request:', error);
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ height: '100vh', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <SideNav user={user} handleLogout={handleLogout} />

      <div className="table-responsive">
        <ToastContainer /> {/* Toast container to display toasts */}
        <table className="table table-bordered table-striped mt-3 text-center">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Ink Model</th>
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
                  <td>{request.ink && request.ink.ink_model ? request.ink.ink_model.ink_name : 'N/A'}</td>
                  <td>{request.ink ? request.ink_type : 'N/A'}</td>
                  <td>{new Date(request.request_date).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'Approved' ? (
                      <span className="badge bg-success">Approved</span>
                    ) : request.status === 'Rejected' ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      <>
                        <button
                          className="btn btn-success mr-2"
                          onClick={() => handleApprove(request._id)}
                          disabled={request.status !== 'Pending'}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request._id)}
                          disabled={request.status !== 'Pending'}
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
                <td colSpan="6" className="text-center">No pending requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestApprovalTable;
