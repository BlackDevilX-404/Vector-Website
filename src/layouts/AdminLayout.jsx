import { Outlet, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import Login from '../pages/admin/Login';
import './AdminLayout.css';

const NAV_LINKS = [
  { to: '/admin',           label: 'Dashboard',           icon: '📊', end: true },
  { to: '/admin/upload',    label: 'Upload Excel',         icon: '📤' },
  { to: '/admin/qrcodes',   label: 'QR Codes',             icon: '🔲' },
  { to: '/admin/scanner',   label: 'QR Scanner',           icon: '📷' },
  { to: '/admin/attendance',label: 'Attendance',            icon: '✅' },
  { to: '/admin/materials', label: 'Learning Materials',   icon: '📚' },
  { to: '/admin/users',     label: 'Admin Accounts',       icon: '🔑' },
];

const AdminLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Nuke any lingering localStorage token from the old version
    localStorage.removeItem('adminToken');

    // Check current session (survives refresh, dies on tab close)
    const token = sessionStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = (token) => {
    sessionStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img
            src="/logo.png"
            alt="VECTOR"
            className="admin-logo"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span>Admin Portal</span>
        </div>

        <nav className="admin-nav">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          <div className="nav-spacer" />

          <button
            onClick={handleLogout}
            className="admin-link logout-btn"
          >
            <span className="nav-icon">🚪</span>
            Log Out
          </button>
          <a href="/" className="admin-link" onClick={handleLogout} style={{ display: 'flex', marginTop: '0.5rem' }}>
            <span className="nav-icon">←</span>
            Public Site
          </a>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h2>VECTOR Event Management</h2>
        </header>
        <ReactLenis 
          className="admin-page-container" 
          options={{ 
            lerp: 0.025,
            duration: 1.5,
            wheelMultiplier: 1.1,
            smoothWheel: true,
            smoothTouch: true,
            syncTouch: true
          }}
        >
          <Outlet />
        </ReactLenis>
      </main>
    </div>
  );
};

export default AdminLayout;
