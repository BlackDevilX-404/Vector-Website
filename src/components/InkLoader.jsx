import { useState, useEffect } from 'react';
import './InkLoader.css';

// Gold pen nib SVG
const PenNibSVG = () => (
  <svg width="40" height="90" viewBox="0 0 28 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="0" width="8" height="28" rx="4" fill="#c5a059" />
    <rect x="8" y="26" width="12" height="6" rx="1" fill="#9a7a40" />
    <path d="M8 32 L4 60 L14 72 L24 60 L20 32 Z" fill="#c5a059" />
    <line x1="14" y1="42" x2="14" y2="70" stroke="#122141" strokeWidth="1.2" opacity="0.6" />
    <ellipse cx="14" cy="71" rx="2.5" ry="2" fill="#e0bb7a" />
    <ellipse cx="14" cy="52" rx="2" ry="3" fill="#122141" opacity="0.35" />
  </svg>
);

const InkLoader = ({ onComplete }) => {
  // Phases: idle -> spreading (ink drop) -> tracing (pen writes) -> revealing (fill word) -> done (fade out)
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    // 1. Drop the ink
    const t1 = setTimeout(() => setPhase('spreading'), 100);
    // 2. Start tracing
    const t2 = setTimeout(() => setPhase('tracing'), 800);
    // 3. Fill text and reveal subtitle
    const t3 = setTimeout(() => setPhase('revealing'), 1000);
    // 4. Fade out sequence
    const t4 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 3800); // Gives enough time for the 2s tracing animation + pause

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  // If done, component stays mounted briefly for CSS opacity transition, then we could unmount entirely
  // but it's handled by CSS pointer-events:none and opacity:0
  
  return (
    <div className={`ink-loader phase-${phase}`} aria-hidden="true" role="presentation">
      
      {/* Background Ink Drop */}
      <div className="ink-drop-overlay" />

      {/* Center Stage */}
      <div className="ink-center">
        
        {/* Wordmark with Pen */}
        <div style={{ position: 'relative' }}>
          <div className="ink-wordmark">VECTOR</div>
          
          <div className="ink-pen-wrap">
            <PenNibSVG />
          </div>
        </div>

        {/* Subtitle */}
        <div className="ink-subtitle">Editorial Workshop</div>
      </div>
      
    </div>
  );
};

export default InkLoader;
