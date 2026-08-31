import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactLenis } from 'lenis/react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.025, // Extremely smooth (lower = smoother/slower)
        duration: 1.5, // Force longer duration
        wheelMultiplier: 1.1, // Slightly faster wheel to compensate for smoothness
        smoothWheel: true,
        smoothTouch: true,
        syncTouch: true // Makes trackpad feel incredibly smooth
      }}
    >
      <App />
    </ReactLenis>
  </StrictMode>,
)
