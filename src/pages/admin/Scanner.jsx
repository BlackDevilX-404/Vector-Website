import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './Scanner.css';

const CHECKIN_FIELDS = [
  { key: 'morningAttendance',    label: 'Morning Attendance',    icon: '🌅' },
  { key: 'afternoonAttendance',  label: 'Afternoon Attendance',  icon: '☀️' },
  { key: 'morningRefreshments',  label: 'Morning Refreshments',  icon: '☕' },
  { key: 'eveningRefreshments',  label: 'Evening Refreshments',  icon: '🧃' },
  { key: 'lunch',                label: 'Lunch',                 icon: '🍽️' },
  { key: 'kitReceived',          label: 'Kit Received',          icon: '🎒' },
];

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
      const res = await fetch(`/api/participants/by-pid/${encodeURIComponent(pid)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Participant not found');
      }
      const data = await res.json();
      setParticipant(data);
      // Pre-fill checkboxes with current state
      const state = {};
      CHECKIN_FIELDS.forEach(f => { state[f.key] = data[f.key] || false; });
      setCheckins(state);
    } catch (err) {
      setScanError(err.message);
      setParticipant(null);
    }
  };

  // Poll for updates on the currently viewed participant
  useEffect(() => {
    if (!participant) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/participants/by-pid/${encodeURIComponent(participant.participantId)}`);
        if (!res.ok) return;
        const data = await res.json();
        
        // Update local state without flickering the whole participant object
        setCheckins(prev => {
          const nextState = { ...prev };
          let changed = false;
          CHECKIN_FIELDS.forEach(f => {
            if (nextState[f.key] !== !!data[f.key]) {
              nextState[f.key] = !!data[f.key];
              changed = true;
            }
          });
          return changed ? nextState : prev;
        });
      } catch (e) {
        // silently ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [participant]);

  const handleScanSuccess = async (decoded) => {
    await stopScanner();
    let pid = decoded;
    try {
      const obj = JSON.parse(decoded);
      if (obj.pid) pid = obj.pid;
    } catch (_) {}
    await lookupParticipant(pid);
  };

  const startScanner = async () => {
    setParticipant(null);
    setScanError('');
    setScanning(true);

    // Small delay to let DOM render the scanner div
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
        setScanError('Camera access denied or unavailable.');
        setScanning(false);
      }
    }, 100);
  };

  const [allParticipants, setAllParticipants] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => setAllParticipants(data))
      .catch(console.error);
    return () => { stopScanner(); };
  }, []);

  const handleToggle = async (fieldKey, newValue) => {
    // Optimistic UI update
    setCheckins(prev => ({ ...prev, [fieldKey]: newValue }));
    try {
      const res = await fetch(`/api/participants/${participant._id}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldKey]: newValue }), // Atomic update: only send the delta
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      // Revert on failure
      setCheckins(prev => ({ ...prev, [fieldKey]: !newValue }));
      setToast(`❌ Failed to update ${fieldKey}`);
      setTimeout(() => setToast(''), 3000);
    }
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
    const query = manualId.trim().toLowerCase();
    
    // First try exact ID match
    let match = allParticipants.find(p => p.participantId.toLowerCase() === query);
    
    // Then try exact name match
    if (!match) {
      const nameMatches = allParticipants.filter(p => p.name.toLowerCase().includes(query));
      if (nameMatches.length === 1) match = nameMatches[0];
      else if (nameMatches.length > 1) {
        setScanError('Multiple participants found. Please select from the dropdown.');
        setShowDropdown(true);
        return;
      }
    }

    if (match) {
      await lookupParticipant(match.participantId);
      setShowDropdown(false);
    } else {
      // Fallback to API if not in local state
      await lookupParticipant(manualId.trim().toUpperCase());
    }
  };

  const filteredParticipants = allParticipants.filter(p => {
    if (!manualId.trim()) return false;
    const q = manualId.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.participantId.toLowerCase().includes(q) || (p.riId && String(p.riId).includes(q));
  }).slice(0, 5); // Limit dropdown to 5 results

  return (
    <div className="scanner-page">
      <h1 className="page-title">QR Scanner</h1>

      {toast && <div className="scanner-toast">{toast}</div>}

      {!participant && (
        <>
          {!scanning ? (
            <div className="scanner-start">
              <div className="scanner-icon">📷</div>
              <p className="scanner-desc">
                Point the camera at a participant's QR code to load their details and mark check-in items.
              </p>
              <button className="btn-start-scan" onClick={startScanner}>
                Start Camera Scanner
              </button>

              <div className="scanner-divider"><span>or upload QR image</span></div>

              <input
                type="file"
                accept="image/*"
                id="qr-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setScanError('');
                  try {
                    const qr = new Html5Qrcode('qr-reader-hidden');
                    const decodedText = await qr.scanFileV2(file);
                    handleScanSuccess(decodedText.decodedText || decodedText);
                  } catch (err) {
                    try {
                      const qr = new Html5Qrcode('qr-reader-hidden');
                      const decodedText = await qr.scanFile(file, false);
                      handleScanSuccess(decodedText);
                    } catch (err2) {
                      setScanError('Could not find a valid QR code in the image.');
                    }
                  }
                  e.target.value = '';
                }}
              />
              <button 
                className="btn-upload-scan" 
                onClick={() => document.getElementById('qr-upload').click()}
              >
                Upload QR Image
              </button>

              <div className="scanner-divider"><span>or enter ID/name manually</span></div>

              <div className="manual-lookup-container">
                <form className="manual-form" onSubmit={handleManualLookup}>
                  <input
                    type="text"
                    className="manual-input"
                    placeholder="e.g. V26G1001 or Arjun"
                    value={manualId}
                    onChange={e => {
                      setManualId(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  <button type="submit" className="btn-manual-lookup">Lookup</button>
                </form>
                {showDropdown && manualId.trim() && (
                  <div className="autocomplete-dropdown">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map(p => (
                        <div 
                          key={p._id} 
                          className="autocomplete-item"
                          onClick={() => {
                            setManualId(p.participantId);
                            setShowDropdown(false);
                            lookupParticipant(p.participantId);
                          }}
                        >
                          <div className="auto-pid">{p.participantId}</div>
                          <div className="auto-name">{p.name}</div>
                          <div className="auto-club">{p.clubName || p.institution}</div>
                        </div>
                      ))
                    ) : (
                      <div className="autocomplete-empty">No matches found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="scanner-active">
              <div id="qr-reader" className="qr-reader-box" ref={scannerRef}></div>
              <button className="btn-stop-scan" onClick={stopScanner}>✕ Stop Scanner</button>
            </div>
          )}

          {scanError && (
            <div className="scan-error">⚠️ {scanError}</div>
          )}
        </>
      )}

      {participant && (
        <div className="checkin-panel">
          <div className="participant-card">
            <div className="pc-pid">{participant.participantId}</div>
            <div className="pc-name">{participant.name}</div>
            <div className="pc-meta">
              <span className="pc-badge club">{participant.clubName || '—'}</span>
              <span className="pc-badge group">{participant.group || '—'}</span>
            </div>
            {participant.portfolio && (
              <div className="pc-portfolio">{participant.portfolio}</div>
            )}
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
                  onChange={e => handleToggle(field.key, e.target.checked)}
                />
                <span className="checkin-icon">{field.icon}</span>
                <span className="checkin-label">{field.label}</span>
                <span className="checkin-status">{checkins[field.key] ? '✓' : ''}</span>
              </label>
            ))}
          </div>

          <div className="checkin-actions">
            <button className="btn-scan-next" onClick={handleReset} style={{ flex: 1 }}>
              📷 Scan Next
            </button>
          </div>
        </div>
      )}
      
      {/* Hidden div for file scanning */}
      <div id="qr-reader-hidden" style={{ display: 'none' }}></div>
    </div>
  );
};

export default Scanner;
