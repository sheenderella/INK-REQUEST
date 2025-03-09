import React, { useState, useEffect } from 'react';
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
    if (!token || !userId) return navigate('/login');

    const fetchData = async () => {
      try {
        const { data: userData } = await axios.get(`http://localhost:8000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(userData);
        const { data: reqs } = await axios.get('http://localhost:8000/api/ink/admin/requests', { headers: { Authorization: `Bearer ${token}` } });
        setRequests(reqs);
      } catch (error) {
        toast.error('Error fetching data');
        console.error(error);
      }
    };
    fetchData();
  }, [navigate]);

  const handleAction = async (id, action) => {
    try {
      const { data: updated } = await axios.post('http://localhost:8000/api/ink/admin/approval', { requestId: id, action }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` }
      });
      toast.success(`Request ${action === 'Approved' ? 'approved' : 'rejected'} successfully!`);
      setRequests(requests.map(r => r._id === id ? { ...r, admin_approval: action, status: updated.status } : r));
    } catch (error) {
      toast.error(`Failed to ${action === 'Approved' ? 'approve' : 'reject'} request.`);
      console.error(error);
    }
  };

// Redirect to the consumption page along with the selected request
const handleFulfillRedirect = (req) => {
  console.log('Redirecting with request:', req);
  navigate('/consumption', { state: { request: req } });
};


  return (
    <div className="d-flex" style={{ height: "100vh", alignItems: "center" }}>
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
              {requests.length > 0 ? requests.map(r => (
                <tr key={r._id}>
                  <td>{r.requested_by ? `${r.requested_by.first_name} ${r.requested_by.last_name}` : 'N/A'}</td>
                  <td>{r.requested_by?.department || 'N/A'}</td>
                  <td>{r.ink?.ink_model?.ink_name || 'N/A'}</td>
                  <td>{r.ink_type || 'N/A'}</td>
                  <td>{new Date(r.request_date).toLocaleDateString()}</td>
                  <td>
                    {r.admin_approval === 'Approved' && <span className="badge bg-success">Approved</span>}
                    {r.admin_approval === 'Rejected' && <span className="badge bg-danger">Rejected</span>}
                    {r.admin_approval === 'Pending' && (
                      <>
                        <button className="btn btn-success me-1" onClick={() => handleAction(r._id, 'Approved')}>
                          <FaCheck /> Approve
                        </button>
                        <button className="btn btn-danger" onClick={() => handleAction(r._id, 'Rejected')}>
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    {r.status === 'Fulfilled' ? (
                      <span className="badge bg-primary">Fulfilled</span>
                    ) : r.admin_approval === 'Approved' ? (
                      // Redirect to the consumption page instead of opening a modal
                      <button className="btn btn-info" onClick={() => handleFulfillRedirect(r)}>Fulfill Request</button>
                    ) : r.status === 'Rejected' ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      r.status
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center">No approved requests found</td>
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

