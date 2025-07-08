import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="overlay">
          <h1 className="headline">Empower Your Workforce</h1>
          <p className="subheadline">
            Streamline HR. Boost Productivity. Transform Employee Experience.
          </p>
          <button className="cta-button" onClick={handleRedirect}>
            Get Started
          </button>
        </div>
      </header>

      <section className="features-section">
        <div className="feature">
          <h2>Leave Management</h2>
          <p>Easily request, approve, and track leave applications with our automated system.</p>
        </div>
        <div className="feature">
          <h2>Payroll Automation</h2>
          <p>Generate accurate and timely payslips for all employees in just a few clicks.</p>
        </div>
        <div className="feature">
          <h2>Attendance Tracking</h2>
          <p>Monitor attendance and working hours with real-time insights.</p>
        </div>
      </section>

      <section className="about-section">
        <h2>Why Choose Us?</h2>
        <p>
          Our HR system is built with simplicity, security, and performance in mind.
          Whether you are a small business or a growing organization, we help you
          take care of your people with scalable solutions, seamless integrations,
          and real-time analytics.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
