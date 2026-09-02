import { useState, useEffect } from 'react';
import './LearningMaterials.css';

/* ── Default item definitions — always rendered regardless of server state ── */
const DEFAULT_ITEMS = [
  {
    key: 'software',
    num: '01',
    title: 'Software for Participants',
    group: '',
    tagline: 'Your creative toolkit for the day.',
    desc: 'The software package provided for all participants. Download and install before you arrive to hit the ground running.',
  },
  {
    key: 'editorial-kit',
    num: '02',
    title: 'Editorial Kit',
    group: '',
    tagline: 'Brand assets and design essentials.',
    desc: 'The official VECTOR editorial kit — typefaces, colour palettes, logo files, and brand guidelines to use across all your workshop outputs.',
  },
  {
    key: 'editorial-manual',
    num: '03',
    title: 'Editorial Manual',
    group: '',
    tagline: 'The complete style and process guide.',
    desc: 'A comprehensive reference manual covering editorial standards, content workflow, layout principles, and visual storytelling guidelines.',
  },
  {
    key: 'trainer-slides-1',
    num: '04',
    title: "Trainer's Slides — Session 1",
    group: "Trainer's Slides",
    tagline: 'Session 1 presentation deck.',
    desc: 'Slides from the first training session. Released after the session concludes so you can revisit and reinforce what you learned.',
  },
  {
    key: 'trainer-slides-2',
    num: '05',
    title: "Trainer's Slides — Session 2",
    group: "Trainer's Slides",
    tagline: 'Session 2 presentation deck.',
    desc: 'Slides from the second training session. A deep dive into the session topics — yours to keep and reference long after the event.',
  },
  {
    key: 'trainer-slides-3',
    num: '06',
    title: "Trainer's Slides — Session 3",
    group: "Trainer's Slides",
    tagline: 'Session 3 presentation deck.',
    desc: 'Slides from the third and final training session. Everything you need to carry the learning forward into your own creative work.',
  },
];

/* ── SVG Icons ── */
const IconSoftware = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="4" y="8" width="40" height="28" rx="2" stroke="#c5a059" strokeWidth="1.6" />
    <line x1="4" y1="16" x2="44" y2="16" stroke="#c5a059" strokeWidth="1.2" opacity="0.4" />
    <circle cx="9" cy="12" r="1.5" fill="#c5a059" opacity="0.5" />
    <circle cx="14" cy="12" r="1.5" fill="#c5a059" opacity="0.5" />
    <circle cx="19" cy="12" r="1.5" fill="#c5a059" opacity="0.5" />
    <path d="M14 26 L18 22 L14 18" stroke="#c5a059" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <line x1="20" y1="26" x2="28" y2="26" stroke="#c5a059" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    <line x1="24" y1="36" x2="24" y2="44" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="44" x2="32" y2="44" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <path d="M24 10 C24 10 14 8 6 12 L6 40 C14 36 24 38 24 38 C24 38 34 36 42 40 L42 12 C34 8 24 10 24 10Z"
      stroke="#c5a059" strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="24" y1="10" x2="24" y2="38" stroke="#c5a059" strokeWidth="1.4" opacity="0.6" />
    <line x1="10" y1="18" x2="21" y2="16" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="10" y1="23" x2="21" y2="21" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="27" y1="16" x2="38" y2="18" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="27" y1="21" x2="38" y2="23" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
  </svg>
);

const IconManual = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="8" y="6" width="28" height="36" rx="2" stroke="#c5a059" strokeWidth="1.6" />
    <rect x="6" y="8" width="28" height="36" rx="2" stroke="#c5a059" strokeWidth="1.2" opacity="0.35" />
    <line x1="14" y1="16" x2="30" y2="16" stroke="#c5a059" strokeWidth="1.1" opacity="0.5" strokeLinecap="round"/>
    <line x1="14" y1="21" x2="30" y2="21" stroke="#c5a059" strokeWidth="1.1" opacity="0.5" strokeLinecap="round"/>
    <line x1="14" y1="26" x2="24" y2="26" stroke="#c5a059" strokeWidth="1.1" opacity="0.5" strokeLinecap="round"/>
    <path d="M26 30 L30 34 L38 26" stroke="#c5a059" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
  </svg>
);

const IconSlides = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <rect x="4" y="8" width="40" height="28" rx="2" stroke="#c5a059" strokeWidth="1.6" />
    <line x1="24" y1="36" x2="24" y2="44" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="44" x2="32" y2="44" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M18 20 L21 14 L27 22 L24 22 L24 28" stroke="#c5a059" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />
    <line x1="30" y1="18" x2="38" y2="18" stroke="#c5a059" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    <line x1="30" y1="22" x2="36" y2="22" stroke="#c5a059" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
  </svg>
);

const ICON_MAP = {
  'software':         IconSoftware,
  'editorial-kit':    IconBook,
  'editorial-manual': IconManual,
  'trainer-slides-1': IconSlides,
  'trainer-slides-2': IconSlides,
  'trainer-slides-3': IconSlides,
};

const STATUS_GRANTED = {
  label: 'Access Granted',
  color: '#c5a059',
  bg:    'rgba(197,160,89,0.1)',
  border:'rgba(197,160,89,0.28)',
  dot:   '#c5a059',
};

const STATUS_LOCKED = {
  label: 'Coming Soon',
  color: 'rgba(244,240,232,0.3)',
  bg:    'rgba(244,240,232,0.04)',
  border:'rgba(244,240,232,0.1)',
  dot:   'rgba(244,240,232,0.25)',
};

const LearningMaterials = () => {
  const [serverData, setServerData] = useState(null); // null = loading

  useEffect(() => {
    fetch('/api/materials')
      .then(r => r.ok ? r.json() : [])
      .then(data => setServerData(Array.isArray(data) ? data : []))
      .catch(() => setServerData([]));
  }, []);

  /* Merge server access state onto hardcoded defaults */
  const mergedItems = DEFAULT_ITEMS.map(def => {
    const srv = serverData?.find(m => m.key === def.key);
    return {
      ...def,
      accessGranted: srv?.accessGranted ?? false,
      url:           srv?.url ?? '',
    };
  });

  const standalone    = mergedItems.filter(m => !m.group);
  const trainerSlides = mergedItems.filter(m => m.group === "Trainer's Slides");

  const renderRow = (m, i) => {
    const Icon   = ICON_MAP[m.key] || IconBook;
    const status = m.accessGranted ? STATUS_GRANTED : STATUS_LOCKED;
    const locked = !m.accessGranted;

    return (
      <div
        className={`material-row reveal ${locked ? 'material-row-locked' : ''}`}
        key={m.key}
        style={{ transitionDelay: `${i * 80}ms` }}
      >
        {/* Icon zone */}
        <div className={`material-icon-zone ${locked ? 'material-body-blurred' : ''}`}>
          <div className="material-num">{m.num}</div>
          <div className="material-icon-wrap">
            <Icon />
            <div className="icon-glow" />
          </div>
        </div>

        {/* Text body — blurred when locked */}
        <div className={`material-body ${locked ? 'material-body-blurred' : ''}`}>
          <div className="material-top-row">
            <h3 className="material-title">{m.title}</h3>
            <span
              className="material-status"
              style={{
                background: status.bg,
                border: `1px solid ${status.border}`,
                color: status.color,
              }}
            >
              <span className="status-dot" style={{ background: status.dot }} />
              {status.label}
            </span>
          </div>
          <p className="material-tagline">{m.tagline}</p>
          <p className="material-desc">{m.desc}</p>
        </div>

        {/* CTA — blurred when locked */}
        <div className={`material-cta-zone ${locked ? 'material-body-blurred' : ''}`}>
          {m.accessGranted && m.url ? (
            <a href={m.url} target="_blank" rel="noopener noreferrer" className="btn-material-cta">
              <span>Access Now</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ) : m.accessGranted ? (
            <span className="btn-material-locked" style={{ color: 'rgba(197,160,89,0.5)', borderColor: 'rgba(197,160,89,0.2)' }}>
              Link Pending
            </span>
          ) : (
            <span className="btn-material-locked">Coming Soon</span>
          )}
        </div>

        {/* Lock overlay (only on locked) */}
        {locked && (
          <div className="material-lock-overlay" aria-hidden="true">
            <span className="material-lock-icon">🔒</span>
            <span className="material-lock-text">Access Pending</span>
          </div>
        )}

        <div className="row-accent-bar" />
      </div>
    );
  };

  return (
    <section id="materials" className="materials-section">
      <div className="materials-ghost" aria-hidden="true">LIBRARY</div>
      <div className="materials-grid-lines" aria-hidden="true" />

      <div className="container">
        <div className="materials-header reveal">
          <h2 className="section-title section-title-light">Learning Materials</h2>
          <div className="gold-bar" />
          <p className="materials-intro">
            Every resource you need, curated and ready. No scrambling — just creating.
          </p>
        </div>

        <div className="materials-library">
          {/* Standalone resources */}
          {standalone.map((m, i) => renderRow(m, i))}

          {/* Trainer Slides group — always shown */}
          <div className="materials-group-divider reveal">
            <span className="materials-group-label">Trainer's Slides</span>
            <div className="materials-group-line" />
          </div>
          {trainerSlides.map((m, i) => renderRow(m, standalone.length + i))}
        </div>
      </div>
    </section>
  );
};

export default LearningMaterials;
