import React, { useState } from 'react';
import { 
  FaXTwitter,
  FaDribbble, 
  FaBehance, 
  FaInstagram,
  FaCcMastercard,
  FaCcVisa,
  FaCcAmex,
  FaCcPaypal
} from 'react-icons/fa6';
import aoneLogo from '../../Home/assets/aone-logo.jpg';
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Company Info Column */}
          <div className="footer-column company-column">
            <div className="footer-logo">
              <img src={aoneLogo} alt="AONE Logo" />
            </div>
            <p className="company-description">
              Praesent nec nisl a purus blandit viverra.<br />
              Pellentesque habitant morbi tristique senectus.
            </p>
            <div className="company-contact">
              <p><strong>Address:</strong> 1234 Heaven Stress,USA.</p>
              <p><strong>Email:</strong> hello@domain.com</p>
              <p><strong>Phone:</strong> (+84) 1800 68 68</p>
            </div>
          </div>
          
          {/* Account Links Column */}
          <div className="footer-column links-column">
            <h3 className="column-heading">ACCOUNT</h3>
            <div className="column-line"></div>
            <ul className="footer-links">
              <li><a href="/about-us">About Us</a></li>
              <li><a href="/delivery">Delivery Information</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/discount">Discount</a></li>
              <li><a href="/custom-service">Custom Service</a></li>
              <li><a href="/terms">Term & Condition</a></li>
            </ul>
          </div>
          
          {/* Services Links Column */}
          <div className="footer-column links-column">
            <h3 className="column-heading">SERVICES</h3>
            <div className="column-line"></div>
            <ul className="footer-links">
              <li><a href="/sitemap">Sitemap</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/account">Your Account</a></li>
              <li><a href="/advanced-search">Advanced Search</a></li>
              <li><a href="/terms">Term & Condition</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Newsletter Column */}
          <div className="footer-column newsletter-column">
            <h3 className="column-heading">NEWSLETTERS</h3>
            <div className="column-line"></div>
            <p className="newsletter-text">
              Join 40.00+ Subscribers and get a new<br />discount coupon
            </p>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email..."
                  required
                  aria-label="Email for newsletter"
                />
                <button type="submit" aria-label="Subscribe to newsletter">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </form>
            
            {/* Social Media Icons */}
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="X (Twitter)">
                <FaXTwitter />
              </a>
              <a href="#" className="social-icon" aria-label="Dribbble">
                <FaDribbble />
              </a>
              <a href="#" className="social-icon" aria-label="Behance">
                <FaBehance />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>© Copyright 2025-2026 | t11 Powered by Strackit</p>
          </div>
          <div className="version-info">
            <p>version 1.0.2</p>
          </div>
          <div className="payment-methods">
            <FaCcMastercard className="payment-icon" title="Mastercard" />
            <FaCcAmex className="payment-icon" title="American Express" />
            <FaCcVisa className="payment-icon" title="Visa" />
            <FaCcPaypal className="payment-icon" title="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;