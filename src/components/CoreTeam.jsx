import './CoreTeam.css';

/* ── Gold silhouette SVG placeholder ── */
const SilhouetteSVG = () => (
  <svg
    viewBox="0 0 200 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="ct-silhouette"
    aria-hidden="true"
  >
    {/* Head */}
    <circle cx="100" cy="72" r="34" stroke="#c5a059" strokeWidth="1.4" fill="rgba(197,160,89,0.06)" />
    {/* Shoulders / body */}
    <path
      d="M28 200 C28 158 56 138 100 138 C144 138 172 158 172 200"
      stroke="#c5a059"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="rgba(197,160,89,0.04)"
    />
    {/* Subtle collar */}
    <path
      d="M82 138 Q100 152 118 138"
      stroke="#c5a059"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.45"
    />
  </svg>
);

const team = [
  {
    name: 'Rtr. PP. Vinay Sakthi',
    roleLabel: 'Event Chairman',
    tagline: 'The vision behind every decision.',
    photo: '/photos/core-chair.jpg',
  },
  {
    name: 'Rtr. Raga Shuruthi',
    roleLabel: 'Event Secretary',
    tagline: 'Every word recorded. Every moment kept.',
    photo: '/photos/core-secretary.jpg',
  },
  {
    name: 'Rtr. Sabari Krishna M',
    roleLabel: 'Event Treasurer',
    tagline: 'Every rupee placed with purpose.',
    photo: '/photos/core-treasurer.jpg',
  },
  {
    name: 'Rtr. Anu Shri',
    roleLabel: 'Event Convenor',
    tagline: 'Bridging people. Connecting purpose.',
    photo: '/photos/core-convenor.jpg',
  },
];

const CoreTeam = () => {
  return (
    <section id="core-team" className="coreteam-section">

      {/* Ghost watermark */}
      <div className="coreteam-ghost" aria-hidden="true">TEAM</div>

      {/* Aperture rings */}
      <div className="coreteam-rings" aria-hidden="true">
        <div className="ct-ring ct-ring-1" />
        <div className="ct-ring ct-ring-2" />
        <div className="ct-ring ct-ring-3" />
        <div className="ct-ring ct-ring-4" />
      </div>

      <div className="container">

        {/* Header */}
        <div className="coreteam-header reveal">
          <h2 className="section-title section-title-light">Core Team</h2>
          <div className="gold-bar" />
          <p className="coreteam-intro">
            Four roles. One shared obsession — making VECTOR 2026 unforgettable.
          </p>
        </div>

        {/* 4-column photo card grid */}
        <div className="coreteam-grid">
          {team.map(({ name, roleLabel, tagline, photo }, i) => (
            <div
              className="ct-card reveal"
              key={name}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {/* Top bar accent */}
              <div className="ct-top-bar" />

              {/* Photo zone */}
              <div className="ct-photo-zone">
                {photo ? (
                  <img src={photo} alt={name} className="ct-photo" />
                ) : (
                  <div className="ct-photo-placeholder">
                    <SilhouetteSVG />
                  </div>
                )}
                {/* Gold inner glow (visible on hover) */}
                <div className="ct-photo-glow" />
              </div>

              {/* Card body */}
              <div className="ct-card-body">
                <div className="ct-role-label">{roleLabel}</div>
                <h3 className="ct-role-name">{name}</h3>
                {/* Tagline slides up on hover */}
                <p className="ct-tagline">{tagline}</p>
              </div>

              {/* Corner accent */}
              <div className="ct-corner-accent" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CoreTeam;
