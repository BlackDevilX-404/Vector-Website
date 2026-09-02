import { useState, useEffect } from 'react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Admin Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admins');
      if (!res.ok) throw new Error('Failed to load admins');
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    setAdding(true);
    setError('');
    
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add admin');
      }
      
      setNewUsername('');
      setNewPassword('');
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin account?')) return;
    
    try {
      const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete');
      }
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading Admins...</div>;

  return (
    <div className="admin-users-page">
      <div className="admin-header">
        <h1 className="page-title">Admin Accounts</h1>
        <p className="page-subtitle">Manage login access for the VECTOR event staff.</p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="admin-users-grid">
        {/* LEFT: List of Admins */}
        <div className="admin-list-card glass-panel">
          <h3>Active Accounts</h3>
          <div className="admin-list">
            {admins.map(admin => (
              <div key={admin._id} className="admin-list-item">
                <div className="admin-info">
                  <span className="admin-username">ID: {admin.username}</span>
                  <span className="admin-password">PWD: {admin.password}</span>
                </div>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(admin._id)}
                  title="Delete Account"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Add New Admin */}
        <div className="admin-add-card glass-panel">
          <h3>Create New Admin</h3>
          <form onSubmit={handleAdd} className="admin-form">
            <div className="form-group">
              <label>User ID</label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="e.g., desk_3"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="e.g., pass123"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={adding}>
              {adding ? 'Creating...' : '+ Create Account'}
            </button>
          </form>
          <div className="security-note">
            <p><strong>Note:</strong> Passwords are shown in plain text to allow easy copying and sharing with event volunteers on the floor.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
