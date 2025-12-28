import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pinkIcon from "../assets/pinkicon.png";
import "./Contact.css";

function Contact() {
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
    <div className="contact-page">
      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            <img src={pinkIcon} alt="HarmonyCare" className="logo-icon" />
            <span className="logo-text">HarmonyCare</span>
          </div>
          <div className="nav-links">
            <a href="/home" className="nav-link" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>For Patients</a>
            <a href="/home" className="nav-link" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>For Professionals</a>
            <a href="/contact" className="nav-link" onClick={(e) => { e.preventDefault(); navigate("/contact"); }}>Contact</a>
            <button className="nav-cta" onClick={() => navigate("/hads")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

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
              <span>Powered by Readdy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contact;

