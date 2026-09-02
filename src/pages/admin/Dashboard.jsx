import { useState, useEffect } from 'react';
import './Dashboard.css';

const METRICS = [
  { key: 'morningAttendance',    label: 'Morning Attendance',    icon: '🌅', color: 'blue' },
  { key: 'afternoonAttendance',  label: 'Afternoon Attendance',  icon: '☀️', color: 'amber' },
  { key: 'morningRefreshments',  label: 'Morning Refreshments',  icon: '☕', color: 'orange' },
  { key: 'eveningRefreshments',  label: 'Evening Refreshments',  icon: '🧃', color: 'teal' },
  { key: 'lunch',                label: 'Lunch',                 icon: '🍽️', color: 'rose' },
  { key: 'kitReceived',          label: 'Kit Received',          icon: '🎒', color: 'violet' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Participants' },
  ...METRICS.map(m => ({ value: m.key + ':true',  label: `✓ Received — ${m.label}` })),
  ...METRICS.map(m => ({ value: m.key + ':false', label: `✗ Not Received — ${m.label}` })),
];

const StatusDot = ({ on }) => (
  <span className={`status-dot ${on ? 'on' : 'off'}`} title={on ? 'Yes' : 'No'} />
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let intervalId;
    const fetchAll = async () => {
      try {
        const [statsRes, partRes] = await Promise.all([
          fetch('/api/participants/stats'),
          fetch('/api/participants'),
        ]);
        if (!statsRes.ok || !partRes.ok) throw new Error('Failed to fetch data');
        const [statsData, partData] = await Promise.all([statsRes.json(), partRes.json()]);
        setStats(statsData);
        setParticipants(partData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchAll();
    
    // Poll every 3 seconds for real-time multi-device sync
    intervalId = setInterval(fetchAll, 3000);
    
    return () => clearInterval(intervalId);
  }, []);

  const filteredParticipants = participants.filter(p => {
    // Category filter
    let passFilter = true;
    if (filter !== 'all') {
      const [key, val] = filter.split(':');
      passFilter = String(!!p[key]) === val;
    }
    // Search
    const q = search.toLowerCase();
    const passSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.participantId?.toLowerCase().includes(q) ||
      p.clubName?.toLowerCase().includes(q) ||
      p.group?.toLowerCase().includes(q);
    return passFilter && passSearch;
  });

  if (loading) return <div className="admin-loading">Loading dashboard…</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  const total = stats.total;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>

      {/* ── Top stat (total) ── */}
      <div className="total-banner">
        <div className="total-num">{total}</div>
        <div className="total-label">Total Registered Participants</div>
      </div>

      {/* ── 6 metric cards ── */}
      <h2 className="section-title">Check-in Overview</h2>
      <div className="metric-grid">
        {METRICS.map(m => {
          const count = stats[m.key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={m.key} className={`metric-card color-${m.color}`}>
              <div className="metric-icon">{m.icon}</div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-count">{count}<span className="metric-total">/{total}</span></div>
              <div className="metric-bar-wrap">
                <div className="metric-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="metric-pct">{pct}%</div>
            </div>
          );
        })}
      </div>

      {/* ── Group-wise breakdown ── */}
      <h2 className="section-title mt-4">Group-wise Breakdown</h2>
      <div className="group-table-wrap">
        <table className="group-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Total</th>
              {METRICS.map(m => <th key={m.key}>{m.icon}</th>)}
            </tr>
          </thead>
          <tbody>
            {(stats.groupStats || []).map(g => (
              <tr key={g.group}>
                <td className="group-name">{g.group}</td>
                <td className="group-total">{g.total}</td>
                {METRICS.map(m => (
                  <td key={m.key} className="group-cell">
                    <span className="group-count">{g[m.key]}</span>
                    <span className="group-sub">/{g.total}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="group-table-legend">
          {METRICS.map(m => (
            <span key={m.key} className="legend-item">{m.icon} {m.label}</span>
          ))}
        </div>
      </div>

      {/* ── Participant filter table ── */}
      <h2 className="section-title mt-4">Participant Details</h2>
      <div className="part-controls">
        <select
          className="part-filter-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="text"
          className="part-search"
          placeholder="Search name, ID, club, group…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="part-count">{filteredParticipants.length} shown</span>
      </div>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Club</th>
              <th>Group</th>
              <th>Portfolio</th>
              {METRICS.map(m => <th key={m.key} title={m.label}>{m.icon}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length === 0 ? (
              <tr><td colSpan={5 + METRICS.length} className="text-center py-4">No participants found.</td></tr>
            ) : (
              filteredParticipants.map(p => (
                <tr key={p._id}>
                  <td className="pid-cell">{p.participantId || '—'}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.clubName || '—'}</td>
                  <td>{p.group || '—'}</td>
                  <td>{p.portfolio || '—'}</td>
                  {METRICS.map(m => (
                    <td key={m.key} className="dot-cell">
                      <StatusDot on={!!p[m.key]} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
