import { useEffect, useRef, useState } from 'react';
import './Schedule.css';

const scheduleData = [
  {
    time: '08:00 AM - 08:15 AM',
    title: 'In-time of participants',
    tag: 'Arrival',
    desc: 'Doors open. Arrive, settle in, and get ready for an engaging day ahead.',
  },
  {
    time: '08:30 AM - 09:00 AM',
    title: 'Inauguration',
    tag: 'Keynote',
    desc: 'The opening ceremony that sets the tone — welcoming participants and kicking off VECTOR 2026.',
  },
  {
    time: '09:15 AM - 10:45 AM',
    title: 'Session 1',
    tag: 'Workshop',
    desc: 'Our first deep-dive session of the day to lay down the foundational editorial concepts.',
  },
  {
    time: '10:45 AM - 11:05 AM',
    title: 'Refreshment Break',
    tag: 'Break',
    desc: 'A short morning break to grab a snack, recharge, and network.',
  },
  {
    time: '11:10 AM - 12:40 PM',
    title: 'Session 2 (Training on Software)',
    tag: 'Workshop',
    desc: 'An engaging, hands-on training session covering the essential software and graphic design tools.',
  },
  {
    time: '12:40 PM - 01:30 PM',
    title: 'Lunch',
    tag: 'Networking',
    desc: 'Eat, connect, and collaborate. The best ideas are often born over a good meal.',
  },
  {
    time: '01:30 PM - 01:45 PM',
    title: 'Ice Breaker Session',
    tag: 'Break',
    desc: 'Shake off the post-lunch sleepiness! A quick, fun activity to get everyone energized and mingling.',
  },
  {
    time: '01:45 PM - 02:45 PM',
    title: 'Workshop',
    tag: 'Workshop',
    desc: 'Roll up your sleeves for a practical, interactive workshop where theory meets execution.',
  },
  {
    time: '02:45 PM - 03:00 PM',
    title: 'Panel Discussion: Passion to Profession',
    tag: 'Panel',
    desc: 'Hear from industry experts on how to transition your editorial passion into a thriving profession.',
  },
  {
    time: '03:00 PM - 04:00 PM',
    title: 'Session 3 (Rotary Branding Centre & AI Prompting)',
    tag: 'Workshop',
    desc: 'Dive into the Rotary Branding Centre guidelines and explore modern AI prompting techniques.',
  },
  {
    time: '04:00 PM - 04:30 PM',
    title: 'Valedictory Ceremony',
    tag: 'Closing',
    desc: 'The official closing ceremony — summarizing insights, recognizing efforts, and giving thanks.',
  },
  {
    time: '04:30 PM - 04:45 PM',
    title: 'Refreshments',
    tag: 'Networking',
    desc: 'Wind down with some evening snacks and share your final thoughts with peers.',
  },
  {
    time: '04:45 PM',
    title: 'Bus Departure',
    tag: 'Closing',
    desc: 'Time to head home! Buses depart, marking the end of a successful and inspiring workshop.',
  },
];

const TAG_COLORS = {
  Arrival:    { bg: 'rgba(197,160,89,0.1)',  border: 'rgba(197,160,89,0.3)',  color: 'var(--gold)' },
  Keynote:    { bg: 'rgba(100,120,255,0.1)', border: 'rgba(100,120,255,0.3)', color: '#8090ff' },
  Workshop:   { bg: 'rgba(80,200,160,0.1)',  border: 'rgba(80,200,160,0.3)',  color: '#50c8a0' },
  Networking: { bg: 'rgba(197,160,89,0.1)',  border: 'rgba(197,160,89,0.3)',  color: 'var(--gold)' },
  Closing:    { bg: 'rgba(255,120,100,0.1)', border: 'rgba(255,120,100,0.3)', color: '#ff7864' },
  Break:      { bg: 'rgba(180,120,255,0.1)', border: 'rgba(180,120,255,0.3)', color: '#b478ff' },
  Panel:      { bg: 'rgba(255,180,80,0.1)',  border: 'rgba(255,180,80,0.3)',  color: '#ffb450' },
};

const Schedule = () => {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  // Animate timeline line fill on scroll
  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      // Progress: 0 when section top hits bottom of viewport, 1 when section bottom leaves top
      const total = rect.height + viewH;
      const scrolled = viewH - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      setLineHeight(progress * 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="schedule" className="schedule-section" ref={sectionRef}>

      {/* Ghost watermark */}
      <div className="schedule-ghost" aria-hidden="true">SCHEDULE</div>

      {/* Aperture rings */}
      <div className="schedule-rings" aria-hidden="true">
        <div className="sch-ring sch-ring-1" />
        <div className="sch-ring sch-ring-2" />
        <div className="sch-ring sch-ring-3" />
      </div>

      <div className="container">

        {/* Header */}
        <div className="schedule-header reveal">
          <h2 className="section-title section-title-light">Event Schedule</h2>
          <div className="gold-bar" />
          <p className="schedule-intro">
            September 6, 2026 &mdash; A full day of sessions. One unforgettable day.
          </p>
        </div>

        {/* Timeline */}
        <div className="timeline">

          {/* Animated fill spine */}
          <div className="timeline-spine">
            <div
              className="timeline-spine-fill"
              style={{ height: `${lineHeight}%` }}
            />
          </div>

          {scheduleData.map((item, index) => {
            const tag = TAG_COLORS[item.tag] || TAG_COLORS.Arrival;
            const isEven = index % 2 === 0;
            return (
              <div
                className={`timeline-item reveal ${isEven ? '' : 'timeline-item-reverse'}`}
                key={index}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                {/* Time label */}
                <div className="timeline-time">{item.time}</div>

                {/* Numbered node badge */}
                <div className="timeline-node">
                  <div className="node-badge">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="node-pulse" />
                </div>

                {/* Content card */}
                <div className="timeline-content">
                  {/* Category tag */}
                  <span
                    className="timeline-tag"
                    style={{
                      background: tag.bg,
                      border: `1px solid ${tag.border}`,
                      color: tag.color,
                    }}
                  >
                    {item.tag}
                  </span>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                  {/* Bottom accent line */}
                  <div className="card-bottom-line" />
                </div>
              </div>
            );
          })}
          {/* THE END Marker */}
          <div className="timeline-end-marker reveal">
            <div className="end-pen-nib">
              <svg width="28" height="72" viewBox="0 0 28 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="0" width="8" height="28" rx="4" fill="#c5a059" />
                <rect x="8" y="26" width="12" height="6" rx="1" fill="#9a7a40" />
                <path d="M8 32 L4 60 L14 72 L24 60 L20 32 Z" fill="#c5a059" />
                <line x1="14" y1="42" x2="14" y2="70" stroke="#122141" strokeWidth="1.2" opacity="0.6" />
                <ellipse cx="14" cy="71" rx="2.5" ry="2" fill="#e0bb7a" />
                <ellipse cx="14" cy="52" rx="2" ry="3" fill="#122141" opacity="0.35" />
              </svg>
            </div>
            <div className="end-text">THE END</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
