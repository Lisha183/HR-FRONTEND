import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie } from "../utils/crsf";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [message, setMessage] = useState(null); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null); 
    setError(null);   
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://hr-backend-xs34.onrender.com/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"), 

         },
        
        body: JSON.stringify(formData),
        credentials: "include",
      });
    
      const data = await response.json();
      console.log("Register response:", data);
    
      if (response.ok) {
        setMessage("Registration successful! Please login.");
        setError(null);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.detail || "Registration failed! Please check the details.");
        setMessage(null);
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      setMessage(null);
    }
  };    

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <h2>Create an Account</h2>
          <p>Join us today! It's fast and easy.</p>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit" className="submit-btn">
              Register
            </button>
          </form>
          <p className="register-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
      <div className="login-right">
        <div className="info-panel">
          <h3>Streamline your workflow.</h3>
          <p>Create your account and get started instantly with your team.</p>
        </div>
      </div>
    </div>
  );
}