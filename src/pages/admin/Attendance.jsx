import { useState, useEffect } from 'react';
import './Attendance.css';

const Attendance = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchParticipants = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/participants');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
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

  const toggleAttendance = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/participants/${id}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended: !currentStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      // Update local state
      setParticipants(participants.map(p => 
        p._id === id ? { ...p, attended: !currentStatus } : p
      ));
    } catch (err) {
      alert('Failed to update attendance status');
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading participants...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1 className="page-title">Attendance Tracking</h1>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Institution</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">No participants found.</td>
              </tr>
            ) : (
              filteredParticipants.map(p => (
                <tr key={p._id} className={p.attended ? 'row-attended' : ''}>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.email}</td>
                  <td className="capitalize">{p.role}</td>
                  <td>{p.institution}</td>
                  <td>
                    <span className={`status-badge ${p.attended ? 'attended' : 'pending'}`}>
                      {p.attended ? 'Attended' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn-toggle ${p.attended ? 'btn-undo' : 'btn-mark'}`}
                      onClick={() => toggleAttendance(p._id, p.attended)}
                    >
                      {p.attended ? 'Undo' : 'Mark Present'}
                    </button>
                  </td>
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
