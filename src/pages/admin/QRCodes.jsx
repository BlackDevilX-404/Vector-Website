import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './QRCodes.css';

// ─── Font preloading ──────────────────────────────────────────────────────────
let fontLoadPromise = null;
async function ensureFontsLoaded() {
  if (fontLoadPromise) return fontLoadPromise;
  fontLoadPromise = (async () => {
    try {
      const bold    = new FontFace('MontserratBold',    'url(/fonts/Montserrat-font/Montserrat-Bold.ttf)');
      const regular = new FontFace('MontserratRegular', 'url(/fonts/Montserrat-font/Montserrat-Regular.ttf)');
      const [loadedBold, loadedRegular] = await Promise.all([bold.load(), regular.load()]);
      document.fonts.add(loadedBold);
      document.fonts.add(loadedRegular);
      // Wait until the browser has fully settled all fonts (important for canvas)
      await document.fonts.ready;
      // Trigger a layout pass so canvas can use the fonts immediately
      await document.fonts.load(`bold 16px MontserratBold`);
      await document.fonts.load(`16px MontserratRegular`);
    } catch (err) {
      console.warn('Montserrat font failed to load, falling back to sans-serif:', err);
    }
  })();
  return fontLoadPromise;
}


// ─── Template dimensions (638 × 1011 px — clean PNG, no placeholders) ─────────
const CARD_W = 638;
const CARD_H = 1011;

// Grey QR box region (visually measured from the template)
const QR_X = 242;   // left edge of grey box
const QR_Y = 333;   // top edge of grey box
const QR_W = 293;   // fills the grey box width
const QR_H = 285;   // fills the grey box height

// Text centre position (aligned with the QR box center)
const TEXT_X = QR_X + (QR_W / 2);

// Text centre Y positions — blank area between QR box and PARTICIPANT PASS bar
const NAME_Y = 700;
const CLUB_Y = 762;

// ─── Core compositing function ────────────────────────────────────────────────
async function generateIDCard(participant) {
  await ensureFontsLoaded();

  // 1. Load clean template
  const templateImg = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = '/id-card-template.png';
  });

  // 2. Full-size canvas
  const canvas = document.createElement('canvas');
  canvas.width  = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  // 3. Paint template
  ctx.drawImage(templateImg, 0, 0, CARD_W, CARD_H);

  // 4. QR canvas — sized exactly to the grey box so it fills it completely
  const qrCanvas = document.createElement('canvas');
  qrCanvas.width  = QR_W;
  qrCanvas.height = QR_H;

  const payload = JSON.stringify({
    pid:       participant.participantId,
    name:      participant.name,
    club:      participant.clubName,
    group:     participant.group,
    portfolio: participant.portfolio,
  });

  await QRCode.toCanvas(qrCanvas, payload, {
    width:                QR_W,
    margin:               1,
    color:                { dark: '#1a1035', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  // 5. "VECTOR" yellow centre pill on QR
  const qrCtx = qrCanvas.getContext('2d');
  const cx = QR_W / 2;
  const cy = QR_H / 2;
  const pillW = 106;
  const pillH = 28;
  qrCtx.fillStyle = '#ffffff';
  qrCtx.beginPath();
  qrCtx.roundRect(cx - pillW / 2, cy - pillH / 2, pillW, pillH, 6);
  qrCtx.fill();
  qrCtx.fillStyle    = '#122141';
  qrCtx.font         = 'bold 16px MontserratBold, sans-serif';
  qrCtx.textAlign    = 'center';
  qrCtx.textBaseline = 'middle';
  qrCtx.fillText('VECTOR', cx, cy);

  // 6. Stamp QR — fills the entire grey box
  ctx.drawImage(qrCanvas, QR_X, QR_Y, QR_W, QR_H);

  // 7. Participant name with "Rtr." prefix
  const rawName = (participant.name || '').trim();
  const strippedName = rawName.replace(/^rtr\.?\s*/i, '');
  const nameText = `Rtr. ${strippedName.toUpperCase()}`;
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let nameFontSize = 30;
  
  ctx.font = `bold ${nameFontSize}px MontserratBold, sans-serif`;
  while (ctx.measureText(nameText).width > 460 && nameFontSize > 14) {
    nameFontSize -= 1;
    ctx.font = `bold ${nameFontSize}px MontserratBold, sans-serif`;
  }
  
  ctx.fillText(nameText, TEXT_X, NAME_Y);

  // 8. Club name
  const clubText = (participant.clubName || '').toUpperCase();
  const maxClubWidth = 460;
  let clubFontSize = 20;
  ctx.font         = `${clubFontSize}px MontserratRegular, sans-serif`;
  ctx.fillStyle    = '#ffffff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const words = clubText.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxClubWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Draw lines vertically centered around CLUB_Y
  const lineHeight = clubFontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  let startY = CLUB_Y - (totalHeight / 2) + (lineHeight / 2);

  for (const line of lines) {
    // If a single word is somehow wider than the max width, scale it down just for safety
    let lineFont = clubFontSize;
    ctx.font = `${lineFont}px MontserratRegular, sans-serif`;
    while (ctx.measureText(line).width > maxClubWidth && lineFont > 10) {
      lineFont -= 1;
      ctx.font = `${lineFont}px MontserratRegular, sans-serif`;
    }
    ctx.fillText(line, TEXT_X, startY);
    startY += lineHeight;
  }

  return canvas.toDataURL('image/png');
}

// ─── Individual ID Card component ─────────────────────────────────────────────
const IDCard = ({ participant, onUpdate }) => {
  const [editedName, setEditedName] = useState(participant.name || '');
  const [editedClub, setEditedClub] = useState(participant.clubName || '');
  const [dataUrl, setDataUrl]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingClub, setEditingClub] = useState(false);

  const regenerate = useCallback(async (name, club) => {
    setLoading(true);
    const url = await generateIDCard({ ...participant, name, clubName: club });
    setDataUrl(url);
    setLoading(false);
  }, [participant]);

  useEffect(() => {
    regenerate(editedName, editedClub);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameSave = async () => {
    setEditingName(false);
    if (participant._id) {
      await fetch(`/api/participants/${participant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName })
      });
    }
    onUpdate && onUpdate(participant.participantId, { name: editedName });
    regenerate(editedName, editedClub);
  };

  const handleClubSave = async () => {
    setEditingClub(false);
    if (participant._id) {
      await fetch(`/api/participants/${participant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubName: editedClub })
      });
    }
    onUpdate && onUpdate(participant.participantId, { clubName: editedClub });
    regenerate(editedName, editedClub);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `IDCard_${participant.participantId}_${editedName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="idcard-card">
      <div className="idcard-preview-wrap">
        {loading ? (
          <div className="idcard-loading">Generating…</div>
        ) : (
          <img src={dataUrl} alt={`ID Card for ${editedName}`} className="idcard-preview" />
        )}
      </div>

      <div className="idcard-info">
        <div className="idcard-pid">{participant.participantId}</div>

        {/* Editable Name */}
        <div className="idcard-field">
          {editingName ? (
            <div className="idcard-edit-row">
              <input
                className="idcard-edit-input"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                autoFocus
              />
              <button className="idcard-save-btn" onClick={handleNameSave}>✓</button>
            </div>
          ) : (
            <div className="idcard-field-display" onClick={() => setEditingName(true)}>
              <span className="idcard-name">{editedName || '—'}</span>
              <span className="idcard-edit-icon" title="Edit name">✎</span>
            </div>
          )}
        </div>

        {/* Editable Club */}
        <div className="idcard-field">
          {editingClub ? (
            <div className="idcard-edit-row">
              <input
                className="idcard-edit-input"
                value={editedClub}
                onChange={e => setEditedClub(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleClubSave()}
                autoFocus
              />
              <button className="idcard-save-btn" onClick={handleClubSave}>✓</button>
            </div>
          ) : (
            <div className="idcard-field-display" onClick={() => setEditingClub(true)}>
              <span className="idcard-club">{editedClub || '—'}</span>
              <span className="idcard-edit-icon" title="Edit club">✎</span>
            </div>
          )}
        </div>

        <div className="idcard-meta">
          <span className="qr-badge group">{participant.group || '—'}</span>
        </div>

        <button className="btn-download-idcard" onClick={handleDownload} disabled={loading}>
          ⬇ Download ID Card
        </button>
      </div>
    </div>
  );
};

// ─── Page component ───────────────────────────────────────────────────────────
const QRCodes = () => {
  const [participants, setParticipants]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [groupFilter, setGroupFilter]     = useState('All');
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleUpdateParticipant = (id, updates) => {
    setParticipants(prev => prev.map(p => p.participantId === id ? { ...p, ...updates } : p));
  };

  useEffect(() => {
    fetch('/api/participants')
      .then(r => r.json())
      .then(data => {
        // We do not format the data here so that the user's edits from the DB
        // are preserved exactly as they typed them (e.g. custom casing, without 'Rtr.').
        setParticipants(data.filter(p => p.participantId));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = participants.filter(p => {
    const matchGroup = groupFilter === 'All' || p.group === groupFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.participantId?.toLowerCase().includes(q) ||
      p.clubName?.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const zip = new JSZip();
    for (const p of filtered) {
      const url    = await generateIDCard(p);
      const base64 = url.split(',')[1];
      zip.file(
        `IDCard_${p.participantId}_${(p.name || 'unknown').replace(/\s+/g, '_')}.png`,
        base64,
        { base64: true }
      );
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'Vector_ID_Cards.zip');
    setDownloadingAll(false);
  };

  if (loading) return <div className="admin-loading">Loading participants…</div>;
  if (error)   return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="qrcodes-page">
      <div className="qrcodes-header">
        <h1 className="page-title">ID Card Generator</h1>
        <div className="qrcodes-controls">
          <input
            type="text"
            placeholder="Search name, ID, club…"
            className="qr-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="qr-group-filter"
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
          >
            <option value="All">All Groups</option>
            <option value="Group 1">Group 1</option>
            <option value="Group 2">Group 2</option>
            <option value="Group 3">Group 3</option>
            <option value="Group 4">Group 4</option>
          </select>
          <button
            className="btn-download-all"
            onClick={handleDownloadAll}
            disabled={downloadingAll || filtered.length === 0}
          >
            {downloadingAll ? '⏳ Zipping…' : `⬇ Download All (${filtered.length})`}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="qr-empty">
          {participants.length === 0
            ? 'No participants found. Upload an Excel file first.'
            : 'No participants match your search.'}
        </div>
      ) : (
        <div className="idcard-grid">
          {filtered.map(p => (
            <IDCard key={p._id} participant={p} onUpdate={handleUpdateParticipant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodes;
