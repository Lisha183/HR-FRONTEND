import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/register/", {
            method: "POST",
      headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
            credentials: "include",
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (response.ok) {
      alert("Registration successful! Please login.");
      navigate("/login");
            } else {
      alert("Registration failed! Please check the details.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <h2>Create an Account</h2>
          <p>Join us today! It's fast and easy.</p>
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