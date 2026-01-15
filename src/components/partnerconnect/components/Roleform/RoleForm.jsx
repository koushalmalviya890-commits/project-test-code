import React, { useState } from 'react';
import './RoleForm.css';

const RoleForm = ({ activeRole, setActiveRole }) => {

const API_BASE_URL = "https://webapi.cumma.in/api";
const [loading, setLoading] = useState(false); // To show spinner/disable button
  // Form Data Mapping
  const content = {
    facility: {
      title: "Start Your 90-Day FREE Trial",
      subtitle: "Join 247+ facilities across India. No credit card required.",
      buttonText: "Start 90-Day Trial",
      themeColor: "#22c55e", // Green
      fields: ['Email', 'Name', 'Phone', 'Facility Type', 'City', 'State']
    },
    affiliate: {
      title: "Join Affiliates (20% Commission)",
      subtitle: "Earn lifetime recurring revenue by referring facilities and startups.",
      buttonText: "Join Affiliate Program",
      themeColor: "#8b5cf6", // Purple
      fields: ['Email', 'Name', 'Phone', 'Primary Platform', 'Audience Size']
    },
    strategic: {
      title: "Strategic Partnership",
      subtitle: "Let's co-build India's startup infrastructure layer together.",
      buttonText: "Apply Strategic Partnership",
      themeColor: "#f59e0b", // Orange
      fields: ['Name', 'Email', 'Phone', 'Organisation', 'Role', 'Partner Type', 'Partnership Vision']
    }
  };

  const current = content[activeRole];

  const getOptionsForField = (fieldName) => {
    switch (fieldName) {
      case 'Facility Type':
        return ["Incubator", "Accelerator", "Institution/University", "Private Coworking Space", "Community Space", "R & D Labs"];
      case 'Partner Type':
        return ["Communities", "Investors", "Creators"];
      case 'Primary Platform':
        return ["LinkedIn", "YouTube", "Instagram", "WhatsApp/Telegram Group", "Email Newsletter", "Offline Network", "Website"];
      case 'Audience Size':
        return ["0-1000", "1000-5000", "5000-20000", "20000+"];
      default:
        return [];
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.roleType = activeRole; // Add the active role to payload

    try {
      const response = await fetch(`${API_BASE_URL}/partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

     const result = await response.json();

      if (response.ok) { // Check if HTTP status is 200-299
        alert("Success! We will contact you shortly.");
        e.target.reset(); // Clear the form
      } else {
        alert("Error: " + (result.message || "Submission failed"));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="form-container">
      <div className="header-section">
        <h2>Fill The Form Based on Your Role</h2>
        <p>Join the network and unlock your benefits</p>
      </div>

      {/* Navigation Toggle */}
      <div className="role-nav">
        <button 
          className={activeRole === 'facility' ? 'active green' : ''} 
          onClick={() => setActiveRole('facility')}
        >
          Facility Partner
        </button>
        <button 
          className={activeRole === 'affiliate' ? 'active purple' : ''} 
          onClick={() => setActiveRole('affiliate')}
        >
          Affiliate Program
        </button>
        <button 
          className={activeRole === 'strategic' ? 'active orange' : ''} 
          onClick={() => setActiveRole('strategic')}
        >
          Strategic Partner
        </button>
      </div>

      {/* Dynamic Form Card */}
      <div className="form-card" style={{ borderTop: `6px solid ${current.themeColor}` }}>
        <h1 style={{ color: current.themeColor }}>{current.title}</h1>
        <p className="subtitle">{current.subtitle}</p>

        <form className="grid-form" onSubmit={handleSubmit}>
          {current.fields.map((field) => (
            <div key={field} className={`input-group ${field === 'Partnership Vision' ? 'full-width' : ''}`}>
              <label>{field} *</label>
              {field.includes('Type') || field.includes('Size') || field.includes('Platform') ? (
                <select name={field.replace(/\s+/g, '_').toLowerCase()} className="form-input" required>
                  <option value="">Select {field}</option>
                  {getOptionsForField(field).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field === 'Partnership Vision' ? (
                <textarea name="vision" className="form-input" placeholder={`Tell us about your ${field}...`} required />
              ) : (
                <input name={field.toLowerCase()} type="text" className="form-input" required />
              )}
            </div>
          ))}

          <button 
            type="submit" 
            className="submit-btn" 
            style={{ backgroundColor: current.themeColor }}
            disabled={loading}
          >
         {loading ? 'Submitting...' : current.buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;