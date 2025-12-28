import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pinkIcon from "../assets/pinkicon.png";
import b0Image from "../assets/b0.jpg";
import b1Image from "../assets/b1.jpg";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [messageLength, setMessageLength] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMessageChange = (e) => {
    setMessageLength(e.target.value.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            <img src={pinkIcon} alt="HarmonyCare" className="logo-icon" />
            <span className="logo-text">HarmonyCare</span>
          </div>
          <div className="nav-links">
            <a href="#patients" className="nav-link">For Patients</a>
            <a href="#professionals" className="nav-link">For Professionals</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button className="nav-cta" onClick={() => navigate("/home")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Advanced Healthcare Platform</div>
          <h1 className="hero-title">Insightful medicine, compassionate care</h1>
          <p className="hero-subtitle">
            Empowering patients and healthcare professionals with AI-driven assessments, 
            risk evaluations, and clinical decision support tools for better health outcomes.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary" 
              onClick={() => document.getElementById("patients")?.scrollIntoView({ behavior: "smooth" })}
            >
              Patient Assessment
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => document.getElementById("professionals")?.scrollIntoView({ behavior: "smooth" })}
            >
              Professional Tools
            </button>
          </div>
        </div>
      </section>

      {/* For Patients Section */}
      <section id="patients" className="section patients-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">For Patients</h2>
            <p className="section-subtitle">
              Take control of your health with our comprehensive assessment tools designed for your wellbeing
            </p>
          </div>
          <div className="cards-grid patients-grid">
            <div className="card patient-card">
              <div className="card-icon-container">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              </div>
              <h3 className="card-title">HADS Psychological Assessment</h3>
              <p className="card-description">
                Evaluate your mental wellbeing with our Hospital Anxiety and Depression Scale assessment tool
              </p>
              <button className="card-button" onClick={() => navigate("/hads")}>
                Start Assessment
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="card patient-card">
              <div className="card-icon-container">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="card-title">Menopause Risk Evaluation</h3>
              <p className="card-description">
                Understand your menopause journey with personalized risk assessment and guidance
              </p>
              <button className="card-button" onClick={() => navigate("/menopause")}>
                Get Evaluated
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="card patient-card">
              <div className="card-icon-container">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="card-title">Breast Cancer Risk Model</h3>
              <p className="card-description">
                Advanced risk prediction model to help you understand and manage your breast health
              </p>
              <button className="card-button" onClick={() => navigate("/risk")}>
                Check Risk
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For Healthcare Professionals Section */}
      <section id="professionals" className="section professionals-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">For Healthcare Professionals</h2>
            <p className="section-subtitle">
              Advanced clinical tools powered by AI to support your diagnostic and treatment decisions
            </p>
          </div>
          <div className="cards-grid professionals-grid">
            <div className="card professional-card">
              <div className="card-icon-container">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  <path d="M21 3l-7 7"/>
                </svg>
              </div>
              <h3 className="card-title">Tumor Classification</h3>
              <p className="card-description">
                Advanced AI-powered tools for breast cancer classification using clinical data analysis or medical image analysis
              </p>
              <button className="card-button" onClick={() => navigate("/cancer-detection")}>
                Access Tool
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="card professional-card">
              <div className="card-icon-container">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="card-title">Recurrence Prediction</h3>
              <p className="card-description">
                Predictive models for cancer recurrence risk assessment
              </p>
              <button className="card-button" onClick={() => navigate("/recurrence")}>
                Access Tool
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="card professional-card">
              <div className="card-icon-container">
                <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                </svg>
              </div>
              <h3 className="card-title">Tumor Aggressivity Clustering</h3>
              <p className="card-description">
                Advanced clustering analysis for tumor classification
              </p>
              <button className="card-button" onClick={() => navigate("/aggressivity")}>
                Access Tool
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrations Section */}
      <section className="section illustrations-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Compassionate Care in Action</h2>
            <p className="section-subtitle">
              Bridging technology and humanity for better healthcare experiences
            </p>
          </div>
          <div className="illustrations-grid">
            <div className="illustration-item">
              <img src={b0Image} alt="Compassionate medical care" className="illustration-image" />
              <div className="illustration-content">
                <div className="feature-item">
                  <div className="feature-icon-container">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M12 14v7M9 17h6"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-title">Patient-Centered Approach</h4>
                    <p className="feature-description">
                      Every tool and assessment is designed with patient wellbeing at the forefront, 
                      ensuring compassionate and personalized care
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-container">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-title">Evidence-Based Medicine</h4>
                    <p className="feature-description">
                      Our platform integrates the latest clinical research and validated assessment tools 
                      to support informed healthcare decisions
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-container">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-title">Collaborative Care</h4>
                    <p className="feature-description">
                      Facilitating seamless communication between patients and healthcare providers 
                      for optimal treatment outcomes
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="illustration-item reverse">
              <div className="illustration-content">
                <div className="feature-item">
                  <div className="feature-icon-container">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-title">AI-Powered Insights</h4>
                    <p className="feature-description">
                      Leveraging advanced machine learning algorithms to provide accurate risk assessments 
                      and clinical decision support
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-container">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-title">Privacy & Security</h4>
                    <p className="feature-description">
                      Your health data is protected with enterprise-grade security and full HIPAA compliance standards
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-container">
                    <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="feature-title">Accessible Anywhere</h4>
                    <p className="feature-description">
                      Cloud-based platform accessible from any device, ensuring healthcare support 
                      whenever and wherever you need it
                    </p>
                  </div>
                </div>
              </div>
              <img src={b1Image} alt="Healthcare professional consultation" className="illustration-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get in Touch</h2>
            <p className="section-subtitle">
              Have questions? We're here to help you navigate your healthcare journey
            </p>
          </div>
          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" placeholder="Enter your full name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="Enter your email address" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" placeholder="What is this regarding?" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  placeholder="Tell us how we can help..."
                  maxLength="500"
                  onChange={handleMessageChange}
                  required
                />
                <span className="char-count">{messageLength}/500</span>
              </div>
              <button type="submit" className="btn-primary form-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <div className="footer-logo">
                <img src={pinkIcon} alt="HarmonyCare" className="logo-icon" />
                <span className="logo-text">HarmonyCare</span>
              </div>
              <p className="footer-tagline">Insightful medicine, compassionate care for a healthier tomorrow</p>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">For Patients</h4>
              <ul className="footer-links">
                <li><a href="/hads" onClick={(e) => { e.preventDefault(); navigate("/hads"); }}>HADS Assessment</a></li>
                <li><a href="/menopause" onClick={(e) => { e.preventDefault(); navigate("/menopause"); }}>Menopause Evaluation</a></li>
                <li><a href="/risk" onClick={(e) => { e.preventDefault(); navigate("/risk"); }}>Cancer Risk Model</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">For Professionals</h4>
              <ul className="footer-links">
                <li><a href="/detect" onClick={(e) => { e.preventDefault(); navigate("/detect"); }}>Cancer Detection</a></li>
                <li><a href="/detect-image" onClick={(e) => { e.preventDefault(); navigate("/detect-image"); }}>Image Analysis</a></li>
                <li><a href="/recurrence" onClick={(e) => { e.preventDefault(); navigate("/recurrence"); }}>Recurrence Prediction</a></li>
                <li><a href="/aggressivity" onClick={(e) => { e.preventDefault(); navigate("/aggressivity"); }}>Tumor Clustering</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4 className="footer-title">Contact</h4>
              <ul className="footer-links">
                <li><a href="mailto:info@harmonycare.com">info@harmonycare.com</a></li>
                <li><a href="tel:+15551234567">+1 (555) 123-4567</a></li>
              </ul>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 HarmonyCare. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms of Service</a>
              <span>|</span>
              <span>Powered by The Outliers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

