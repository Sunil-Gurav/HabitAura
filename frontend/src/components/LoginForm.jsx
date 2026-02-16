import { useRef, useState } from 'react'
import ForgotPassword from './ForgotPassword'

const LoginForm = ({ loginForm, isLoading, logo }) => {
  const email = useRef()
  const password = useRef()
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    loginForm(email.current.value, password.current.value)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className='sign-in-form' autoComplete="off">
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
        <h4 className='title'>Login</h4>

        <div className='input-field'>
          <i className='fas fa-user'></i>
          <input
            type='email'
            placeholder='Email'
            ref={email}
            required
            disabled={isLoading}
          />
        </div>

        <div className='input-field'>
          <i className='fas fa-lock'></i>
          <input
            type='password'
            placeholder='Password'
            ref={password}
            required
            disabled={isLoading}
          />
        </div>

        <a 
          href="#" 
          className='for'
          onClick={(e) => {
            e.preventDefault()
            setShowForgotPassword(true)
          }}
        >
          Forgot Your Password
        </a>

        <input 
          type='submit' 
          value={isLoading ? 'Logging in...' : 'Login'} 
          className='btn solid' 
          disabled={isLoading}
        />
      </form>

      <ForgotPassword 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  )
}

export default LoginForm
