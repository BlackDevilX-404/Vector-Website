import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../../config';
import './Scanner.css';

const CHECKIN_FIELDS = [
  { key: 'morningAttendance',    label: 'Morning Attendance',    icon: '🌅' },
  { key: 'afternoonAttendance',  label: 'Afternoon Attendance',  icon: '☀️' },
  { key: 'morningRefreshments',  label: 'Morning Refreshments',  icon: '☕' },
  { key: 'afternoonRefreshments',label: 'Afternoon Refreshments',icon: '🧃' },
  { key: 'lunch',                label: 'Lunch',                 icon: '🍽️' },
  { key: 'kitReceived',          label: 'Kit Received',          icon: '🎒' },
];

function playBeepSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (_) {}
}

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [checkins, setCheckins] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [scanError, setScanError] = useState('');
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const lookupParticipant = async (pid) => {
    setScanError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/participants/by-pid/${encodeURIComponent(pid)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Participant not found');
      }
      const data = await res.json();
      setParticipant(data);
      // Pre-fill checkboxes with current database state
      const state = {};
      CHECKIN_FIELDS.forEach(f => { state[f.key] = data[f.key] || false; });
      setCheckins(state);
      playBeepSound();
    } catch (err) {
      setScanError(err.message);
      setParticipant(null);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    await stopScanner();
    let pid = decodedText.trim();
    // Parse JSON payload or URL if QR contains complex data
    try {
      const obj = JSON.parse(decodedText);
      if (obj.pid) pid = obj.pid;
    } catch (_) {
      if (decodedText.includes('id=')) {
        const match = decodedText.match(/id=([a-zA-Z0-9]+)/);
        if (match) pid = match[1];
      }
    }
    await lookupParticipant(pid);
  };

  const startScanner = async () => {
    setParticipant(null);
    setScanError('');
    setScanning(true);

    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode('qr-reader');
        html5QrRef.current = qr;
        await qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScanSuccess,
          () => {}
        );
      } catch (err) {
        setScanError('Camera access denied or unavailable on this device.');
        setScanning(false);
      }
    }, 100);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const handleSave = async (andNext = false) => {
    if (!participant) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/participants/${participant._id}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkins),
      });
      if (!res.ok) throw new Error('Failed to save check-in');
      setToast(`✅ Check-in saved for ${participant.name}!`);
      setTimeout(() => setToast(''), 3000);

      if (andNext) {
        setParticipant(null);
        setCheckins({});
        setManualId('');
        startScanner();
      }
    } catch (err) {
      setToast('❌ Failed to save. Please try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status = true) => {
    const updated = {};
    CHECKIN_FIELDS.forEach(f => { updated[f.key] = status; });
    setCheckins(updated);
  };

  const handleReset = async () => {
    await stopScanner();
    setParticipant(null);
    setCheckins({});
    setScanError('');
    setManualId('');
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    await lookupParticipant(manualId.trim().toUpperCase());
  };

  return (
    <div className="scanner-page">
      <h1 className="page-title">QR Scanner & Check-in Desk</h1>

      {toast && <div className="scanner-toast">{toast}</div>}

      {!participant && (
        <div className="scanner-container">
          {!scanning ? (
            <div className="scanner-start">
              <div className="scanner-icon">📷</div>
              <h2>Scan Participant Pass</h2>
              <p className="scanner-desc">
                Point the device camera at any participant's QR code pass to instantly load their profile and manage check-ins.
              </p>
              <button className="btn-start-scan" onClick={startScanner}>
                📷 Launch Camera Scanner
              </button>

              <div className="scanner-divider"><span>OR ENTER PARTICIPANT ID MANUALLY</span></div>

              <form className="manual-form" onSubmit={handleManualLookup}>
                <input
                  type="text"
                  className="manual-input"
                  placeholder="Enter ID e.g. V26G1001…"
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                />
                <button type="submit" className="btn-manual-lookup">Lookup ID</button>
              </form>
            </div>
          ) : (
            <div className="scanner-active">
              <div id="qr-reader" className="qr-reader-box" ref={scannerRef}></div>
              <button className="btn-stop-scan" onClick={stopScanner}>✕ Stop Camera</button>
            </div>
          )}

          {scanError && (
            <div className="scan-error">⚠️ {scanError}</div>
          )}
        </div>
      )}

      {participant && (
        <div className="checkin-panel">
          <div className="participant-card">
            <div className="pc-header">
              <span className="pc-pid">{participant.participantId}</span>
              <span className="pc-badge group">{participant.group || 'Group 1'}</span>
            </div>
            <h2 className="pc-name">{participant.name}</h2>
            <div className="pc-meta">
              {participant.riId && <span className="pc-badge riid">🆔 RI: {participant.riId}</span>}
              <span className="pc-badge club">🏛️ {participant.clubName || participant.institution || 'Participant'}</span>
              {participant.portfolio && <span className="pc-badge portfolio">💼 {participant.portfolio}</span>}
            </div>
          </div>

          <div className="checkin-controls-header">
            <h3>Mark Items for {participant.name}</h3>
            <div className="quick-toggle-btns">
              <button type="button" className="btn-quick-select" onClick={() => handleMarkAll(true)}>
                ✓ Select All
              </button>
              <button type="button" className="btn-quick-clear" onClick={() => handleMarkAll(false)}>
                ✕ Clear All
              </button>
            </div>
          </div>

          <div className="checkin-grid">
            {CHECKIN_FIELDS.map(field => (
              <label
                key={field.key}
                className={`checkin-item ${checkins[field.key] ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!checkins[field.key]}
                  onChange={e => setCheckins(prev => ({ ...prev, [field.key]: e.target.checked }))}
                />
                <span className="checkin-icon">{field.icon}</span>
                <div className="checkin-text">
                  <span className="checkin-label">{field.label}</span>
                  <span className="checkin-state-tag">
                    {checkins[field.key] ? 'Checked In' : 'Not Issued'}
                  </span>
                </div>
                <span className="checkin-checkbox-indicator">
                  {checkins[field.key] ? '✓' : ''}
                </span>
              </label>
            ))}
          </div>

          <div className="checkin-actions">
            <button className="btn-save" onClick={() => handleSave(false)} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
            <button className="btn-save-next" onClick={() => handleSave(true)} disabled={saving}>
              📷 Save & Scan Next
            </button>
            <button className="btn-scan-next" onClick={handleReset}>
              🔄 Reset / Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
