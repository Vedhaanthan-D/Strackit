import React, { useState } from 'react';
import { FaTwitter, FaDribbble, FaBehance, FaInstagram } from 'react-icons/fa';
import aoneLogo from '../../assets/aone-logo.webp';
import '../styles/Footer.css';

/* Base64 encoded SVG payment method icons as fallbacks */
const paymentIcons = {
  mastercard: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIxNjYiIGN5PSIyNTYiIHI9IjE0MCIgZmlsbD0iI2ViMDAxYiIvPjxjaXJjbGUgY3g9IjM0NiIgY3k9IjI1NiIgcj0iMTQwIiBmaWxsPSIjZjc5ZTFiIi8+PHBhdGggZmlsbD0iI2ZmNWYwMCIgZD0iTTI1NiAzNDZjMzMuNjgzLTMzLjc0IDUwLjUyNC03OC4xMTYgNTAuNTI0LTEyMi40ODlDMzA2LjUyNCAxNzcuMTE2IDI4OS42ODMgMTMyLjc0IDI1NiA5OWMtMzMuNjgzIDMzLjc0LTUwLjUyNCA3OC4xMTYtNTAuNTI0IDEyNC41MTFDMjA1LjQ3NiAyNjcuODg0IDIyMi4zMTcgMzEyLjI2IDI1NiAzNDZ6Ii8+PC9zdmc+",
  visa: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMDAyNzlBIiBkPSJNMTc4LjIwOCAyMDIuMzYzbC0yMC40MDQgOTUuNDMzSDEzMS41OWwyMC40MDMtOTUuNDMzaC0wLjAwMXpNMjMxLjIzOCAyMDIuODcxYy02Ljk0NCAwLTEyLjE1OCAyLjAzOS0xNS4yMzUgOS41MzlsLTAuNTM1IDBMIDI5NS4wMDIgMjk3Ljc5NmgtMjcuMzA5bC0zLjM1MS05My40MjZIMjM4LjlsMjIuMzQ0IDkzLjQyNmgtMjIuMzQ0bDIwLjQwNC05NS4zMzRoLTAuMDAxek0zNTAuMDQxIDI5OC4yOTZoMjMuNTcxbC0xNC42MTctOTUuOTI0aC0yMC42ODdjLTkuMzM4IDAtMTEuNjIxIDcuMjQyLTE2LjkwMSAxNS45NTZsLTI5LjI3OCA3OS45NjhoMjYuMzQzbDQuMDY2LTExLjI3OWgyNC45NWwxLjU2MiAxMS4yNzloLTAuMDA5ek0yODYuNyAyMDIuMzcxbC0xOS4zNDkgMDguOTgySDI0Mi4wMTlsMTkuMzQ5LTkwLjg4MmgyNS4yOTl6Ii8+PC9zdmc+",
  amex: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZyBmaWxsPSIjMDA2NkMxIj48cGF0aCBkPSJNMTE5LjA2MiAxMzAuNzY4SDE3LjA0NnYyNTAuNDVoMTAyLjAxNnoiLz48cGF0aCBkPSJNMTIzLjEwNCAxMzAuNzY4aDk1LjcybDE5Ljk1OCA0NS42NDIgMTkuNDU0LTQ1LjY0Mmg1Ni4zNDJ2MTk4LjA2NmgtNTYuMzQyVjE5NC41MzFsLTI2LjM3OCA2Mi42MDctMjkuOTE2LTYyLjYwN3YxMzQuMzAzSDEyMy4xMDR6Ii8+PHBhdGggZD0iTTM5My4xMzkgMTMwLjc2OGgzMi4wNzhMNDk1IDMyOC44MzRoLTU3Ljg0N2wtMTAuNDc3LTI4LjUyNWgtNTYuODQ0bC0xMS45ODUgMjguNTI1aC01Ny4zNDNMNDM4LjI5MiAxMzAuNzY4eiIvPjwvZz48L3N2Zz4=",
  paypal: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMDAzMDg3IiBkPSJNNDAzLjkzOCAxNzMuMTJjMC00Ni4yMDktMzcuNDkxLTgzLjcwMS04My43MDEtODMuNzAxSDIwNS4wMDVDMTk2LjEyOCA2MS42NTYgMTY5LjQ3OSAzOCAxMzYuODc4IDM4Yy0zNS4yMzIgMC02My43NjggMjguNTM2LTYzLjc2OCA2My43Njh2MjA4LjQ2NGMwIDM1LjIzMiAyOC41MzYgNjMuNzY4IDYzLjc2OCA2My43NjhoMzIuNTI1QzE3OC41MTEgNDAxLjM0NCAyMDQuOTIzIDQyNCAyMzYuNzQ5IDQyNGgxNTUuOTIyYzQ2LjIwOSAwIDgzLjcwMS0zNy40OTEgODMuNzAxLTgzLjcwMVYxNzMuMTJ6Ii8+PHBhdGggZmlsbD0iIzAwMzA4NyIgZD0iTTEzNi44NzggNTguODcyYy0yMy42NiAwLTQyLjg5NiAxOS4yMzYtNDIuODk2IDQyLjg5NnYyMDguNDY0YzAgMjMuNjYgMTkuMjM2IDQyLjg5NiA0Mi44OTYgNDIuODk2aDMyLjUyNWM5LjEwOC0yNy40MzIgMzUuNTItNDcuNzI4IDY3LjM0Ni00Ny43MjhoMTU1LjkyMmM0Ni4yMDkgMCA4My43MDEtMzcuNDkxIDgzLjcwMS04My43MDFWMTU4LjY3NGgtNTYuMTQxYy0zNC44NDQgMC02My4wNzYtMjguMjMyLTYzLjA3Ni02My4wNzZ2LTM2LjcyN0gyMDUuMDA1eiIvPjxwYXRoIGZpbGw9IiMwMDk5RTEiIGQ9Ik00MzYuNDY0IDE1OC42NzRoLTU2LjE0MWMtMzQuODQ0IDAtNjMuMDc2LTI4LjIzMi02My4wNzYtNjMuMDc2VjU4Ljg3MkgyMDUuMDA1Yy04LjgyNC0yMS43MjgtMzQuMzM4LTM2LjgxLTYzLjg5Ni0zNi44MUMxMDIuMjQ4IDIyLjA2MiA3Ni40IDQ3LjkxIDc2LjQgODEuNzcydjIwOC40NjRDNzYuNCAzMjQuMDk5IDEwMi4yNDggMzQ5Ljk0NyAxMzYuODc4IDM0OS45NDdoMzIuNTI1YzguODg4IDI0LjUzMiAzNC4zOTggMzkuMTQgNjIuMDE3IDM5LjE0aDE1NS45MjJjMzQuODQ0IDAgNjMuMDc2LTI4LjIzMiA2My4wNzYtNjMuMDc2VjE3My4xMmMwLTguMDA0LTYuNDQyLTE0LjQ0Ni0xNC40NDYtMTQuNDQ2aC0wLjAwOHoiLz48cGF0aCBmaWxsPSIjMDBBQUVFIiBkPSJNMzgwLjMyMyA5NS41OTh2LTM2LjcyN0gyMDUuMDA1Yy04LjgyNC0yMS43MjgtMzQuMzM4LTM2LjgxLTYzLjg5Ni0zNi44MUM5My40MTQgMjIuMDYyIDUxLjAzMSA2NC40NDUgNTEuMDMxIDExNi45Mjl2MTg4LjE0M0M1MS4wMzEgMzQ4LjU1NSA5My40MTQgMzkwLjkzOCAxMzYuODc4IDM5MC45MzhoMzIuNTI1YzguODg4IDI0LjUzMiAzNC4zOTggMzkuMTQgNjIuMDE3IDM5LjE0aDE1NS45MjJjMzQuODQ0IDAgNjMuMDc2LTI4LjIzMiA2My4wNzYtNjMuMDc2VjE1OC42NzRoLTU2LjE0MUM0MDguNTU0IDE1OC42NzQgMzgwLjMyMyAxMzAuNDQyIDM4MC4zMjMgOTUuNTk4eiIvPjwvc3ZnPg=="
};

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    // Reset form
    setEmail('');
  };
  
  const currentYear = new Date().getFullYear();

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
              <a href="#" className="social-icon" aria-label="Twitter">
                <FaTwitter />
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
            <p>© Copyright {currentYear} | <span>Aone</span> By ShopiLaunch. Powered by Shopify.</p>
          </div>
          <div className="payment-methods">
            <img src={paymentIcons.mastercard} alt="Mastercard" />
            <img src={paymentIcons.amex} alt="American Express" />
            <img src={paymentIcons.visa} alt="Visa" />
            <img src={paymentIcons.paypal} alt="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;