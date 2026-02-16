import React from 'react'
import './LoadingScreen.css'
import logo from '../assets/logo.png'

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-logo-wrapper">
          <img src={logo} alt="HabitSpark Logo" className="loading-logo" />
          <div className="loading-circle"></div>
          <div className="loading-circle-outer"></div>
        </div>
        <h2 className="loading-title">HabitSpark</h2>
        <p className="loading-subtitle">Loading your habits...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
