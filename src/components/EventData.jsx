import { useEffect, useRef, useState } from 'react';
import './EventData.css';

/* ── Custom SVG icons (File Metaphor) ── */
const IconCrowd = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconKit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconFood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const KIT_ITEMS = [
  'Customized mousepad',
  'Mechanical Pencil',
  'Certificate for each participant',
];

const FOOD_ITEMS = [
  'Morning Refreshments',
  'Lunch',
  'Evening Refreshments',
];

/* ── Animated count-up hook ── */
function useCountUp(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

const EventData = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('participants');
  const count = useCountUp(200, 1800, active);

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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section id="logistics" className="event-data-section reveal" ref={sectionRef}>
      <div className="container">
        
        <div className="event-data-header">
          <h2 className="section-title section-title-light" style={{ textAlign: 'center' }}>
            Event Logistics
          </h2>
          <div className="gold-bar" style={{ margin: '0 auto 1.5rem' }} />
          <p className="logistics-intro">
            Every detail, handled. So you can focus on what matters — creating.
          </p>
        </div>

        <div className="logistics-asset-bin">
          
          {/* LEFT: Asset List (Thumbnails) */}
          <div className="bin-sidebar">
            <div className="bin-header">
              <span>PROJECT_ASSETS</span>
              <span className="bin-icons">≡ ⊞</span>
            </div>
            <div className="bin-files">
              
              <div 
                className={`bin-file-item ${selectedAsset === 'participants' ? 'active' : ''}`}
                onClick={() => setSelectedAsset('participants')}
              >
                <div className="file-icon"><IconCrowd /></div>
                <div className="file-name">01_Participants.dat</div>
                <div className="file-meta">8.2 MB</div>
              </div>

              <div 
                className={`bin-file-item ${selectedAsset === 'kits' ? 'active' : ''}`}
                onClick={() => setSelectedAsset('kits')}
              >
                <div className="file-icon"><IconKit /></div>
                <div className="file-name">02_Event_Kits.pkg</div>
                <div className="file-meta">14.0 MB</div>
              </div>

              <div 
                className={`bin-file-item ${selectedAsset === 'food' ? 'active' : ''}`}
                onClick={() => setSelectedAsset('food')}
              >
                <div className="file-icon"><IconFood /></div>
                <div className="file-name">03_Catering.log</div>
                <div className="file-meta">2.1 MB</div>
              </div>

            </div>
          </div>

          {/* RIGHT: Preview / Inspector Panel */}
          <div className="bin-inspector">
            <div className="inspector-header">
              <span>PREVIEW_INSPECTOR</span>
              <span>[ ] X</span>
            </div>
            
            <div className="inspector-content">
              {selectedAsset === 'participants' && (
                <div className="preview-panel preview-participants">
                  <div className="preview-icon-large"><IconCrowd /></div>
                  <h3 className="preview-title">Total Participants</h3>
                  <div className="preview-stat">
                    {count}<span className="preview-stat-plus">+</span>
                  </div>
                  <p className="preview-desc">
                    Two hundred creative minds, one campus. The largest District Editorial Workshop in the region — and you're in it.
                  </p>
                  <div className="preview-meta-list">
                    <div className="meta-row"><span>Target:</span> <span>Creative Heads</span></div>
                    <div className="meta-row"><span>Status:</span> <span className="status-ok">CONFIRMED</span></div>
                  </div>
                </div>
              )}

              {selectedAsset === 'kits' && (
                <div className="preview-panel preview-kits">
                  <div className="preview-icon-large"><IconKit /></div>
                  <h3 className="preview-title">Event Kits</h3>
                  <p className="preview-desc">
                    Your VECTOR kit — curated for makers, not attendees.
                  </p>
                  <ul className="preview-list">
                    {KIT_ITEMS.map((item, idx) => (
                      <li key={idx}>
                        <span className="list-bullet">▶</span> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="preview-meta-list mt-auto">
                    <div className="meta-row"><span>Distribution:</span> <span>At Check-in</span></div>
                    <div className="meta-row"><span>Status:</span> <span className="status-ok">PACKED</span></div>
                  </div>
                </div>
              )}

              {selectedAsset === 'food' && (
                <div className="preview-panel preview-food">
                  <div className="preview-icon-large"><IconFood /></div>
                  <h3 className="preview-title">Lunch & Refreshments</h3>
                  <p className="preview-desc">
                    Fuel for a full day of creation — quality catering from morning to dusk.
                  </p>
                  <ul className="preview-list">
                    {FOOD_ITEMS.map((item, idx) => (
                      <li key={idx}>
                        <span className="list-bullet">▶</span> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="preview-meta-list mt-auto">
                    <div className="meta-row"><span>Schedule:</span> <span>Strict</span></div>
                    <div className="meta-row"><span>Status:</span> <span className="status-ok">ROUTED</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EventData;
