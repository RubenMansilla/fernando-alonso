import { useState, useEffect, useRef } from 'react'
import Header from './components/Header/Header'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground'
import CustomScrollbar from './components/CustomScrollbar/CustomScrollbar'
import Home from './pages/Home/Home'
import './App.css'
import Circuits from './components/Circuits/Circuits'
import TrackMapper from './components/TrackMapper'

function App() {
  const [isLoading, setIsLoading] = useState(true)
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

    // Easter Egg in Console
    console.log(
      `%c
   ███████╗███████╗██████╗ ███╗   ██╗ █████╗ ███╗   ██╗██████╗  ██████╗ 
   ██╔════╝██╔════╝██╔══██╗████╗  ██║██╔══██╗████╗  ██║██╔══██╗██╔═══██╗
   █████╗  █████╗  ██████╔╝██╔██╗ ██║███████║██╔██╗ ██║██║  ██║██║   ██║
   ██╔══╝  ██╔══╝  ██╔══██╗██║╚██╗██║██╔══██║██║╚██╗██║██║  ██║██║   ██║
   ██║     ███████╗██║  ██║██║ ╚████║██║  ██║██║ ╚████║██████╔╝╚██████╔╝
   ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ 
                                                                     
    █████╗ ██╗      ██████╗ ███╗   ██╗███████╗ ██████╗                  
   ██╔══██╗██║     ██╔═══██╗████╗  ██║██╔════╝██╔═══██╗                 
   ███████║██║     ██║   ██║██╔██╗ ██║███████╗██║   ██║                 
   ██╔══██║██║     ██║   ██║██║╚██╗██║╚════██║██║   ██║                 
   ██║  ██║███████╗╚██████╔╝██║ ╚████║███████║╚██████╔╝                 
   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝                  
      `,
      'color: #2c8ecc; font-weight: bold;'
    );

    return () => {
      desktopBreakpoint.removeEventListener('change', handleResize);
      tabletBreakpoint.removeEventListener('change', handleResize);
    }
  }, [])

  const path = window.location.pathname;

  return (
    <>
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}
      <CustomScrollbar />
      <Header />
      <AnimatedBackground />
      {path === '/circuits' && <Circuits />}
      {path === '/debug-tracks' && <TrackMapper />}
      {path === '/' && <Home />}
    </>
  )
}

export default App