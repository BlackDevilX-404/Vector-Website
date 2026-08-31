import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import './Attendance.css';

const CHECKIN_COLS = [
  { key: 'morningAttendance',    shortLabel: 'Morning Attn',    icon: '🌅' },
  { key: 'afternoonAttendance',  shortLabel: 'Afternoon Attn',  icon: '☀️' },
  { key: 'morningRefreshments',  shortLabel: 'Morning Ref.',    icon: '☕' },
  { key: 'afternoonRefreshments',shortLabel: 'Afternoon Ref.',  icon: '🧃' },
  { key: 'lunch',                shortLabel: 'Lunch',           icon: '🍽️' },
  { key: 'kitReceived',          shortLabel: 'Kit Received',    icon: '🎒' },
];

const Attendance = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/participants`);
      if (!res.ok) throw new Error('Failed to load participants data');
      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const toggleCheckinField = async (participantId, fieldKey, currentVal) => {
    const updatedVal = !currentVal;
    
    // Optimistic UI update
    setParticipants(prev =>
      prev.map(p => p._id === participantId ? { ...p, [fieldKey]: updatedVal } : p)
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/participants/${participantId}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldKey]: updatedVal }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      // Rollback on failure
      setParticipants(prev =>
        prev.map(p => p._id === participantId ? { ...p, [fieldKey]: currentVal } : p)
      );
      alert('Failed to update status on server.');
    }
  };

  const filtered = participants.filter(p => {
    const matchGroup = groupFilter === 'All' || p.group === groupFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.participantId?.toLowerCase().includes(q) ||
      p.clubName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  // Calculate live counters
  const totalCount = participants.length;
  const morningAttn = participants.filter(p => p.morningAttendance).length;
  const afternoonAttn = participants.filter(p => p.afternoonAttendance).length;
  const lunchCount = participants.filter(p => p.lunch).length;
  const kitCount = participants.filter(p => p.kitReceived).length;

  if (loading) return <div className="admin-loading">Loading attendance matrix…</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1 className="page-title">Attendance & Check-in Matrix</h1>
          <p className="attendance-subtitle">Track and update attendance, refreshments, lunch, and kit distribution in real-time.</p>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="attendance-kpi-bar">
        <div className="kpi-card">
          <span className="kpi-num">{totalCount}</span>
          <span className="kpi-label">Registered</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-num">{morningAttn}</span>
          <span className="kpi-label">🌅 Morning Attn</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-num">{afternoonAttn}</span>
          <span className="kpi-label">☀️ Afternoon Attn</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-num">{lunchCount}</span>
          <span className="kpi-label">🍽️ Lunch Served</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-num">{kitCount}</span>
          <span className="kpi-label">🎒 Kits Issued</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="attendance-controls">
        <input
          type="text"
          className="att-search"
          placeholder="Search by Name, ID, Email or Club…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="att-group-filter"
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
        >
          <option value="All">All Groups</option>
          <option value="Group 1">Group 1</option>
          <option value="Group 2">Group 2</option>
          <option value="Group 3">Group 3</option>
          <option value="Group 4">Group 4</option>
        </select>
      </div>

      {/* Matrix Table */}
      <div className="att-table-container">
        <table className="att-table">
          <thead>
            <tr>
              <th>ID & Participant</th>
              <th>Group & Institution</th>
              {CHECKIN_COLS.map(col => (
                <th key={col.key} className="text-center">
                  <span className="th-icon">{col.icon}</span>
                  <span>{col.shortLabel}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={2 + CHECKIN_COLS.length} className="att-empty">
                  No participants matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="att-user-cell">
                      <span className="att-pid">{p.participantId || '—'}</span>
                      <span className="att-name">{p.name}</span>
                      {p.riId && <span className="att-riid">RI ID: {p.riId}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="att-group-cell">
                      <span className="badge-group">{p.group || 'Group 1'}</span>
                      <span className="att-club">{p.clubName || p.institution || '—'}</span>
                    </div>
                  </td>
                  {CHECKIN_COLS.map(col => {
                    const isChecked = !!p[col.key];
                    return (
                      <td key={col.key} className="text-center">
                        <button
                          type="button"
                          className={`btn-toggle-badge ${isChecked ? 'active' : 'inactive'}`}
                          onClick={() => toggleCheckinField(p._id, col.key, isChecked)}
                          title={`Click to toggle ${col.shortLabel}`}
                        >
                          {isChecked ? '✓ Issued' : '— Pending'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
