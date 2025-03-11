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

  // Utility: filter records based on ink type.
  const filterRecords = (records) => {
    return request.ink_type.toLowerCase() === 'black'
      ? records.filter((rec) => rec.color.toLowerCase() === 'black')
      : records.filter((rec) => rec.color.toLowerCase() !== 'black');
  };

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
        const filtered = filterRecords(response.data);
        setInkRecords(filtered);
        // Set default additional value 0 for each color found.
        const defaults = filtered.reduce((acc, rec) => {
          acc[rec.color.toLowerCase()] = { additional: 0 };
          return acc;
        }, {});
        setOrderInputs(defaults);
      })
      .catch(() => toast.error('Error fetching Ink In Use records'))
      .finally(() => setLoading(false));
  }, [request, token, navigate]);

  const handleOrderChange = (color, value) => {
    setOrderInputs((prev) => ({
      ...prev,
      [color.toLowerCase()]: { additional: parseInt(value, 10) || 0 },
    }));
  };

  const handleConfirm = () => {
    let consumptionStatus;
    if (request.ink_type.toLowerCase() === 'black') {
      // For black ink, use the first record's additional value.
      const key = inkRecords[0]?.color.toLowerCase() || 'black';
      const additional = orderInputs[key]?.additional || 0;
      consumptionStatus = additional > 0 ? 'Partially Used' : 'Used';
    } else {
      // For colored ink, build an object mapping each color to its status.
      consumptionStatus = inkRecords.reduce((acc, rec) => {
        const key = rec.color.toLowerCase();
        const additional = orderInputs[key]?.additional || 0;
        acc[rec.color] = additional > 0 ? 'Partially Used' : 'Used';
        return acc;
      }, {});
    }

    // Prepare the total quantity requested, adding additional quantities
    let totalRequested = request.quantity_requested;
    Object.values(orderInputs).forEach((input) => {
      totalRequested += input.additional;
    });

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
        const errorMsg =
          error.response?.data?.error || 'Error processing issuance';
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

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="custom-card p-4">
        <h2 className="mb-3">Ink Request Confirmation</h2>
        <p className="mb-4">Review and confirm your ink request details below.</p>
        {inkRecords.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Ink In Use</th>
                  <th>Additional (from Inventory)</th>
                </tr>
              </thead>
              <tbody>
                {inkRecords.map((rec) => {
                  const key = rec.color.toLowerCase();
                  // Check if there's an "Ink In Use" record for the color, else show 0
                  const inkInUseQuantity = rec.quantity_used || 0;
                  return (
                    <tr key={rec._id}>
                      <td>{rec.color}</td>
                      <td>{inkInUseQuantity}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={orderInputs[key]?.additional || 0}
                          onChange={(e) =>
                            handleOrderChange(rec.color, e.target.value)
                          }
                        />
                      </td>
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
          <p>No matching ink records found.</p>
        )}
      </div>
    </div>
  );
};

export default InkOrderPage;
