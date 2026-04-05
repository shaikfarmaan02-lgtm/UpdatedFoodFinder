import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAPI } from "../services/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orgName: "",
    orgType: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    setIsSubmitting(true);

    // Validate based on role
    if (selectedRole === "giver") {
      if (!formData.name || !formData.phone || !formData.email || !formData.address) {
        alert("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }
    } else if (selectedRole === "organization") {
      if (!formData.orgName || !formData.email || !formData.phone || !formData.address) {
        alert("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }
    } else if (selectedRole === "finder") {
      if (!formData.name) {
        alert("Please enter your name");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare registration data
      const userData = {
        role: selectedRole,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s/g, "")}@user.com`,
        phone: formData.phone,
        address: formData.address,
      };

      // Add role-specific fields
      if (selectedRole === "organization") {
        userData.name = formData.orgName;
        userData.orgType = formData.orgType;
      } else {
        userData.name = formData.name;
      }

      // Call registration API
      const response = await userAPI.register(userData);
      
      // Show appropriate message based on role
      if (selectedRole === "finder") {
        alert("Registration successful! You can now login.");
        navigate("/login");
      } else {
        alert(
          `Registration submitted successfully!\n\nYour account is pending admin approval.\nYou'll be notified once approved.`
        );
        navigate("/login");
      }
    } catch (error) {
      alert(
        "Registration failed: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <h2>Create an Account</h2>
        <p>Join Food Finder and help reduce food waste</p>

        {/* Role Selection */}
        <div className="role-section">
          <h3>Select Your Role</h3>
          <div className="role-buttons register-roles">
            <button
              className={`role-btn ${selectedRole === "giver" ? "active" : ""}`}
              onClick={() => setSelectedRole("giver")}
            >
              <span className="role-icon">👨‍🍳</span>
              <span className="role-title">Food Donor</span>
              <span className="role-desc">Share surplus food</span>
              <span className="approval-note">Requires Approval</span>
            </button>
            <button
              className={`role-btn ${selectedRole === "organization" ? "active" : ""}`}
              onClick={() => setSelectedRole("organization")}
            >
              <span className="role-icon">🏢</span>
              <span className="role-title">Organization</span>
              <span className="role-desc">NGOs, Shelters, Hostels</span>
              <span className="approval-note">Requires Approval</span>
            </button>
            <button
              className={`role-btn ${selectedRole === "finder" ? "active" : ""}`}
              onClick={() => setSelectedRole("finder")}
            >
              <span className="role-icon">🔍</span>
              <span className="role-title">Receiver</span>
              <span className="role-desc">Find available food</span>
              <span className="approval-note auto">Auto Approved</span>
            </button>
          </div>
        </div>

        {/* Registration Forms */}
        {selectedRole === "giver" && (
          <div className="auth-form">
            <h4>Donor Registration</h4>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="info-box warning">
              ⚠️ Donor accounts require admin approval before you can add food listings.
            </div>
          </div>
        )}

        {selectedRole === "organization" && (
          <div className="auth-form">
            <h4>Organization Registration</h4>
            <div className="form-group">
              <label>Organization Name *</label>
              <input
                type="text"
                name="orgName"
                placeholder="Enter organization name"
                value={formData.orgName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Organization Type</label>
              <select
                name="orgType"
                value={formData.orgType}
                onChange={handleInputChange}
              >
                <option value="">Select type</option>
                <option value="ngo">NGO</option>
                <option value="shelter">Shelter</option>
                <option value="hostel">Hostel</option>
                <option value="foodbank">Food Bank</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter organization email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter contact number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                placeholder="Enter organization address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="info-box warning">
              ⚠️ Organization accounts require admin verification before you can request food.
            </div>
          </div>
        )}

        {selectedRole === "finder" && (
          <div className="auth-form">
            <h4>Receiver Registration</h4>
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Phone (Optional)</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-box success">
              ✅ Receiver accounts are auto-approved. You can start finding food immediately!
            </div>
          </div>
        )}

        {selectedRole && (
          <button
            className="register-btn"
            onClick={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : `Register as ${selectedRole === "giver" ? "Donor" : selectedRole === "organization" ? "Organization" : "Receiver"}`}
          </button>
        )}

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
