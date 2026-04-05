import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import "../styles/adminDashboard.css";

function AdminDashboard({ foodList, setFoodList }) {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await adminAPI.getAllUsers();
        const allUsers = response.data?.data || [];
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
        showToast("Failed to load users", "error");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Stats calculation
  const totalListings = foodList.length;
  const activeListings = foodList.filter(f => f.status === "available" && new Date(f.expiryTime) > new Date()).length;
  const collectedFood = foodList.filter(f => f.status === "collected").length;
  const expiredFood = foodList.filter(f => new Date(f.expiryTime) < new Date() && f.status !== "collected").length;
  const totalUsers = users.length;
  const pendingApprovals = users.filter(u => u.approvalStatus === "PENDING_APPROVAL").length;
  const approvedUsers = users.filter(u => u.approvalStatus === "APPROVED").length;

  // Remove expired/invalid entries
  const removeExpiredListings = () => {
    const now = new Date();
    setFoodList(prev => prev.filter(food => 
      new Date(food.expiryTime) > now || food.status === "collected"
    ));
    showToast("Expired listings removed successfully!");
  };

  // Approve user
  const approveUser = async (userId) => {
    try {
      const response = await adminAPI.approveUser(userId);
      if (response.data?.data) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, approvalStatus: "APPROVED" } : user
        ));
        showToast("User approved successfully! They can now access the platform.");
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
      showToast("Failed to approve user", "error");
    }
  };

  // Reject user
  const rejectUser = async (userId) => {
    try {
      const response = await adminAPI.rejectUser(userId);
      if (response.data?.data) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, approvalStatus: "REJECTED" } : user
        ));
        showToast("User registration rejected.", "warning");
      }
    } catch (error) {
      console.error("Failed to reject user:", error);
      showToast("Failed to reject user", "error");
    }
  };

  // Toggle user status (suspend/activate)
  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.approvalStatus === "APPROVED" ? "SUSPENDED" : "APPROVED";
        return { ...user, approvalStatus: newStatus };
      }
      return user;
    }));
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        showToast("User deleted successfully.", "warning");
      } catch (error) {
        console.error("Failed to delete user:", error);
        showToast("Failed to delete user", "error");
      }
    }
  };

  // Delete food listing
  const deleteListing = (foodId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setFoodList(prev => prev.filter(food => food.id !== foodId));
      showToast("Listing deleted successfully.");
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get pending users
  const pendingUsers = users.filter(u => u.approvalStatus === "PENDING_APPROVAL");

  const role = localStorage.getItem("role");
  if (role !== "admin") {
    return (
      <div className="unauthorized-message">
        <h2>⚠️ Access Denied - Admin Only</h2>
      </div>
    );
  }

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED": return "approved";
      case "PENDING_APPROVAL": return "pending";
      case "REJECTED": return "rejected";
      case "SUSPENDED": return "suspended";
      default: return "";
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case "APPROVED": return "Approved";
      case "PENDING_APPROVAL": return "Pending";
      case "REJECTED": return "Rejected";
      case "SUSPENDED": return "Suspended";
      default: return status;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage platform content, users, and approvals</p>
        {isLoadingUsers && <p style={{fontSize: "14px", color: "#888", marginTop: "5px"}}>Loading users...</p>}
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={activeTab === "overview" ? "active" : ""} 
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === "approvals" ? "active" : ""} 
          onClick={() => setActiveTab("approvals")}
        >
          ✅ User Approvals {pendingApprovals > 0 && <span className="badge">{pendingApprovals}</span>}
        </button>
        <button 
          className={activeTab === "listings" ? "active" : ""} 
          onClick={() => setActiveTab("listings")}
        >
          🍽️ Manage Listings
        </button>
        <button 
          className={activeTab === "users" ? "active" : ""} 
          onClick={() => setActiveTab("users")}
        >
          👥 All Users
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card blue">
              <span className="stat-icon">📋</span>
              <div className="stat-info">
                <h3>{totalListings}</h3>
                <p>Total Listings</p>
              </div>
            </div>
            <div className="stat-card green">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <h3>{activeListings}</h3>
                <p>Active Listings</p>
              </div>
            </div>
            <div className="stat-card yellow">
              <span className="stat-icon">🤝</span>
              <div className="stat-info">
                <h3>{collectedFood}</h3>
                <p>Food Collected</p>
              </div>
            </div>
            <div className="stat-card red">
              <span className="stat-icon">⏰</span>
              <div className="stat-info">
                <h3>{expiredFood}</h3>
                <p>Expired Items</p>
              </div>
            </div>
            <div className="stat-card purple">
              <span className="stat-icon">👥</span>
              <div className="stat-info">
                <h3>{totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card orange">
              <span className="stat-icon">⏳</span>
              <div className="stat-info">
                <h3>{pendingApprovals}</h3>
                <p>Pending Approvals</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn danger" onClick={removeExpiredListings}>
                🗑️ Remove Expired Listings
              </button>
              <button className="action-btn primary" onClick={() => setActiveTab("approvals")}>
                ✅ Review Pending Approvals ({pendingApprovals})
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {foodList.slice(-5).reverse().map((food, index) => (
                <div className="activity-item" key={index}>
                  <span className="activity-icon">🍽️</span>
                  <div className="activity-info">
                    <p><strong>{food.foodName}</strong> listed by {food.giverName}</p>
                    <span className="activity-time">{food.location}</span>
                  </div>
                  <span className={`status-badge ${food.status}`}>{food.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Approvals Tab */}
      {activeTab === "approvals" && (
        <div className="admin-content">
          <div className="approvals-header">
            <h3>🔐 User Approval Requests</h3>
            <p>Review and approve new user registrations</p>
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="no-data-card">
              <span className="no-data-icon">✅</span>
              <h4>No Pending Approvals</h4>
              <p>All user registrations have been reviewed.</p>
            </div>
          ) : (
            <div className="approvals-grid">
              {pendingUsers.map(user => (
                <div className="approval-card" key={user.id}>
                  <div className="approval-header">
                    <div className="user-avatar">
                      {user.role === "giver" ? "👨‍🍳" : user.role === "organization" ? "🏢" : "👤"}
                    </div>
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="approval-details">
                    <div className="detail-row">
                      <span className="label">Role:</span>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === "giver" ? "Food Donor" : user.role === "organization" ? "Organization" : user.role}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{user.phone || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Registered:</span>
                      <span>{user.joinedDate}</span>
                    </div>
                    {user.orgType && (
                      <div className="detail-row">
                        <span className="label">Org Type:</span>
                        <span>{user.orgType}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="detail-row">
                        <span className="label">Address:</span>
                        <span>{user.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="approval-actions">
                    <button className="approve-btn" onClick={() => approveUser(user.id)}>
                      ✅ Approve
                    </button>
                    <button className="reject-btn" onClick={() => rejectUser(user.id)}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Manage Listings Tab */}
      {activeTab === "listings" && (
        <div className="admin-content">
          <div className="listings-header">
            <h3>All Food Listings</h3>
            <button className="action-btn danger" onClick={removeExpiredListings}>
              Remove All Expired
            </button>
          </div>
          
          <div className="listings-table">
            <table>
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Location</th>
                  <th>Donor</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foodList.length === 0 ? (
                  <tr><td colSpan="6" className="no-data">No listings found</td></tr>
                ) : (
                  foodList.map(food => (
                    <tr key={food.id}>
                      <td>{food.foodName}</td>
                      <td>{food.location}</td>
                      <td>{food.giverName}</td>
                      <td>{new Date(food.expiryTime).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${
                          new Date(food.expiryTime) < new Date() ? "expired" : food.status
                        }`}>
                          {new Date(food.expiryTime) < new Date() ? "Expired" : food.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="table-btn delete"
                          onClick={() => deleteListing(food.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === "users" && (
        <div className="admin-content">
          <div className="users-header">
            <h3>All Registered Users</h3>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td>{user.joinedDate}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(user.approvalStatus)}`}>
                        {formatStatus(user.approvalStatus)}
                      </span>
                    </td>
                    <td className="action-cell">
                      {user.approvalStatus === "PENDING_APPROVAL" && (
                        <>
                          <button 
                            className="table-btn success"
                            onClick={() => approveUser(user.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="table-btn warning"
                            onClick={() => rejectUser(user.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user.approvalStatus === "APPROVED" && (
                        <button 
                          className="table-btn warning"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          Suspend
                        </button>
                      )}
                      {user.approvalStatus === "SUSPENDED" && (
                        <button 
                          className="table-btn success"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          Activate
                        </button>
                      )}
                      <button 
                        className="table-btn delete"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
