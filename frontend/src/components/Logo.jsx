import logoImage from '../assets/logo.png'
import './Logo.css'

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  className = '',
  onClick = null 
}) => {
  return (
    <div 
      className={`logo-wrapper logo-${size} ${className} ${onClick ? 'logo-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="logo-image-container">
        <img 
          src={logoImage}
          alt="HabitSpark Logo" 
          className="logo-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        <div className="logo-fallback">
          <span className="logo-fallback-text">H</span>
        </div>
      </div>
      {showText && (
        <span className="logo-text">
          HabitSpark
        </span>
      )}
    </div>
  )
}

export default Logo