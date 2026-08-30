import { useEffect, useRef, useState } from 'react';
import './EventData.css';

/* ── Custom gold SVG icons ── */
const IconCrowd = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    <circle cx="24" cy="14" r="6" stroke="#c5a059" strokeWidth="1.8" />
    <path d="M12 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#c5a059" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="16" r="4" stroke="#c5a059" strokeWidth="1.4" opacity="0.55" />
    <path d="M2 36c0-4.418 3.582-8 8-8" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
    <circle cx="38" cy="16" r="4" stroke="#c5a059" strokeWidth="1.4" opacity="0.55" />
    <path d="M46 36c0-4.418-3.582-8-8-8" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
  </svg>
);

const IconKit = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    {/* Tote bag */}
    <path d="M14 18h20l-3 22H17L14 18Z" stroke="#c5a059" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M18 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#c5a059" strokeWidth="1.8" strokeLinecap="round" />
    {/* Pen nib detail */}
    <line x1="24" y1="24" x2="24" y2="34" stroke="#c5a059" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
    <path d="M21 28l3 6 3-6" stroke="#c5a059" strokeWidth="1.2" opacity="0.6" strokeLinejoin="round" />
  </svg>
);

const IconFood = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
    {/* Plate */}
    <circle cx="24" cy="28" r="14" stroke="#c5a059" strokeWidth="1.8" />
    <circle cx="24" cy="28" r="9" stroke="#c5a059" strokeWidth="1.2" opacity="0.5" />
    {/* Steam lines */}
    <path d="M18 10 Q19 7 18 4" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M24 10 Q25 7 24 4" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    <path d="M30 10 Q31 7 30 4" stroke="#c5a059" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
  </svg>
);

/* ── Animated count-up hook ── */
function useCountUp(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

/* ── Card data ── */
const KIT_ITEMS = [
  'Premium VECTOR T-shirt',
  'Tote Bag',
  'Notepad & Pen',
  'Sticker Pack',
  'Event Badge & Lanyard',
];

const FOOD_ITEMS = [
  'Morning Tea & Coffee',
  'Buffet Lunch (Veg & Non-Veg)',
  'Evening High Tea',
  'Continuous Water Stations',
];

const EventData = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(500, 1800, active);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-active');
            setActive(true);
          }
        });
      },
      { threshold: 0.15 }
    );
    const cards = document.querySelectorAll('.data-card');
    cards.forEach((c) => observer.observe(c));
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      cards.forEach((c) => observer.unobserve(c));
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section id="logistics" className="event-data-section" ref={sectionRef}>

      {/* Background aperture rings */}
      <div className="logistics-bg-rings" aria-hidden="true">
        <div className="logistics-ring logistics-ring-1" />
        <div className="logistics-ring logistics-ring-2" />
        <div className="logistics-ring logistics-ring-3" />
      </div>

      <div className="container">

        {/* ── Section header ── */}
        <div className="event-data-header reveal">
          <h2 className="section-title section-title-light" style={{ textAlign: 'center' }}>
            Event Logistics
          </h2>
          <div className="gold-bar" style={{ margin: '0 auto 1.5rem' }} />
          <p className="logistics-intro">
            Every detail, handled. So you can focus on what matters — creating.
          </p>
        </div>

        {/* ── Gold connector line above cards ── */}
        <div className="logistics-connector" aria-hidden="true">
          <div className="connector-line" />
          <div className="connector-dot connector-dot-1" />
          <div className="connector-dot connector-dot-2" />
          <div className="connector-dot connector-dot-3" />
        </div>

        {/* ── 3-column card grid ── */}
        <div className="event-data-grid">

          {/* Card 1 — Participants */}
          <div className="data-card reveal delay-100">
            <div className="card-accent-border" />
            <div className="data-icon-wrapper">
              <IconCrowd />
            </div>
            <h3 className="data-title">Total Participants</h3>
            <div className="data-stat">
              {count}<span className="data-stat-plus">+</span>
            </div>
            <p className="data-desc">
              Five hundred creative minds, one campus. The largest District Editorial Workshop in the region — and you're in it.
            </p>
          </div>

          {/* Card 2 — Event Kits */}
          <div className="data-card data-card-featured reveal delay-200">
            <div className="card-accent-border" />
            <div className="card-featured-glow" aria-hidden="true" />
            <div className="data-icon-wrapper">
              <IconKit />
            </div>
            <h3 className="data-title">Event Kits</h3>
            <p className="data-desc" style={{ marginBottom: '0.5rem' }}>
              Your VECTOR kit — curated for makers, not attendees.
            </p>
            <ul className="data-list">
              {KIT_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Card 3 — Refreshments */}
          <div className="data-card reveal delay-300">
            <div className="card-accent-border" />
            <div className="data-icon-wrapper">
              <IconFood />
            </div>
            <h3 className="data-title">Lunch & Refreshments</h3>
            <p className="data-desc" style={{ marginBottom: '0.5rem' }}>
              Fuel for a full day of creation — quality catering from morning to dusk.
            </p>
            <ul className="data-list">
              {FOOD_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EventData;
