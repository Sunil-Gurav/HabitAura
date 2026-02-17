// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://habit-aura-one.vercel.app' 
    : 'http://localhost:5000')

export default API_URL
