import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Prevent scrolling when menu is open
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#home" className="nav-logo-link" onClick={closeMenu}>
            <img src="/logo.png" alt="VECTOR Logo" className="nav-logo-img" />
          </a>
          
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#sponsors">Sponsors</a></li>
            <li><a href="#logistics">Logistics</a></li>
            <li><a href="#schedule">Schedule</a></li>
            <li><a href="#materials">Materials</a></li>
            <li><a href="#core-team">Core Team</a></li>
            <li><a href="#host-leaders">Host Leaders</a></li>
            <li><a href="#guidelines">Guidelines</a></li>
          </ul>

          <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Full-screen Mobile Overlay */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-nav-links">
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#sponsors" onClick={closeMenu}>Sponsors</a></li>
            <li><a href="#logistics" onClick={closeMenu}>Logistics</a></li>
            <li><a href="#schedule" onClick={closeMenu}>Schedule</a></li>
            <li><a href="#materials" onClick={closeMenu}>Materials</a></li>
            <li><a href="#core-team" onClick={closeMenu}>Core Team</a></li>
            <li><a href="#host-leaders" onClick={closeMenu}>Host Leaders</a></li>
            <li><a href="#guidelines" onClick={closeMenu}>Guidelines</a></li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
