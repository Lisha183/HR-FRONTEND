import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setError(null);
    try {
     
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("Contact Form Submitted:", formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' }); 
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
     

      <div className="header-section">
        <h1>CONTACT US</h1>
        <p>Need an expert? You are more than welcomed to leave your contact info and we will be in touch shortly</p>
      </div>

<div className="contact-info-section">
  <div className="info-card">
    <div className="icon"><i className="fas fa-home"></i></div> 
    <h3>VISIT US</h3>
    <p>Our Nairobi office specializes in comprehensive talent acquisition and workforce planning to help your company grow.</p>
    <p>Nairobi,Kenya</p>
  </div>

  <div className="info-card">
    <div className="icon"><i className="fas fa-phone"></i></div> 
    <h3>CALL US</h3>
    <p>Speak with our HR consultants for personalized advice on employee engagement, compliance, and training solutions.</p>
    <p>254 712 345 678</p>
  </div>

  <div className="info-card">
    <div className="icon"><i className="fas fa-envelope"></i></div> 
    <h3>CONTACT US</h3>
    <p>Send us your inquiries about recruitment strategies, HR audits, or workforce development programs.</p>
    <p><a href="mailto:noreply@roland.com">support@loomahrplatform.com</a></p>
  </div>
</div>
    </div>
  );
};

export default ContactUs;
