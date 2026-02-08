import { useState, useEffect, useRef } from 'react'
import Header from './components/Header/Header'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground'
import CustomScrollbar from './components/CustomScrollbar/CustomScrollbar'
import Home from './pages/Home/Home'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const handleBreakpointChange = () => {
      setIsLoading(true)
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    const desktopQuery = window.matchMedia('(min-width: 1024px)')

    mobileQuery.addEventListener('change', handleBreakpointChange)
    tabletQuery.addEventListener('change', handleBreakpointChange)
    desktopQuery.addEventListener('change', handleBreakpointChange)

    return () => {
      mobileQuery.removeEventListener('change', handleBreakpointChange)
      tabletQuery.removeEventListener('change', handleBreakpointChange)
      desktopQuery.removeEventListener('change', handleBreakpointChange)
    }
  }, [])

  return (
    <>
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}
      <CustomScrollbar />
      <Header />
      <AnimatedBackground />
      <Home />
    </>
  )
}

export default App