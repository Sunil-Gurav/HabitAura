import axios from 'axios'
import API_URL from '../config/api'
import '../assets/login.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import SignUp from './SignupForm'
import logo from '../assets/logo.png'
import logSvg from '../assets/log.svg'
import registerSvg from '../assets/register.svg'

const Auth = () => {
  const navigate = useNavigate()
  const [clsName, setCls] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [pendingUserData, setPendingUserData] = useState(null)

  // Mouse tracking for enhanced animations
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function handleClick(cls) {
    if (cls === true) {
      setCls(true)
    } else {
      setCls(false)
    }
  }

  const loginForm = async (email, password) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        password: password
      })
      
      let accessToken = response.data.token
      localStorage.setItem('accessToken', accessToken)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 100)
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        alert('Cannot connect to server. Please make sure the backend server is running on port 5000.')
      } else {
        alert(error.response?.data?.message || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }
  const signUp = async (username, email, password) => {
    setIsLoading(true)
    try {
      console.log('Attempting to send OTP to:', email) // Debug log
      
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        username: username,
        email: email,
        password: password
      })
      
      console.log('OTP response:', response.data) // Debug log
      setPendingUserData({ username, email, password })
      
      // Show OTP if available in response (for testing)
      if (response.data.otp) {
        alert(`OTP sent to your email.\n\nFor testing: Your OTP is ${response.data.otp}\n\nPlease check your inbox or use this OTP.`)
      } else {
        alert('OTP sent to your email. Please check your inbox.')
      }
      return true
    } catch (error) {
      console.error('Signup error:', error) // Debug log
      console.error('Error response:', error.response?.data) // Debug log
      console.error('Full error object:', error) // Debug log
      
      // More specific error messages
      if (error.code === 'ECONNREFUSED') {
        alert('Cannot connect to server. Please make sure the backend server is running on port 5000.')
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid input data')
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.message || 'Server error. Please try again later.'
        alert(`Server Error: ${errorMsg}`)
        console.error('500 Error details:', error.response?.data)
      } else {
        alert(error.response?.data?.message || 'Registration failed. Please check if the server is running.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (email, otp) => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: email,
        otp: otp
      })
      
      let accessToken = response.data.token
      localStorage.setItem('accessToken', accessToken)
      
      alert('Email verified and registration successful!')
      setPendingUserData(null)
      
      // Reset the form state
      setCls(false) // Switch back to login view
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 100)
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        alert('Cannot connect to server. Please make sure the backend server is running on port 5000.')
      } else {
        alert(error.response?.data?.message || 'OTP verification failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async (email) => {
    if (!pendingUserData) return
    
    setIsLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, pendingUserData)
      alert('OTP resent to your email')
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        alert('Cannot connect to server. Please make sure the backend server is running on port 5000.')
      } else {
        alert(error.response?.data?.message || 'Failed to resend OTP')
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className={`${clsName ? 'container sign-up-mode' : 'container'}`}>
      <div className='forms-container'>
        <div className='signin-signup'>
          <LoginForm loginForm={loginForm} isLoading={isLoading} logo={logo} />
          <SignUp 
            key={clsName ? 'signup' : 'signup-hidden'} // Force re-render when switching
            signUp={signUp} 
            verifyOTP={verifyOTP}
            resendOTP={resendOTP}
            isLoading={isLoading}
            logo={logo}
          />
        </div>
      </div>

      <div className='panels-container'>
        <div className='panel left-panel'>
          <div className='content'>
            <div className="panel-logo">
              <img src={logo} alt="HabitSpark Logo" />
              <h2>HabitSpark</h2>
            </div>
            <h3>Welcome</h3>
            <p>Don't have an account?</p>
            <button
              className='btn transparent'
              id='sign-up-btn'
              onClick={() => handleClick(true)}
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
          <img src={logSvg} className='image' alt='Login illustration' />
        </div>
        <div className='panel right-panel'>
          <div className='content'>
            <div className="panel-logo">
              <img src={logo} alt="HabitSpark Logo" />
              <h2>HabitSpark</h2>
            </div>
            <h3>Welcome</h3>
            <p>Already have an account?</p>
            <button
              className='btn transparent'
              id='sign-in-btn'
              onClick={() => handleClick(false)}
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
          <img src={registerSvg} className='image' alt='Register illustration' />
        </div>
      </div>
    </div>
  )
}

export default Auth