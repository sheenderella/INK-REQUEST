import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      toast.error("User not found. Please log in again.");
      setTimeout(() => navigate("/"), 3000);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      toast.error("Unauthorized access. Please log in again.", { position: "top-right" });
      return;
    }

    if (!userId) {
      toast.error("User ID is missing. Please log in again.", { position: "top-right" });
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New passwords do not match.", { position: "top-right" });
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
        { position: "top-right" }
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        "http://localhost:8000/api/change-password",
        {
          id: userId,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message, { position: "top-right" });
      setTimeout(() => navigate(-1), 2000); // Go back to previous page

    } catch (error) {
      console.error("Change Password Error:", error.response);
      toast.error(error.response?.data?.message || "Error updating password", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-card p-4">
      <ToastContainer />
      <div className="text-center">
      <h2 className="mb-3 custom-title">change password</h2>

        <form onSubmit={handleSubmit}>
          {/* Old Password */}
          <div className="custom-form-group mb-3">

            <label className="form-label field-label"> old password:</label>
            <div className="input-group">
              <input
                type={showPassword.oldPassword ? "text" : "password"}
                className="form-control"
                name="oldPassword"
                placeholder="enter old password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"

                onClick={() => togglePasswordVisibility("oldPassword")}
              >
                <i className={showPassword.oldPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="custom-form-group mb-3">
            <label className="form-label field-label"> new password:</label>
            <div className="input-group">
              <input
                type={showPassword.newPassword ? "text" : "password"}
                className="form-control"
                name="newPassword"
                placeholder="enter new password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"

                onClick={() => togglePasswordVisibility("newPassword")}
              >
                <i className={showPassword.newPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>

          </div>

          {/* Confirm New Password */}
          <div className="custom-form-group mb-3">
          <label className="form-label field-label"> confirm new password:</label>
            <div className="input-group">
              <input
                type={showPassword.confirmNewPassword ? "text" : "password"}
                className="form-control"
                name="confirmNewPassword"
                placeholder="re-enter new password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => togglePasswordVisibility("confirmNewPassword")}
              >
                <i className={showPassword.confirmNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
             <button type="submit" className="btn btn-primary mt-3 custom-button"
            disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
