import './LearningMaterials.css';

/* ── Custom gold SVG icons ── */
const IconBook = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    {/* Open book */}
    <path d="M24 10 C24 10 14 8 6 12 L6 40 C14 36 24 38 24 38 C24 38 34 36 42 40 L42 12 C34 8 24 10 24 10Z"
      stroke="#c5a059" strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="24" y1="10" x2="24" y2="38" stroke="#c5a059" strokeWidth="1.4" opacity="0.6" />
    <line x1="10" y1="18" x2="21" y2="16" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="10" y1="23" x2="21" y2="21" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="10" y1="28" x2="21" y2="26" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="27" y1="16" x2="38" y2="18" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="27" y1="21" x2="38" y2="23" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
    <line x1="27" y1="26" x2="38" y2="28" stroke="#c5a059" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    {/* Folder with grid inside */}
    <path d="M6 16 L6 38 L42 38 L42 20 L22 20 L18 16 Z" stroke="#c5a059" strokeWidth="1.6" strokeLinejoin="round" />
    <rect x="13" y="26" width="7" height="7" rx="1" stroke="#c5a059" strokeWidth="1.1" opacity="0.55" />
    <rect x="24" y="26" width="7" height="7" rx="1" stroke="#c5a059" strokeWidth="1.1" opacity="0.55" />
    <rect x="13" y="26" width="22" height="1" fill="#c5a059" opacity="0" />
    <line x1="35" y1="26" x2="35" y2="33" stroke="#c5a059" strokeWidth="1.1" opacity="0.55" />
  </svg>
);

const IconSlides = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    {/* Screen */}
    <rect x="4" y="8" width="40" height="28" rx="2" stroke="#c5a059" strokeWidth="1.6" />
    {/* Stand */}
    <line x1="24" y1="36" x2="24" y2="44" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="44" x2="32" y2="44" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" />
    {/* Pen nib detail on screen */}
    <path d="M18 20 L21 14 L27 22 L24 22 L24 28" stroke="#c5a059" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />
    <line x1="12" y1="24" x2="16" y2="24" stroke="#c5a059" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    <line x1="30" y1="18" x2="38" y2="18" stroke="#c5a059" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    <line x1="30" y1="22" x2="36" y2="22" stroke="#c5a059" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
  </svg>
);

const STATUS = {
  available: {
    label: 'Available Now',
    color: '#4ecb8d',
    bg: 'rgba(78,203,141,0.1)',
    border: 'rgba(78,203,141,0.28)',
    dot: '#4ecb8d',
  },
  granted: {
    label: 'Access Granted',
    color: '#c5a059',
    bg: 'rgba(197,160,89,0.1)',
    border: 'rgba(197,160,89,0.28)',
    dot: '#c5a059',
  },
  locked: {
    label: 'Unlocked Post-Event',
    color: 'rgba(244,240,232,0.3)',
    bg: 'rgba(244,240,232,0.04)',
    border: 'rgba(244,240,232,0.1)',
    dot: 'rgba(244,240,232,0.25)',
  },
};

const materials = [
  {
    num: '01',
    Icon: IconBook,
    title: 'Pre-Event Guide',
    tagline: 'The pre-event kit. Read it before you arrive.',
    desc: 'Everything you need to know — the agenda, what to bring, how to prepare, and how to make the most of every session at VECTOR 2026.',
    cta: 'Download PDF',
    ctaHref: '#',
    status: STATUS.available,
    locked: false,
  },
  {
    num: '02',
    Icon: IconFolder,
    title: 'Workshop Assets',
    tagline: 'Templates, references, and tools for makers.',
    desc: 'A full resource pack for the creative tracks — design templates, brand guidelines reference sheets, and documentation to follow along with during sessions.',
    cta: 'View Repository',
    ctaHref: '#',
    status: STATUS.granted,
    locked: false,
  },
  {
    num: '03',
    Icon: IconSlides,
    title: 'Speaker Slides',
    tagline: 'Speaker decks. Unlocked as the day unfolds.',
    desc: 'Presentations from every keynote and masterclass will be released here after each session concludes. Come back and revisit what you learned.',
    cta: 'Coming Soon',
    ctaHref: null,
    status: STATUS.locked,
    locked: true,
  },
];

const LearningMaterials = () => {
  return (
    <section id="materials" className="materials-section">

      {/* Ghost watermark */}
      <div className="materials-ghost" aria-hidden="true">LIBRARY</div>

      {/* Faint diagonal grid lines */}
      <div className="materials-grid-lines" aria-hidden="true" />

      <div className="container">
        <div className="materials-header reveal">
          <h2 className="section-title section-title-light">Learning Materials</h2>
          <div className="gold-bar" />
          <p className="materials-intro">
            Every resource you need, curated and ready. No scrambling — just creating.
          </p>
        </div>

        {/* Resource library rows */}
        <div className="materials-library">
          {materials.map(({ num, Icon, title, tagline, desc, cta, ctaHref, status, locked }, i) => (
            <div
              className={`material-row reveal ${locked ? 'material-row-locked' : ''}`}
              key={title}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Left: icon zone with number */}
              <div className="material-icon-zone">
                <div className="material-num">{num}</div>
                <div className="material-icon-wrap">
                  <Icon />
                  <div className="icon-glow" />
                </div>
              </div>

              {/* Centre: text content */}
              <div className="material-body">
                <div className="material-top-row">
                  <h3 className="material-title">{title}</h3>
                  {/* Status pill */}
                  <span
                    className="material-status"
                    style={{
                      background: status.bg,
                      border: `1px solid ${status.border}`,
                      color: status.color,
                    }}
                  >
                    <span
                      className="status-dot"
                      style={{ background: status.dot }}
                    />
                    {status.label}
                  </span>
                </div>
                <p className="material-tagline">{tagline}</p>
                <p className="material-desc">{desc}</p>
              </div>

              {/* Right: CTA */}
              <div className="material-cta-zone">
                {ctaHref ? (
                  <a href={ctaHref} className="btn-material-cta">
                    <span>{cta}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : (
                  <span className="btn-material-locked">{cta}</span>
                )}
              </div>

              {/* Hover accent bar */}
              <div className="row-accent-bar" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningMaterials;
