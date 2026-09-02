import './Sponsors.css';
import SPONSORS from '../data/sponsors';

// Repeat sponsors enough times so the first half always overflows the screen.
// Minimum of 12 cards in one "half" ensures full viewport coverage at any size.
// The animation then translates exactly -50%, making the loop seamless.
const MIN_HALF_COUNT = 12;
const repeatTimes = Math.ceil((MIN_HALF_COUNT * 2) / SPONSORS.length);
const FULL_SET = Array.from({ length: repeatTimes }, () => SPONSORS).flat();
// TICKER_ITEMS = two full sets side-by-side; animation scrolls exactly one set (-50%)
const TICKER_ITEMS = [...FULL_SET, ...FULL_SET];

const Sponsors = () => {
  if (!SPONSORS.length) return null;

  return (
    <section id="sponsors" className="sponsors-section reveal">

      {/* Ghost watermark */}
      <div className="sponsors-ghost-text" aria-hidden="true">SPONSORS</div>

      {/* Top & bottom gold rule */}
      <div className="sponsors-rule sponsors-rule--top" />
      <div className="sponsors-rule sponsors-rule--bottom" />

      <div className="container">

        {/* ── Header ── */}
        <div className="sponsors-header">
          <div className="section-eyebrow">
            <span className="section-num">Supported By</span>
            <span className="section-num-line" />
          </div>
          <h2 className="section-title section-title-light sponsors-title">
            Our Sponsors
          </h2>
          <div className="gold-bar" />
        </div>

      </div>

      {/* ── Ticker (full-width, outside container so it bleeds edge-to-edge) ── */}
      <div className="sponsors-ticker-wrapper" aria-label="Sponsor logos">

        {/* Fade masks */}
        <div className="sponsors-fade-left"  aria-hidden="true" />
        <div className="sponsors-fade-right" aria-hidden="true" />

        {/* The moving track — hover on the wrapper pauses it */}
        <div className="sponsors-ticker-track">
          {TICKER_ITEMS.map(({ file, name }, idx) => (
            <div className="sponsor-card" key={`${file}-${idx}`}>
              <img
                src={`/sponsors/${encodeURIComponent(file)}`}
                alt={name}
                className="sponsor-logo"
                loading="lazy"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default Sponsors;
