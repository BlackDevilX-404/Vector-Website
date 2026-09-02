import { useState, useEffect } from 'react';
import './Hero.css';
import LiveEditText from './LiveEditText';

// Gold pen nib SVG (matches logo motif)
const PenNibSVG = () => (
  <svg width="28" height="72" viewBox="0 0 28 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Barrel */}
    <rect x="10" y="0" width="8" height="28" rx="4" fill="#c5a059" />
    {/* Collar */}
    <rect x="8" y="26" width="12" height="6" rx="1" fill="#9a7a40" />
    {/* Nib body */}
    <path d="M8 32 L4 60 L14 72 L24 60 L20 32 Z" fill="#c5a059" />
    {/* Nib tines (center split) */}
    <line x1="14" y1="42" x2="14" y2="70" stroke="#122141" strokeWidth="1.2" opacity="0.6" />
    {/* Nib tip */}
    <ellipse cx="14" cy="71" rx="2.5" ry="2" fill="#e0bb7a" />
    {/* Nib vent hole */}
    <ellipse cx="14" cy="52" rx="2" ry="3" fill="#122141" opacity="0.35" />
  </svg>
);

// Live countdown to event date
const EVENT_DATE = new Date('2026-09-06T09:00:00+05:30');

function getTimeLeft() {
  const diff = EVENT_DATE - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);
  return { days, hours, minutes, seconds };
}

const CountdownTimer = () => {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="hero-countdown" aria-label="Countdown to event">
      {[
        ['days',    time.days],
        ['hours',   time.hours],
        ['minutes', time.minutes],
        ['seconds', time.seconds],
      ].map(([label, val]) => (
        <div className="countdown-unit" key={label}>
          <span className="countdown-value">{pad(val)}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
};

const Hero = () => {
  return (
    <section id="home" className="hero-section">

      {/* Full-screen video */}
      <div className="video-wrapper">
        <video
          className="intro-video"
          autoPlay
          loop
          muted
          playsInline
          controls
        >
          <source src="/event-video.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay */}
        <div className="video-overlay" />

        {/* Aperture concentric rings (camera lens motif, right side) */}
        <div className="video-aperture-rings">
          <div className="var-ring var-ring-1" />
          <div className="var-ring var-ring-2" />
          <div className="var-ring var-ring-3" />
          <div className="var-ring var-ring-4" />
        </div>
      </div>

      {/* ── BELOW-VIDEO EDITORIAL CONTENT ── */}
      <div className="hero-content-below">
        <div className="hero-text-centered reveal">

          {/* Floating pen nib — logo editorial motif */}
          <div className="hero-pen-nib" aria-hidden="true">
            <PenNibSVG />
          </div>



          {/* Date badge */}
          <div className="event-badge">September 6, 2026</div>

          {/* Main title — bold Oswald, logo-style */}
          <h1 className="hero-title-dark">
            <span className="text-accent">VECTOR</span>
          </h1>

          <div className="hero-subtitle-line">
            District Editorial Workshop
          </div>

          <p className="hero-subtitle-dark" style={{ minHeight: '3em' }}>
            Join us at Sri Shakthi Institute of Engineering and Technology for... <br />
            <LiveEditText
              draftText="a boring day of standard presentations."
              finalText="an immersive day of learning, networking, and editorial excellence."
            />
          </p>

          {/* Live countdown to event */}
          <CountdownTimer />



          {/* Scroll indicator - replaced with a timeline scrub hint */}
          <div className="hero-scroll-hint">
            <div className="scroll-timeline-line" />
            <span className="scroll-timeline-text">SCRUB TIMELINE</span>
          </div>
        </div>

        {/* ── EDITING UI OVERLAYS ── */}
        <div className="edit-ui-overlay">
          {/* Crop marks */}
          <div className="crop-mark crop-tl" />
          <div className="crop-mark crop-tr" />
          <div className="crop-mark crop-bl" />
          <div className="crop-mark crop-br" />
          
          {/* Rec indicator */}
          <div className="rec-indicator">
            <span className="rec-dot" /> REC
          </div>

          {/* Timecode */}
          <div className="timecode-indicator">00:00:00:00</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
