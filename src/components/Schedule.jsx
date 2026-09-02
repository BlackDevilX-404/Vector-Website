import { useEffect, useRef, useState } from 'react';
import './Schedule.css';

const scheduleData = [
  {
    time: '08:00 AM - 08:15 AM',
    title: 'In time',
    tag: 'Arrival',
    desc: 'Doors open. Collect your kit, grab your badge, and let the day begin.',
  },
  {
    time: '08:30 AM - 09:00 AM',
    title: 'Inauguration',
    tag: 'Keynote',
    desc: 'The keynote that sets the tone — district leadership and a chief guest speak on the future of editorial media.',
  },
  {
    time: '09:15 AM - 11:00 AM',
    title: 'Session 1',
    tag: 'Workshop',
    desc: 'Join us for an insightful session.',
  },
  {
    time: '11:00 AM - 11:20 AM',
    title: 'Break',
    tag: 'Break',
    desc: 'A short break to relax and recharge.',
  },
  {
    time: '11:30 AM - 01:00 PM',
    title: 'Session 2 (Software or Graphic Designer session)',
    tag: 'Workshop',
    desc: 'An engaging session on software and graphic design tools.',
  },
  {
    time: '01:00 PM - 01:45 PM',
    title: 'Lunch',
    tag: 'Networking',
    desc: 'Eat, connect, collaborate. The best ideas are born over food.',
  },
  {
    time: '02:00 PM - 03:00 PM',
    title: '3 Professional Editors Panel',
    tag: 'Panel',
    desc: 'Hear from industry experts as they share their experiences and answer your questions.',
  },
  {
    time: '03:00 PM - 03:15 PM',
    title: 'Icebreaker Session',
    tag: 'Break',
    desc: 'Stretch your legs and mingle with fellow participants.',
  },
  {
    time: '03:15 PM - 04:00 PM',
    title: 'Session 3 (Rotary Branding, PR & Bulletin)',
    tag: 'Workshop',
    desc: 'Dive deep into Rotary branding, public relations, and bulletin creation.',
  },
  {
    time: '04:00 PM - 05:00 PM',
    title: 'Live Editing Workshop',
    tag: 'Workshop',
    desc: 'A hands-on live editing workshop to put your skills to the test.',
  },
  {
    time: '05:00 PM - 05:45 PM',
    title: 'Valedictory Ceremony',
    tag: 'Closing',
    desc: 'A day well spent. Certificates, recognition, and the moment you\'ve been working toward.',
  },
  {
    time: '05:45 PM - 06:10 PM',
    title: 'Refreshments',
    tag: 'Networking',
    desc: 'Wind down and enjoy some evening refreshments before heading out.',
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
        </div>
      </div>
    </section>
  );
};

export default Schedule;
