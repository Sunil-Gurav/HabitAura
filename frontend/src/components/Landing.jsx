import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Logo from './Logo'
import './Landing.css'

const Landing = () => {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState('default')
  const [isMouseMoving, setIsMouseMoving] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const mouseTimeoutRef = useRef(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          // If request succeeds, user is authenticated, redirect to dashboard
          navigate('/dashboard')
        } catch (error) {
          // If request fails, token is invalid, remove it
          localStorage.removeItem('accessToken')
        }
      }
    }

    checkAuthStatus()
  }, [navigate])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e) => {
      // Use clientX and clientY for absolute positioning relative to viewport
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
      
      // Set mouse moving state
      setIsMouseMoving(true)
      
      // Clear existing timeout
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current)
      }
      
      // Set timeout to detect when mouse stops
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false)
      }, 150)
      
      // Detect cursor variant based on element
      const target = e.target
      if (target.closest('button') || target.closest('a') || target.closest('.clickable')) {
        setCursorVariant('hover')
      } else if (target.closest('.feature-card') || target.closest('.stat-card')) {
        setCursorVariant('card')
      } else if (target.closest('h1') || target.closest('h2') || target.closest('h3')) {
        setCursorVariant('text')
      } else {
        setCursorVariant('default')
      }
    }

    const handleMouseLeave = () => {
      setIsMouseMoving(false)
      setCursorVariant('default')
    }

    // Add event listeners to document instead of window for better tracking
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current)
      }
    }
  }, [])

  const navigateToLoginPage = () => {
    navigate('/login')
  }

  return (
    <div 
      ref={containerRef}
      className={`landing-container cursor-${cursorVariant}`}
    >
      {/* Custom Cursor */}
      <div 
        className={`custom-cursor ${isMouseMoving ? 'moving' : ''} cursor-${cursorVariant}`}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      >
        <div className="cursor-dot"></div>
        <div className="cursor-ring"></div>
        <div className="cursor-trail"></div>
      </div>

      {/* Enhanced Interactive Background */}
      <div 
        className={`interactive-background ${isMouseMoving ? 'active' : ''}`}
        style={{
          background: `
            radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.15), transparent 50%),
            radial-gradient(600px at ${mousePosition.x + 100}px ${mousePosition.y + 100}px, rgba(34, 211, 238, 0.1), transparent 40%),
            radial-gradient(400px at ${mousePosition.x - 50}px ${mousePosition.y - 50}px, rgba(168, 85, 247, 0.08), transparent 30%)
          `
        }}
      />

      {/* Magnetic Particles */}
      <div className="magnetic-particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="magnetic-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 25}s`,
              transform: isMouseMoving ? `translate(${(mousePosition.x - window.innerWidth/2) * 0.01}px, ${(mousePosition.y - window.innerHeight/2) * 0.01}px)` : 'translate(0, 0)'
            }}
          />
        ))}
      </div>

      {/* Animated Background Particles */}
      <div className="particles-container">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${20 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-content">
            <Logo size="medium" showText={true} className="nav-brand" />
            <ul className="nav-menu">
              <li>
                <a href="/" className="nav-link">HOME</a>
              </li>
              <li>
                <a href="/about" className="nav-link">ABOUT US</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Content */}
            <div 
              className="hero-content"
              style={{ 
                transform: `translateY(${scrollY * 0.1}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="hero-text">
                <h1 className="hero-title">
                  <span className="title-primary">Build Your</span>
                  <br />
                  <span className="title-gradient">Good Habits</span>
                </h1>
                <p className="hero-description">
                  Transform your life one habit at a time. Monitor your progress, stay motivated, 
                  and achieve your goals with our intelligent habit tracking system.
                </p>
              </div>
              
              <div className="hero-buttons">
                <button
                  onClick={navigateToLoginPage}
                  className="btn-primary clickable"
                >
                  <div className="btn-shine"></div>
                  <span className="btn-content">
                    <span className="btn-emoji">🚀</span>
                    Start Your Journey
                  </span>
                </button>
                <button className="btn-secondary clickable">
                  <span className="btn-content">
                    <span className="btn-emoji">📖</span>
                    Learn More
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                {[
                  { number: '10K+', label: 'Active Users', icon: '👥' },
                  { number: '50K+', label: 'Habits Tracked', icon: '📊' },
                  { number: '95%', label: 'Success Rate', icon: '🎯' },
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="stat-card"
                    style={{ 
                      animationDelay: `${index * 0.2}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Images */}
            <div 
              className="hero-images"
              style={{ 
                transform: `translateY(${scrollY * 0.05}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="images-container">
                {/* Main Image */}
                <div className="main-image">
                  <img 
                    src="/src/assets/images/hero-img3.jpg" 
                    alt="Habit Building" 
                    className="main-img"
                  />
                  <div className="image-overlay"></div>
                </div>

                {/* Floating Card */}
                <div className="floating-card">
                  <div className="card-content">
                    <div className="card-icon">
                      <span>✨</span>
                    </div>
                    <div className="card-text">
                      <h4>Habit | Spark</h4>
                      <p>Your Habit Partner</p>
                    </div>
                  </div>
                </div>

                {/* Secondary Image */}
                <div className="secondary-image">
                  <img 
                    src="/src/assets/images/hero-img1.jpg" 
                    alt="Progress Tracking" 
                    className="secondary-img"
                  />
                  <div className="secondary-overlay"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          {/* Section Header */}
          <div className="section-header">
            <div className="header-badge">
              <span>✨</span>
              <span>What you get!</span>
            </div>
            <h2 className="section-title">
              Powerful Features for<br />
              <span className="title-gradient">Habit Success</span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            {[
              {
                image: '/src/assets/images/hero-img5.jpg',
                title: 'Habit Tutorials',
                description: 'Learn about effective strategies, common pitfalls, and the science behind habit formation to help you create lasting positive changes in your life.',
                icon: '🎓',
                gradient: 'blue-cyan'
              },
              {
                image: '/src/assets/images/hero-img4.jpg',
                title: 'Stay Organized',
                description: 'Stay organized and on track with our editable habits and goals feature combined with a to-do list. Easily set, edit, and update your habits.',
                icon: '📋',
                gradient: 'emerald-green'
              },
              {
                image: '/src/assets/images/hero-img2.jpg',
                title: 'Progress Visualization',
                description: 'Progress visualization helps users see their habit tracking data in a clear and engaging manner. Stay motivated with visual insights.',
                icon: '📊',
                gradient: 'purple-pink'
              },
              {
                image: '/src/assets/images/hero-img7.jpg',
                title: 'Responsive Design',
                description: 'Ensuring an optimal viewing experience across all devices, from desktops to smartphones with flexible layouts and adaptive elements.',
                icon: '📱',
                gradient: 'orange-amber'
              },
              {
                image: '/src/assets/images/hero-img8.jpg',
                title: 'Privacy & Security',
                description: 'We prioritize your privacy and security by implementing robust measures to ensure your data remains safe with high security standards.',
                icon: '🔒',
                gradient: 'red-pink'
              },
              {
                image: '/src/assets/images/hero-img6.jpg',
                title: 'Smart Analytics',
                description: 'Get detailed insights into your habit patterns, success rates, and areas for improvement with our advanced analytics dashboard.',
                icon: '🧠',
                gradient: 'indigo-purple'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`feature-card gradient-${feature.gradient} magnetic-element`}
                style={{ 
                  transform: `translateY(${scrollY * 0.02 * (index + 1)}px) ${isMouseMoving ? `translate(${(mousePosition.x - window.innerWidth/2) * 0.005}px, ${(mousePosition.y - window.innerHeight/2) * 0.005}px)` : ''}`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                {/* Image */}
                <div className="feature-image">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="feature-img"
                  />
                  <div className="feature-image-overlay"></div>
                  {/* Floating Icon */}
                  <div className="feature-icon">
                    <span>{feature.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>

                {/* Hover Effect */}
                <div className="feature-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <Logo size="large" showText={true} className="footer-brand" />
            <div className="social-links">
              {[
                { icon: '📷', platform: 'Instagram' },
                { icon: '👻', platform: 'Snapchat' },
                { icon: '🐦', platform: 'Twitter' },
                { icon: '📘', platform: 'Facebook' },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="social-link"
                >
                  <span>{social.icon}</span>
                </a>
              ))}
            </div>
            <p className="footer-email">
              <span>✉️</span> habitspark01@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing