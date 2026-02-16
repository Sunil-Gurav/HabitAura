import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Logo from './components/Logo'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000) // 2 seconds loading

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      
        <Route path="/about" element={
          <div style={{padding: '2rem', textAlign: 'center', color: 'white', background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem'}}>
            <Logo size="xlarge" showText={true} />
            <h1>About Page - Coming Soon!</h1>
            <p>Learn more about HabitSpark</p>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
