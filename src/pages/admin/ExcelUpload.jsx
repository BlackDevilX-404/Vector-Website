import { useState, useRef, useEffect } from 'react';
import './ExcelUpload.css';

const ExcelUpload = () => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Manual Add state
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualData, setManualData] = useState({
    riId: '', name: '', clubName: '', group: '', portfolio: ''
  });
  
  // Participant List state
  const [participants, setParticipants] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchParticipants = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/participants');
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const filteredParticipants = participants.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.participantId && p.participantId.toLowerCase().includes(q)) ||
      (p.clubName && p.clubName.toLowerCase().includes(q)) ||
      (p.institution && p.institution.toLowerCase().includes(q)) ||
      (p.riId && String(p.riId).toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Please upload an .xlsx or .xls file.');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/participants/upload-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResult(data);
      setFile(null);
      fetchParticipants(); // refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualData.name) {
      alert("Name is required");
      return;
    }
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add');
      }
      setManualData({ riId: '', name: '', clubName: '', group: '', portfolio: '' });
      setShowAddForm(false);
      fetchParticipants(); // refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchParticipants();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="upload-page">
      <h1 className="page-title">Upload Participants</h1>
      <p className="upload-subtitle">
        Upload an Excel file or manually add participants as a fallback. The system will automatically detect columns for: <strong>RI ID, Name, Club/Institution, Group, and Portfolio/Designation</strong>.<br />
        Participants already in the database (matched by name) will be preserved.
      </p>

      <div
        className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="drop-icon">
          {file ? '📄' : '⬆️'}
        </div>
        {file ? (
          <div className="drop-text">
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <div className="drop-text">
            <span className="drop-main">Drag & drop your Excel file here</span>
            <span className="drop-sub">or click to browse</span>
          </div>
        )}
      </div>

      {error && <div className="upload-error">⚠️ {error}</div>}

      {file && (
        <button
          className="btn-upload"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <span className="btn-spinner">Processing…</span>
          ) : (
            '🚀 Upload & Import'
          )}
        </button>
      )}

      {result && (
        <div className="upload-result">
          <div className="result-card success">
            <div className="result-icon">✅</div>
            <div className="result-label">Added</div>
            <div className="result-value">{result.added}</div>
          </div>
          <div className="result-card skipped">
            <div className="result-icon">⏭️</div>
            <div className="result-label">Skipped</div>
            <div className="result-value">{result.skipped}</div>
          </div>
          {result.errors?.length > 0 && (
            <div className="result-errors">
              <strong>Errors:</strong>
              <ul>
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <hr className="divider" />

      <div className="manual-management-header">
        <h2>Registered Participants ({filteredParticipants.length})</h2>
        <div className="manual-management-actions">
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search participants..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-add-manual" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close Form' : '+ Add Participant'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="admin-manual-form" onSubmit={handleManualSubmit}>
          <div className="admin-form-group">
            <label>RI ID (Optional)</label>
            <input type="number" value={manualData.riId} onChange={e => setManualData({...manualData, riId: e.target.value})} placeholder="e.g. 1002" />
          </div>
          <div className="admin-form-group">
            <label>Name</label>
            <input type="text" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} required placeholder="e.g. Arjun Sharma" />
          </div>
          <div className="admin-form-group">
            <label>Club / Institution</label>
            <input type="text" value={manualData.clubName} onChange={e => setManualData({...manualData, clubName: e.target.value})} placeholder="e.g. Tech Club" />
          </div>
          <div className="admin-form-group">
            <label>Group</label>
            <input type="text" value={manualData.group} onChange={e => setManualData({...manualData, group: e.target.value})} placeholder="e.g. Group 1" />
          </div>
          <div className="admin-form-group">
            <label>Portfolio / Designation</label>
            <input type="text" value={manualData.portfolio} onChange={e => setManualData({...manualData, portfolio: e.target.value})} placeholder="e.g. Developer" />
          </div>
          <button type="submit" className="btn-submit-manual">Add to Database</button>
        </form>
      )}

      <div className="participant-list-container">
        {loadingList ? (
          <div className="list-loading">Loading participants...</div>
        ) : participants.length === 0 ? (
          <div className="list-empty">No participants uploaded yet.</div>
        ) : filteredParticipants.length === 0 ? (
          <div className="list-empty">No matching participants found.</div>
        ) : (
          <table className="format-table">
            <thead>
              <tr>
                <th>RI ID</th>
                <th>Participant ID</th>
                <th>Name</th>
                <th>Club / Institution</th>
                <th>Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map(p => (
                <tr key={p._id}>
                  <td data-label="RI ID">{p.riId || p.sNo || '-'}</td>
                  <td data-label="Participant ID"><strong style={{ color: 'var(--gold)' }}>{p.participantId}</strong></td>
                  <td data-label="Name">{p.name}</td>
                  <td data-label="Club">{p.clubName || p.institution}</td>
                  <td data-label="Group">{p.group}</td>
                  <td data-label="Actions">
                    <button className="btn-delete" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ExcelUpload;
