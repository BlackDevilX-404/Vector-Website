import { useState, useRef } from 'react';
import './ExcelUpload.css';

const ExcelUpload = () => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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
      const res = await fetch('http://localhost:5000/api/participants/upload-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h1 className="page-title">Upload Participants</h1>
      <p className="upload-subtitle">
        Upload an Excel file. The system will automatically detect columns for: <strong>S.No, Name, Club/Institution, Group, and Portfolio/Designation</strong>.<br />
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
            <div className="result-label">New Participants Added</div>
            <div className="result-value">{result.added}</div>
          </div>
          <div className="result-card skipped">
            <div className="result-icon">⏭️</div>
            <div className="result-label">Already Existed (Skipped)</div>
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

      <div className="upload-tips">
        <h3>📋 Excel Format Guide</h3>
        <table className="format-table">
          <thead>
            <tr>
              <th>S.No / ID</th>
              <th>Name</th>
              <th>Club / Institution</th>
              <th>Group</th>
              <th>Portfolio / Designation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Arjun Sharma</td>
              <td>Tech Club</td>
              <td>Group 1</td>
              <td>Design Lead</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Priya Nair</td>
              <td>Robotics Club</td>
              <td>Group 3</td>
              <td>Developer</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelUpload;
