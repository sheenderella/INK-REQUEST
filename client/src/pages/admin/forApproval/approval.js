import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTimes } from 'react-icons/fa';
import SideNav from '../../../components/SideNav';
import { toast, ToastContainer } from 'react-toastify';

const RequestApprovalTable = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch user data and requests concurrently
    Promise.all([
      axios.get(`http://localhost:8000/api/users/${userId}`, { headers }),
      axios.get('http://localhost:8000/api/ink/admin/requests', { headers })
    ])
      .then(([userRes, requestsRes]) => {
        setUser(userRes.data);
        setRequests(requestsRes.data);
      })
      .catch(error => {
        toast.error('Error fetching data');
        console.error(error);
      });
  }, [navigate]);

  const handleReject = useCallback(async (id) => {
    const token = sessionStorage.getItem('authToken');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const { data: updated } = await axios.post(
        'http://localhost:8000/api/ink/admin/approval',
        { requestId: id, action: 'Rejected' },
        { headers }
      );
      toast.success('Request rejected successfully!');
      setRequests(prevRequests =>
        prevRequests.map((r) =>
          r._id === id ? { ...r, admin_approval: 'Rejected', status: updated.status } : r
        )
      );
    } catch (error) {
      toast.error('Failed to reject request.');
      console.error(error);
    }
  }, []);

  const handleApprove = useCallback(async (req) => {
    const token = sessionStorage.getItem('authToken');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Fetch ink in use records
      const response = await axios.get('http://localhost:8000/api/inkinuse', { headers });
      const records = response.data;
      const requestedColor = req.ink_type.toLowerCase();
  
      let filteredRecords = [];
      if (requestedColor === 'colored') {
        // Example: consider all inks that are not black as colored inks
        filteredRecords = records.filter(record => record.color.toLowerCase() !== 'black');
      } else {
        filteredRecords = records.filter(record =>
          record.color.toLowerCase() === requestedColor
        );
      }
  
      if (filteredRecords.length === 0) {
        // No matching records found; auto approve directly
        const { data: updated } = await axios.post(
          'http://localhost:8000/api/ink/admin/approval',
          { requestId: req._id, action: 'Approved' },
          { headers }
        );
        toast.success('Request approved successfully!');
        setRequests(prevRequests =>
          prevRequests.map((r) =>
            r._id === req._id ? { ...r, admin_approval: 'Approved', status: updated.status } : r
          )
        );
      } else {
        // Matching records exist; redirect for further confirmation
        navigate('/ink-order', { state: { request: req } });
      }
    } catch (error) {
      toast.error('Failed to approve request.');
      console.error(error);
    }
  }, [navigate]);
  
  
  const handleFulfillRedirect = useCallback((req) => {
    console.log('Redirecting with request:', req);
    navigate('/consumption', { state: { request: req } });
  }, [navigate]);

  const renderAdminApproval = (r) => {
    switch (r.admin_approval) {
      case 'Approved':
        return <span className="badge bg-success">Approved</span>;
      case 'Rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'Pending':
        return (
          <>
            <button className="btn btn-success me-1" onClick={() => handleApprove(r)}>
              <FaCheck /> Approve
            </button>
            <button className="btn btn-danger" onClick={() => handleReject(r._id)}>
              <FaTimes /> Reject
            </button>
          </>
        );
      default:
        return null;
    }
  };

  const renderStatus = (r) => {
    if (r.status === 'Fulfilled') {
      return <span className="badge bg-primary">Fulfilled</span>;
    }
    if (r.admin_approval === 'Approved') {
      return (
        <button className="btn btn-info" onClick={() => handleFulfillRedirect(r)}>
          Fulfill Request
        </button>
      );
    }
    if (r.status === 'Rejected') {
      return <span className="badge bg-danger">Rejected</span>;
    }
    return r.status;
  };
  
  return (
    <div className="d-flex" style={{ height: '100vh', alignItems: 'center' }}>
      <SideNav user={user} />
      <div className="content">
        <h2 className="dashboard-title">Approve Requests</h2>
        <div className="table-responsive">
          <table className="table table-bordered table-striped mt-3 text-center">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Ink Model</th>
                <th>Ink Color</th>
                <th>Date</th>
                <th>Admin Approval</th>
                <th>Request Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.requested_by ? `${r.requested_by.first_name} ${r.requested_by.last_name}` : 'N/A'}</td>
                    <td>{r.requested_by?.department || 'N/A'}</td>
                    <td>{r.ink && r.ink[0]?.ink_model?.ink_name ? r.ink[0].ink_model.ink_name : 'N/A'}</td>
                    <td>{r.ink_type || 'N/A'}</td>
                    <td>{new Date(r.request_date).toLocaleDateString()}</td>
                    <td>{renderAdminApproval(r)}</td>
                    <td>{renderStatus(r)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No approved requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default RequestApprovalTable;
