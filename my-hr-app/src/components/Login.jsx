import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom"; 

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(trimmed.slice(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // useEffect(() => {
  //   fetch("https://hr-backend-xs34.onrender.com/api/csrf/", {
  //     credentials: "include",
  //   });
  // }, []);
  useEffect(() => {
    async function fetchCSRF() {
      try {
        const res = await fetch("https://hr-backend-xs34.onrender.com/api/csrf/", {
          method: "GET",
          credentials: "include", // 👈 super important to get the cookie
        });
        console.log("CSRF set headers:", res.headers);
      } catch (err) {
        console.error("Failed to fetch CSRF cookie:", err);
      }
    }
    fetchCSRF();
  }, []);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(null);

    try {
        const csrfToken = getCookie("csrftoken");

        const response = await fetch("https://hr-backend-xs34.onrender.com/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (response.ok) {
            loginUser(data); 

            console.log(`Attempting to navigate to dashboard for role: ${data.role}`);
            if (data.role === "employee") {
              navigate ("/employee-dashboard");
            } else if (data.role === "admin") {
              navigate ("/admin-dashboard");
            } else {
              setError("Unknown role. Please contact support.");
            }
            
        } else {
            if (response.status === 403 && data.detail === "Your account is pending approval by an administrator.") {
                setError("Your account is pending approval by an administrator. Please wait for an HR manager to approve your account.");
            } else if (data.detail) {
                setError(data.detail);
            } else if (data.non_field_errors && data.non_field_errors.length > 0) {
                setError(data.non_field_errors[0]);
            } else {
                setError("Login failed. Please check your credentials.");
            }
            console.error('Login error:', data);
        }
    } catch (err) {
        console.error("Network error during login:", err);
        setError("Network error. Could not connect to the server.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <h1>Welcome back! </h1>
          <h2>Log in to your Account</h2>
          <p>Select method to log in:</p>
          
          {error && <div className="login-error-message">{error}</div>} 

          <form onSubmit={handleSubmit} autoComplete="off">
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required autoComplete="off" />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required autoComplete="off" />
            <div className="login-options">
            </div>
            <button type="submit" className="submit-btn">Log in</button>
          </form>
          <p className="register-link">
            Don’t have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
      <div className="login-right">
        <div className="info-panel">
          <h3>Connect with every application.</h3>
          <p>Everything you need in an easily customizable dashboard.</p>
        </div>
      </div>
    </div>
  );
}