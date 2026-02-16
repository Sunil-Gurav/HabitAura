import { useRef, useState, useEffect } from 'react'

const SignUp = ({ signUp, verifyOTP, resendOTP, isLoading, logo }) => {
  const username = useRef()
  const email = useRef()
  const password = useRef()
  const otp = useRef()
  
  const [step, setStep] = useState(1) // 1: signup form, 2: OTP verification
  const [userEmail, setUserEmail] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  const validateUsername = (username) => {
    if (!username || username.length < 3) {
      return 'Username must be at least 3 characters long'
    }
    if (username.length > 30) {
      return 'Username cannot exceed 30 characters'
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and spaces'
    }
    return null
  }

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const resetForm = () => {
    if (username.current) username.current.value = ''
    if (email.current) email.current.value = ''
    if (password.current) password.current.value = ''
    if (otp.current) otp.current.value = ''
    setStep(1)
    setUserEmail('')
  }

  // Reset form when component mounts
  useEffect(() => {
    resetForm()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const usernameError = validateUsername(username.current.value)
    const emailError = validateEmail(email.current.value)
    const passwordError = validatePassword(password.current.value)
    
    const errors = {}
    if (usernameError) errors.username = usernameError
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
    
    setValidationErrors(errors)
    
    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return
    }
    
    const emailValue = email.current.value
    setUserEmail(emailValue)
    
    // Send OTP and move to step 2
    const success = await signUp(username.current.value, emailValue, password.current.value)
    if (success) {
      setStep(2)
    }
  }

  const handleInputChange = (field, value) => {
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleOTPVerification = (e) => {
    e.preventDefault()
    verifyOTP(userEmail, otp.current.value)
  }

  const handleResendOTP = () => {
    resendOTP(userEmail)
  }

  const goBackToSignup = () => {
    setStep(1)
    // Clear OTP field when going back
    if (otp.current) {
      otp.current.value = ''
    }
  }

  // Reset form when component mounts or when switching between login/signup
  const handleFormReset = () => {
    resetForm()
  }

  return (
    <div className='sign-up-form'>
      <div className="form-logo">
        <img src={logo} alt="HabitSpark Logo" />
      </div>
      {/* <h1 className='tit'>HabitSpark</h1> */}
      <p className='tit'>
        <b>
          Build a Better Habit, <br />
          Build a Better Life
        </b>
      </p>
      
      {step === 1 ? (
        <>
          <h4 className='title'>Sign up</h4>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className='input-field'>
              <i className='fas fa-user'></i>
              <input
                type='text'
                id='signup-name'
                name='signup-name'
                placeholder='Username'
                ref={username}
                required
                disabled={isLoading}
                autoComplete="off"
                onChange={(e) => handleInputChange('username', e.target.value)}
                style={{
                  borderColor: validationErrors.username ? '#ff4757' : '#2c4766'
                }}
              />
              {validationErrors.username && (
                <div className="validation-error">{validationErrors.username}</div>
              )}
            </div>
            <div className='input-field'>
              <i className='fas fa-envelope'></i>
              <input
                type='email'
                id='signup-email'
                name='signup-email'
                placeholder='Email'
                ref={email}
                required
                disabled={isLoading}
                autoComplete="off"
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  borderColor: validationErrors.email ? '#ff4757' : '#2c4766'
                }}
              />
              {validationErrors.email && (
                <div className="validation-error">{validationErrors.email}</div>
              )}
            </div>
            <div className='input-field'>
              <i className='fas fa-lock'></i>
              <input
                type='password'
                id='signup-password'
                name='signup-password'
                placeholder='Password'
                ref={password}
                required
                disabled={isLoading}
                autoComplete="new-password"
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={{
                  borderColor: validationErrors.password ? '#ff4757' : '#2c4766'
                }}
              />
              {validationErrors.password && (
                <div className="validation-error">{validationErrors.password}</div>
              )}
            </div>
            <input 
              type='submit' 
              className='btn' 
              id='submit' 
              value={isLoading ? 'Sending OTP...' : 'Send OTP'} 
              disabled={isLoading}
            />
          </form>
        </>
      ) : (
        <>
          <h4 className='title'>Verify Email</h4>
          <p className='otp-message'>
            We've sent a 6-digit OTP to <br />
            <strong>{userEmail}</strong>
          </p>
          <form onSubmit={handleOTPVerification} autoComplete="off">
            <div className='input-field'>
              <i className='fas fa-key'></i>
              <input
                type='text'
                id='signup-otp'
                name='signup-otp'
                placeholder='Enter 6-digit OTP'
                ref={otp}
                maxLength='6'
                required
                disabled={isLoading}
                autoComplete="off"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6)
                }}
              />
            </div>
            <input 
              type='submit' 
              className='btn' 
              id='verify-otp' 
              value={isLoading ? 'Verifying...' : 'Verify & Sign Up'} 
              disabled={isLoading}
            />
            <button 
              type='button' 
              className='btn transparent resend-btn' 
              onClick={handleResendOTP}
              disabled={isLoading}
            >
              Resend OTP
            </button>
            <button 
              type='button' 
              className='btn transparent back-btn' 
              onClick={goBackToSignup}
              disabled={isLoading}
            >
              Back to Sign Up
            </button>
          </form>
        </>
      )}
      
      <div className='social-media'></div>
    </div>
  )
}

export default SignUp