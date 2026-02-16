import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'
import logo from '../assets/logo.png'

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  toggleDarkMode, 
  activeSection, 
  setActiveSection 
}) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  const handleNavClick = (section) => {
    setActiveSection(section)
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="HabitSpark Logo" className="logo-image" />
            <h2>HabitSpark</h2>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'habits' ? 'active' : ''}`}
            onClick={() => handleNavClick('habits')}
          >
            <i className="fas fa-check-circle"></i>
            <span>My Habits</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Analytics</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'calendar' ? 'active' : ''}`}
            onClick={() => handleNavClick('calendar')}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Calendar</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'goals' ? 'active' : ''}`}
            onClick={() => handleNavClick('goals')}
          >
            <i className="fas fa-target"></i>
            <span>Goals</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'rewards' ? 'active' : ''}`}
            onClick={() => handleNavClick('rewards')}
          >
            <i className="fas fa-trophy"></i>
            <span>Rewards</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'journal' ? 'active' : ''}`}
            onClick={() => handleNavClick('journal')}
          >
            <i className="fas fa-book"></i>
            <span>Journal</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <i className="fas fa-user-circle"></i>
            <span>Profile</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item" onClick={toggleDarkMode}>
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button className="nav-item logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar