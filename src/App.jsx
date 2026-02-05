import Header from './components/Header/Header'
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground'
import CustomScrollbar from './components/CustomScrollbar/CustomScrollbar'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <>
      <CustomScrollbar />
      <Header />
      <AnimatedBackground />
      <Home />
    </>
  )
}

export default App
