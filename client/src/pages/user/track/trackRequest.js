import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft } from 'react-icons/fa';  // Import the back arrow icon
import './trackRequest.css';  // Make sure to add the new CSS

const TrackRequest = () => {
  const navigate = useNavigate();

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />  {/* Add the back icon here */}
        <h2 className="form-title">Track Ink Request</h2>

        <div className="track-result mt-4">
          <table className="table table-bordered table-black-white">
            <thead>
              <tr>
                <th scope="col">Request ID</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="text-center">No requests yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
