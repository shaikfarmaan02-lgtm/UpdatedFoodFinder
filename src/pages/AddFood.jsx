import { useState } from "react";
import { foodAPI } from "../services/api";
import "../styles/addFood.css";

function AddFood({ setFoodList }) {
  const [foodName, setFoodName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const role = localStorage.getItem("role");
  const approvalStatus = localStorage.getItem("approvalStatus");
  const giverName = localStorage.getItem("giverName");

  // Check authorization
  if (role !== "giver" && role !== "admin") {
    return (
      <div className="unauthorized-message">
        <h2>⚠️ Access Denied</h2>
        <p>Only approved donors can add food listings.</p>
      </div>
    );
  }

  if (approvalStatus === "PENDING_APPROVAL") {
    return (
      <div className="unauthorized-message">
        <h2>⏳ Account Pending Approval</h2>
        <p>Your donor account must be approved before you can add food listings.</p>
      </div>
    );
  }

  // STEP B1: Convert address to latitude & longitude
  const getCoordinates = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
    );
    const data = await response.json();

    if (data.length === 0) {
      alert("Location not found. Try a more specific place.");
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  };

  // STEP B2: Add food with real coordinates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const coords = await getCoordinates(location);
      if (!coords) {
        setIsSubmitting(false);
        return;
      }

      const newFood = {
        foodName,
        location,
        price: price === "0" || price === "" ? "Free" : `₹${price}`,
        type,
        latitude: coords.lat,
        longitude: coords.lng,
        expiryTime,
        status: "available",
        giverName: localStorage.getItem("giverName"),
        giverContact: localStorage.getItem("giverContact"),
      };

      // Call API to create food listing
      const response = await foodAPI.create(newFood);
      
      // Add the created food to the list
      setFoodList((prev) => [...prev, response.data]);

      alert("Food added successfully!");

      setFoodName("");
      setLocation("");
      setPrice("");
      setType("");
      setExpiryTime("");
    } catch (error) {
      alert(
        "Failed to add food: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Add food error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-food-container">
      <h2>Add Food Details</h2>
      <p>Share your food with those in need</p>

      <form className="add-food-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Food Name</label>
          <input
            type="text"
            placeholder="Enter food name"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Pickup Location</label>
          <input
            type="text"
            placeholder="e.g. Beach Road, Hyderabad"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              type="number"
              placeholder="0 for Free"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Food Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Expiry Time</label>
          <input
            type="datetime-local"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding Food..." : "Add Food"}
        </button>
      </form>
    </div>
  );
}

export default AddFood;
