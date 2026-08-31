import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';
import './UserLogin.css';

const CHECKIN_ITEMS = [
  { key: 'morningAttendance',    label: 'Morning Attendance',    icon: '🌅' },
  { key: 'afternoonAttendance',  label: 'Afternoon Attendance',  icon: '☀️' },
  { key: 'morningRefreshments',  label: 'Morning Refreshments',  icon: '☕' },
  { key: 'afternoonRefreshments',label: 'Afternoon Refreshments',icon: '🧃' },
  { key: 'lunch',                label: 'Lunch',                 icon: '🍽️' },
  { key: 'kitReceived',          label: 'Kit Received',          icon: '🎒' },
];

async function generateBrandedQR(participant) {
  if (!participant?.participantId) return null;
  const payload = JSON.stringify({
    pid: participant.participantId,
    riId: participant.riId,
    name: participant.name,
    club: participant.clubName,
    group: participant.group,
  });

  const canvas = document.createElement('canvas');
  const size = 320;
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, payload, {
    width: size,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const boxW = 96;
  const boxH = 30;

  // Center white badge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 6);
  ctx.fill();

  // Vector Logo Text
  ctx.fillStyle = '#8b5cf6';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VECTOR', cx, cy);

  return canvas.toDataURL('image/png');
}

const UserLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [user, setUser] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check stored session
  useEffect(() => {
    const stored = localStorage.getItem('vector_user_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (_) {}
    }
  }, []);

  // Generate QR when user state changes
  useEffect(() => {
    if (user) {
      generateBrandedQR(user).then(url => setQrUrl(url));
    }
  }, [user]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Please fill in both RI ID and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/user-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}). Please verify server status.`);
      }

      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.participant);
      localStorage.setItem('vector_user_data', JSON.stringify(data.participant));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setQrUrl('');
    setCredentials({ username: '', password: '' });
    localStorage.removeItem('vector_user_data');
  };

  const handleDownloadPass = () => {
    if (!user || !qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `VECTOR_PASS_${user.participantId}_${user.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="app">
      <Navbar />
      <main className="user-login-page">
        {!user ? (
          <div className="login-card-container">
            <div className="login-card-header">
              <div className="brand-badge">VECTOR 2026</div>
              <h1>Participant Login</h1>
              <p className="login-hint">
                🔑 <strong>Username:</strong> Your RI ID &nbsp;|&nbsp; 🔒 <strong>Password:</strong> <code>vector</code>
              </p>
            </div>

            <form onSubmit={handleLogin} className="user-login-form">
              {error && <div className="user-login-error">⚠️ {error}</div>}

              <div className="form-field">
                <label htmlFor="username">RI ID / Participant ID</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="e.g. RI10245 or V26G1001"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password (vector)"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn-user-login" disabled={loading}>
                {loading ? 'Authenticating…' : '🔓 Sign In to View Pass'}
              </button>
            </form>
          </div>
        ) : (
          <div className="user-dashboard-container">
            <div className="user-dash-header">
              <div>
                <span className="welcome-tag">WELCOME BACK</span>
                <h1 className="dash-name">{user.name}</h1>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>

            <div className="dash-grid">
              {/* Left Column: Digital Pass & QR Code */}
              <div className="pass-card-box">
                <div className="pass-card-top">
                  <div className="brand-logo">VECTOR 2026</div>
                  <div className="pass-group-badge">{user.group || 'Group 1'}</div>
                </div>

                <div className="pass-qr-frame">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`QR Code for ${user.name}`} className="pass-qr-img" />
                  ) : (
                    <div className="qr-loading">Generating QR…</div>
                  )}
                </div>

                <div className="pass-details">
                  <div className="pd-id">{user.participantId}</div>
                  {user.riId && <div className="pd-riid">RI ID: {user.riId}</div>}
                  <h3 className="pd-name">{user.name}</h3>

                  <div className="pd-meta-grid">
                    {user.clubName && (
                      <div className="pd-meta-item">
                        <span className="pdm-label">Club</span>
                        <span className="pdm-val">{user.clubName}</span>
                      </div>
                    )}
                    {user.group && (
                      <div className="pd-meta-item">
                        <span className="pdm-label">Group</span>
                        <span className="pdm-val">{user.group}</span>
                      </div>
                    )}
                    {user.portfolio && (
                      <div className="pd-meta-item">
                        <span className="pdm-label">Portfolio</span>
                        <span className="pdm-val">{user.portfolio}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button className="btn-download-qr-pass" onClick={handleDownloadPass}>
                  ⬇ Save Digital Pass (PNG)
                </button>
              </div>

              {/* Right Column: Check-in & Event Status */}
              <div className="status-overview-box">
                <h2>Event Check-In Status</h2>
                <p className="status-desc">
                  Present your QR code at registration counters to receive your attendance marks, refreshments, lunch, and kits.
                </p>

                <div className="status-grid">
                  {CHECKIN_ITEMS.map(item => {
                    const isDone = !!user[item.key];
                    return (
                      <div key={item.key} className={`status-card ${isDone ? 'done' : 'pending'}`}>
                        <span className="sc-icon">{item.icon}</span>
                        <div className="sc-info">
                          <span className="sc-label">{item.label}</span>
                          <span className="sc-state">{isDone ? '✓ Verified & Issued' : '⏳ Pending'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserLogin;
