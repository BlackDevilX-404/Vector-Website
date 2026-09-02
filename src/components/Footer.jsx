import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-top-rule" />
    <div className="footer-main">
      <div className="container footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <div className="nav-logo-link">
            <img src="/logo.png" alt="VECTOR Logo" className="nav-logo-img" />
          </div>
          <p className="footer-desc">
            District Editorial Workshop<br />
            September 6, 2026<br />
            Sri Shakthi Institute of Engineering and Technology
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#logistics">Logistics</a></li>
            <li><a href="#schedule">Schedule</a></li>
            <li><a href="#materials">Materials</a></li>
            <li><a href="#core-team">Core Team</a></li>
            <li><a href="#host-leaders">Host Leaders</a></li>
            <li><a href="#guidelines">Guidelines</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>Email: vector.dews3206@gmail.com</p>
          <p>Contact no: +91 8111055911</p>
        </div>

      </div>
    </div>

    <div className="footer-bottom">
      <p>
        © {new Date().getFullYear()}&nbsp;
        <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none', cursor: 'default' }}>
          VECTOR Event
        </Link>
        . All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
