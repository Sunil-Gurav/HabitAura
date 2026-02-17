const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator')
require('dotenv').config()

const app = express()

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://habit-aura-coral.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all for now
    }
  },
  credentials: true
}))

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Database connection
console.log('Attempting to connect to MongoDB:', process.env.MONGODB_URI || 'mongodb://localhost:27017/habitspark1')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitspark1')
  .then(() => {
    console.log('✅ Connected to MongoDB database successfully')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message)
    console.log('Server will continue without database connection')
  })

// ==================== MODELS ====================

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      habitReminders: { type: Boolean, default: true },
      goalDeadlines: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      streakMilestones: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['private', 'friends', 'public'], default: 'private' },
      shareProgress: { type: Boolean, default: false },
      allowFriendRequests: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: false }
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'dark' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
      weekStartsOn: { type: String, enum: ['sunday', 'monday'], default: 'monday' }
    },
    account: {
      twoFactorEnabled: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

const User = mongoose.model('User', userSchema)

// Habit Schema
const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  category: {
    type: String,
    enum: ['personal', 'health', 'productivity', 'study', 'fitness'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  goal: {
    type: String,
    trim: true,
    maxlength: [200, 'Goal cannot exceed 200 characters']
  },
  reminderTime: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streak: {
    type: Number,
    default: 0
  },
  completions: [{
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Calculate streak method with detailed status
habitSchema.methods.calculateStreak = function() {
  if (!this.completions || this.completions.length === 0) {
    this.streak = 0
    this.streakStatus = {
      current: 0,
      isBroken: false,
      lastCompleted: null,
      message: 'Start your streak by completing this habit today!'
    }
    return { streak: 0, status: this.streakStatus }
  }

  // Sort completions by date (newest first)
  const sortedCompletions = this.completions
    .map(c => new Date(c.date).toDateString())
    .sort((a, b) => new Date(b) - new Date(a))

  // Remove duplicates (same day completions)
  const uniqueDates = [...new Set(sortedCompletions)]

  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  const lastCompletedDate = uniqueDates[0]
  const lastCompleted = new Date(lastCompletedDate)
  const daysSinceLastCompletion = Math.floor((new Date() - lastCompleted) / (1000 * 60 * 60 * 24))

  let streakStatus = {
    current: 0,
    isBroken: false,
    lastCompleted: lastCompletedDate,
    daysSinceLastCompletion,
    message: ''
  }

  // Check if completed today or yesterday to start counting
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    streak = 1
    let currentDate = new Date(uniqueDates[0])
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      
      if (uniqueDates[i] === prevDate.toDateString()) {
        streak++
        currentDate = new Date(uniqueDates[i])
      } else {
        break
      }
    }

    streakStatus.current = streak
    streakStatus.isBroken = false
    
    if (uniqueDates[0] === today) {
      streakStatus.message = `Great! You're on a ${streak} day streak! Keep it up! 🔥`
    } else {
      streakStatus.message = `You have a ${streak} day streak! Complete today to continue! 💪`
    }
  } else {
    // Streak is broken
    streakStatus.current = 0
    streakStatus.isBroken = true
    
    if (daysSinceLastCompletion === 1) {
      streakStatus.message = `Streak ended! You missed yesterday. Your previous streak was ${this.streak} days. Start fresh today! 🌟`
    } else if (daysSinceLastCompletion > 1) {
      streakStatus.message = `Streak ended ${daysSinceLastCompletion} days ago due to inactivity. Your previous streak was ${this.streak} days. Time to rebuild! 💪`
    }
  }

  this.streak = streak
  this.streakStatus = streakStatus
  return { streak, status: streakStatus }
}

// Add streak status field to schema
habitSchema.add({
  streakStatus: {
    current: { type: Number, default: 0 },
    isBroken: { type: Boolean, default: false },
    lastCompleted: { type: String },
    daysSinceLastCompletion: { type: Number, default: 0 },
    message: { type: String, default: '' }
  },
  lastStreakValue: { type: Number, default: 0 } // Store previous streak before it breaks
})

const Habit = mongoose.model('Habit', habitSchema)

// Goal Schema
const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Goal title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['personal', 'health', 'productivity', 'study', 'fitness', 'career', 'financial'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetValue: {
    type: Number,
    required: [true, 'Target value is required'],
    min: [1, 'Target value must be at least 1']
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    maxlength: [20, 'Unit cannot exceed 20 characters']
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  relatedHabits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit'
  }],
  milestones: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Milestone title cannot exceed 100 characters']
    },
    targetValue: {
      type: Number,
      required: true,
      min: [0, 'Milestone target value cannot be negative']
    },
    completedAt: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  progressHistory: [{
    value: {
      type: Number,
      required: true,
      min: [0, 'Progress value cannot be negative']
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Calculate progress percentage
goalSchema.methods.getProgressPercentage = function() {
  if (this.targetValue === 0) return 0
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100)
}

// Calculate days remaining
goalSchema.methods.getDaysRemaining = function() {
  const today = new Date()
  const targetDate = new Date(this.targetDate)
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Check if goal is overdue
goalSchema.methods.isOverdue = function() {
  return new Date() > new Date(this.targetDate) && this.status !== 'completed'
}

// Auto-update status based on progress and date
goalSchema.pre('save', function(next) {
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed'
  }
  next()
})

const Goal = mongoose.model('Goal', goalSchema)

// Reward Schema
const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Reward title is required'],
    trim: true,
    maxlength: [100, 'Reward title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['entertainment', 'food', 'shopping', 'experience', 'relaxation', 'social', 'other'],
    default: 'other'
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Points required is mandatory'],
    min: [1, 'Points required must be at least 1']
  },
  isRedeemed: {
    type: Boolean,
    default: false
  },
  redeemedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  imageUrl: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Reward = mongoose.model('Reward', rewardSchema)

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Journal entry title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Journal entry content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
    required: [true, 'Mood is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  habitReflections: [{
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit'
    },
    reflection: {
      type: String,
      maxlength: [500, 'Reflection cannot exceed 500 characters']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  goalReflections: [{
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    reflection: {
      type: String,
      maxlength: [500, 'Reflection cannot exceed 500 characters']
    },
    progress: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  gratitude: [{
    type: String,
    trim: true,
    maxlength: [200, 'Gratitude item cannot exceed 200 characters']
  }],
  challenges: [{
    type: String,
    trim: true,
    maxlength: [200, 'Challenge cannot exceed 200 characters']
  }],
  achievements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  }],
  tomorrowGoals: [{
    type: String,
    trim: true,
    maxlength: [200, 'Tomorrow goal cannot exceed 200 characters']
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema)

// User Points Schema (for reward system)
const userPointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: [0, 'Available points cannot be negative']
  },
  pointsHistory: [{
    action: {
      type: String,
      enum: ['earned', 'redeemed', 'bonus', 'penalty'],
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    },
    relatedType: {
      type: String,
      enum: ['habit', 'goal', 'reward', 'streak', 'manual']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Method to add points
userPointsSchema.methods.addPoints = function(points, description, relatedId = null, relatedType = 'manual') {
  this.totalPoints += points
  this.availablePoints += points
  this.pointsHistory.push({
    action: 'earned',
    points,
    description,
    relatedId,
    relatedType,
    date: new Date()
  })
  return this.save()
}

// Method to redeem points
userPointsSchema.methods.redeemPoints = function(points, description, relatedId = null) {
  if (this.availablePoints < points) {
    throw new Error('Insufficient points')
  }
  this.availablePoints -= points
  this.pointsHistory.push({
    action: 'redeemed',
    points: -points,
    description,
    relatedId,
    relatedType: 'reward',
    date: new Date()
  })
  return this.save()
}

const UserPoints = mongoose.model('UserPoints', userPointsSchema)

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'reset'],
    default: 'registration'
  },
  userData: {
    username: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // OTP expires after 10 minutes
  }
})

const OTP = mongoose.model('OTP', otpSchema)

// ==================== UTILITY FUNCTIONS ====================

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  console.log('Attempting to send email to:', email)
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'HabitSpark - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #081b29 0%, #0a1a2e 100%); color: white; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ef; margin: 0; font-size: 2.5rem; text-shadow: 0 0 20px rgba(14, 239, 255, 0.5);">HabitSpark</h1>
          <p style="color: #fff; margin: 10px 0; opacity: 0.9;">Build a Better Habit, Build a Better Life</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; border: 1px solid rgba(14, 239, 255, 0.3);">
          <h2 style="color: #0ef; text-align: center; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #fff; line-height: 1.6; margin-bottom: 25px;">
            Welcome to HabitSpark! Please verify your email using the OTP below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(45deg, #0ef, #00d4ff); padding: 15px 30px; border-radius: 10px; font-size: 2rem; font-weight: bold; color: #081b29; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #fff; line-height: 1.6;">
            This OTP is valid for <strong style="color: #0ef;">10 minutes</strong>. Please do not share this code.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #aaa; font-size: 0.8rem;">© 2024 HabitSpark. All rights reserved.</p>
        </div>
      </div>
    `
  }

  try {
    console.log('Sending email...')
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
    return { success: true, message: 'OTP sent successfully' }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, message: 'Failed to send OTP email' }
  }
}

// Send Reset Password OTP email
const sendResetOTPEmail = async (email, otp) => {
  console.log('Attempting to send reset password email to:', email)
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'HabitSpark - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #081b29 0%, #0a1a2e 100%); color: white; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ef; margin: 0; font-size: 2.5rem; text-shadow: 0 0 20px rgba(14, 239, 255, 0.5);">HabitSpark</h1>
          <p style="color: #fff; margin: 10px 0; opacity: 0.9;">Build a Better Habit, Build a Better Life</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; border: 1px solid rgba(239, 68, 68, 0.3);">
          <h2 style="color: #ef4444; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #fff; line-height: 1.6; margin-bottom: 25px;">
            You requested to reset your password. Use the OTP below to proceed:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(45deg, #ef4444, #dc2626); padding: 15px 30px; border-radius: 10px; font-size: 2rem; font-weight: bold; color: white; letter-spacing: 5px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #fff; line-height: 1.6;">
            This OTP is valid for <strong style="color: #ef4444;">10 minutes</strong>. If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #aaa; font-size: 0.8rem;">© 2024 HabitSpark. All rights reserved.</p>
        </div>
      </div>
    `
  }

  try {
    console.log('Sending reset password email...')
    await transporter.sendMail(mailOptions)
    console.log('Reset password email sent successfully')
    return { success: true, message: 'Reset OTP sent successfully' }
  } catch (error) {
    console.error('Reset email sending error:', error)
    return { success: false, message: 'Failed to send reset OTP email' }
  }
}

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

// ==================== REWARDS ROUTES ====================

// Get user's rewards
app.get('/api/rewards', auth, async (req, res) => {
  try {
    const { category, redeemed } = req.query
    
    const filter = { user: req.user._id, isActive: true }
    
    if (category && category !== 'all') {
      filter.category = category
    }
    
    if (redeemed !== undefined) {
      filter.isRedeemed = redeemed === 'true'
    }

    const rewards = await Reward.find(filter).sort({ createdAt: -1 })
    
    // Get user points
    let userPoints = await UserPoints.findOne({ user: req.user._id })
    if (!userPoints) {
      userPoints = new UserPoints({ user: req.user._id })
      await userPoints.save()
    }

    res.json({ 
      rewards,
      userPoints: {
        total: userPoints.totalPoints,
        available: userPoints.availablePoints
      }
    })
  } catch (error) {
    console.error('Get rewards error:', error)
    res.status(500).json({ message: 'Server error while fetching rewards' })
  }
})

// Create new reward
app.post('/api/rewards', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reward title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['entertainment', 'food', 'shopping', 'experience', 'relaxation', 'social', 'other'])
    .withMessage('Invalid category'),
  body('cost')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('pointsRequired')
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { title, description, category, cost, pointsRequired, priority, imageUrl } = req.body

    const reward = new Reward({
      title,
      description,
      category: category || 'other',
      cost: cost || 0,
      pointsRequired,
      priority: priority || 'medium',
      imageUrl,
      user: req.user._id
    })

    await reward.save()
    
    res.status(201).json({
      message: 'Reward created successfully',
      reward
    })
  } catch (error) {
    console.error('Create reward error:', error)
    res.status(500).json({ message: 'Server error while creating reward' })
  }
})

// Redeem reward
app.post('/api/rewards/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true,
      isRedeemed: false
    })

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found or already redeemed' })
    }

    // Get user points
    let userPoints = await UserPoints.findOne({ user: req.user._id })
    if (!userPoints) {
      userPoints = new UserPoints({ user: req.user._id })
      await userPoints.save()
    }

    // Check if user has enough points
    if (userPoints.availablePoints < reward.pointsRequired) {
      return res.status(400).json({ 
        message: 'Insufficient points',
        required: reward.pointsRequired,
        available: userPoints.availablePoints
      })
    }

    // Redeem points
    await userPoints.redeemPoints(
      reward.pointsRequired, 
      `Redeemed reward: ${reward.title}`,
      reward._id
    )

    // Mark reward as redeemed
    reward.isRedeemed = true
    reward.redeemedAt = new Date()
    await reward.save()

    res.json({
      message: 'Reward redeemed successfully',
      reward,
      remainingPoints: userPoints.availablePoints
    })
  } catch (error) {
    console.error('Redeem reward error:', error)
    res.status(500).json({ message: 'Server error while redeeming reward' })
  }
})

// Update reward
app.put('/api/rewards/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reward title must be between 1 and 100 characters'),
  body('pointsRequired')
    .optional()
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const reward = await Reward.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' })
    }

    // Don't allow editing redeemed rewards
    if (reward.isRedeemed) {
      return res.status(400).json({ message: 'Cannot edit redeemed rewards' })
    }

    const { title, description, category, cost, pointsRequired, priority, imageUrl } = req.body

    if (title !== undefined) reward.title = title
    if (description !== undefined) reward.description = description
    if (category !== undefined) reward.category = category
    if (cost !== undefined) reward.cost = cost
    if (pointsRequired !== undefined) reward.pointsRequired = pointsRequired
    if (priority !== undefined) reward.priority = priority
    if (imageUrl !== undefined) reward.imageUrl = imageUrl

    await reward.save()

    res.json({
      message: 'Reward updated successfully',
      reward
    })
  } catch (error) {
    console.error('Update reward error:', error)
    res.status(500).json({ message: 'Server error while updating reward' })
  }
})

// Delete reward
app.delete('/api/rewards/:id', auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' })
    }

    // Don't allow deleting redeemed rewards
    if (reward.isRedeemed) {
      return res.status(400).json({ message: 'Cannot delete redeemed rewards' })
    }

    reward.isActive = false
    await reward.save()

    res.json({ message: 'Reward deleted successfully' })
  } catch (error) {
    console.error('Delete reward error:', error)
    res.status(500).json({ message: 'Server error while deleting reward' })
  }
})

// Get user points and history
app.get('/api/rewards/points', auth, async (req, res) => {
  try {
    let userPoints = await UserPoints.findOne({ user: req.user._id })
    if (!userPoints) {
      userPoints = new UserPoints({ user: req.user._id })
      await userPoints.save()
    }

    // Get recent history (last 50 entries)
    const recentHistory = userPoints.pointsHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50)

    res.json({
      totalPoints: userPoints.totalPoints,
      availablePoints: userPoints.availablePoints,
      history: recentHistory
    })
  } catch (error) {
    console.error('Get points error:', error)
    res.status(500).json({ message: 'Server error while fetching points' })
  }
})

// ==================== JOURNAL ROUTES ====================

// Get user's journal entries
app.get('/api/journal', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, mood, tag, startDate, endDate } = req.query
    
    const filter = { user: req.user._id, isActive: true }
    
    if (mood && mood !== 'all') {
      filter.mood = mood
    }
    
    if (tag) {
      filter.tags = { $in: [tag] }
    }
    
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const entries = await JournalEntry.find(filter)
      .populate('habitReflections.habit', 'name category')
      .populate('goalReflections.goal', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await JournalEntry.countDocuments(filter)

    res.json({ 
      entries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    })
  } catch (error) {
    console.error('Get journal entries error:', error)
    res.status(500).json({ message: 'Server error while fetching journal entries' })
  }
})

// Create new journal entry
app.post('/api/journal', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('mood')
    .isIn(['excellent', 'good', 'neutral', 'bad', 'terrible'])
    .withMessage('Invalid mood value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('gratitude')
    .optional()
    .isArray()
    .withMessage('Gratitude must be an array'),
  body('challenges')
    .optional()
    .isArray()
    .withMessage('Challenges must be an array'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('tomorrowGoals')
    .optional()
    .isArray()
    .withMessage('Tomorrow goals must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { 
      title, 
      content, 
      mood, 
      tags, 
      habitReflections, 
      goalReflections,
      gratitude,
      challenges,
      achievements,
      tomorrowGoals,
      isPrivate 
    } = req.body

    const journalEntry = new JournalEntry({
      title,
      content,
      mood,
      tags: tags || [],
      habitReflections: habitReflections || [],
      goalReflections: goalReflections || [],
      gratitude: gratitude || [],
      challenges: challenges || [],
      achievements: achievements || [],
      tomorrowGoals: tomorrowGoals || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      user: req.user._id
    })

    await journalEntry.save()
    await journalEntry.populate('habitReflections.habit', 'name category')
    await journalEntry.populate('goalReflections.goal', 'title category')

    // Award points for journaling
    let userPoints = await UserPoints.findOne({ user: req.user._id })
    if (!userPoints) {
      userPoints = new UserPoints({ user: req.user._id })
    }
    
    await userPoints.addPoints(
      10, 
      'Daily journal entry',
      journalEntry._id,
      'manual'
    )
    
    res.status(201).json({
      message: 'Journal entry created successfully',
      entry: journalEntry,
      pointsEarned: 10
    })
  } catch (error) {
    console.error('Create journal entry error:', error)
    res.status(500).json({ message: 'Server error while creating journal entry' })
  }
})

// Update journal entry
app.put('/api/journal/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'neutral', 'bad', 'terrible'])
    .withMessage('Invalid mood value')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const entry = await JournalEntry.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' })
    }

    const { 
      title, 
      content, 
      mood, 
      tags, 
      habitReflections, 
      goalReflections,
      gratitude,
      challenges,
      achievements,
      tomorrowGoals,
      isPrivate 
    } = req.body

    if (title !== undefined) entry.title = title
    if (content !== undefined) entry.content = content
    if (mood !== undefined) entry.mood = mood
    if (tags !== undefined) entry.tags = tags
    if (habitReflections !== undefined) entry.habitReflections = habitReflections
    if (goalReflections !== undefined) entry.goalReflections = goalReflections
    if (gratitude !== undefined) entry.gratitude = gratitude
    if (challenges !== undefined) entry.challenges = challenges
    if (achievements !== undefined) entry.achievements = achievements
    if (tomorrowGoals !== undefined) entry.tomorrowGoals = tomorrowGoals
    if (isPrivate !== undefined) entry.isPrivate = isPrivate

    await entry.save()
    await entry.populate('habitReflections.habit', 'name category')
    await entry.populate('goalReflections.goal', 'title category')

    res.json({
      message: 'Journal entry updated successfully',
      entry
    })
  } catch (error) {
    console.error('Update journal entry error:', error)
    res.status(500).json({ message: 'Server error while updating journal entry' })
  }
})

// Delete journal entry
app.delete('/api/journal/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' })
    }

    entry.isActive = false
    await entry.save()

    res.json({ message: 'Journal entry deleted successfully' })
  } catch (error) {
    console.error('Delete journal entry error:', error)
    res.status(500).json({ message: 'Server error while deleting journal entry' })
  }
})

// Get journal analytics
app.get('/api/journal/analytics', auth, async (req, res) => {
  try {
    const userId = req.user._id
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const entries = await JournalEntry.find({ 
      user: userId, 
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    })

    const analytics = {
      totalEntries: entries.length,
      averageMood: 0,
      moodDistribution: {
        excellent: 0,
        good: 0,
        neutral: 0,
        bad: 0,
        terrible: 0
      },
      topTags: [],
      writingStreak: 0,
      entriesThisWeek: 0,
      averageContentLength: 0
    }

    if (entries.length > 0) {
      // Mood distribution and average
      const moodValues = { terrible: 1, bad: 2, neutral: 3, good: 4, excellent: 5 }
      let totalMoodValue = 0

      entries.forEach(entry => {
        analytics.moodDistribution[entry.mood]++
        totalMoodValue += moodValues[entry.mood]
      })

      analytics.averageMood = Math.round((totalMoodValue / entries.length) * 100) / 100

      // Top tags
      const tagCounts = {}
      entries.forEach(entry => {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      analytics.topTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))

      // Entries this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      analytics.entriesThisWeek = entries.filter(entry => 
        new Date(entry.createdAt) >= oneWeekAgo
      ).length

      // Average content length
      const totalLength = entries.reduce((sum, entry) => sum + entry.content.length, 0)
      analytics.averageContentLength = Math.round(totalLength / entries.length)

      // Calculate writing streak
      const sortedEntries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      let streak = 0
      let currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)

      for (let entry of sortedEntries) {
        const entryDate = new Date(entry.createdAt)
        entryDate.setHours(0, 0, 0, 0)
        
        if (entryDate.getTime() === currentDate.getTime()) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (entryDate.getTime() === currentDate.getTime() + 24 * 60 * 60 * 1000) {
          // Entry from yesterday, continue streak
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }

      analytics.writingStreak = streak
    }

    res.json(analytics)
  } catch (error) {
    console.error('Get journal analytics error:', error)
    res.status(500).json({ message: 'Server error while fetching journal analytics' })
  }
})

// ==================== GOAL ROUTES ====================

// Get user's goals
app.get('/api/goals', auth, async (req, res) => {
  try {
    const { status, category, priority } = req.query
    
    // Build filter object
    const filter = { user: req.user._id, isActive: true }
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (category && category !== 'all') {
      filter.category = category
    }
    
    if (priority) {
      filter.priority = priority
    }

    const goals = await Goal.find(filter)
      .populate('relatedHabits', 'name category')
      .sort({ createdAt: -1 })

    res.json({ goals })
  } catch (error) {
    console.error('Get goals error:', error)
    res.status(500).json({ message: 'Server error while fetching goals' })
  }
})

// Create new goal
app.post('/api/goals', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Goal title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['personal', 'health', 'productivity', 'study', 'fitness', 'career', 'financial'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('targetValue')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Target value must be a number greater than 0'),
  body('unit')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),
  body('targetDate')
    .isISO8601()
    .withMessage('Target date must be a valid date'),
  body('relatedHabits')
    .optional()
    .isArray()
    .withMessage('Related habits must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { 
      title, 
      description, 
      category, 
      priority, 
      targetValue, 
      unit, 
      targetDate, 
      relatedHabits,
      milestones 
    } = req.body

    // Validate target date is in the future
    if (new Date(targetDate) <= new Date()) {
      return res.status(400).json({ message: 'Target date must be in the future' })
    }

    const goal = new Goal({
      title,
      description,
      category: category || 'personal',
      priority: priority || 'medium',
      targetValue,
      unit,
      targetDate,
      relatedHabits: relatedHabits || [],
      milestones: milestones || [],
      user: req.user._id
    })

    await goal.save()
    await goal.populate('relatedHabits', 'name category')
    
    res.status(201).json({
      message: 'Goal created successfully',
      goal
    })
  } catch (error) {
    console.error('Create goal error:', error)
    res.status(500).json({ message: 'Server error while creating goal' })
  }
})

// Update goal progress
app.put('/api/goals/:id/progress', [
  auth,
  body('value')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Progress value must be a number greater than or equal to 0'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const goal = await Goal.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    const { value, notes } = req.body

    // Update current value
    goal.currentValue = value

    // Add to progress history
    goal.progressHistory.push({
      value,
      notes: notes || '',
      date: new Date()
    })

    // Check and update milestone completion
    goal.milestones.forEach(milestone => {
      if (!milestone.isCompleted && value >= milestone.targetValue) {
        milestone.isCompleted = true
        milestone.completedAt = new Date()
      }
    })

    await goal.save()
    await goal.populate('relatedHabits', 'name category')

    res.json({
      message: 'Goal progress updated successfully',
      goal
    })
  } catch (error) {
    console.error('Update goal progress error:', error)
    res.status(500).json({ message: 'Server error while updating goal progress' })
  }
})

// Update goal
app.put('/api/goals/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Goal title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['personal', 'health', 'productivity', 'study', 'fitness', 'career', 'financial'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('targetValue')
    .optional()
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Target value must be a number greater than 0'),
  body('unit')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid date'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const goal = await Goal.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    const { 
      title, 
      description, 
      category, 
      priority, 
      targetValue, 
      unit, 
      targetDate, 
      status,
      relatedHabits,
      milestones 
    } = req.body

    // Validate target date is in the future (if provided)
    if (targetDate && new Date(targetDate) <= new Date()) {
      return res.status(400).json({ message: 'Target date must be in the future' })
    }

    // Update only provided fields
    if (title !== undefined) goal.title = title
    if (description !== undefined) goal.description = description
    if (category !== undefined) goal.category = category
    if (priority !== undefined) goal.priority = priority
    if (targetValue !== undefined) goal.targetValue = targetValue
    if (unit !== undefined) goal.unit = unit
    if (targetDate !== undefined) goal.targetDate = targetDate
    if (status !== undefined) goal.status = status
    if (relatedHabits !== undefined) goal.relatedHabits = relatedHabits
    if (milestones !== undefined) goal.milestones = milestones

    await goal.save()
    await goal.populate('relatedHabits', 'name category')

    res.json({
      message: 'Goal updated successfully',
      goal
    })
  } catch (error) {
    console.error('Update goal error:', error)
    res.status(500).json({ message: 'Server error while updating goal' })
  }
})

// Delete goal
app.delete('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    // Soft delete
    goal.isActive = false
    await goal.save()

    res.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Delete goal error:', error)
    res.status(500).json({ message: 'Server error while deleting goal' })
  }
})

// Get goal analytics
app.get('/api/goals/analytics', auth, async (req, res) => {
  try {
    const userId = req.user._id

    // Get all user goals
    const goals = await Goal.find({ user: userId, isActive: true })

    const analytics = {
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      overdueGoals: goals.filter(g => g.isOverdue()).length,
      averageProgress: 0,
      categoryBreakdown: {},
      priorityBreakdown: {},
      upcomingDeadlines: [],
      recentAchievements: []
    }

    if (goals.length > 0) {
      // Calculate average progress
      const totalProgress = goals.reduce((sum, goal) => sum + goal.getProgressPercentage(), 0)
      analytics.averageProgress = Math.round(totalProgress / goals.length)

      // Category breakdown
      goals.forEach(goal => {
        const category = goal.category
        if (!analytics.categoryBreakdown[category]) {
          analytics.categoryBreakdown[category] = {
            total: 0,
            completed: 0,
            averageProgress: 0
          }
        }
        analytics.categoryBreakdown[category].total++
        if (goal.status === 'completed') {
          analytics.categoryBreakdown[category].completed++
        }
      })

      // Calculate average progress per category
      Object.keys(analytics.categoryBreakdown).forEach(category => {
        const categoryGoals = goals.filter(g => g.category === category)
        const categoryProgress = categoryGoals.reduce((sum, goal) => sum + goal.getProgressPercentage(), 0)
        analytics.categoryBreakdown[category].averageProgress = Math.round(categoryProgress / categoryGoals.length)
      })

      // Priority breakdown
      goals.forEach(goal => {
        const priority = goal.priority
        analytics.priorityBreakdown[priority] = (analytics.priorityBreakdown[priority] || 0) + 1
      })

      // Upcoming deadlines (next 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      analytics.upcomingDeadlines = goals
        .filter(goal => 
          goal.status === 'active' && 
          new Date(goal.targetDate) <= thirtyDaysFromNow &&
          new Date(goal.targetDate) >= new Date()
        )
        .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
        .slice(0, 5)
        .map(goal => ({
          id: goal._id,
          title: goal.title,
          targetDate: goal.targetDate,
          daysRemaining: goal.getDaysRemaining(),
          progress: goal.getProgressPercentage()
        }))

      // Recent achievements (completed goals in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      analytics.recentAchievements = goals
        .filter(goal => 
          goal.status === 'completed' && 
          new Date(goal.updatedAt) >= thirtyDaysAgo
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(goal => ({
          id: goal._id,
          title: goal.title,
          completedAt: goal.updatedAt,
          category: goal.category
        }))
    }

    res.json(analytics)
  } catch (error) {
    console.error('Get goal analytics error:', error)
    res.status(500).json({ message: 'Server error while fetching goal analytics' })
  }
})

// ==================== HABIT ROUTES ====================

// Get habit analytics
app.get('/api/habits/analytics', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query
    const userId = req.user._id

    // Calculate date range based on period
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get all user habits
    const habits = await Habit.find({ user: userId, isActive: true })

    // Calculate analytics
    const analytics = {
      totalHabits: habits.length,
      totalCompletions: 0,
      averageStreak: 0,
      completionsByDay: {},
      topPerformingHabits: [],
      completionRate: 0,
      weeklyData: [],
      monthlyTrend: [],
      categoryBreakdown: {},
      insights: {
        bestPerformanceDay: 'Wednesday',
        optimalTime: 'morning',
        improvementCategory: 'fitness'
      }
    }

    let totalStreaks = 0
    let completionsInPeriod = 0
    let possibleCompletions = 0
    let completionsByDayOfWeek = {}

    habits.forEach(habit => {
      // Calculate streak for each habit
      habit.calculateStreak()
      totalStreaks += habit.streak

      // Count completions in period
      const habitCompletionsInPeriod = habit.completions.filter(completion => 
        new Date(completion.date) >= startDate
      ).length

      completionsInPeriod += habitCompletionsInPeriod
      analytics.totalCompletions += habit.completions.length

      // Calculate possible completions based on habit frequency and period
      const daysInPeriod = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
      let possibleForThisHabit = daysInPeriod

      if (habit.frequency === 'weekly') {
        possibleForThisHabit = Math.ceil(daysInPeriod / 7)
      } else if (habit.frequency === 'monthly') {
        possibleForThisHabit = Math.ceil(daysInPeriod / 30)
      }

      possibleCompletions += possibleForThisHabit

      // Group completions by day for chart data
      habit.completions.forEach(completion => {
        const date = new Date(completion.date)
        const dateKey = date.toDateString()
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
        
        analytics.completionsByDay[dateKey] = (analytics.completionsByDay[dateKey] || 0) + 1
        completionsByDayOfWeek[dayOfWeek] = (completionsByDayOfWeek[dayOfWeek] || 0) + 1
      })

      // Category breakdown
      const category = habit.category
      if (!analytics.categoryBreakdown[category]) {
        analytics.categoryBreakdown[category] = {
          count: 0,
          completions: 0,
          averageStreak: 0
        }
      }
      analytics.categoryBreakdown[category].count++
      analytics.categoryBreakdown[category].completions += habit.completions.length
      analytics.categoryBreakdown[category].averageStreak += habit.streak
    })

    // Calculate category averages
    Object.keys(analytics.categoryBreakdown).forEach(category => {
      const data = analytics.categoryBreakdown[category]
      data.averageStreak = Math.round(data.averageStreak / data.count)
    })

    // Calculate averages
    analytics.averageStreak = habits.length > 0 ? Math.round(totalStreaks / habits.length) : 0
    analytics.completionRate = possibleCompletions > 0 ? Math.round((completionsInPeriod / possibleCompletions) * 100) : 0

    // Generate weekly data for bar chart (last 7 days)
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    analytics.weeklyData = weekDays.map(day => {
      const dayDate = new Date()
      const dayIndex = weekDays.indexOf(day)
      const currentDayIndex = (dayDate.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
      const daysBack = (currentDayIndex - dayIndex + 7) % 7
      dayDate.setDate(dayDate.getDate() - daysBack)
      
      const dateKey = dayDate.toDateString()
      const completions = analytics.completionsByDay[dateKey] || 0
      
      return {
        day: day.substring(0, 3), // Mon, Tue, etc.
        completions,
        percentage: habits.length > 0 ? Math.round((completions / habits.length) * 100) : 0
      }
    })

    // Generate monthly trend data (last 4 weeks)
    analytics.monthlyTrend = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7) - 6)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - (i * 7))
      
      let weekCompletions = 0
      Object.keys(analytics.completionsByDay).forEach(dateKey => {
        const date = new Date(dateKey)
        if (date >= weekStart && date <= weekEnd) {
          weekCompletions += analytics.completionsByDay[dateKey]
        }
      })
      
      const weeklyPossible = habits.length * 7
      const weeklyRate = weeklyPossible > 0 ? Math.round((weekCompletions / weeklyPossible) * 100) : 0
      
      analytics.monthlyTrend.push({
        week: `Week ${4 - i}`,
        completionRate: weeklyRate,
        completions: weekCompletions
      })
    }

    // Find best performance day
    let bestDay = 'Wednesday'
    let maxCompletions = 0
    Object.keys(completionsByDayOfWeek).forEach(day => {
      if (completionsByDayOfWeek[day] > maxCompletions) {
        maxCompletions = completionsByDayOfWeek[day]
        bestDay = day
      }
    })
    analytics.insights.bestPerformanceDay = bestDay

    // Find category that needs improvement (lowest completion rate)
    let lowestCategory = 'fitness'
    let lowestRate = 100
    Object.keys(analytics.categoryBreakdown).forEach(category => {
      const data = analytics.categoryBreakdown[category]
      const rate = data.count > 0 ? (data.completions / data.count) : 0
      if (rate < lowestRate) {
        lowestRate = rate
        lowestCategory = category
      }
    })
    analytics.insights.improvementCategory = lowestCategory

    // Get top performing habits (by completion rate in period)
    analytics.topPerformingHabits = habits
      .map(habit => {
        const completionsInPeriod = habit.completions.filter(completion => 
          new Date(completion.date) >= startDate
        ).length
        
        const daysInPeriod = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
        let possibleForThisHabit = daysInPeriod

        if (habit.frequency === 'weekly') {
          possibleForThisHabit = Math.ceil(daysInPeriod / 7)
        } else if (habit.frequency === 'monthly') {
          possibleForThisHabit = Math.ceil(daysInPeriod / 30)
        }

        const completionRate = possibleForThisHabit > 0 ? (completionsInPeriod / possibleForThisHabit) * 100 : 0

        return {
          name: habit.name,
          completionRate: Math.round(completionRate),
          streak: habit.streak,
          totalCompletions: habit.completions.length
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5)

    res.json(analytics)

  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Server error while fetching analytics' })
  }
})

// Get user's habits
app.get('/api/habits', auth, async (req, res) => {
  try {
    const { category, priority, frequency } = req.query
    
    // Build filter object
    const filter = { user: req.user._id, isActive: true }
    
    if (category && category !== 'all') {
      filter.category = category
    }
    
    if (priority) {
      filter.priority = priority
    }
    
    if (frequency) {
      filter.frequency = frequency
    }

    const habits = await Habit.find(filter)
      .sort({ createdAt: -1 })

    // Calculate streaks for all habits and check for broken streaks
    const habitsWithStatus = habits.map(habit => {
      const { streak, status } = habit.calculateStreak()
      
      // If streak was broken, store the previous streak value
      if (status.isBroken && habit.streak > 0 && habit.lastStreakValue !== habit.streak) {
        habit.lastStreakValue = habit.streak
      }
      
      return habit
    })

    // Save all habits with updated streak status
    await Promise.all(habitsWithStatus.map(habit => habit.save()))
    
    res.json({ habits: habitsWithStatus })
  } catch (error) {
    console.error('Get habits error:', error)
    res.status(500).json({ message: 'Server error while fetching habits' })
  }
})

// Create new habit
app.post('/api/habits', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  body('category')
    .optional()
    .isIn(['personal', 'health', 'productivity', 'study', 'fitness'])
    .withMessage('Category must be personal, health, productivity, study, or fitness'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('goal')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Goal cannot exceed 200 characters'),
  body('reminderTime')
    .optional()
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, description, frequency, category, priority, goal, reminderTime } = req.body

    const habit = new Habit({
      name,
      description,
      frequency: frequency || 'daily',
      category: category || 'personal',
      priority: priority || 'medium',
      goal,
      reminderTime,
      user: req.user._id
    })

    await habit.save()
    
    res.status(201).json({
      message: 'Habit created successfully',
      habit
    })
  } catch (error) {
    console.error('Create habit error:', error)
    res.status(500).json({ message: 'Server error while creating habit' })
  }
})

// Mark habit as complete
app.post('/api/habits/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    // Check if already completed today
    const today = new Date().toDateString()
    const alreadyCompleted = habit.completions.some(completion => 
      new Date(completion.date).toDateString() === today
    )

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Habit already completed today' })
    }

    // Store previous streak before adding new completion
    const previousStreak = habit.streak || 0

    // Add completion
    habit.completions.push({
      date: new Date(),
      notes: req.body.notes || ''
    })

    // Calculate and update streak
    const { streak, status } = habit.calculateStreak()
    await habit.save()

    // Award points for habit completion
    let userPoints = await UserPoints.findOne({ user: req.user._id })
    if (!userPoints) {
      userPoints = new UserPoints({ user: req.user._id })
    }

    let pointsEarned = 5 // Base points for habit completion
    let bonusMessages = []
    
    // Bonus points for streaks
    if (streak >= 7) {
      pointsEarned += 5
      bonusMessages.push('7-day streak bonus: +5 points')
    }
    if (streak >= 30) {
      pointsEarned += 10
      bonusMessages.push('30-day streak bonus: +10 points')
    }
    if (streak >= 100) {
      pointsEarned += 20
      bonusMessages.push('100-day streak bonus: +20 points')
    }

    // Priority bonus
    if (habit.priority === 'high') {
      pointsEarned += 3
      bonusMessages.push('High priority bonus: +3 points')
    } else if (habit.priority === 'medium') {
      pointsEarned += 1
      bonusMessages.push('Medium priority bonus: +1 point')
    }

    // Streak recovery bonus (if user is rebuilding after a break)
    if (previousStreak === 0 && streak === 1) {
      pointsEarned += 2
      bonusMessages.push('Fresh start bonus: +2 points')
    }

    await userPoints.addPoints(
      pointsEarned,
      `Completed habit: ${habit.name}${streak > 1 ? ` (${streak} day streak)` : ''}`,
      habit._id,
      'habit'
    )

    res.json({
      message: 'Habit marked as complete',
      habit,
      pointsEarned,
      bonusMessages,
      streakInfo: {
        current: streak,
        previous: previousStreak,
        isNew: streak === 1 && previousStreak === 0,
        isContinued: streak > previousStreak,
        message: status.message
      }
    })
  } catch (error) {
    console.error('Complete habit error:', error)
    res.status(500).json({ message: 'Server error while completing habit' })
  }
})

// Update habit
app.put('/api/habits/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  body('category')
    .optional()
    .isIn(['personal', 'health', 'productivity', 'study', 'fitness'])
    .withMessage('Category must be personal, health, productivity, study, or fitness'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('goal')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Goal cannot exceed 200 characters'),
  body('reminderTime')
    .optional()
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    const { name, description, frequency, category, priority, goal, reminderTime } = req.body

    // Update only provided fields
    if (name !== undefined) habit.name = name
    if (description !== undefined) habit.description = description
    if (frequency !== undefined) habit.frequency = frequency
    if (category !== undefined) habit.category = category
    if (priority !== undefined) habit.priority = priority
    if (goal !== undefined) habit.goal = goal
    if (reminderTime !== undefined) habit.reminderTime = reminderTime

    await habit.save()

    res.json({
      message: 'Habit updated successfully',
      habit
    })
  } catch (error) {
    console.error('Update habit error:', error)
    res.status(500).json({ message: 'Server error while updating habit' })
  }
})

// Delete habit
app.delete('/api/habits/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    // Soft delete
    habit.isActive = false
    await habit.save()

    res.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('Delete habit error:', error)
    res.status(500).json({ message: 'Server error while deleting habit' })
  }
})

// Get habit statistics
app.get('/api/habits/:id/stats', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true 
    })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    const stats = {
      totalCompletions: habit.completions.length,
      currentStreak: habit.calculateStreak(),
      completionsThisWeek: habit.completions.filter(c => {
        const completionDate = new Date(c.date)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return completionDate >= weekAgo
      }).length,
      completionsThisMonth: habit.completions.filter(c => {
        const completionDate = new Date(c.date)
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return completionDate >= monthAgo
      }).length
    }

    res.json({ stats })
  } catch (error) {
    console.error('Get habit stats error:', error)
    res.status(500).json({ message: 'Server error while fetching habit statistics' })
  }
})

// ==================== AUTH ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HabitSpark API is running',
    timestamp: new Date().toISOString()
  })
})

// Send OTP for registration
app.post('/api/auth/send-otp', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_ ]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    console.log('Send OTP request received:', req.body)
    
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { username, email, password } = req.body
    console.log('Processing OTP for:', { username, email })

    // Check if user already exists
    console.log('Checking if user exists...')
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Username is already taken'
      })
    }

    // Generate OTP
    console.log('Generating OTP...')
    const otp = generateOTP()
    console.log('Generated OTP:', otp)

    // Delete any existing OTP for this email
    console.log('Deleting existing OTPs...')
    await OTP.deleteMany({ email })

    // Store OTP and user data temporarily
    console.log('Storing OTP in database...')
    const otpDoc = new OTP({
      email,
      otp,
      type: 'registration',
      userData: { username, email, password }
    })
    await otpDoc.save()
    console.log('OTP stored successfully')

    // Send OTP email
    console.log('Sending OTP email...')
    const emailResult = await sendOTPEmail(email, otp)
    console.log('Email result:', emailResult)
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult)
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    console.log('OTP sent successfully to:', email)
    res.json({
      message: 'OTP sent successfully to your email',
      email: email
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ message: 'Server error while sending OTP' })
  }
})

// Verify OTP and register user
app.post('/api/auth/verify-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    console.log('OTP verification request:', req.body)
    
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, otp } = req.body

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp, type: 'registration' })
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Extract user data from OTP record
    const { username, password } = otpRecord.userData

    // Create new user
    const user = new User({
      username,
      email,
      password,
      isEmailVerified: true
    })

    await user.save()
    console.log('User registered successfully:', email)

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      message: 'Email verified and user registered successfully',
      token,
      user: user.getPublicProfile()
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    res.status(500).json({ message: 'Server error during OTP verification' })
  }
})

// User login
app.post('/api/auth/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('Login request for:', req.body.email)
    
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    console.log('Login successful for:', email)
    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Forgot Password - Send OTP
app.post('/api/auth/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    console.log('Forgot password request for:', req.body.email)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User with this email does not exist' })
    }

    // Generate OTP
    const otp = generateOTP()

    // Delete any existing reset OTP for this email
    await OTP.deleteMany({ email, type: 'reset' })

    // Store reset OTP
    const otpDoc = new OTP({
      email,
      otp,
      type: 'reset',
      userData: { email }
    })
    await otpDoc.save()

    // Send OTP email
    const emailResult = await sendResetOTPEmail(email, otp)
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send reset OTP email' })
    }

    res.json({
      message: 'Password reset OTP sent to your email',
      email: email
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error while processing forgot password request' })
  }
})

// Verify Reset OTP
app.post('/api/auth/verify-reset-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, otp } = req.body

    // Find reset OTP record
    const otpRecord = await OTP.findOne({ email, otp, type: 'reset' })
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    res.json({ message: 'OTP verified successfully' })

  } catch (error) {
    console.error('Reset OTP verification error:', error)
    res.status(500).json({ message: 'Server error during OTP verification' })
  }
})

// Reset Password
app.post('/api/auth/reset-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, otp, newPassword } = req.body

    // Verify OTP one more time
    const otpRecord = await OTP.findOne({ email, otp, type: 'reset' })
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Find user and update password
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    user.password = newPassword
    await user.save()

    // Delete the reset OTP record
    await OTP.deleteOne({ _id: otpRecord._id })

    console.log('Password reset successful for:', email)
    res.json({ message: 'Password reset successfully' })

  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ message: 'Server error during password reset' })
  }
})
// Get user profile
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user settings
app.get('/api/auth/settings', auth, async (req, res) => {
  try {
    // Return default settings if user doesn't have custom settings
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        habitReminders: true,
        goalDeadlines: true,
        weeklyReports: true,
        achievements: true,
        streakMilestones: true
      },
      privacy: {
        profileVisibility: 'private',
        shareProgress: false,
        allowFriendRequests: true,
        showOnlineStatus: false
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStartsOn: 'monday'
      },
      account: {
        twoFactorEnabled: false,
        emailVerified: req.user.isEmailVerified || false,
        phoneVerified: false
      }
    }

    res.json({
      settings: req.user.settings || defaultSettings
    })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ message: 'Server error while fetching settings' })
  }
})

// Update user settings
app.put('/api/auth/settings', auth, async (req, res) => {
  try {
    const settingsUpdate = req.body

    // Initialize settings if not exists
    if (!req.user.settings) {
      req.user.settings = {
        notifications: {},
        privacy: {},
        preferences: {},
        account: {}
      }
    }

    // Deep merge settings - handle nested objects properly
    Object.keys(settingsUpdate).forEach(category => {
      if (typeof settingsUpdate[category] === 'object' && !Array.isArray(settingsUpdate[category])) {
        // Merge nested objects (notifications, privacy, preferences, account)
        req.user.settings[category] = {
          ...req.user.settings[category],
          ...settingsUpdate[category]
        }
      } else {
        // Direct assignment for non-object values
        req.user.settings[category] = settingsUpdate[category]
      }
    })

    // Mark the settings field as modified for Mongoose
    req.user.markModified('settings')
    
    await req.user.save()

    res.json({
      message: 'Settings updated successfully',
      settings: req.user.settings
    })
  } catch (error) {
    console.error('Update settings error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({ 
      message: 'Server error while updating settings',
      error: error.message 
    })
  }
})

// Export user data
app.get('/api/auth/export-data', auth, async (req, res) => {
  try {
    const userId = req.user._id

    // Get all user data
    const [habits, goals, rewards, journalEntries, userPoints] = await Promise.all([
      Habit.find({ user: userId, isActive: true }),
      Goal.find({ user: userId, isActive: true }).populate('relatedHabits', 'name category'),
      Reward.find({ user: userId, isActive: true }),
      JournalEntry.find({ user: userId, isActive: true }).populate('habitReflections.habit goalReflections.goal', 'name title category'),
      UserPoints.findOne({ user: userId })
    ])

    const exportData = {
      user: req.user.getPublicProfile(),
      habits,
      goals,
      rewards,
      journalEntries,
      points: userPoints || { totalPoints: 0, availablePoints: 0, pointsHistory: [] },
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    res.json(exportData)
  } catch (error) {
    console.error('Export data error:', error)
    res.status(500).json({ message: 'Server error while exporting data' })
  }
})

// Update user profile
app.put('/api/auth/profile', [
  auth,
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_ ]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and spaces'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('website')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true
      try {
        new URL(value)
        return true
      } catch {
        throw new Error('Please enter a valid website URL (e.g., https://example.com)')
      }
    }),
  body('phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') return true
      // Allow various phone formats
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(value)) {
        throw new Error('Phone number can only contain digits, spaces, and +()-')
      }
      // Check minimum length (at least 10 digits)
      const digitsOnly = value.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        throw new Error('Phone number must contain at least 10 digits')
      }
      return true
    })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { 
      username, 
      email, 
      firstName, 
      lastName, 
      bio, 
      avatar, 
      phone, 
      location, 
      website, 
      birthDate 
    } = req.body

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      })

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' })
      }
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      })

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' })
      }
    }

    // Update user fields
    if (username !== undefined) req.user.username = username
    if (email !== undefined) req.user.email = email
    if (firstName !== undefined) req.user.firstName = firstName
    if (lastName !== undefined) req.user.lastName = lastName
    if (bio !== undefined) req.user.bio = bio
    if (avatar !== undefined) req.user.avatar = avatar
    if (phone !== undefined) req.user.phone = phone
    if (location !== undefined) req.user.location = location
    if (website !== undefined) req.user.website = website
    if (birthDate !== undefined) req.user.birthDate = birthDate ? new Date(birthDate) : null

    await req.user.save()

    res.json({
      message: 'Profile updated successfully',
      user: req.user.getPublicProfile()
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error while updating profile' })
  }
})

// Change password
app.put('/api/auth/change-password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Update password
    req.user.password = newPassword
    await req.user.save()

    res.json({ message: 'Password changed successfully' })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error while changing password' })
  }
})

// Delete account
app.delete('/api/auth/account', [
  auth,
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { password } = req.body

    // Verify password
    const isMatch = await req.user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' })
    }

    // Delete user's habits first
    await Habit.deleteMany({ user: req.user._id })

    // Delete user
    await User.findByIdAndDelete(req.user._id)

    res.json({ message: 'Account deleted successfully' })

  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ message: 'Server error while deleting account' })
  }
})

// Logout user
app.post('/api/auth/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// Root route - Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'HabitSpark API is running',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'HabitSpark API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      habits: '/api/habits/*',
      goals: '/api/goals/*',
      rewards: '/api/rewards/*',
      journal: '/api/journal/*'
    }
  })
})

// 404 handler - Must be last
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app
} else {
  // For local development
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`)
  })
}