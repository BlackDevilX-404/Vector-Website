import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';
import './ParticipantPass.css';

async function generateBrandedQR(participant) {
  if (!participant?.participantId) return null;
  const payload = JSON.stringify({
    pid: participant.participantId,
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

  // Center white box for logo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 6);
  ctx.fill();

  // VECTOR Text
  ctx.fillStyle = '#8b5cf6';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VECTOR', cx, cy);

  return canvas.toDataURL('image/png');
}

const ParticipantPass = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Handle URL query param e.g. /pass?id=V26G1001
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('id');
    if (pid) {
      setQuery(pid);
      fetch(`${API_BASE_URL}/api/participants/by-pid/${encodeURIComponent(pid)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setSelected(data);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (selected) {
      generateBrandedQR(selected).then(url => setQrUrl(url));
    }
  }, [selected]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setSelected(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/participants/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data);
      if (data.length === 1) {
        setSelected(data[0]);
      } else if (data.length === 0) {
        setError('No participant pass found matching your query.');
      }
    } catch (err) {
      setError('Failed to fetch participant pass. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadPass = () => {
    if (!selected || !qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `VECTOR_PASS_${selected.participantId}_${selected.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="app">
      <Navbar />
      <main className="pass-page-container">
        <div className="pass-hero-section">
          <h1 className="pass-hero-title">Get Your Digital Event Pass</h1>
          <p className="pass-hero-subtitle">
            Enter your Name, Participant ID, or Club to download your official QR Pass for event check-in.
          </p>

          <form onSubmit={handleSearch} className="pass-search-form">
            <input
              type="text"
              className="pass-search-input"
              placeholder="Search by Name or Participant ID (e.g. V26G1001)…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="pass-search-btn" disabled={searching}>
              {searching ? 'Searching…' : '🔍 Find Pass'}
            </button>
          </form>

          {error && <div className="pass-error-msg">{error}</div>}

          {/* Multiple matches selector */}
          {results.length > 1 && !selected && (
            <div className="pass-results-list">
              <p className="pass-results-title">Multiple participants found. Select yours:</p>
              <div className="pass-results-grid">
                {results.map(p => (
                  <div
                    key={p._id}
                    className="pass-result-card"
                    onClick={() => setSelected(p)}
                  >
                    <span className="pr-id">{p.participantId}</span>
                    <span className="pr-name">{p.name}</span>
                    <span className="pr-club">{p.clubName || p.institution || 'Participant'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Pass Ticket */}
        {selected && (
          <div className="pass-ticket-wrapper">
            <div className="pass-ticket-card">
              <div className="ticket-header">
                <div className="ticket-brand">VECTOR 2026</div>
                <div className="ticket-badge">{selected.group || 'Participant Pass'}</div>
              </div>

              <div className="ticket-body">
                <div className="ticket-qr-area">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`QR Pass for ${selected.name}`} className="ticket-qr-img" />
                  ) : (
                    <div className="ticket-qr-placeholder">Generating QR…</div>
                  )}
                </div>

                <div className="ticket-info">
                  <div className="ticket-pid">{selected.participantId}</div>
                  <h2 className="ticket-name">{selected.name}</h2>
                  
                  <div className="ticket-details-grid">
                    {selected.riId && (
                      <div className="td-item">
                        <span className="td-label">RI ID</span>
                        <span className="td-value">{selected.riId}</span>
                      </div>
                    )}
                    {selected.clubName && (
                      <div className="td-item">
                        <span className="td-label">Club / Institution</span>
                        <span className="td-value">{selected.clubName}</span>
                      </div>
                    )}
                    {selected.group && (
                      <div className="td-item">
                        <span className="td-label">Allocated Group</span>
                        <span className="td-value">{selected.group}</span>
                      </div>
                    )}
                    {selected.portfolio && (
                      <div className="td-item">
                        <span className="td-label">Portfolio</span>
                        <span className="td-value">{selected.portfolio}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="ticket-footer">
                <p className="ticket-instruction">
                  📷 Present this QR code at registration desks for Attendance, Refreshments & Kits.
                </p>
                <div className="ticket-actions">
                  <button className="btn-download-pass" onClick={handleDownloadPass}>
                    ⬇ Save Digital Pass (PNG)
                  </button>
                  <button className="btn-clear-pass" onClick={() => { setSelected(null); setResults([]); }}>
                    🔍 Search Another
                  </button>
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

export default ParticipantPass;
