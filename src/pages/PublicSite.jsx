import '../App.css'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Schedule from '../components/Schedule'
import Footer from '../components/Footer'
import EventData from '../components/EventData'
import LearningMaterials from '../components/LearningMaterials'

import Guidelines from '../components/Guidelines'
import CoreTeam from '../components/CoreTeam'
import HostLeaders from '../components/HostLeaders'
import InkLoader from '../components/InkLoader'
import useScrollReveal from '../hooks/useScrollReveal'

const PublicSite = () => {
  useScrollReveal();
  return (
    <div className="app">
      <InkLoader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <EventData />
        <Schedule />
        <LearningMaterials />
        <CoreTeam />

        <HostLeaders />
        <Guidelines />
      </main>
      <Footer />
    </div>
  )
}

export default PublicSite
