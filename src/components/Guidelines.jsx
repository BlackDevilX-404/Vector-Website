import { useEffect, useRef } from 'react';
import './Guidelines.css';

const Guidelines = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('reveal-active')),
      { threshold: 0.1 }
    );
    const items = document.querySelectorAll('.guideline-item');
    items.forEach((i) => observer.observe(i));
    return () => items.forEach((i) => observer.unobserve(i));
  }, []);

  const guidelinesList = [
    {
      title: 'Code of Conduct',
      desc: 'All attendees, sponsors, partners, volunteers, and staff are required to agree with the following code of conduct. Organizers will enforce this code throughout the event to ensure a safe environment for everybody.'
    },
    {
      title: 'Arrival & Check-in',
      desc: 'Check-in opens at 8:00 AM at the designated venue. Attendance will be verified at the registration desk, and event kits will be distributed accordingly.'
    },
    {
      title: 'Equipment',
      desc: 'Participants are required to bring the following items: Laptop & Charger, Mouse, Notepad & Pen, and a Water Bottle. Wi-Fi and power outlets will be provided at the venue.'
    },
    {
      title: 'No Food Allowed',
      desc: 'Please note that food and beverages are strictly prohibited inside the event hall. Dedicated catering and refreshment zones will be available for all attendees during scheduled breaks.'
    }
  ];

  return (
    <section id="guidelines" className="guidelines-section" ref={sectionRef}>
      <div className="container">
        <div className="guidelines-header reveal">
          <h2 className="section-title section-title-light">Event Guidelines</h2>
          <div className="gold-bar" />
          <p style={{ color: 'rgba(244,240,232,0.45)', maxWidth: '520px', fontSize: '0.98rem' }}>
            Please read these guidelines carefully to ensure a smooth and enjoyable experience.
          </p>
        </div>

        <div className="guidelines-container">
          {guidelinesList.map((item, index) => (
            <div
              className="guideline-item reveal"
              key={index}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <h3>
                <span className="rule-number">{index + 1}</span>
                {item.title}
              </h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guidelines;
