import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTimes } from 'react-icons/fa';
import SideNav from '../../../components/SideNav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        const userResponse = await axios.get(`http://localhost:8000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(userResponse.data);

        const requestsResponse = await axios.get('http://localhost:8000/api/ink/admin/requests', { headers: { Authorization: `Bearer ${token}` } });
        setRequests(requestsResponse.data);
      } catch (error) {
        toast.error('Error fetching data');
        console.error(error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAction = async (requestId, action) => {
    try {
      const actionResponse = await axios.put(`http://localhost:8000/api/ink/request/${action}/${requestId}`, { action }, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } });
      const updatedRequest = actionResponse.data;

      if (updatedRequest.ink_type === 'black') {
        await axios.put(`http://localhost:8000/api/ink/request/issue/${requestId}`, { consumptionStatus: "Fully Used" }, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } });
      } else if (updatedRequest.ink_type === 'colored') {
        await axios.put(`http://localhost:8000/api/ink/request/issue/${requestId}`, { consumptionStatus: { red: 'Used', blue: 'Partially Used' } }, { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } });
      }

      toast.success(`Request ${action}d successfully!`);
      setRequests(requests.map(req => req._id === requestId ? { ...req, status: action.charAt(0).toUpperCase() + action.slice(1) } : req));
    } catch (error) {
      toast.error(`Failed to ${action} request.`);
      console.error(error);
    }
  };

  return (
    <div className="d-flex" style={{ height: "100vh", alignItems: "center" }}>
      <SideNav user={user} />
      <div className="content" style={{ height: "50vh" }}>
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.requested_by ? `${request.requested_by.first_name} ${request.requested_by.last_name}` : 'N/A'}</td>
                    <td>{request.requested_by ? request.requested_by.department : 'N/A'}</td>
                    <td>{request.ink?.ink_model?.ink_name || 'N/A'}</td>
                    <td>{request.ink ? request.ink_type : 'N/A'}</td>
                    <td>{new Date(request.request_date).toLocaleDateString()}</td>
                    <td>
                      {request.status === 'Approved' && <span className="badge bg-success">Approved</span>}
                      {request.status === 'Rejected' && <span className="badge bg-danger">Rejected</span>}
                      {!['Approved', 'Rejected'].includes(request.status) && (
                        <>
                          <button className="btn btn-success mr-2" onClick={() => handleAction(request._id, 'approve')} disabled={request.status !== 'Pending'}><FaCheck /> Approve</button>
                          <button className="btn btn-danger" onClick={() => handleAction(request._id, 'reject')} disabled={request.status !== 'Pending'}><FaTimes /> Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">No approved requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default RequestApprovalTable;
