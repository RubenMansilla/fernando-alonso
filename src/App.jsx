import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header/Header'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground'
import CustomScrollbar from './components/CustomScrollbar/CustomScrollbar'
import Home from './pages/Home/Home'
import './App.css'
import Circuits from './components/Circuits/Circuits'
import TrackMapper from './components/TrackMapper'
import Calendar from './pages/Calendar/Calendar'
import Career from './pages/Career/Career'
import Honors from './pages/Honors/Honors'

import SmoothScroll from './components/SmoothScroll/SmoothScroll'

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Logic to reload page when switching between major breakpoints:
    // Mobile (<500px) <-> Tablet (500px-799px) <-> Desktop (>=800px)
    const desktopBreakpoint = window.matchMedia('(min-width: 800px)');
    const tabletBreakpoint = window.matchMedia('(min-width: 500px)');

    const handleResize = () => {
      // Reloading the page forces a full reset of React state and GSAP context
      window.location.reload();
    };

    desktopBreakpoint.addEventListener('change', handleResize);
    tabletBreakpoint.addEventListener('change', handleResize);

    return () => {
      desktopBreakpoint.removeEventListener('change', handleResize);
      tabletBreakpoint.removeEventListener('change', handleResize);
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}
      <SmoothScroll />
      <CustomScrollbar />
      <Header />
      {location.pathname === '/' && <AnimatedBackground
        backgroundColor="#1c2230"
        videoOpacity={1.0}
        videoFilter="sepia(1) hue-rotate(190deg) saturate(2) brightness(0.2) contrast(1.1)"
        videoMixBlendMode="screen"
        className="global-bg"
      />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/career" element={<Career />} />
        <Route path="/honors" element={<Honors />} />
        <Route path="/circuits" element={<Circuits />} />
        <Route path="/debug-tracks" element={<TrackMapper />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App