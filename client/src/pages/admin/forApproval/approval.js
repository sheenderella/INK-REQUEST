import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTimes } from 'react-icons/fa';
import SideNav from '../../../components/SideNav';
import { toast, ToastContainer } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const RequestApprovalTable = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [consumptionStatus, setConsumptionStatus] = useState({});

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
      const requestData = {
        requestId,
        action
      };
  
      const { data: updatedRequest } = await axios.post(
        'http://localhost:8000/api/ink/admin/approval',
        requestData,
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` }
        }
      );
  
      // Compare with 'Approved' as sent from the UI
      toast.success(`Request ${action === 'Approved' ? 'approved' : 'rejected'} successfully!`);
  
      // Update the local requests state to reflect the changes
      setRequests(requests.map(req =>
        req._id === requestId
          ? { ...req, admin_approval: action, status: updatedRequest.status }
          : req
      ));
    } catch (error) {
      toast.error(`Failed to ${action === 'Approved' ? 'approve' : 'reject'} request.`);
      console.error(error);
    }
  };
  

const openFulfillModal = (request) => {
  setSelectedRequest(request);
  setConsumptionStatus(request.ink_type === 'black' ? 'Fully Used' : {}); // Default status
  setShowModal(true);
};

const handleFulfill = async () => {
  try {
    // Send consumption status to backend for updating the request
    await axios.put(`http://localhost:8000/api/ink/request/issue/${selectedRequest._id}`, 
      { consumptionStatus },
      { headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` } });

    toast.success('Request fulfilled successfully!');
    
    // Update the status of the request in the frontend to 'Fulfilled'
    setRequests(requests.map(req => req._id === selectedRequest._id ? { ...req, status: 'Fulfilled' } : req));

    setShowModal(false);
  } catch (error) {
    toast.error('Failed to fulfill request.');
    console.error(error);
  }
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
                <th>Name</th><th>Department</th><th>Ink Model</th><th>Ink Color</th><th>Date</th><th>Admin Approval</th><th>Request Status</th>
              </tr>
            </thead>
            
            <tbody>
  {requests.length > 0 ? requests.map((request) => (
    <tr key={request._id}>
      <td>{request.requested_by ? `${request.requested_by.first_name} ${request.requested_by.last_name}` : 'N/A'}</td>
      <td>{request.requested_by ? request.requested_by.department : 'N/A'}</td>
      <td>{request.ink?.ink_model?.ink_name || 'N/A'}</td>
      <td>{request.ink_type || 'N/A'}</td>
      <td>{new Date(request.request_date).toLocaleDateString()}</td>

      <td>
        {request.admin_approval === 'Approved' && <span className="badge bg-success">Approved</span>}
        {request.admin_approval === 'Rejected' && <span className="badge bg-danger">Rejected</span>}
        
        {!['Approved', 'Rejected'].includes(request.admin_approval) && (
          <>
            <button className="btn btn-success" 
              onClick={() => handleAction(request._id, 'Approved')} 
              disabled={request.admin_approval !== 'Pending'}>
              <FaCheck /> Approve
            </button>
            <button className="btn btn-danger" 
              onClick={() => handleAction(request._id, 'Rejected')} 
              disabled={request.admin_approval !== 'Pending'}>
              <FaTimes /> Reject
            </button>
          </>
        )}
      </td>
      
      <td>
        {request.status === 'Fulfilled' ? (
          <span className="badge bg-primary">Fulfilled</span>
        ) : request.status === 'Rejected' ? (
          <span className="badge bg-danger">Rejected</span>
        ) : (
          request.status
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

      {/* Modal for Fulfilled status */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title> Request Fulfilled </Modal.Title></Modal.Header>


        <Modal.Body>
  <label htmlFor="consumptionStatus">Consumption Status</label>
  {selectedRequest?.ink_type === 'colored' ? (
    Object.keys(consumptionStatus).map(color => (
      <div key={color}>
        <label>{color}</label>
        <select 
          className="form-control" 
          value={consumptionStatus[color]} 
          onChange={(e) => setConsumptionStatus({ ...consumptionStatus, [color]: e.target.value })}>
          <option value="Used">Used</option>
          <option value="Partially Used">Partially Used</option>
          <option value="Not Used">Not Used</option>
        </select>
      </div>
    ))
  ) : (
    <input 
      type="text" 
      className="form-control" 
      value={consumptionStatus} 
      onChange={(e) => setConsumptionStatus(e.target.value)} 
      placeholder="Enter consumption status" />
  )}
</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleFulfill}>Fulfill Request</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default RequestApprovalTable;
