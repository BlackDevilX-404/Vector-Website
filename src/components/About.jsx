import { useState } from 'react';
import './About.css';

const FEATURES = [
  { id: 'layer-1', icon: '✦', title: 'Design & Branding', desc: 'Craft visual identities that leave a mark — from poster layouts to full brand systems.' },
  { id: 'layer-2', icon: '✎', title: 'Content Writing', desc: 'Turn ideas into words that move people. Sharp copy. Compelling narratives. Real impact.' },
  { id: 'layer-3', icon: '◈', title: 'Visual Storytelling', desc: 'Merge images and language into cohesive stories that audiences actually remember.' },
  { id: 'layer-4', icon: '◉', title: 'Logo Design', desc: 'Design marks that define identity — symbols that speak before a word is said.' },
];

const STATS = [
  { id: 'stat-1', label: 'Attendees', value: '200+', type: 'Capacity' },
  { id: 'stat-2', label: 'Sessions', value: '2+', type: 'Tracks' },
  { id: 'stat-3', label: 'Immersion', value: '1 Day', type: 'Duration' },
];

const About = () => {
  const [activeLayer, setActiveLayer] = useState('layer-1');

  return (
    <section id="about" className="about-section reveal">
      <div className="about-ghost-text" aria-hidden="true">VECTOR_WORKSPACE.PRJ</div>
      
      <div className="container">
        <div className="about-header-text">
          <h2 className="section-title section-title-light">About the Event</h2>
          <div className="gold-bar" />
          <p className="about-text-lead">
            VECTOR 2026 isn't a seminar. It's a full-day creative collision — where rotaractors who live for design, storytelling, and brand thinking gather to sharpen their craft.
          </p>
          <p className="about-text">
            Hosted at Sri Shakthi Institute of Engineering and Technology, by the Rotaract Club of Coimbatore Nexus and the Rotaract Club of Sri Shakthi Institute of Engineering and Technology, this District Editorial Workshop brings together the most creatively driven minds from across the district. No spectators. Only makers.
          </p>
        </div>

        <div className="about-workspace">
           {/* LEFT PANEL: LAYERS */}
           <div className="workspace-panel">
             <div className="panel-header">
               <span>Layers</span>
               <span>Op: 100%</span>
             </div>
             <div className="layer-list">
                {FEATURES.map(feat => (
                  <div 
                    key={feat.id} 
                    className={`layer-item ${activeLayer === feat.id ? 'active' : ''}`}
                    onClick={() => setActiveLayer(feat.id)}
                  >
                    <span className="layer-visibility">👁</span>
                    <span className="layer-icon">{feat.icon}</span>
                    <div className="layer-details">
                      <span className="layer-title">{feat.title}</span>
                      <span className="layer-desc">{feat.desc}</span>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           {/* CENTER: ARTBOARD */}
           <div className="workspace-center">
             <div className="artboard-tab">Composition_1 <span className="tab-close">×</span></div>
             <div className="artboard-canvas">
                {/* Crop marks */}
                <div className="crop-mark top-left"></div>
                <div className="crop-mark top-right"></div>
                <div className="crop-mark bottom-left"></div>
                <div className="crop-mark bottom-right"></div>
                
                {/* Vector SVG that changes slightly based on activeLayer */}
                <div className="vector-graphics-container">
                   <svg viewBox="0 0 400 300" className="vector-path-svg">
                      <path className="vector-line" d={activeLayer === 'layer-1' ? "M 50 150 Q 150 50 250 200 T 350 100" : activeLayer === 'layer-2' ? "M 50 100 C 150 250, 250 50, 350 200" : "M 100 200 L 200 50 L 300 250 Z"} fill="none" />
                      <circle cx="50" cy={activeLayer === 'layer-2' ? '100' : '150'} r="4" className="vector-node" />
                      <circle cx="250" cy="200" r="4" className="vector-node active-node" />
                      <circle cx="350" cy={activeLayer === 'layer-1' ? '100' : '200'} r="4" className="vector-node" />
                      <line x1={activeLayer === 'layer-2' ? '150' : '150'} y1={activeLayer === 'layer-2' ? '250' : '50'} x2="50" y2={activeLayer === 'layer-2' ? '100' : '150'} className="vector-handle" />
                      <line x1={activeLayer === 'layer-2' ? '250' : '150'} y1={activeLayer === 'layer-2' ? '50' : '50'} x2={activeLayer === 'layer-2' ? '350' : '250'} y2="200" className="vector-handle" />
                      <circle cx={activeLayer === 'layer-2' ? '150' : '150'} cy={activeLayer === 'layer-2' ? '250' : '50'} r="3" className="vector-handle-point" />
                   </svg>
                   <div className="pen-cursor">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                   </div>
                </div>

                <div className="tech-readouts">
                  <span>X: {activeLayer === 'layer-1' ? '124' : '341'}px</span>
                  <span>Y: 289px</span>
                  <span>W: 1920</span>
                  <span>H: 1080</span>
                  <span>ZOOM: 150%</span>
                </div>
             </div>
           </div>

           {/* RIGHT PANEL: PROPERTIES */}
           <div className="workspace-panel">
             <div className="panel-header">
               <span>Properties</span>
               <span>⚙</span>
             </div>
             <div className="properties-list">
               {STATS.map(stat => (
                 <div className="property-box" key={stat.id}>
                   <div className="prop-top">
                     <span className="prop-type">{stat.type}</span>
                   </div>
                   <div className="prop-value-container">
                     <span className="prop-val">{stat.value}</span>
                     <span className="prop-label">{stat.label}</span>
                   </div>
                 </div>
               ))}
               
               <div className="export-section">
                  <div className="prop-type">RENDER SETTINGS</div>
                  <div className="render-options">
                    <span className="render-btn active">.VEC</span>
                    <span className="render-btn">.SVG</span>
                    <span className="render-btn">.PNG</span>
                  </div>
                  <button className="btn-export">EXPORT PROJECT</button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default About;
