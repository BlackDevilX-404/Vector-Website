import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { API_BASE_URL } from '../../config';
import './QRCodes.css';

const VECTOR_LOGO_TEXT = 'VECTOR';

// Draw a QR with "VECTOR" branded in the center
async function generateQRDataURL(participant) {
  const payload = JSON.stringify({
    pid: participant.participantId,
    name: participant.name,
    club: participant.clubName,
    group: participant.group,
    portfolio: participant.portfolio,
  });

  const canvas = document.createElement('canvas');
  const size = 300;
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, payload, {
    width: size,
    margin: 2,
    color: { dark: '#1a1035', light: '#ffffff' },
    errorCorrectionLevel: 'H', // High — needed for center overlay
  });

  const ctx = canvas.getContext('2d');

  // White rounded rect in center
  const cx = size / 2;
  const cy = size / 2;
  const boxW = 90;
  const boxH = 28;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 6);
  ctx.fill();

  // "VECTOR" text
  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(VECTOR_LOGO_TEXT, cx, cy);

  return canvas.toDataURL('image/png');
}

const QRCard = ({ participant }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRDataURL(participant).then(url => {
      setDataUrl(url);
      setLoading(false);
    });
  }, [participant]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR_${participant.participantId}_${participant.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="qr-card">
      <div className="qr-image-wrap">
        {loading ? (
          <div className="qr-loading">Generating…</div>
        ) : (
          <img src={dataUrl} alt={`QR for ${participant.name}`} className="qr-image" />
        )}
      </div>
      <div className="qr-info">
        <div className="qr-pid">{participant.participantId}</div>
        <div className="qr-name">{participant.name}</div>
        {participant.riId && <div className="qr-riid">RI ID: {participant.riId}</div>}
        <div className="qr-meta">
          <span className="qr-badge club">{participant.clubName || '—'}</span>
          <span className="qr-badge group">{participant.group || '—'}</span>
        </div>
        {participant.portfolio && (
          <div className="qr-portfolio">{participant.portfolio}</div>
        )}
        <button className="btn-download-qr" onClick={handleDownload} disabled={loading}>
          ⬇ Download QR
        </button>
      </div>
    </div>
  );
};

const QRCodes = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/participants`)
      .then(r => r.json())
      .then(data => {
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
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.participantId?.toLowerCase().includes(q) ||
      p.clubName?.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const zip = new JSZip();
    for (const p of filtered) {
      const url = await generateQRDataURL(p);
      const base64 = url.split(',')[1];
      zip.file(`QR_${p.participantId}_${p.name.replace(/\s+/g, '_')}.png`, base64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'Vector_QR_Codes.zip');
    setDownloadingAll(false);
  };

  if (loading) return <div className="admin-loading">Generating QR codes…</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="qrcodes-page">
      <div className="qrcodes-header">
        <h1 className="page-title">QR Codes</h1>
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
        <div className="qr-grid">
          {filtered.map(p => (
            <QRCard key={p._id} participant={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodes;
