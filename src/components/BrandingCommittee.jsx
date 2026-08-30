import { useEffect, useRef } from 'react';
import './BrandingCommittee.css';

const BrandingCommittee = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('reveal-active')),
      { threshold: 0.1 }
    );
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((c) => observer.observe(c));
    return () => cards.forEach((c) => observer.unobserve(c));
  }, []);

  const committee = [
    { name: 'Alex Morgan', role: 'Creative Director', bio: 'Leading the overall visual identity and aesthetic direction for the VECTOR event series.' },
    { name: 'Jamie Chen', role: 'Lead Designer', bio: 'Crafting beautiful UI/UX experiences and ensuring our digital presence is pixel perfect.' },
    { name: 'Sam Taylor', role: 'Marketing Head', bio: 'Connecting our brand with the community and driving engagement across all platforms.' },
    { name: 'Jordan Lee', role: 'Media Coordinator', bio: 'Managing digital assets, photography, and video production for all event materials.' }
  ];

  return (
    <section id="committee" className="committee-section" ref={sectionRef}>
      <div className="container">
        <div className="committee-header reveal">
          <h2 className="section-title section-title-light">Branding Committee</h2>
          <div className="gold-bar" />
          <p style={{ color: 'rgba(244,240,232,0.45)', maxWidth: '520px', fontSize: '0.98rem' }}>
            Meet the creative minds behind the visual identity and design language of VECTOR.
          </p>
        </div>

        <div className="committee-grid">
          {committee.map((member, index) => (
            <div
              className="member-card reveal"
              key={index}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="member-image-placeholder">👤</div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <div className="member-role">{member.role}</div>
                <p className="member-bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandingCommittee;
