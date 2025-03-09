import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Consumption = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRequest = location.state?.request || null;

  // For colored ink, consumptionStatus is an object; for black ink, it's a string.
  const [consumptionStatus, setConsumptionStatus] = useState(
    selectedRequest?.ink_type === 'colored' ? {} : 'Used'
  );
  // State to hold available colors.
  const [colorOptions, setColorOptions] = useState([]);

  useEffect(() => {
    if (!selectedRequest) {
      toast.error('No request data found.');
      navigate('/admin/for-approval');
      return;
    }

    if (selectedRequest.ink_type === 'colored') {
      // Ensure we work with an array of inventory records.
      const inventoryRecords = Array.isArray(selectedRequest.ink)
        ? selectedRequest.ink
        : [selectedRequest.ink];

      // Extract colors, filter out "black", and remove duplicates.
      const filteredColors = [
        ...new Set(
          inventoryRecords
            .map(record => record.color)
            .filter(color => color && color.toLowerCase() !== 'black')
        )
      ];

      setColorOptions(filteredColors);
      // Create a defaults object for consumptionStatus.
      setConsumptionStatus(
        filteredColors.reduce((defaults, color) => {
          defaults[color] = 'Used';
          return defaults;
        }, {})
      );
    } else {
      // For black ink, show a single field labeled "Black".
      setColorOptions(['Black']);
      setConsumptionStatus('Used');
    }
  }, [selectedRequest, navigate]);

  const handleConsumptionChange = (color, value) => {
    if (selectedRequest.ink_type === 'colored') {
      setConsumptionStatus(prev => ({ ...prev, [color]: value }));
    } else {
      setConsumptionStatus(value);
    }
  };

  const handleFulfill = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/ink/admin/issuance',
        { requestId: selectedRequest._id, consumptionStatus },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        }
      );
      toast.success('Request fulfilled successfully!');
      setTimeout(() => {
        navigate('/admin/for-approval');
      }, 1500);
    } catch (error) {
      toast.error('Failed to fulfill request.');
      console.error(error);
    }
  };

  if (!selectedRequest) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="custom-card p-4 text-center">
        <div>
          <h2 className="mb-3 custom-title">
            Fulfill Request for {selectedRequest.requested_by?.first_name}{' '}
            {selectedRequest.requested_by?.last_name}
          </h2>
          <p className="mb-4 custom-text">Ink Type: {selectedRequest.ink_type}</p>
        </div>
        <form>
          <div className="custom-form-group mb-3">
            <label className="form-label field-label">Consumption Status</label>
            {colorOptions.map(color => (
              <div className="mb-3" key={color}>
                <label className="form-label custom-label">{color}</label>
                <select
                  className="form-select custom-select mx-auto"
                  style={{ maxWidth: '300px' }}
                  value={
                    selectedRequest.ink_type === 'colored'
                      ? consumptionStatus[color]
                      : consumptionStatus
                  }
                  onChange={e => handleConsumptionChange(color, e.target.value)}
                >
                  <option value="Used">Used</option>
                  <option value="Partially Used">Partially Used</option>
                </select>
              </div>
            ))}
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary mt-3 custom-button"
              onClick={handleFulfill}
            >
              Fulfill Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Consumption;
