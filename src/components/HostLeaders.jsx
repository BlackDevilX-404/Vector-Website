import './HostLeaders.css';

/* ── Gold silhouette SVG placeholder (identical to Core Team) ── */
const SilhouetteSVG = () => (
  <svg
    viewBox="0 0 200 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="hl-silhouette"
    aria-hidden="true"
  >
    <circle cx="100" cy="72" r="34" stroke="#c5a059" strokeWidth="1.4" fill="rgba(197,160,89,0.06)" />
    <path
      d="M28 200 C28 158 56 138 100 138 C144 138 172 158 172 200"
      stroke="#c5a059"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="rgba(197,160,89,0.04)"
    />
    <path
      d="M82 138 Q100 152 118 138"
      stroke="#c5a059"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.45"
    />
  </svg>
);

/*
 * ── DATA ──
 * Replace placeholder values with actual data:
 *   clubName  → e.g. "Rotaract Club of Sri Shakthi"
 *   name      → e.g. "Rtn. John Doe"
 *   portfolio → "President" or "Secretary"
 *   tagline   → short one-liner shown on hover
 *   photo     → e.g. "/photos/club1-president.jpg" (null = silhouette)
 */
const clubs = [
  {
    clubName: 'Club Name',          // ← Replace
    members: [
      { name: 'Name', portfolio: 'President',  tagline: 'Leading with vision and conviction.',    photo: null },
      { name: 'Name', portfolio: 'Secretary',  tagline: 'Administering every detail with care.',  photo: null },
      { name: 'Name', portfolio: 'Secretary',  tagline: 'Keeping every commitment on track.',     photo: null },
    ],
  },
  {
    clubName: 'Club Name',          // ← Replace
    members: [
      { name: 'Name', portfolio: 'President',  tagline: 'Driving collaboration forward.',          photo: null },
      { name: 'Name', portfolio: 'Secretary',  tagline: 'Coordinating with precision.',            photo: null },
      { name: 'Name', portfolio: 'Secretary',  tagline: 'Connecting people. Connecting purpose.',  photo: null },
    ],
  },
];

const HostLeaders = () => {
  return (
    <section id="host-leaders" className="hl-section">

      {/* Ghost watermark */}
      <div className="hl-ghost" aria-hidden="true">LEADERSHIP</div>

      {/* Aperture rings */}
      <div className="hl-rings" aria-hidden="true">
        <div className="hl-ring hl-ring-1" />
        <div className="hl-ring hl-ring-2" />
        <div className="hl-ring hl-ring-3" />
      </div>

      <div className="container">

        {/* Section header */}
        <div className="hl-header reveal">
          <h2 className="section-title section-title-light">
            Meet the Host Presidents<br />and Secretaries
          </h2>
          <div className="gold-bar" />
          <p className="hl-intro">
            The leaders of our host organizations — the clubs that made VECTOR 2026 possible.
          </p>
        </div>

        {/* Two club rows */}
        <div className="hl-clubs">
          {clubs.map(({ clubName, members }, ci) => (
            <div className="hl-club-row" key={ci}>

              {/* Editorial row label — flanking gold lines */}
              <div className="hl-club-label reveal" style={{ transitionDelay: `${ci * 80}ms` }}>
                <span className="hl-label-line" />
                <span className="hl-label-text">{clubName}</span>
                <span className="hl-label-line" />
              </div>

              {/* 3 portrait cards */}
              <div className="hl-grid">
                {members.map(({ name, portfolio, tagline, photo }, mi) => (
                  <div
                    className="hl-card reveal"
                    key={mi}
                    style={{ transitionDelay: `${(ci * 3 + mi) * 80}ms` }}
                  >
                    {/* Top bar */}
                    <div className="hl-top-bar" />

                    {/* Photo zone */}
                    <div className="hl-photo-zone">
                      {photo ? (
                        <img src={photo} alt={name} className="hl-photo" />
                      ) : (
                        <div className="hl-photo-placeholder">
                          <SilhouetteSVG />
                        </div>
                      )}
                      <div className="hl-photo-fade" />
                      <div className="hl-photo-glow" />
                    </div>

                    {/* Card body */}
                    <div className="hl-card-body">
                      <div className="hl-portfolio">{portfolio}</div>
                      <h3 className="hl-name">{name}</h3>
                      <p className="hl-tagline">{tagline}</p>
                    </div>

                    {/* Corner accent */}
                    <div className="hl-corner-accent" />
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HostLeaders;
