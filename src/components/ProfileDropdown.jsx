import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profileDropdown.css";

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const getUserData = () => {
    const role = localStorage.getItem("role");
    if (!role) return null;

    const baseData = {
      role,
      approvalStatus: localStorage.getItem("approvalStatus"),
    };

    switch (role) {
      case "giver":
        return {
          ...baseData,
          name: localStorage.getItem("giverName") || "Donor",
          email: localStorage.getItem("userEmail") || "",
          phone: localStorage.getItem("giverContact") || "",
          displayRole: "Donor",
          roleColor: "giver",
        };
      case "organization":
        return {
          ...baseData,
          name: localStorage.getItem("orgName") || "Organization",
          email: localStorage.getItem("orgEmail") || "",
          phone: "",
          displayRole: "Organization",
          roleColor: "organization",
        };
      case "finder":
        return {
          ...baseData,
          name: localStorage.getItem("finderName") || "Receiver",
          email: "",
          phone: localStorage.getItem("finderPhone") || "",
          displayRole: "Receiver",
          roleColor: "finder",
        };
      case "analyst":
        return {
          ...baseData,
          name: localStorage.getItem("analystName") || "Analyst",
          email: localStorage.getItem("analystEmail") || "",
          phone: "",
          displayRole: "Data Analyst",
          roleColor: "analyst",
        };
      case "admin":
        return {
          ...baseData,
          name: "Administrator",
          email: localStorage.getItem("adminEmail") || "",
          phone: "",
          displayRole: "Admin",
          roleColor: "admin",
        };
      default:
        return null;
    }
  };

  // Load user data on mount and listen for changes
  useEffect(() => {
    setUserData(getUserData());

    const handleStorageChange = () => {
      setUserData(getUserData());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    
    // Clear user data
    localStorage.removeItem("role");
    localStorage.removeItem("approvalStatus");
    localStorage.removeItem("giverName");
    localStorage.removeItem("giverContact");
    localStorage.removeItem("orgName");
    localStorage.removeItem("orgEmail");
    localStorage.removeItem("analystName");
    localStorage.removeItem("analystEmail");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("finderName");
    localStorage.removeItem("finderPhone");
    localStorage.removeItem("userEmail");
    
    setUserData(null);
    setIsOpen(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!userData) return null;

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        className={`profile-avatar-btn ${userData.roleColor}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <span className="avatar-initials">{getInitials(userData.name)}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="profile-dropdown-panel">
          {/* Header with Avatar */}
          <div className="profile-dropdown-header">
            <div className={`profile-avatar-large ${userData.roleColor}`}>
              <span>{getInitials(userData.name)}</span>
            </div>
            <div className="profile-header-info">
              <h3 className="profile-name">{userData.name}</h3>
              <span className={`profile-role-badge ${userData.roleColor}`}>
                {userData.displayRole}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="profile-dropdown-divider"></div>

          {/* User Details */}
          <div className="profile-dropdown-details">
            {userData.email && (
              <div className="profile-detail-item">
                <span className="detail-icon">📧</span>
                <div className="detail-content">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{userData.email}</span>
                </div>
              </div>
            )}

            {userData.phone && (
              <div className="profile-detail-item">
                <span className="detail-icon">📱</span>
                <div className="detail-content">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{userData.phone}</span>
                </div>
              </div>
            )}

            {/* Status Badge */}
            {userData.approvalStatus && userData.role !== "finder" && userData.role !== "admin" && (
              <div className="profile-detail-item">
                <span className="detail-icon">
                  {userData.approvalStatus === "APPROVED" ? "✅" : "⏳"}
                </span>
                <div className="detail-content">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${userData.approvalStatus.toLowerCase()}`}>
                    {userData.approvalStatus === "APPROVED" ? "Approved" : "Pending Approval"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Role-specific info */}
          {userData.role === "giver" && (
            <div className="profile-role-info">
              <span className="role-info-icon">👨‍🍳</span>
              <span className="role-info-text">You can share surplus food with those in need</span>
            </div>
          )}

          {userData.role === "organization" && (
            <div className="profile-role-info">
              <span className="role-info-icon">🏢</span>
              <span className="role-info-text">Manage food collections for your organization</span>
            </div>
          )}

          {userData.role === "finder" && (
            <div className="profile-role-info">
              <span className="role-info-icon">🔍</span>
              <span className="role-info-text">Find and collect available food near you</span>
            </div>
          )}

          {userData.role === "analyst" && (
            <div className="profile-role-info">
              <span className="role-info-icon">📊</span>
              <span className="role-info-text">Access analytics and platform insights</span>
            </div>
          )}

          {userData.role === "admin" && (
            <div className="profile-role-info">
              <span className="role-info-icon">🛡️</span>
              <span className="role-info-text">Full platform management access</span>
            </div>
          )}

          {/* Divider */}
          <div className="profile-dropdown-divider"></div>

          {/* Actions */}
          <div className="profile-dropdown-actions">
            <button className="profile-logout-btn" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
