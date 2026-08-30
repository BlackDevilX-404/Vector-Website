import './About.css';

// Blade lines at different angles crossing the aperture
const BLADE_ANGLES = [0, 30, 60, 90, 120, 150];

// Gold pen nib SVG for aperture core
const PenNibSVG = () => (
  <svg width="32" height="82" viewBox="0 0 28 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="0" width="8" height="28" rx="4" fill="#c5a059" />
    <rect x="8" y="26" width="12" height="6" rx="1" fill="#9a7a40" />
    <path d="M8 32 L4 60 L14 72 L24 60 L20 32 Z" fill="#c5a059" />
    <line x1="14" y1="42" x2="14" y2="70" stroke="#0a1528" strokeWidth="1.2" opacity="0.6" />
    <ellipse cx="14" cy="71" rx="2.5" ry="2" fill="#e0bb7a" />
    <ellipse cx="14" cy="52" rx="2" ry="3" fill="#0a1528" opacity="0.35" />
  </svg>
);

const FEATURES = [
  {
    icon: '✦',
    title: 'Design & Branding',
    desc: 'Craft visual identities that leave a mark — from poster layouts to full brand systems.',
  },
  {
    icon: '✎',
    title: 'Content Writing',
    desc: 'Turn ideas into words that move people. Sharp copy. Compelling narratives. Real impact.',
  },
  {
    icon: '◈',
    title: 'Visual Storytelling',
    desc: 'Merge images and language into cohesive stories that audiences actually remember.',
  },
  {
    icon: '◉',
    title: 'Logo Design',
    desc: 'Design marks that define identity — symbols that speak before a word is said.',
  },
];

const STATS = [
  { value: '500+', label: 'Attendees', position: 'stat-pos-1' },
  { value: '8+',   label: 'Sessions',  position: 'stat-pos-2' },
  { value: '1',    label: 'Day of Immersion', position: 'stat-pos-3' },
];

const About = () => {
  return (
    <section id="about" className="about-section reveal">

      {/* Ghost VECTOR watermark */}
      <div className="about-ghost-text" aria-hidden="true">VECTOR</div>

      <div className="container">
        <div className="about-grid">

          {/* ── LEFT: Text Content ── */}
          <div className="about-content">


            <h2 className="section-title section-title-light about-heading">
              About the Event
            </h2>
            <div className="gold-bar" />

            <p className="about-text about-text-lead">
              VECTOR 2026 isn't a seminar. It's a full-day creative collision — where rotaractors who live for design, storytelling, and brand thinking gather to sharpen their craft.
            </p>
            <p className="about-text">
              Hosted at Sri Shakthi Institute of Engineering and Technology, this District Editorial Workshop brings together the most creatively driven minds from across the district. No spectators. Only makers.
            </p>

            <div className="features-grid">
              {FEATURES.map(({ icon, title, desc }) => (
                <div className="feature-card" key={title}>
                  <div className="feature-icon">{icon}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Animated Aperture Visual ── */}
          <div className="about-image-container">
            <div className="about-aperture">

              {/* Glow behind everything */}
              <div className="aperture-glow-bg" />

              {/* Concentric rings */}
              <div className="aperture-visual-outer" />
              <div className="aperture-ring-tick" />
              <div className="aperture-visual-mid" />
              <div className="aperture-visual-inner" />
              <div className="aperture-visual-pulse" />

              {/* Blade lines */}
              {BLADE_ANGLES.map((angle) => (
                <div
                  key={angle}
                  className="aperture-blade-line"
                  style={{ transform: `rotate(${angle}deg)` }}
                />
              ))}

              {/* Pen nib core */}
              <div className="aperture-visual-core">
                <PenNibSVG />
              </div>
            </div>

            {/* Floating stat cards */}
            {STATS.map(({ value, label, position }) => (
              <div className={`about-stat-card ${position}`} key={label}>
                <span className="stat-number">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
