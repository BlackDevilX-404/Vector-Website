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
      title: 'ID & Check-in',
      desc: 'Please bring a valid photo ID and your registration confirmation email. Check-in opens at 8:00 AM at the main entrance of Sri Shakthi Institute.'
    },
    {
      title: 'Equipment',
      desc: 'If participating in hands-on sessions, please bring your own laptop and charger. We will provide high-speed Wi-Fi and power outlets at every workstation.'
    },
    {
      title: 'Health & Safety',
      desc: 'Follow all venue safety regulations. Medical staff will be on standby in the designated first-aid room throughout the event.'
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
