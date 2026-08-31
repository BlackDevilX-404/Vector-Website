import { useState, useEffect } from 'react';
import './InkLoader.css';

const InkLoader = ({ onComplete }) => {
  // Phases: idle -> focus (scale down + unblur) -> glow (add subtle glow) -> revealing (subtitle) -> done (fade out)
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    // 1. Start focus animation immediately
    const t1 = setTimeout(() => setPhase('focus'), 100);
    // 2. Add glow after focus completes
    const t2 = setTimeout(() => setPhase('glow'), 1200);
    // 3. Reveal subtitle
    const t3 = setTimeout(() => setPhase('revealing'), 1600);
    // 4. Fade out sequence
    const t4 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 3400);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`ink-loader phase-${phase}`} aria-hidden="true" role="presentation">
      
      {/* Background overlay */}
      <div className="ink-drop-overlay" />

      {/* Center Stage */}
      <div className="ink-center">
        
        {/* Logo focus animation */}
        <div className="logo-wrap">
          <img src="/logo.png" alt="VECTOR Logo" className="loader-logo" />
        </div>

        {/* Subtitle */}
        <div className="ink-subtitle">Editorial Workshop</div>
      </div>
      
    </div>
  );
};

export default InkLoader;
