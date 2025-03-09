// InkOrderPage.js
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
  
  const [inkInUseRecords, setInkInUseRecords] = useState([]);
  // orderInputs will store additional quantities from inventory per color.
  // Example: { Black: { additional: 0 }, cyan: { additional: 1 }, ... }
  const [orderInputs, setOrderInputs] = useState({});

  useEffect(() => {
    if (!request) {
      toast.error("No request data found");
      return navigate("/admin/for-approval");
    }
    
    // Fetch InkInUse records for this request's ink (using a query param such as inkId)
    axios
      .get(`http://localhost:8000/api/ink/inkinuse?inkId=${request.ink?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const records = response.data;
        setInkInUseRecords(records);
        
        // If no InkInUse records exist, directly process the issuance
        if (records.length === 0) {
          // Directly call issuance endpoint with default consumptionStatus (for example, using "Used")
          axios
            .post(
              'http://localhost:8000/api/ink/admin/issuance',
              { requestId: request._id, consumptionStatus: "Used" },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(() => {
              toast.success("Request approved directly (no InkInUse records found)");
              navigate("/admin/for-approval");
            })
            .catch((err) => {
              toast.error("Error processing issuance");
              console.error(err);
            });
        } else {
          // Initialize order inputs based on the InkInUse records (using color as key)
          const defaults = {};
          records.forEach((record) => {
            // For simplicity, we assume one record per color.
            defaults[record.color] = { additional: 0 };
          });
          setOrderInputs(defaults);
        }
      })
      .catch((err) => {
        toast.error("Error fetching InkInUse records");
        console.error(err);
      });
  }, [request, navigate, token]);

  const handleOrderChange = (color, value) => {
    setOrderInputs((prev) => ({
      ...prev,
      [color]: { additional: parseInt(value, 10) || 0 },
    }));
  };

  const handleConfirm = () => {
    // Build the consumptionStatus object.
    // This example assumes that for each color, the system will use 1 unit from the InkInUse record
    // and add any additional units from Inventory.
    const consumptionStatus = {};
    Object.keys(orderInputs).forEach((color) => {
      // We assume that if no additional quantity is needed, it's "Used"
      // Otherwise, "Partially Used" indicates new InkInUse records will be created.
      consumptionStatus[color] =
        orderInputs[color].additional > 0
          ? { used: 1, partiallyUsed: orderInputs[color].additional }
          : "Used";
    });

    axios
      .post(
        'http://localhost:8000/api/ink/admin/issuance',
        { requestId: request._id, consumptionStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Ink issuance processed successfully");
        navigate("/admin/for-approval");
      })
      .catch((err) => {
        toast.error("Error processing issuance");
        console.error(err);
      });
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2 className="mb-3">Ink Order Confirmation</h2>
      {inkInUseRecords.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Color</th>
                <th>Quantity In Use</th>
                <th>Additional from Inventory</th>
              </tr>
            </thead>
            <tbody>
              {inkInUseRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.color}</td>
                  <td>{record.quantity_used}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={orderInputs[record.color]?.additional || 0}
                      onChange={(e) => handleOrderChange(record.color, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm Order
          </button>
        </div>
      ) : (
        <p>Processing direct approval...</p>
      )}
    </div>
  );
};

export default InkOrderPage;
