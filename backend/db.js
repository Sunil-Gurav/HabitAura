// MongoDB connection for serverless
const mongoose = require('mongoose')

let cachedConnection = null

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection')
    return cachedConnection
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitspark1'
    
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    cachedConnection = connection
    console.log('✅ New MongoDB connection established')
    return connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    throw error
  }
}

module.exports = connectDB
