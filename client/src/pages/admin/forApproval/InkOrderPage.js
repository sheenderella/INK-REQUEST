import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const InkOrderPage = () => {
  const navigate = useNavigate();
  const { request } = useLocation().state || {};
  const token = sessionStorage.getItem('authToken');

  const [inkRecords, setInkRecords] = useState([]);
  const [orderInputs, setOrderInputs] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetching ink records and handling the request details
  useEffect(() => {
    if (!request) {
      toast.error('No request data found');
      navigate('/for-approval');
      return;
    }

    axios
      .get('http://localhost:8000/api/inkinuse', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const filteredInkRecords = response.data; // All ink records fetched from the backend
        setInkRecords(filteredInkRecords);

        // Initialize order inputs dynamically based on the fetched ink colors
        const defaults = filteredInkRecords.reduce((acc, rec) => {
          acc[rec.color.toLowerCase()] = { additional: 0 }; // Set default additional ink to 0
          return acc;
        }, {});
        setOrderInputs(defaults);
      })
      .catch(() => toast.error('Error fetching Ink In Use records'))
      .finally(() => setLoading(false));
  }, [request, token, navigate]);

  // Handle changes in the additional quantity input
  const handleOrderChange = (color, value) => {
    const additionalValue = parseInt(value, 10) || 0;
    const inkInUseQuantity = inkRecords.find((rec) => rec.color.toLowerCase() === color.toLowerCase())?.quantity_used || 0;
    const totalRequested = inkInUseQuantity + additionalValue;

    setOrderInputs((prev) => ({
      ...prev,
      [color.toLowerCase()]: { additional: additionalValue, totalRequested },
    }));
  };

  // Handle the "Confirm" button click
  const handleConfirm = () => {
    let consumptionStatus = {};
    let totalRequested = request.quantity_requested;

    inkRecords.forEach((rec) => {
      const color = rec.color.toLowerCase();
      const additional = orderInputs[color]?.additional || 0;
      const inkInUseQuantity = rec.quantity_used || 0;

      const totalRequired = inkInUseQuantity + additional;
      consumptionStatus[color] = totalRequired > 0 ? (additional > 0 ? 'Partially Used' : 'Used') : 'Used';

      totalRequested += totalRequired;
    });

    // Send data to backend API for processing
    axios
      .post(
        'http://localhost:8000/api/ink/admin/issuance',
        { requestId: request._id, consumptionStatus, totalRequested },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success('Ink issuance processed successfully');
        navigate('/for-approval');
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.error || 'Error processing issuance';
        toast.error(errorMsg);
      });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <ToastContainer />
        <p>Loading...</p>
      </div>
    );
  }

  // Get requested colors (by ink type) and ensure all are displayed, even if no record exists
  const requestedColors = request.ink.map((ink) => ink.color.toLowerCase()); // Get the requested colors
  const filteredInkRecords = requestedColors.map((color) => {
    const record = inkRecords.find((rec) => rec.color.toLowerCase() === color); // Find the ink record for the color
    if (record) {
      return record; // If it exists, return the record
    } else {
      // If no record exists, return a default object for that color
      return { color, quantity_used: 0 };
    }
  });

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="custom-card p-4">
        <h2 className="mb-3">Ink Request Confirmation</h2>
        <p className="mb-4">Review and confirm your ink request details below.</p>
        <div className="mb-4">
          <h5>Request Details</h5>
          <p><strong>Requested By:</strong> {request.requested_by.first_name} {request.requested_by.last_name}</p>
          <p><strong>Ink Type:</strong> {request.ink_type}</p>
          <p><strong>Quantity Requested:</strong> {request.quantity_requested}</p>
        </div>

        {filteredInkRecords.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Ink In Use</th>
                  <th>Additional (from Inventory)</th>
                  <th>Total Requested</th>
                </tr>
              </thead>
              <tbody>
                {filteredInkRecords.map((rec) => {
                  const key = rec.color.toLowerCase();
                  const inkInUseQuantity = rec.quantity_used || 0;
                  const additional = orderInputs[key]?.additional || 0;
                  const totalRequested = inkInUseQuantity + additional;

                  return (
                    <tr key={rec.color}>
                      <td>{rec.color}</td>
                      <td>{inkInUseQuantity}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={additional}
                          onChange={(e) =>
                            handleOrderChange(rec.color, e.target.value)
                          }
                        />
                      </td>
                      <td>{totalRequested}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <p>No matching ink records found for the requested colors.</p>
        )}
      </div>
    </div>
  );
};

export default InkOrderPage;
