import { useState, useEffect } from 'react';
import './Attendance.css';

const Attendance = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
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

  const toggleAttendance = async (id, field, currentStatus) => {
    try {
      const response = await fetch(`/api/participants/${id}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      // Update local state
      setParticipants(participants.map(p => 
        p._id === id ? { ...p, [field]: !currentStatus } : p
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
              <th>Morning Status</th>
              <th>Afternoon Status</th>
              <th>Morning Action</th>
              <th>Afternoon Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No participants found.</td>
              </tr>
            ) : (
              filteredParticipants.map(p => {
                const isFullyAttended = p.morningAttendance && p.afternoonAttendance;
                return (
                  <tr key={p._id} className={isFullyAttended ? 'row-attended' : ''}>
                    <td data-label="Name" className="font-medium">{p.name}</td>
                    <td data-label="Email">{p.email}</td>
                    <td data-label="Role" className="capitalize">{p.role}</td>
                    <td data-label="Institution">{p.institution}</td>
                    <td data-label="Morning">
                      <span className={`status-badge ${p.morningAttendance ? 'attended' : 'pending'}`}>
                        {p.morningAttendance ? 'Attended' : 'Pending'}
                      </span>
                    </td>
                    <td data-label="Afternoon">
                      <span className={`status-badge ${p.afternoonAttendance ? 'attended' : 'pending'}`}>
                        {p.afternoonAttendance ? 'Attended' : 'Pending'}
                      </span>
                    </td>
                    <td data-label="Mark Morning">
                      <button 
                        className={`btn-toggle ${p.morningAttendance ? 'btn-undo' : 'btn-mark'}`}
                        onClick={() => toggleAttendance(p._id, 'morningAttendance', p.morningAttendance)}
                      >
                        {p.morningAttendance ? 'Undo Morning' : 'Mark Morning'}
                      </button>
                    </td>
                    <td data-label="Mark Afternoon">
                      <button 
                        className={`btn-toggle ${p.afternoonAttendance ? 'btn-undo' : 'btn-mark'}`}
                        onClick={() => toggleAttendance(p._id, 'afternoonAttendance', p.afternoonAttendance)}
                      >
                        {p.afternoonAttendance ? 'Undo Afternoon' : 'Mark Afternoon'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
