import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom"; 


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

  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);


    const result = await loginUser(formData.username, formData.password);

    if (result.success) {

        console.log("Login successful, redirection handled by AuthContext or useEffect.");
    } else {
        if (result.error === "Your account is pending approval by an administrator.") {
            setError("Your account is pending approval by an an administrator. Please wait for an HR manager to approve your account.");
        } else {
            setError(result.error);
        }
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