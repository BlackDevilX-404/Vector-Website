import { useState, useEffect } from 'react';
import './LearningMaterialsAdmin.css';

const API = '/api/materials';

/* ── Hardcoded item definitions (always shown — server data enriches them) ── */
const DEFAULT_ITEMS = [
  { key: 'software',         num: '01', title: 'Software for Participants',    group: '',                tagline: 'Your creative toolkit for the day.' },
  { key: 'editorial-kit',    num: '02', title: 'Editorial Kit',                group: '',                tagline: 'Brand assets and design essentials.' },
  { key: 'editorial-manual', num: '03', title: 'Editorial Manual',             group: '',                tagline: 'The complete style and process guide.' },
  { key: 'trainer-slides-1', num: '04', title: "Trainer's Slides — Session 1", group: "Trainer's Slides", tagline: 'Session 1 presentation deck.' },
  { key: 'trainer-slides-2', num: '05', title: "Trainer's Slides — Session 2", group: "Trainer's Slides", tagline: 'Session 2 presentation deck.' },
  { key: 'trainer-slides-3', num: '06', title: "Trainer's Slides — Session 3", group: "Trainer's Slides", tagline: 'Session 3 presentation deck.' },
];

/* Pill toggle switch */
const Toggle = ({ on, onChange, disabled }) => (
  <button
    className={`lm-toggle ${on ? 'lm-toggle-on' : 'lm-toggle-off'}`}
    onClick={() => !disabled && onChange(!on)}
    aria-checked={on}
    role="switch"
    disabled={disabled}
    title={on ? 'Click to revoke access' : 'Click to grant access'}
  >
    <span className="lm-toggle-knob" />
    <span className="lm-toggle-label">{on ? 'Access Granted' : 'Access Locked'}</span>
  </button>
);

const LearningMaterialsAdmin = () => {
  /* Merge server data onto DEFAULT_ITEMS so UI always renders */
  const [serverData, setServerData]   = useState(null);   // null = loading, [] = empty/error
  const [serverError, setServerError] = useState('');
  const [urlDrafts, setUrlDrafts]     = useState({});
  const [saving, setSaving]           = useState({});
  const [saved, setSaved]             = useState({});

  useEffect(() => {
    fetch(API)
      .then(r => {
        if (!r.ok) throw new Error(`Server responded with ${r.status}`);
        return r.json();
      })
      .then(data => {
        setServerData(data);
        const drafts = {};
        data.forEach(m => { drafts[m.key] = m.url || ''; });
        setUrlDrafts(drafts);
      })
      .catch(err => {
        setServerError(err.message || 'Cannot reach server');
        setServerData([]);   // fall through to UI with defaults
      });
  }, []);

  /* Merge: for each default item, find its server record (if any) */
  const mergedItems = DEFAULT_ITEMS.map(def => {
    const srv = serverData?.find(m => m.key === def.key);
    return {
      ...def,
      _id:           srv?._id            ?? def.key,   // use key as fallback id
      accessGranted: srv?.accessGranted  ?? false,
      url:           srv?.url            ?? '',
      fromServer:    !!srv,
    };
  });

  const toggleAccess = async (item, newVal) => {
    if (!item.fromServer) return;   // server not connected
    // Optimistic
    setServerData(prev => prev.map(m => m.key === item.key ? { ...m, accessGranted: newVal } : m));
    try {
      await fetch(`${API}/${item._id}/access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessGranted: newVal }),
      });
    } catch {
      setServerData(prev => prev.map(m => m.key === item.key ? { ...m, accessGranted: !newVal } : m));
    }
  };

  const saveUrl = async (item) => {
    if (!item.fromServer) return;
    const key = item.key;
    setSaving(s => ({ ...s, [key]: true }));
    setSaved(s => ({ ...s, [key]: false }));
    try {
      const res = await fetch(`${API}/${item._id}/url`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlDrafts[key] || '' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setServerData(prev => prev.map(m => m.key === key ? updated : m));
        setSaved(s => ({ ...s, [key]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2500);
      }
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const isLoading  = serverData === null;
  const standalone    = mergedItems.filter(m => !m.group);
  const trainerSlides = mergedItems.filter(m => m.group === "Trainer's Slides");

  const renderCard = (item) => {
    const key = item.key;
    const offline = !item.fromServer;
    return (
      <div key={key} className={`lm-card ${item.accessGranted ? 'lm-card-granted' : 'lm-card-locked'} ${offline ? 'lm-card-offline' : ''}`}>

        {/* Left: number + title */}
        <div className="lm-card-meta">
          <span className="lm-num">{item.num}</span>
          <div>
            <h3 className="lm-title">{item.title}</h3>
            <p className="lm-tagline">{item.tagline}</p>
          </div>
        </div>

        {/* Centre: URL input */}
        <div className="lm-url-area">
          <label className="lm-url-label">Resource URL</label>
          <div className="lm-url-row">
            <input
              type="url"
              className="lm-url-input"
              placeholder={offline ? 'Server offline — connect to save' : 'https://drive.google.com/…'}
              value={urlDrafts[key] ?? ''}
              onChange={e => setUrlDrafts(d => ({ ...d, [key]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && saveUrl(item)}
              disabled={offline}
            />
            <button
              className={`lm-save-btn ${saved[key] ? 'lm-save-btn-saved' : ''}`}
              onClick={() => saveUrl(item)}
              disabled={offline || saving[key]}
            >
              {saving[key] ? '…' : saved[key] ? '✓ Saved' : 'Save'}
            </button>
          </div>
          {!offline && !item.url && (
            <p className="lm-url-hint">No URL set yet.</p>
          )}
        </div>

        {/* Right: toggle */}
        <div className="lm-toggle-area">
          <Toggle
            on={item.accessGranted}
            onChange={val => toggleAccess(item, val)}
            disabled={offline}
          />
          <p className="lm-toggle-hint">
            {offline
              ? 'Start the server to control access'
              : item.accessGranted
                ? 'Visible & unlocked on public site'
                : 'Blurred & locked on public site'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="lm-admin">
      <h1 className="lm-page-title">Learning Materials</h1>
      <p className="lm-admin-intro">
        Control access to each resource. Toggle a switch to grant or revoke participant access.
        Paste the resource URL before granting access.
      </p>

      {/* Server status banners */}
      {isLoading && (
        <div className="lm-banner lm-banner-loading">
          ⏳ Connecting to server…
        </div>
      )}
      {serverError && (
        <div className="lm-banner lm-banner-error">
          ⚠️ Server unreachable — <strong>{serverError}</strong>.
          Run <code>node server/server.js</code> and refresh. Items shown below are read-only previews.
        </div>
      )}
      {!isLoading && !serverError && (
        <div className="lm-banner lm-banner-ok">
          ✓ Connected — changes save instantly
        </div>
      )}

      {/* Resources */}
      <h2 className="lm-group-label lm-group-label-mt">Resources</h2>
      <div className="lm-list">{standalone.map(renderCard)}</div>

      {/* Trainer Slides */}
      <h2 className="lm-group-label lm-group-label-mt">Trainer's Slides</h2>
      <p className="lm-group-desc">Release each session's slides individually after the session concludes.</p>
      <div className="lm-list">{trainerSlides.map(renderCard)}</div>
    </div>
  );
};

export default LearningMaterialsAdmin;
