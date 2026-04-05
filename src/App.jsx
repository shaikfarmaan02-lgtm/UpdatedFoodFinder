import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { foodAPI } from "./services/api";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FindFood from "./pages/FindFood";
import AddFood from "./pages/AddFood";
import FoodDetails from "./pages/FoodDetails";
import Profile from "./pages/Profile";
import MyFoods from "./pages/MyFoods";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import AdminDashboard from "./pages/AdminDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import PendingApproval from "./pages/PendingApproval";
import Unauthorized from "./pages/Unauthorized";

function App() {
  /* ================= FOOD LIST (FROM API) ================= */
  const [foodList, setFoodList] = useState([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(true);

  /* ================= ROLE STATE ================= */
  const [role, setRole] = useState(() => {
    return localStorage.getItem("role");
  });

  const [approvalStatus, setApprovalStatus] = useState(() => {
    return localStorage.getItem("approvalStatus");
  });

  /* ================= LOAD FOODS FROM API ================= */
  useEffect(() => {
    const loadFoods = async () => {
      try {
        setIsLoadingFoods(true);
        const response = await foodAPI.getAll();
        setFoodList(response.data);
      } catch (error) {
        console.error("Failed to load foods:", error);
        // Fallback to empty list if API fails
        setFoodList([]);
      } finally {
        setIsLoadingFoods(false);
      }
    };

    loadFoods();
  }, []);

  /* ================= AUTO-DELETE EXPIRED FOOD ================= */
  useEffect(() => {
    const cleanupExpiredFood = () => {
      const now = new Date();
      setFoodList(prev => {
        const validFood = prev.filter(food => 
          new Date(food.expiryTime) > now || food.status === "collected"
        );
        // Only update if something was removed
        if (validFood.length !== prev.length) {
          console.log(`Auto-removed ${prev.length - validFood.length} expired food item(s)`);
          return validFood;
        }
        return prev;
      });
    };

    // Run cleanup on mount
    cleanupExpiredFood();

    // Run cleanup every 5 minutes (300000ms)
    const interval = setInterval(cleanupExpiredFood, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /* ================= SYNC ROLE ON LOGIN / LOGOUT ================= */
  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
      setApprovalStatus(localStorage.getItem("approvalStatus"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* ================= DELETE FOOD (GIVER) ================= */
  const deleteFood = async (id) => {
    try {
      await foodAPI.delete(id);
      setFoodList((prev) =>
        prev.filter((food) => food.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete food:", error);
      alert("Failed to delete food item");
    }
  };

  /* ================= MARK AS COLLECTED (GIVER) ================= */
  const markAsCollected = async (id) => {
    try {
      await foodAPI.update(id, { status: "collected" });
      setFoodList((prev) =>
        prev.map((food) =>
          food.id === id
            ? { ...food, status: "collected" }
            : food
        )
      );
    } catch (error) {
      console.error("Failed to mark as collected:", error);
      alert("Failed to update food status");
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-content">
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ========== FIND FOOD (ALL LOGGED IN USERS) ========== */}
          <Route
            path="/find-food"
            element={
              <FindFood
                foodList={foodList}
                markAsCollected={markAsCollected}
                role={role}
              />
            }
          />

          {/* ========== DONOR ROUTES (APPROVED ONLY) ========== */}
          <Route
            path="/add-food"
            element={
              <ProtectedRoute allowedRoles={["giver", "admin"]} requireApproval={true}>
                <AddFood setFoodList={setFoodList} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-foods"
            element={
              <ProtectedRoute allowedRoles={["giver", "admin"]} requireApproval={true}>
                <MyFoods
                  foodList={foodList}
                  deleteFood={deleteFood}
                  markAsCollected={markAsCollected}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["giver", "admin"]} requireApproval={true}>
                <DonorDashboard foodList={foodList} />
              </ProtectedRoute>
            }
          />

          {/* ========== ORGANIZATION ROUTES (APPROVED ONLY) ========== */}
          <Route
            path="/organization-dashboard"
            element={
              <ProtectedRoute allowedRoles={["organization", "admin"]} requireApproval={true}>
                <OrganizationDashboard
                  foodList={foodList}
                  setFoodList={setFoodList}
                />
              </ProtectedRoute>
            }
          />

          {/* ========== ANALYST ROUTES (READ-ONLY) ========== */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["analyst", "admin"]} requireApproval={false}>
                <AnalyticsDashboard foodList={foodList} />
              </ProtectedRoute>
            }
          />

          {/* ========== ADMIN ROUTES ========== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]} requireApproval={false}>
                <AdminDashboard
                  foodList={foodList}
                  setFoodList={setFoodList}
                />
              </ProtectedRoute>
            }
          />

          {/* ========== OPTIONAL ROUTES ========== */}
          <Route path="/food/:id" element={<FoodDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* ========== FALLBACK ========== */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
