import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config/api'
import Sidebar from './Sidebar'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeCategory, setActiveCategory] = useState('all')
  const [editingHabit, setEditingHabit] = useState(null)
  const [showEditHabit, setShowEditHabit] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [goals, setGoals] = useState([])
  const [goalAnalytics, setGoalAnalytics] = useState(null)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressGoal, setProgressGoal] = useState(null)
  const [activeGoalCategory, setActiveGoalCategory] = useState('all')
  const [activeGoalStatus, setActiveGoalStatus] = useState('all')
  const [streakNotifications, setStreakNotifications] = useState([])
  const [showStreakNotification, setShowStreakNotification] = useState(false)
  const [reminderNotifications, setReminderNotifications] = useState([])
  const [showReminderNotification, setShowReminderNotification] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    targetValue: '',
    unit: '',
    targetDate: '',
    relatedHabits: [],
    milestones: []
  })
  const [progressUpdate, setProgressUpdate] = useState({
    value: '',
    notes: ''
  })
  const [rewards, setRewards] = useState([])
  const [userPoints, setUserPoints] = useState({ total: 0, available: 0 })
  const [pointsHistory, setPointsHistory] = useState([])
  const [showAddReward, setShowAddReward] = useState(false)
  const [showEditReward, setShowEditReward] = useState(false)
  const [editingReward, setEditingReward] = useState(null)
  const [activeRewardCategory, setActiveRewardCategory] = useState('all')
  const [showRedeemed, setShowRedeemed] = useState(false)
  const [journalEntries, setJournalEntries] = useState([])
  const [journalAnalytics, setJournalAnalytics] = useState(null)
  const [showAddJournal, setShowAddJournal] = useState(false)
  const [showEditJournal, setShowEditJournal] = useState(false)
  const [editingJournal, setEditingJournal] = useState(null)
  const [journalPagination, setJournalPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [journalFilters, setJournalFilters] = useState({ mood: 'all', tag: '', page: 1 })
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    category: 'other',
    cost: '',
    pointsRequired: '',
    priority: 'medium',
    imageUrl: ''
  })
  const [newJournal, setNewJournal] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
    habitReflections: [],
    goalReflections: [],
    gratitude: [''],
    challenges: [''],
    achievements: [''],
    tomorrowGoals: [''],
    isPrivate: true
  })
  const [newHabit, setNewHabit] = useState({ 
    name: '', 
    description: '', 
    frequency: 'daily',
    category: 'personal',
    reminderTime: '',
    goal: '',
    priority: 'medium'
  })

  // Settings state
  const [userSettings, setUserSettings] = useState({
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
      emailVerified: true,
      phoneVerified: false
    }
  })
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    avatar: '',
    phone: '',
    location: '',
    website: '',
    birthDate: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: '',
    confirmation: ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const [dailyAnalytics, setDailyAnalytics] = useState({
    completed: 0,
    pending: 0,
    total: 0,
    percentage: 0
  })
  const [weeklyChartData, setWeeklyChartData] = useState([])
  const [monthlyChartData, setMonthlyChartData] = useState([])

  const quotes = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. - Aristotle"
  ]

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission)
        })
      } else {
        setNotificationPermission(Notification.permission)
      }
    }
  }, [])

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Try to play custom sound first
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {
        // If custom sound fails, use browser beep
        const context = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(context.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)
        
        oscillator.start(context.currentTime)
        oscillator.stop(context.currentTime + 0.5)
      })
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  // Show browser notification
  const showBrowserNotification = (title, body, icon = '🔔') => {
    if (notificationPermission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'habit-reminder',
          requireInteraction: false,
          silent: false
        })
        playNotificationSound()
      } catch (error) {
        console.log('Could not show browser notification:', error)
      }
    }
  }

  // Check for habit reminders
  const checkHabitReminders = () => {
    if (!habits || habits.length === 0) return

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const remindersToShow = []

    habits.forEach(habit => {
      if (habit.reminderTime && !isHabitCompletedToday(habit)) {
        // Check if current time matches reminder time (within 1 minute)
        if (habit.reminderTime === currentTime) {
          remindersToShow.push({
            id: habit._id,
            habitName: habit.name,
            reminderTime: habit.reminderTime,
            streak: habit.streak || 0,
            priority: habit.priority
          })
        }
      }
    })

    if (remindersToShow.length > 0) {
      setReminderNotifications(remindersToShow)
      setShowReminderNotification(true)
      
      // Show browser notification for each reminder
      remindersToShow.forEach(reminder => {
        showBrowserNotification(
          `⏰ Habit Reminder: ${reminder.habitName}`,
          `Time to complete your habit! Current streak: ${reminder.streak} days`,
          '⏰'
        )
      })

      // Auto-hide after 30 seconds
      setTimeout(() => {
        setShowReminderNotification(false)
      }, 30000)
    }
  }

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkHabitReminders()
    }, 60000) // Check every minute

    // Check immediately on mount
    checkHabitReminders()

    return () => clearInterval(interval)
  }, [habits])

  // Check for missed habits at midnight
  const checkMissedHabits = () => {
    if (!habits || habits.length === 0) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    const missedHabits = habits.filter(habit => {
      if (habit.frequency !== 'daily') return false
      
      const lastCompletion = habit.completions && habit.completions.length > 0
        ? new Date(habit.completions[habit.completions.length - 1].date).toDateString()
        : null

      return lastCompletion !== yesterdayStr && lastCompletion !== new Date().toDateString()
    })

    if (missedHabits.length > 0) {
      missedHabits.forEach(habit => {
        showBrowserNotification(
          `⚠️ Habit Missed: ${habit.name}`,
          `You missed this habit yesterday. Your ${habit.streak} day streak may be at risk!`,
          '⚠️'
        )
      })
    }
  }

  // Check for missed habits once per day at midnight
  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    
    const timeUntilMidnight = midnight - now

    const timeout = setTimeout(() => {
      checkMissedHabits()
      
      // Set up daily interval
      const interval = setInterval(() => {
        checkMissedHabits()
      }, 24 * 60 * 60 * 1000) // Every 24 hours

      return () => clearInterval(interval)
    }, timeUntilMidnight)

    return () => clearTimeout(timeout)
  }, [habits])

  const fetchHabits = async (category = 'all') => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()
      if (category !== 'all') {
        params.append('category', category)
      }
      
      const response = await axios.get(`${API_URL}/api/habits?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const fetchedHabits = response.data.habits
      
      // Check for broken streaks and show notifications
      const brokenStreaks = fetchedHabits.filter(habit => 
        habit.streakStatus && habit.streakStatus.isBroken && habit.lastStreakValue > 0
      )
      
      if (brokenStreaks.length > 0) {
        const notifications = brokenStreaks.map(habit => ({
          id: habit._id,
          habitName: habit.name,
          message: habit.streakStatus.message,
          previousStreak: habit.lastStreakValue,
          daysSince: habit.streakStatus.daysSinceLastCompletion
        }))
        
        setStreakNotifications(notifications)
        setShowStreakNotification(true)
        
        // Auto-hide notification after 10 seconds
        setTimeout(() => {
          setShowStreakNotification(false)
        }, 10000)
      }
      
      setHabits(fetchedHabits)
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/habits/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchGoals = async (category = 'all', status = 'all') => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()
      if (category !== 'all') {
        params.append('category', category)
      }
      if (status !== 'all') {
        params.append('status', status)
      }
      
      const response = await axios.get(`${API_URL}/api/goals?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGoals(response.data.goals)
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  const fetchGoalAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/goals/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGoalAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching goal analytics:', error)
    }
  }

  const fetchRewards = async (category = 'all', redeemed = false) => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()
      if (category !== 'all') {
        params.append('category', category)
      }
      params.append('redeemed', redeemed.toString())
      
      const response = await axios.get(`${API_URL}/api/rewards?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRewards(response.data.rewards)
      setUserPoints(response.data.userPoints)
    } catch (error) {
      console.error('Error fetching rewards:', error)
    }
  }

  const fetchPointsHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/rewards/points`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPointsHistory(response.data.history)
      setUserPoints({
        total: response.data.totalPoints,
        available: response.data.availablePoints
      })
    } catch (error) {
      console.error('Error fetching points history:', error)
    }
  }

  const fetchJournalEntries = async (filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const response = await axios.get(`${API_URL}/api/journal?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setJournalEntries(response.data.entries)
      setJournalPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    }
  }

  const fetchJournalAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/journal/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setJournalAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching journal analytics:', error)
    }
  }

  // Settings API functions
  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/auth/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.settings) {
        setUserSettings(response.data.settings)
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    }
  }

  const updateUserSettings = async (settingsUpdate) => {
    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`${API_URL}/api/auth/settings`, settingsUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Deep merge settings
      setUserSettings(prev => {
        const updated = { ...prev }
        Object.keys(settingsUpdate).forEach(key => {
          if (typeof settingsUpdate[key] === 'object' && !Array.isArray(settingsUpdate[key])) {
            updated[key] = { ...prev[key], ...settingsUpdate[key] }
          } else {
            updated[key] = settingsUpdate[key]
          }
        })
        return updated
      })
      
      // Apply theme changes immediately
      if (settingsUpdate.preferences?.theme) {
        const theme = settingsUpdate.preferences.theme
        if (theme === 'dark') {
          setDarkMode(true)
          localStorage.setItem('darkMode', 'true')
        } else if (theme === 'light') {
          setDarkMode(false)
          localStorage.setItem('darkMode', 'false')
        }
      }
      
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings. Please try again.')
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(profileData.email)) {
        alert('Please enter a valid email address')
        return
      }
      
      // Prepare data - only send non-empty fields
      const dataToSend = {
        username: profileData.username,
        email: profileData.email,
        firstName: profileData.firstName || undefined,
        lastName: profileData.lastName || undefined,
        bio: profileData.bio || undefined,
        avatar: profileData.avatar || undefined,
        location: profileData.location || undefined,
        birthDate: profileData.birthDate || undefined
      }
      
      // Only add phone if it's not empty and looks valid
      if (profileData.phone && profileData.phone.trim() !== '') {
        // Remove spaces and special characters for validation
        const cleanPhone = profileData.phone.replace(/[\s\-\(\)]/g, '')
        if (cleanPhone.length >= 10) {
          dataToSend.phone = profileData.phone
        }
      }
      
      // Only add website if it's not empty and is a valid URL
      if (profileData.website && profileData.website.trim() !== '') {
        try {
          new URL(profileData.website)
          dataToSend.website = profileData.website
        } catch {
          alert('Please enter a valid website URL (e.g., https://example.com)')
          return
        }
      }
      
      // Remove undefined values
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined || dataToSend[key] === '') {
          delete dataToSend[key]
        }
      })
      
      const response = await axios.put(`${API_URL}/api/auth/profile`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setUser(response.data.user)
      setShowProfileEdit(false)
      setImagePreview(null)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error details:', error.response?.data)
      
      // Show detailed error message
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join('\n')
        alert('Validation errors:\n' + errorMessages)
      } else {
        alert(error.response?.data?.message || 'Error updating profile. Please try again.')
      }
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setProfileData({ ...profileData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setProfileData({ ...profileData, avatar: '' })
  }

  const changePassword = async (e) => {
    e.preventDefault()
    
    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      alert('New password must be different from current password')
      return
    }
    
    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordChange(false)
      alert('Password changed successfully! Please login again with your new password.')
      
      // Optional: Auto logout after password change for security
      setTimeout(() => {
        handleLogout()
      }, 2000)
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error.response?.data?.message || 'Error changing password. Please check your current password.')
    }
  }

  const deleteAccount = async (e) => {
    e.preventDefault()
    
    if (deleteAccountData.confirmation !== 'DELETE') {
      alert('Please type "DELETE" exactly to confirm account deletion')
      return
    }
    
    if (!deleteAccountData.password || deleteAccountData.password.trim() === '') {
      alert('Please enter your password to confirm')
      return
    }
    
    // Final confirmation
    const finalConfirm = window.confirm(
      '⚠️ FINAL WARNING ⚠️\n\n' +
      'This will permanently delete:\n' +
      `• ${habits.length} habits\n` +
      `• ${goals.length} goals\n` +
      `• ${journalAnalytics?.totalEntries || 0} journal entries\n` +
      `• ${analytics?.totalCompletions || 0} completions\n` +
      `• ${userPoints.total} points\n\n` +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure?'
    )
    
    if (!finalConfirm) {
      return
    }
    
    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(`${API_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deleteAccountData.password }
      })
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('darkMode')
      alert('Account deleted successfully. We\'re sorry to see you go!')
      navigate('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert(error.response?.data?.message || 'Error deleting account. Please check your password.')
    }
  }

  const exportData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      // Show loading state
      const exportBtn = document.querySelector('.export-btn')
      if (exportBtn) {
        exportBtn.disabled = true
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...'
      }
      
      const response = await axios.get(`${API_URL}/api/auth/export-data`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Create formatted JSON with metadata
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        user: {
          username: user?.username,
          email: user?.email,
          memberSince: user?.createdAt
        },
        statistics: {
          totalHabits: habits.length,
          totalGoals: goals.length,
          totalJournalEntries: journalAnalytics?.totalEntries || 0,
          totalCompletions: analytics?.totalCompletions || 0,
          totalPoints: userPoints.total
        },
        data: response.data
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `habitspark-backup-${user?.username}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Reset button
      if (exportBtn) {
        exportBtn.disabled = false
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data'
      }
      
      alert('✅ Data exported successfully!\n\nYour backup file has been downloaded.')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('❌ Error exporting data. Please try again.')
      
      // Reset button on error
      const exportBtn = document.querySelector('.export-btn')
      if (exportBtn) {
        exportBtn.disabled = false
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data'
      }
    }
  }

  // Handle notification permission request
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          alert('✅ Notifications enabled! You will now receive habit reminders.')
          // Update settings
          await updateUserSettings({
            notifications: { ...userSettings.notifications, push: true }
          })
        } else {
          alert('❌ Notifications blocked. You can enable them in your browser settings.')
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    }
  }

  // Test notification
  const testNotification = () => {
    if (notificationPermission === 'granted') {
      showBrowserNotification(
        '🔔 Test Notification',
        'This is a test notification from HabitSpark! Your notifications are working perfectly.',
        '✅'
      )
    } else {
      alert('Please enable notifications first')
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setUser(response.data.user)
        
        // Initialize profile data
        setProfileData({
          username: response.data.user.username || '',
          email: response.data.user.email || '',
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          bio: response.data.user.bio || '',
          avatar: response.data.user.avatar || '',
          phone: response.data.user.phone || '',
          location: response.data.user.location || '',
          website: response.data.user.website || '',
          birthDate: response.data.user.birthDate ? new Date(response.data.user.birthDate).toISOString().split('T')[0] : ''
        })
        
        await fetchHabits()
        await fetchAnalytics()
        await fetchGoals()
        await fetchGoalAnalytics()
        await fetchRewards()
        await fetchPointsHistory()
        await fetchJournalEntries()
        await fetchJournalAnalytics()
        await fetchUserSettings()
        
        setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)])
        
        const savedDarkMode = localStorage.getItem('darkMode') === 'true'
        setDarkMode(savedDarkMode)
        
      } catch (error) {
        console.error('Error fetching user data:', error)
        localStorage.removeItem('accessToken')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  // Calculate daily analytics
  useEffect(() => {
    if (habits) {
        const today = new Date();
        const todaysHabits = getHabitsForDate(today);
        const completedTodaysHabits = getCompletedHabitsForDate(today);

        const total = todaysHabits.length;
        const completed = completedTodaysHabits.length;
        const pending = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        setDailyAnalytics({
            completed,
            pending,
            total,
            percentage
        });
    }
  }, [habits]);

  // Calculate weekly chart data (last 7 days)
  useEffect(() => {
    if (habits && habits.length > 0) {
      const weekData = [];
      const today = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayHabits = getHabitsForDate(date);
        const completedHabits = getCompletedHabitsForDate(date);
        
        const total = dayHabits.length;
        const completed = completedHabits.length;
        const pending = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        weekData.push({
          day: days[date.getDay()],
          date: date.toISOString().split('T')[0],
          completions: completed,
          pending: pending,
          total: total,
          percentage: percentage
        });
      }
      
      setWeeklyChartData(weekData);
    }
  }, [habits]);

  // Calculate monthly chart data (last 4 weeks)
  useEffect(() => {
    if (habits && habits.length > 0) {
      const monthData = [];
      const today = new Date();
      
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() - (i * 7));
        weekEnd.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        
        let weekTotal = 0;
        let weekCompleted = 0;
        
        for (let j = 0; j < 7; j++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + j);
          
          if (date <= today) {
            const dayHabits = getHabitsForDate(date);
            const completedHabits = getCompletedHabitsForDate(date);
            
            weekTotal += dayHabits.length;
            weekCompleted += completedHabits.length;
          }
        }
        
        const completionRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
        
        monthData.push({
          week: `Week ${4 - i}`,
          completionRate: completionRate,
          completed: weekCompleted,
          total: weekTotal,
          pending: weekTotal - weekCompleted
        });
      }
      
      setMonthlyChartData(monthData);
    }
  }, [habits]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const handleAddHabit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(`${API_URL}/api/habits`, newHabit, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewHabit({ 
        name: '', 
        description: '', 
        frequency: 'daily',
        category: 'personal',
        reminderTime: '',
        goal: '',
        priority: 'medium'
      })
      setShowAddHabit(false)
      await fetchHabits(activeCategory)
      await fetchAnalytics()
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  const handleCompleteHabit = async (habitId) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(`${API_URL}/api/habits/${habitId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Show success message with points and streak info
      if (response.data.streakInfo) {
        const { streakInfo, pointsEarned, bonusMessages } = response.data
        let message = `✅ Habit completed! +${pointsEarned} points\n`
        
        if (streakInfo.isNew) {
          message += `🌟 Started a new streak!`
        } else if (streakInfo.isContinued) {
          message += `🔥 ${streakInfo.current} day streak!`
        }
        
        if (bonusMessages && bonusMessages.length > 0) {
          message += `\n\n🎁 Bonuses:\n${bonusMessages.join('\n')}`
        }
        
        alert(message)
      }
      
      await fetchHabits(activeCategory)
      await fetchAnalytics()
      await fetchPointsHistory()
    } catch (error) {
      console.error('Error completing habit:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      }
    }
  }

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        const token = localStorage.getItem('accessToken')
        await axios.delete(`${API_URL}/api/habits/${habitId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await fetchHabits(activeCategory)
        await fetchAnalytics()
      } catch (error) {
        console.error('Error deleting habit:', error)
      }
    }
  }

  const handleEditHabit = (habit) => {
    setEditingHabit(habit)
    setNewHabit({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      category: habit.category,
      reminderTime: habit.reminderTime || '',
      goal: habit.goal || '',
      priority: habit.priority
    })
    setShowEditHabit(true)
  }

  const handleUpdateHabit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`${API_URL}/api/habits/${editingHabit._id}`, newHabit, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewHabit({ 
        name: '', 
        description: '', 
        frequency: 'daily',
        category: 'personal',
        reminderTime: '',
        goal: '',
        priority: 'medium'
      })
      setShowEditHabit(false)
      setEditingHabit(null)
      await fetchHabits(activeCategory)
      await fetchAnalytics()
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  const handleCategoryFilter = async (category) => {
    setActiveCategory(category)
    await fetchHabits(category)
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(`${API_URL}/api/goals`, newGoal, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        targetValue: '',
        unit: '',
        targetDate: '',
        relatedHabits: [],
        milestones: []
      })
      setShowAddGoal(false)
      await fetchGoals(activeGoalCategory, activeGoalStatus)
      await fetchGoalAnalytics()
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      priority: goal.priority,
      targetValue: goal.targetValue.toString(),
      unit: goal.unit,
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      relatedHabits: goal.relatedHabits.map(h => h._id) || [],
      milestones: goal.milestones || []
    })
    setShowEditGoal(true)
  }

  const handleUpdateGoal = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`${API_URL}/api/goals/${editingGoal._id}`, newGoal, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        targetValue: '',
        unit: '',
        targetDate: '',
        relatedHabits: [],
        milestones: []
      })
      setShowEditGoal(false)
      setEditingGoal(null)
      await fetchGoals(activeGoalCategory, activeGoalStatus)
      await fetchGoalAnalytics()
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const token = localStorage.getItem('accessToken')
        await axios.delete(`${API_URL}/api/goals/${goalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await fetchGoals(activeGoalCategory, activeGoalStatus)
        await fetchGoalAnalytics()
      } catch (error) {
        console.error('Error deleting goal:', error)
      }
    }
  }

  const handleUpdateProgress = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`${API_URL}/api/goals/${progressGoal._id}/progress`, progressUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProgressUpdate({ value: '', notes: '' })
      setShowProgressModal(false)
      setProgressGoal(null)
      await fetchGoals(activeGoalCategory, activeGoalStatus)
      await fetchGoalAnalytics()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleGoalCategoryFilter = async (category) => {
    setActiveGoalCategory(category)
    await fetchGoals(category, activeGoalStatus)
  }

  const handleGoalStatusFilter = async (status) => {
    setActiveGoalStatus(status)
    await fetchGoals(activeGoalCategory, status)
  }

  const openProgressModal = (goal) => {
    setProgressGoal(goal)
    setProgressUpdate({
      value: goal.currentValue.toString(),
      notes: ''
    })
    setShowProgressModal(true)
  }

  const getProgressPercentage = (goal) => {
    if (goal.targetValue === 0) return 0
    return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
  }

  const getDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isGoalOverdue = (goal) => {
    return new Date() > new Date(goal.targetDate) && goal.status !== 'completed'
  }

  // Rewards handlers
  const handleAddReward = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(`${API_URL}/api/rewards`, newReward, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewReward({
        title: '',
        description: '',
        category: 'other',
        cost: '',
        pointsRequired: '',
        priority: 'medium',
        imageUrl: ''
      })
      setShowAddReward(false)
      await fetchRewards(activeRewardCategory, showRedeemed)
    } catch (error) {
      console.error('Error adding reward:', error)
    }
  }

  const handleEditReward = (reward) => {
    setEditingReward(reward)
    setNewReward({
      title: reward.title,
      description: reward.description || '',
      category: reward.category,
      cost: reward.cost.toString(),
      pointsRequired: reward.pointsRequired.toString(),
      priority: reward.priority,
      imageUrl: reward.imageUrl || ''
    })
    setShowEditReward(true)
  }

  const handleUpdateReward = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      await axios.put(`${API_URL}/api/rewards/${editingReward._id}`, newReward, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewReward({
        title: '',
        description: '',
        category: 'other',
        cost: '',
        pointsRequired: '',
        priority: 'medium',
        imageUrl: ''
      })
      setShowEditReward(false)
      setEditingReward(null)
      await fetchRewards(activeRewardCategory, showRedeemed)
    } catch (error) {
      console.error('Error updating reward:', error)
    }
  }

  const handleDeleteReward = async (rewardId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        const token = localStorage.getItem('accessToken')
        await axios.delete(`${API_URL}/api/rewards/${rewardId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await fetchRewards(activeRewardCategory, showRedeemed)
      } catch (error) {
        console.error('Error deleting reward:', error)
      }
    }
  }

  const handleRedeemReward = async (rewardId) => {
    if (window.confirm('Are you sure you want to redeem this reward?')) {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await axios.post(`${API_URL}/api/rewards/${rewardId}/redeem`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        alert(`Reward redeemed successfully! Remaining points: ${response.data.remainingPoints}`)
        await fetchRewards(activeRewardCategory, showRedeemed)
        await fetchPointsHistory()
      } catch (error) {
        console.error('Error redeeming reward:', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        }
      }
    }
  }

  const handleRewardCategoryFilter = async (category) => {
    setActiveRewardCategory(category)
    await fetchRewards(category, showRedeemed)
  }

  const handleToggleRedeemed = async (show) => {
    setShowRedeemed(show)
    await fetchRewards(activeRewardCategory, show)
  }

  // Journal handlers
  const handleAddJournal = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      const journalData = {
        ...newJournal,
        tags: newJournal.tags.filter(tag => tag.trim() !== ''),
        gratitude: newJournal.gratitude.filter(item => item.trim() !== ''),
        challenges: newJournal.challenges.filter(item => item.trim() !== ''),
        achievements: newJournal.achievements.filter(item => item.trim() !== ''),
        tomorrowGoals: newJournal.tomorrowGoals.filter(item => item.trim() !== '')
      }
      
      const response = await axios.post(`${API_URL}/api/journal`, journalData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewJournal({
        title: '',
        content: '',
        mood: 'neutral',
        tags: [],
        habitReflections: [],
        goalReflections: [],
        gratitude: [''],
        challenges: [''],
        achievements: [''],
        tomorrowGoals: [''],
        isPrivate: true
      })
      setShowAddJournal(false)
      await fetchJournalEntries(journalFilters)
      await fetchJournalAnalytics()
      await fetchPointsHistory()
      
      if (response.data.pointsEarned) {
        alert(`Journal entry saved! You earned ${response.data.pointsEarned} points!`)
      }
    } catch (error) {
      console.error('Error adding journal entry:', error)
    }
  }

  const handleEditJournal = (entry) => {
    setEditingJournal(entry)
    setNewJournal({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      habitReflections: entry.habitReflections || [],
      goalReflections: entry.goalReflections || [],
      gratitude: entry.gratitude.length > 0 ? entry.gratitude : [''],
      challenges: entry.challenges.length > 0 ? entry.challenges : [''],
      achievements: entry.achievements.length > 0 ? entry.achievements : [''],
      tomorrowGoals: entry.tomorrowGoals.length > 0 ? entry.tomorrowGoals : [''],
      isPrivate: entry.isPrivate
    })
    setShowEditJournal(true)
  }

  const handleUpdateJournal = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('accessToken')
      const journalData = {
        ...newJournal,
        tags: newJournal.tags.filter(tag => tag.trim() !== ''),
        gratitude: newJournal.gratitude.filter(item => item.trim() !== ''),
        challenges: newJournal.challenges.filter(item => item.trim() !== ''),
        achievements: newJournal.achievements.filter(item => item.trim() !== ''),
        tomorrowGoals: newJournal.tomorrowGoals.filter(item => item.trim() !== '')
      }
      
      await axios.put(`${API_URL}/api/journal/${editingJournal._id}`, journalData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNewJournal({
        title: '',
        content: '',
        mood: 'neutral',
        tags: [],
        habitReflections: [],
        goalReflections: [],
        gratitude: [''],
        challenges: [''],
        achievements: [''],
        tomorrowGoals: [''],
        isPrivate: true
      })
      setShowEditJournal(false)
      setEditingJournal(null)
      await fetchJournalEntries(journalFilters)
      await fetchJournalAnalytics()
    } catch (error) {
      console.error('Error updating journal entry:', error)
    }
  }

  const handleDeleteJournal = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        const token = localStorage.getItem('accessToken')
        await axios.delete(`${API_URL}/api/journal/${entryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await fetchJournalEntries(journalFilters)
        await fetchJournalAnalytics()
      } catch (error) {
        console.error('Error deleting journal entry:', error)
      }
    }
  }

  const handleJournalFilterChange = async (newFilters) => {
    const updatedFilters = { ...journalFilters, ...newFilters }
    setJournalFilters(updatedFilters)
    await fetchJournalEntries(updatedFilters)
  }

  const addArrayItem = (arrayName, value = '') => {
    setNewJournal(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], value]
    }))
  }

  const removeArrayItem = (arrayName, index) => {
    setNewJournal(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (arrayName, index, value) => {
    setNewJournal(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }))
  }

  const getMoodEmoji = (mood) => {
    const emojis = {
      excellent: '😄',
      good: '😊',
      neutral: '😐',
      bad: '😞',
      terrible: '😢'
    }
    return emojis[mood] || '😐'
  }

  const getMoodColor = (mood) => {
    const colors = {
      excellent: '#10b981',
      good: '#3b82f6',
      neutral: '#6b7280',
      bad: '#f59e0b',
      terrible: '#ef4444'
    }
    return colors[mood] || '#6b7280'
  }

  const isHabitCompletedToday = (habit) => {
    if (!habit.completions) return false
    const today = new Date().toDateString()
    return habit.completions.some(completion => 
      new Date(completion.date).toDateString() === today
    )
  }

  const handleNavClick = (section) => {
    setActiveSection(section)
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      health: 'heart',
      productivity: 'briefcase',
      personal: 'user',
      fitness: 'dumbbell',
      study: 'book'
    }
    return icons[category] || 'circle'
  }

  const getCategoryColor = (category) => {
    const colors = {
      health: '#ef4444',
      productivity: '#3b82f6',
      personal: '#8b5cf6',
      fitness: '#10b981',
      study: '#f59e0b'
    }
    return colors[category] || '#6b7280'
  }

  // Calendar helper functions
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      date.setHours(0, 0, 0, 0)
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isFuture: date > today
      })
    }
    
    return days
  }
  
  // Get completion percentage for a specific date
  const getDateCompletionPercentage = (date) => {
    const dayHabits = getHabitsForDate(date)
    const completedHabits = getCompletedHabitsForDate(date)
    
    if (dayHabits.length === 0) return 0
    return Math.round((completedHabits.length / dayHabits.length) * 100)
  }

  const getHabitsForDate = (date) => {
    if (!habits || !date) return []
    
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return habits.filter(habit => {
      const habitCreatedDate = new Date(habit.createdAt)
      habitCreatedDate.setHours(0, 0, 0, 0)
      
      // Only show habits that were created before or on this date
      if (targetDate < habitCreatedDate) return false
      
      if (habit.frequency === 'daily') return true
      
      if (habit.frequency === 'weekly') {
        // For weekly habits, check if it's the same day of week as creation
        return targetDate.getDay() === habitCreatedDate.getDay()
      }
      
      if (habit.frequency === 'monthly') {
        // For monthly habits, check if it's the same date of month as creation
        return targetDate.getDate() === habitCreatedDate.getDate()
      }
      
      return false
    })
  }

  const getCompletedHabitsForDate = (date) => {
    if (!habits || !date) return []
    
    return habits.filter(habit => 
      isHabitCompletedOnDate(habit, date)
    )
  }

  const isHabitCompletedOnDate = (habit, date) => {
    if (!habit.completions || !date) return false
    
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return habit.completions.some(completion => {
      const completionDate = new Date(completion.date)
      completionDate.setHours(0, 0, 0, 0)
      return completionDate.getTime() === targetDate.getTime()
    })
  }
  
  // Get habit completion status for a date with color coding
  const getHabitStatusColor = (habit, date) => {
    if (isHabitCompletedOnDate(habit, date)) {
      return getCategoryColor(habit.category)
    }
    return 'rgba(255, 255, 255, 0.3)'
  }

  const getMonthlyStats = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let totalDays = 0
    let perfectDays = 0
    let totalCompletions = 0
    let totalPossible = 0
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    let missedDays = 0
    let partialDays = 0
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      
      // Only count days up to today
      if (date > today) continue
      
      const dayHabits = getHabitsForDate(date)
      const completedHabits = getCompletedHabitsForDate(date)
      
      if (dayHabits.length > 0) {
        totalDays++
        totalCompletions += completedHabits.length
        totalPossible += dayHabits.length
        
        if (completedHabits.length === dayHabits.length && dayHabits.length > 0) {
          perfectDays++
          tempStreak++
          bestStreak = Math.max(bestStreak, tempStreak)
        } else {
          if (completedHabits.length === 0) {
            missedDays++
          } else {
            partialDays++
          }
          tempStreak = 0
        }
      }
    }
    
    // Check if current streak continues to today
    if (today.getMonth() === month && today.getFullYear() === year) {
      currentStreak = tempStreak
    }
    
    return {
      totalDays,
      perfectDays,
      missedDays,
      partialDays,
      averageRate: totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0,
      streak: bestStreak,
      currentStreak,
      totalCompletions,
      totalPossible
    }
  }

  const getWeeklyComparison = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    
    let thisWeekCompletions = 0
    let lastWeekCompletions = 0
    
    for (let i = 0; i < 7; i++) {
      const thisWeekDay = new Date(thisWeekStart)
      thisWeekDay.setDate(thisWeekStart.getDate() + i)
      
      const lastWeekDay = new Date(lastWeekStart)
      lastWeekDay.setDate(lastWeekStart.getDate() + i)
      
      if (thisWeekDay <= today) {
        thisWeekCompletions += getCompletedHabitsForDate(thisWeekDay).length
      }
      
      lastWeekCompletions += getCompletedHabitsForDate(lastWeekDay).length
    }
    
    return {
      thisWeek: thisWeekCompletions,
      lastWeek: lastWeekCompletions,
      improvement: lastWeekCompletions > 0 
        ? Math.round(((thisWeekCompletions - lastWeekCompletions) / lastWeekCompletions) * 100)
        : 0
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="sidebar-toggle mobile-only"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <div className="welcome-section">
                <h1>Welcome back, <span className="username">{user?.username}</span>!</h1>
                <p className="date">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
            
            <div className="header-right">
              <button className="header-btn" onClick={toggleDarkMode}>
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <button className="header-btn logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-main">
          {activeSection === 'dashboard' && (
            <div className="dashboard-content">
              <div className="quote-card">
                <i className="fas fa-quote-left quote-icon"></i>
                <p className="quote-text">{motivationalQuote}</p>
              </div>

              {analytics && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{analytics.totalHabits || 0}</h3>
                      <p>Total Habits</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-fire"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{analytics.averageStreak || 0}</h3>
                      <p>Average Streak</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{analytics.completionRate || 0}%</h3>
                      <p>Completion Rate</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{analytics.totalCompletions || 0}</h3>
                      <p>Total Completions</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="section">
                <div className="section-header">
                  <h2>Today's Habits</h2>
                  <button 
                    className="add-habit-btn"
                    onClick={() => setShowAddHabit(true)}
                  >
                    <i className="fas fa-plus"></i>
                    Add Habit
                  </button>
                </div>
                
                {habits.length === 0 ? (
                  <div className="no-habits">
                    <i className="fas fa-seedling no-habits-icon"></i>
                    <h4>No habits yet</h4>
                    <p>Start building better habits today!</p>
                    <button 
                      className="btn primary"
                      onClick={() => setShowAddHabit(true)}
                    >
                      Create Your First Habit
                    </button>
                  </div>
                ) : (
                  <div className="habits-grid">
                    {habits.slice(0, 6).map(habit => (
                      <div 
                        key={habit._id} 
                        className={`habit-card ${isHabitCompletedToday(habit) ? 'completed' : ''} ${
                          habit.streakStatus && habit.streakStatus.isBroken ? 'streak-broken' : ''
                        }`}
                      >
                        <div className="habit-header">
                          <h4>{habit.name}</h4>
                          <div className="habit-actions">
                            <button
                              className={`complete-btn ${isHabitCompletedToday(habit) ? 'completed' : ''}`}
                              onClick={() => handleCompleteHabit(habit._id)}
                              disabled={isHabitCompletedToday(habit)}
                              title={isHabitCompletedToday(habit) ? "Already completed today" : "Mark as completed"}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteHabit(habit._id)}
                              title="Delete habit"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        {habit.description && (
                          <p className="habit-description">{habit.description}</p>
                        )}
                        
                        {habit.streakStatus && habit.streakStatus.message && (
                          <div className={`streak-message ${habit.streakStatus.isBroken ? 'broken' : 'active'}`}>
                            <i className={`fas ${habit.streakStatus.isBroken ? 'fa-exclamation-circle' : 'fa-fire'}`}></i>
                            <span>{habit.streakStatus.message}</span>
                          </div>
                        )}
                        
                        <div className="habit-stats">
                          <span className={habit.streak > 0 ? 'streak-active' : 'streak-inactive'}>
                            <i className="fas fa-fire"></i>
                            {habit.streak || 0} day streak
                          </span>
                          <span>
                            <i className="fas fa-calendar"></i>
                            {habit.frequency}
                          </span>
                          <span className={`priority-${habit.priority || 'medium'}`}>
                            <i className="fas fa-flag"></i>
                            {habit.priority || 'medium'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'habits' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2>My Habits</h2>
                <button 
                  className="add-habit-btn"
                  onClick={() => setShowAddHabit(true)}
                >
                  <i className="fas fa-plus"></i>
                  Add Habit
                </button>
              </div>

              <div className="category-tabs">
                {['All', 'Health', 'Productivity', 'Study', 'Personal', 'Fitness'].map(category => (
                  <button 
                    key={category}
                    className={`category-tab ${activeCategory === category.toLowerCase() ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(category.toLowerCase())}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {habits.length === 0 ? (
                <div className="no-habits">
                  <i className="fas fa-seedling no-habits-icon"></i>
                  <h4>No habits yet</h4>
                  <p>Start building better habits today!</p>
                  <button 
                    className="btn primary"
                    onClick={() => setShowAddHabit(true)}
                  >
                    Create Your First Habit
                  </button>
                </div>
              ) : (
                <div className="habits-grid">
                  {habits.map(habit => (
                    <div 
                      key={habit._id} 
                      className={`habit-card ${isHabitCompletedToday(habit) ? 'completed' : ''}`}
                    >
                      <div className="habit-header">
                        <div className="habit-title">
                          <h4>{habit.name}</h4>
                          <span className={`habit-category ${habit.category}`}>
                            {habit.category}
                          </span>
                        </div>
                        <div className="habit-actions">
                          <button
                            className={`complete-btn ${isHabitCompletedToday(habit) ? 'completed' : ''}`}
                            onClick={() => handleCompleteHabit(habit._id)}
                            disabled={isHabitCompletedToday(habit)}
                            title={isHabitCompletedToday(habit) ? "Already completed today" : "Mark as completed"}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditHabit(habit)}
                            title="Edit habit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteHabit(habit._id)}
                            title="Delete habit"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      {habit.description && (
                        <p className="habit-description">{habit.description}</p>
                      )}
                      
                      {habit.goal && (
                        <div className="habit-goal">
                          <i className="fas fa-target"></i>
                          <span>Goal: {habit.goal}</span>
                        </div>
                      )}
                      
                      {habit.reminderTime && (
                        <div className="habit-reminder">
                          <i className="fas fa-clock"></i>
                          <span>Reminder: {habit.reminderTime}</span>
                        </div>
                      )}
                      
                      <div className="habit-stats">
                        <span>
                          <i className="fas fa-fire"></i>
                          {habit.streak || 0} day streak
                        </span>
                        <span>
                          <i className="fas fa-calendar"></i>
                          {habit.frequency}
                        </span>
                        <span className={`priority-${habit.priority || 'medium'}`}>
                          <i className="fas fa-flag"></i>
                          {habit.priority || 'medium'}
                        </span>
                        <span>
                          <i className="fas fa-check-circle"></i>
                          {(habit.completions && habit.completions.length) || 0} completions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2>Analytics & Progress</h2>
                <div className="analytics-filters">
                  <select className="filter-select" onChange={(e) => fetchAnalytics(e.target.value)}>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
              
              {analytics ? (
                <div className="analytics-content">
                  {/* Real-Time Habit Performance */}
                  {habits.length > 0 && (
                    <div className="habit-performance-section">
                      <h3>📊 Habit Performance Overview</h3>
                      <div className="performance-grid">
                        {habits.map(habit => {
                          const completionCount = habit.completions ? habit.completions.length : 0
                          const daysActive = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24))
                          const expectedCompletions = habit.frequency === 'daily' ? daysActive : 
                                                     habit.frequency === 'weekly' ? Math.ceil(daysActive / 7) :
                                                     Math.ceil(daysActive / 30)
                          const habitCompletionRate = expectedCompletions > 0 ? Math.round((completionCount / expectedCompletions) * 100) : 0
                          
                          return (
                            <div key={habit._id} className="performance-card">
                              <div className="performance-header">
                                <h4>{habit.name}</h4>
                                <span className={`category-badge ${habit.category}`}>
                                  {habit.category}
                                </span>
                              </div>
                              <div className="performance-stats">
                                <div className="stat-row">
                                  <span className="stat-label">Current Streak:</span>
                                  <span className="stat-value streak">{habit.streak || 0} days 🔥</span>
                                </div>
                                <div className="stat-row">
                                  <span className="stat-label">Total Completions:</span>
                                  <span className="stat-value">{completionCount}</span>
                                </div>
                                <div className="stat-row">
                                  <span className="stat-label">Completion Rate:</span>
                                  <span className="stat-value">{habitCompletionRate}%</span>
                                </div>
                                <div className="stat-row">
                                  <span className="stat-label">Priority:</span>
                                  <span className={`stat-value priority-${habit.priority}`}>
                                    {habit.priority}
                                  </span>
                                </div>
                              </div>
                              <div className="performance-progress">
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill"
                                    style={{ 
                                      width: `${habitCompletionRate}%`,
                                      background: habitCompletionRate >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' :
                                                 habitCompletionRate >= 50 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                                                 'linear-gradient(90deg, #f59e0b, #d97706)'
                                    }}
                                  />
                                </div>
                                <span className="progress-label">{habitCompletionRate}% Success Rate</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {/* Overview Stats */}
                  <div className="analytics-overview">
                    <div className="overview-card">
                      <div className="overview-icon">
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <div className="overview-content">
                        <h3>{analytics.completionRate || 0}%</h3>
                        <p>Overall Completion Rate</p>
                        <span className="trend positive">+5% from last week</span>
                      </div>
                    </div>
                    
                    <div className="overview-card">
                      <div className="overview-icon">
                        <i className="fas fa-fire"></i>
                      </div>
                      <div className="overview-content">
                        <h3>{analytics.averageStreak || 0}</h3>
                        <p>Average Streak</p>
                        <span className="trend positive">+2 days</span>
                      </div>
                    </div>
                    
                    <div className="overview-card">
                      <div className="overview-icon">
                        <i className="fas fa-calendar-check"></i>
                      </div>
                      <div className="overview-content">
                        <h3>{analytics.totalCompletions || 0}</h3>
                        <p>Total Completions</p>
                        <span className="trend positive">+12 this week</span>
                      </div>
                    </div>
                    
                    <div className="overview-card">
                      <div className="overview-icon">
                        <i className="fas fa-trophy"></i>
                      </div>
                      <div className="overview-content">
                        <h3>{habits.filter(h => (h.streak || 0) >= 7).length}</h3>
                        <p>Active Streaks (7+ days)</p>
                        <span className="trend neutral">Same as last week</span>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="charts-grid">
                    {/* Completion Rate Pie Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <h3>Daily Completion Rate</h3>
                        <p>Today's habit completion breakdown</p>
                      </div>
                      <div className="pie-chart-container">
                        <div 
                            className="pie-chart"
                            style={{
                                background: dailyAnalytics.total > 0 
                                  ? `conic-gradient(#10b981 0% ${dailyAnalytics.percentage}%, #ef4444 ${dailyAnalytics.percentage}% 100%)`
                                  : '#374151'
                            }}
                        >
                          <div className="pie-center">
                            <span className="pie-percentage">{dailyAnalytics.percentage}%</span>
                            <span className="pie-label">Completed</span>
                          </div>
                        </div>
                        <div className="pie-legend">
                          <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                            <span>Completed ({dailyAnalytics.completed})</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                            <span>Pending ({dailyAnalytics.pending})</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#6b7280' }}></span>
                            <span>Total ({dailyAnalytics.total})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Progress Bar Chart */}
                    <div className="chart-card">
                      <div className="chart-header">
                        <h3>Weekly Progress</h3>
                        <p>Habit completions over the past 7 days</p>
                      </div>
                      <div className="bar-chart-container">
                        <div className="bar-chart">
                          {weeklyChartData.length > 0 ? weeklyChartData.map((dayData, index) => {
                            const maxCompletions = Math.max(...weeklyChartData.map(d => d.total), 1);
                            const completedHeight = dayData.total > 0 ? (dayData.completions / maxCompletions) * 100 : 0;
                            const pendingHeight = dayData.total > 0 ? (dayData.pending / maxCompletions) * 100 : 0;
                            
                            return (
                              <div key={index} className="bar-item">
                                <div className="bar-stack" style={{ height: '150px' }}>
                                  {dayData.total > 0 ? (
                                    <>
                                      <div 
                                        className="bar completed"
                                        style={{ 
                                          height: `${completedHeight}%`,
                                          backgroundColor: '#10b981'
                                        }}
                                        title={`${dayData.completions} completed`}
                                      ></div>
                                      <div 
                                        className="bar pending"
                                        style={{ 
                                          height: `${pendingHeight}%`,
                                          backgroundColor: '#ef4444'
                                        }}
                                        title={`${dayData.pending} pending`}
                                      ></div>
                                    </>
                                  ) : (
                                    <div 
                                      className="bar empty"
                                      style={{ 
                                        height: '10px',
                                        backgroundColor: '#374151'
                                      }}
                                      title="No habits"
                                    ></div>
                                  )}
                                </div>
                                <span className="bar-label">{dayData.day}</span>
                                <span className="bar-value">{dayData.completions}/{dayData.total}</span>
                              </div>
                            );
                          }) : (
                            <div className="no-data">No data available</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Monthly Trend Line Chart */}
                    <div className="chart-card full-width">
                      <div className="chart-header">
                        <h3>Monthly Trend</h3>
                        <p>Completion rate trend over the past 4 weeks</p>
                      </div>
                      <div className="line-chart-container">
                        <div className="line-chart">
                          <svg viewBox="0 0 400 200" className="line-svg">
                            <defs>
                              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                              <line 
                                key={i}
                                x1="0" 
                                y1={i * 40} 
                                x2="400" 
                                y2={i * 40} 
                                stroke="rgba(255,255,255,0.1)" 
                                strokeWidth="1"
                              />
                            ))}
                            
                            {/* Data line and area */}
                            {monthlyChartData.length > 0 && (
                              <>
                                <polyline
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="3"
                                  points={monthlyChartData.map((data, i) => 
                                    `${i * 133.33},${200 - (data.completionRate * 2)}`
                                  ).join(' ')}
                                />
                                
                                <polygon
                                  fill="url(#lineGradient)"
                                  points={`${monthlyChartData.map((data, i) => 
                                    `${i * 133.33},${200 - (data.completionRate * 2)}`
                                  ).join(' ')} 400,200 0,200`}
                                />
                                
                                {monthlyChartData.map((data, i) => (
                                  <g key={i}>
                                    <circle
                                      cx={i * 133.33}
                                      cy={200 - (data.completionRate * 2)}
                                      r="4"
                                      fill="#3b82f6"
                                      stroke="#fff"
                                      strokeWidth="2"
                                    />
                                    <text
                                      x={i * 133.33}
                                      y={200 - (data.completionRate * 2) - 10}
                                      textAnchor="middle"
                                      fill="#fff"
                                      fontSize="12"
                                    >
                                      {data.completionRate}%
                                    </text>
                                  </g>
                                ))}
                              </>
                            )}
                          </svg>
                          
                          <div className="line-chart-labels">
                            {monthlyChartData.length > 0 ? monthlyChartData.map((data, index) => (
                              <div key={index} className="chart-label-group">
                                <span className="chart-label">{data.week}</span>
                                <span className="chart-sublabel">{data.completed}/{data.total}</span>
                              </div>
                            )) : (
                              <span className="chart-label">No data</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analytics */}
                  <div className="detailed-analytics">
                    <div className="analytics-section">
                      <h3>Habit Performance</h3>
                      <div className="performance-list">
                        {habits.slice(0, 5).map(habit => {
                          const completionRate = habit.completions ? 
                            Math.round((habit.completions.length / 30) * 100) : 0
                          return (
                            <div key={habit._id} className="performance-item">
                              <div className="performance-info">
                                <h4>{habit.name}</h4>
                                <span className={`category-badge ${habit.category}`}>
                                  {habit.category}
                                </span>
                              </div>
                              <div className="performance-stats">
                                <div className="stat">
                                  <span className="stat-value">{habit.streak || 0}</span>
                                  <span className="stat-label">Streak</span>
                                </div>
                                <div className="stat">
                                  <span className="stat-value">{completionRate}%</span>
                                  <span className="stat-label">Rate</span>
                                </div>
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill"
                                    style={{ width: `${completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="analytics-section">
                      <h3>Category Breakdown</h3>
                      <div className="category-stats">
                        {['health', 'productivity', 'personal', 'fitness', 'study'].map(category => {
                          const categoryData = analytics.categoryBreakdown?.[category]
                          const count = categoryData?.count || 0
                          const percentage = analytics.totalHabits > 0 ? Math.round((count / analytics.totalHabits) * 100) : 0
                          
                          return (
                            <div key={category} className="category-stat">
                              <div className="category-info">
                                <span className={`category-icon ${category}`}>
                                  <i className={`fas fa-${getCategoryIcon(category)}`}></i>
                                </span>
                                <div className="category-details">
                                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                                  <p>{count} habits</p>
                                </div>
                              </div>
                              <div className="category-progress">
                                <span className="percentage">{percentage}%</span>
                                <div className="progress-ring">
                                  <div 
                                    className="progress-ring-fill"
                                    style={{ 
                                      strokeDasharray: `${percentage * 2.51}, 251`,
                                      stroke: getCategoryColor(category)
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Insights Section */}
                  <div className="insights-section">
                    <h3>Insights & Recommendations</h3>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-icon">
                          <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className="insight-content">
                          <h4>Best Performance Day</h4>
                          <p>You complete most habits on <strong>{analytics.insights?.bestPerformanceDay || 'Wednesdays'}</strong>. Try scheduling challenging habits on this day.</p>
                        </div>
                      </div>
                      
                      <div className="insight-card">
                        <div className="insight-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="insight-content">
                          <h4>Optimal Time</h4>
                          <p>Your completion rate is highest in the <strong>{analytics.insights?.optimalTime || 'morning'}</strong>. Consider setting more reminders for 8-10 AM.</p>
                        </div>
                      </div>
                      
                      <div className="insight-card">
                        <div className="insight-icon">
                          <i className="fas fa-trending-up"></i>
                        </div>
                        <div className="insight-content">
                          <h4>Improvement Opportunity</h4>
                          <p>Your <strong>{analytics.insights?.improvementCategory || 'fitness'}</strong> habits need attention. Focus on consistency.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="loading-state">
                  <i className="fas fa-chart-line"></i>
                  <p>Loading analytics...</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'calendar' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2>Calendar</h2>
                <div className="calendar-controls">
                  <button 
                    className="calendar-nav-btn"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setCurrentDate(newDate)
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <h3 className="calendar-month">
                    {currentDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h3>
                  <button 
                    className="calendar-nav-btn"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setCurrentDate(newDate)
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  <button 
                    className="today-btn"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="calendar-container">
                <div className="calendar-grid">
                  {/* Calendar Header */}
                  <div className="calendar-header">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="calendar-day-header">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="calendar-body">
                    {generateCalendarDays().map((day, index) => {
                      const dayHabits = getHabitsForDate(day.date)
                      const completedHabits = getCompletedHabitsForDate(day.date)
                      const completionRate = dayHabits.length > 0 ? 
                        Math.round((completedHabits.length / dayHabits.length) * 100) : 0
                      
                      return (
                        <div 
                          key={index}
                          className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${
                            day.isToday ? 'today' : ''
                          } ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''} ${
                            completionRate === 100 && dayHabits.length > 0 ? 'perfect-day' : ''
                          }`}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <div className="day-number">{day.date.getDate()}</div>
                          
                          {dayHabits.length > 0 && (
                            <div className="day-habits">
                              <div className="habit-dots">
                                {dayHabits.slice(0, 3).map((habit, habitIndex) => (
                                  <div 
                                    key={habitIndex}
                                    className={`habit-dot ${
                                      isHabitCompletedOnDate(habit, day.date) ? 'completed' : 'pending'
                                    }`}
                                    style={{ 
                                      backgroundColor: isHabitCompletedOnDate(habit, day.date) 
                                        ? getCategoryColor(habit.category) 
                                        : 'rgba(255,255,255,0.3)' 
                                    }}
                                    title={`${habit.name} - ${isHabitCompletedOnDate(habit, day.date) ? 'Completed' : 'Pending'}`}
                                  />
                                ))}
                                {dayHabits.length > 3 && (
                                  <div className="habit-dot more" title={`${dayHabits.length - 3} more habits`}>
                                    +{dayHabits.length - 3}
                                  </div>
                                )}
                              </div>
                              
                              {completionRate > 0 && (
                                <div className="completion-rate" title={`${completionRate}% completion rate`}>
                                  <div 
                                    className="completion-bar"
                                    style={{ 
                                      width: `${completionRate}%`,
                                      background: completionRate === 100 
                                        ? 'linear-gradient(90deg, #10b981, #059669)' 
                                        : completionRate >= 50 
                                        ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                                        : 'linear-gradient(90deg, #ef4444, #dc2626)'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Calendar Sidebar */}
                <div className="calendar-sidebar">
                  <div className="selected-date-info">
                    <h3>
                      {selectedDate ? 
                        selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : 
                        'Select a date'
                      }
                    </h3>
                    
                    {selectedDate && (
                      <div className="date-habits">
                        {getHabitsForDate(selectedDate).length === 0 ? (
                          <div className="no-habits-day">
                            <i className="fas fa-calendar-plus"></i>
                            <p>No habits scheduled for this day</p>
                          </div>
                        ) : (
                          <>
                            <div className="date-stats">
                              <div className="stat">
                                <span className="stat-number">
                                  {getCompletedHabitsForDate(selectedDate).length}
                                </span>
                                <span className="stat-label">Completed</span>
                              </div>
                              <div className="stat">
                                <span className="stat-number">
                                  {getHabitsForDate(selectedDate).length - getCompletedHabitsForDate(selectedDate).length}
                                </span>
                                <span className="stat-label">Pending</span>
                              </div>
                              <div className="stat">
                                <span className="stat-number">
                                  {getHabitsForDate(selectedDate).length > 0 ? 
                                    Math.round((getCompletedHabitsForDate(selectedDate).length / getHabitsForDate(selectedDate).length) * 100) : 0
                                  }%
                                </span>
                                <span className="stat-label">Rate</span>
                              </div>
                            </div>

                            <div className="date-habit-list">
                              {getHabitsForDate(selectedDate).map(habit => {
                                const isCompleted = isHabitCompletedOnDate(habit, selectedDate)
                                return (
                                  <div 
                                    key={habit._id} 
                                    className={`calendar-habit-item ${isCompleted ? 'completed' : 'pending'}`}
                                  >
                                    <div className="habit-info">
                                      <div className="habit-name-category">
                                        <h4>{habit.name}</h4>
                                        <span className={`habit-category ${habit.category}`}>
                                          {habit.category}
                                        </span>
                                      </div>
                                      {habit.reminderTime && (
                                        <div className="habit-time">
                                          <i className="fas fa-clock"></i>
                                          {habit.reminderTime}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="habit-actions">
                                      {selectedDate.toDateString() === new Date().toDateString() ? (
                                        <button
                                          className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                                          onClick={() => handleCompleteHabit(habit._id)}
                                          disabled={isCompleted}
                                          title={isCompleted ? "Already completed" : "Mark as completed"}
                                        >
                                          <i className="fas fa-check"></i>
                                        </button>
                                      ) : (
                                        <div className={`status-indicator ${isCompleted ? 'completed' : 'missed'}`}>
                                          <i className={`fas ${isCompleted ? 'fa-check' : 'fa-times'}`}></i>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Calendar Legend */}
                  <div className="calendar-legend">
                    <h4>Legend</h4>
                    <div className="legend-items">
                      <div className="legend-item">
                        <div className="legend-dot completed"></div>
                        <span>Completed Habit</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot pending"></div>
                        <span>Pending Habit</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-bar">
                          <div className="completion-bar" style={{ width: '60%' }}></div>
                        </div>
                        <span>Completion Rate</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="calendar-quick-stats">
                    <h4>This Month</h4>
                    <div className="quick-stat-grid">
                      <div className="quick-stat">
                        <span className="stat-value">{getMonthlyStats().totalDays}</span>
                        <span className="stat-label">Days Tracked</span>
                      </div>
                      <div className="quick-stat">
                        <span className="stat-value">{getMonthlyStats().perfectDays}</span>
                        <span className="stat-label">Perfect Days</span>
                      </div>
                      <div className="quick-stat">
                        <span className="stat-value">{getMonthlyStats().averageRate}%</span>
                        <span className="stat-label">Avg. Rate</span>
                      </div>
                      <div className="quick-stat">
                        <span className="stat-value">{getMonthlyStats().streak}</span>
                        <span className="stat-label">Best Streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'goals' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2>Goals & Objectives</h2>
                <button 
                  className="add-habit-btn"
                  onClick={() => setShowAddGoal(true)}
                >
                  <i className="fas fa-plus"></i>
                  Add Goal
                </button>
              </div>

              {/* Goal Analytics Overview */}
              {goalAnalytics && (
                <div className="goals-overview">
                  <div className="overview-stats">
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-bullseye"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{goalAnalytics.totalGoals}</h3>
                        <p>Total Goals</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{goalAnalytics.completedGoals}</h3>
                        <p>Completed</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-play-circle"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{goalAnalytics.activeGoals}</h3>
                        <p>Active</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{goalAnalytics.overdueGoals}</h3>
                        <p>Overdue</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{goalAnalytics.averageProgress}%</h3>
                        <p>Avg Progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="goals-filters">
                <div className="filter-group">
                  <label>Category:</label>
                  <div className="filter-tabs">
                    {['All', 'Personal', 'Health', 'Productivity', 'Study', 'Fitness', 'Career', 'Financial'].map(category => (
                      <button 
                        key={category}
                        className={`filter-tab ${activeGoalCategory === category.toLowerCase() ? 'active' : ''}`}
                        onClick={() => handleGoalCategoryFilter(category.toLowerCase())}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Status:</label>
                  <div className="filter-tabs">
                    {['All', 'Active', 'Completed', 'Paused', 'Cancelled'].map(status => (
                      <button 
                        key={status}
                        className={`filter-tab ${activeGoalStatus === status.toLowerCase() ? 'active' : ''}`}
                        onClick={() => handleGoalStatusFilter(status.toLowerCase())}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goals Grid */}
              {goals.length === 0 ? (
                <div className="no-goals">
                  <i className="fas fa-target no-goals-icon"></i>
                  <h4>No goals yet</h4>
                  <p>Set your first goal and start achieving your dreams!</p>
                  <button 
                    className="btn primary"
                    onClick={() => setShowAddGoal(true)}
                  >
                    Create Your First Goal
                  </button>
                </div>
              ) : (
                <div className="goals-grid">
                  {goals.map(goal => {
                    const progress = getProgressPercentage(goal)
                    const daysRemaining = getDaysRemaining(goal.targetDate)
                    const isOverdue = isGoalOverdue(goal)
                    
                    return (
                      <div 
                        key={goal._id} 
                        className={`goal-card ${goal.status} ${isOverdue ? 'overdue' : ''}`}
                      >
                        <div className="goal-header">
                          <div className="goal-title-section">
                            <h4>{goal.title}</h4>
                            <div className="goal-meta">
                              <span className={`goal-category ${goal.category}`}>
                                {goal.category}
                              </span>
                              <span className={`goal-priority priority-${goal.priority}`}>
                                <i className="fas fa-flag"></i>
                                {goal.priority}
                              </span>
                              <span className={`goal-status status-${goal.status}`}>
                                {goal.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="goal-actions">
                            <button
                              className="progress-btn"
                              onClick={() => openProgressModal(goal)}
                              title="Update progress"
                              disabled={goal.status === 'completed' || goal.status === 'cancelled'}
                            >
                              <i className="fas fa-chart-line"></i>
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => handleEditGoal(goal)}
                              title="Edit goal"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteGoal(goal._id)}
                              title="Delete goal"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        {goal.description && (
                          <p className="goal-description">{goal.description}</p>
                        )}
                        
                        <div className="goal-progress">
                          <div className="progress-info">
                            <span className="progress-text">
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </span>
                            <span className="progress-percentage">{progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${progress}%`,
                                backgroundColor: progress === 100 ? '#10b981' : 
                                                progress >= 75 ? '#3b82f6' :
                                                progress >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="goal-timeline">
                          <div className="timeline-info">
                            <span className="target-date">
                              <i className="fas fa-calendar"></i>
                              Target: {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                            <span className={`days-remaining ${isOverdue ? 'overdue' : daysRemaining <= 7 ? 'urgent' : ''}`}>
                              <i className="fas fa-clock"></i>
                              {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                               daysRemaining === 0 ? 'Due today' :
                               daysRemaining === 1 ? '1 day left' :
                               `${daysRemaining} days left`}
                            </span>
                          </div>
                        </div>
                        
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div className="goal-milestones">
                            <h5>Milestones</h5>
                            <div className="milestones-list">
                              {goal.milestones.slice(0, 3).map((milestone, index) => (
                                <div 
                                  key={index} 
                                  className={`milestone ${milestone.isCompleted ? 'completed' : ''}`}
                                >
                                  <i className={`fas ${milestone.isCompleted ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                  <span>{milestone.title} ({milestone.targetValue} {goal.unit})</span>
                                </div>
                              ))}
                              {goal.milestones.length > 3 && (
                                <div className="milestone-more">
                                  +{goal.milestones.length - 3} more milestones
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {goal.relatedHabits && goal.relatedHabits.length > 0 && (
                          <div className="goal-related-habits">
                            <h5>Related Habits</h5>
                            <div className="related-habits-list">
                              {goal.relatedHabits.map(habit => (
                                <span key={habit._id} className={`habit-tag ${habit.category}`}>
                                  {habit.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Upcoming Deadlines & Recent Achievements */}
              {goalAnalytics && (goalAnalytics.upcomingDeadlines.length > 0 || goalAnalytics.recentAchievements.length > 0) && (
                <div className="goals-insights">
                  {goalAnalytics.upcomingDeadlines.length > 0 && (
                    <div className="insights-section">
                      <h3>Upcoming Deadlines</h3>
                      <div className="deadlines-list">
                        {goalAnalytics.upcomingDeadlines.map(deadline => (
                          <div key={deadline.id} className="deadline-item">
                            <div className="deadline-info">
                              <h4>{deadline.title}</h4>
                              <span className="deadline-date">
                                Due: {new Date(deadline.targetDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="deadline-status">
                              <span className={`days-left ${deadline.daysRemaining <= 3 ? 'urgent' : ''}`}>
                                {deadline.daysRemaining} days
                              </span>
                              <div className="mini-progress">
                                <div 
                                  className="mini-progress-fill"
                                  style={{ width: `${deadline.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {goalAnalytics.recentAchievements.length > 0 && (
                    <div className="insights-section">
                      <h3>Recent Achievements</h3>
                      <div className="achievements-list">
                        {goalAnalytics.recentAchievements.map(achievement => (
                          <div key={achievement.id} className="achievement-item">
                            <div className="achievement-icon">
                              <i className="fas fa-trophy"></i>
                            </div>
                            <div className="achievement-info">
                              <h4>{achievement.title}</h4>
                              <span className="achievement-date">
                                Completed: {new Date(achievement.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`achievement-category ${achievement.category}`}>
                              {achievement.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'rewards' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2>Rewards & Points</h2>
                <div className="header-actions">
                  <div className="points-display">
                    <div className="points-info">
                      <span className="points-label">Available Points</span>
                      <span className="points-value">{userPoints.available}</span>
                    </div>
                    <div className="points-info">
                      <span className="points-label">Total Earned</span>
                      <span className="points-value">{userPoints.total}</span>
                    </div>
                  </div>
                  <button 
                    className="add-habit-btn"
                    onClick={() => setShowAddReward(true)}
                  >
                    <i className="fas fa-plus"></i>
                    Add Reward
                  </button>
                </div>
              </div>

              {/* Points History Section */}
              <div className="points-section">
                <h3>Recent Points Activity</h3>
                <div className="points-history">
                  {pointsHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className={`points-entry ${entry.action}`}>
                      <div className="points-entry-icon">
                        <i className={`fas ${
                          entry.action === 'earned' ? 'fa-plus-circle' : 
                          entry.action === 'redeemed' ? 'fa-minus-circle' : 
                          'fa-star'
                        }`}></i>
                      </div>
                      <div className="points-entry-info">
                        <h4>{entry.description}</h4>
                        <span className="points-entry-date">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`points-entry-value ${entry.action}`}>
                        {entry.action === 'earned' ? '+' : ''}{entry.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Filters */}
              <div className="rewards-filters">
                <div className="filter-group">
                  <label>Category:</label>
                  <div className="filter-tabs">
                    {['All', 'Entertainment', 'Food', 'Shopping', 'Experience', 'Relaxation', 'Social', 'Other'].map(category => (
                      <button 
                        key={category}
                        className={`filter-tab ${activeRewardCategory === category.toLowerCase() ? 'active' : ''}`}
                        onClick={() => handleRewardCategoryFilter(category.toLowerCase())}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Status:</label>
                  <div className="filter-tabs">
                    <button 
                      className={`filter-tab ${!showRedeemed ? 'active' : ''}`}
                      onClick={() => handleToggleRedeemed(false)}
                    >
                      Available
                    </button>
                    <button 
                      className={`filter-tab ${showRedeemed ? 'active' : ''}`}
                      onClick={() => handleToggleRedeemed(true)}
                    >
                      Redeemed
                    </button>
                  </div>
                </div>
              </div>

              {/* Rewards Grid */}
              {rewards.length === 0 ? (
                <div className="no-rewards">
                  <i className="fas fa-gift no-rewards-icon"></i>
                  <h4>No rewards yet</h4>
                  <p>Create rewards to motivate yourself and celebrate achievements!</p>
                  <button 
                    className="btn primary"
                    onClick={() => setShowAddReward(true)}
                  >
                    Create Your First Reward
                  </button>
                </div>
              ) : (
                <div className="rewards-grid">
                  {rewards.map(reward => (
                    <div 
                      key={reward._id} 
                      className={`reward-card ${reward.isRedeemed ? 'redeemed' : ''} ${
                        !reward.isRedeemed && userPoints.available >= reward.pointsRequired ? 'affordable' : ''
                      }`}
                    >
                      <div className="reward-header">
                        <div className="reward-title-section">
                          <h4>{reward.title}</h4>
                          <div className="reward-meta">
                            <span className={`reward-category ${reward.category}`}>
                              {reward.category}
                            </span>
                            <span className={`reward-priority priority-${reward.priority}`}>
                              <i className="fas fa-flag"></i>
                              {reward.priority}
                            </span>
                            {reward.isRedeemed && (
                              <span className="reward-status redeemed">
                                <i className="fas fa-check-circle"></i>
                                Redeemed
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!reward.isRedeemed && (
                          <div className="reward-actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditReward(reward)}
                              title="Edit reward"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteReward(reward._id)}
                              title="Delete reward"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {reward.imageUrl && (
                        <div className="reward-image">
                          <img src={reward.imageUrl} alt={reward.title} />
                        </div>
                      )}
                      
                      {reward.description && (
                        <p className="reward-description">{reward.description}</p>
                      )}
                      
                      <div className="reward-cost-section">
                        <div className="reward-points">
                          <i className="fas fa-coins"></i>
                          <span className="points-required">{reward.pointsRequired} points</span>
                        </div>
                        {reward.cost > 0 && (
                          <div className="reward-money">
                            <i className="fas fa-dollar-sign"></i>
                            <span className="money-cost">${reward.cost}</span>
                          </div>
                        )}
                      </div>
                      
                      {reward.isRedeemed ? (
                        <div className="redeemed-info">
                          <i className="fas fa-calendar"></i>
                          <span>Redeemed on {new Date(reward.redeemedAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <div className="reward-redeem-section">
                          <button
                            className={`redeem-btn ${
                              userPoints.available >= reward.pointsRequired ? 'affordable' : 'unaffordable'
                            }`}
                            onClick={() => handleRedeemReward(reward._id)}
                            disabled={userPoints.available < reward.pointsRequired}
                            title={
                              userPoints.available >= reward.pointsRequired 
                                ? 'Redeem this reward' 
                                : `Need ${reward.pointsRequired - userPoints.available} more points`
                            }
                          >
                            {userPoints.available >= reward.pointsRequired ? (
                              <>
                                <i className="fas fa-gift"></i>
                                Redeem Now
                              </>
                            ) : (
                              <>
                                <i className="fas fa-lock"></i>
                                Need {reward.pointsRequired - userPoints.available} more
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'journal' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2>Journal & Reflections</h2>
                <button 
                  className="add-habit-btn"
                  onClick={() => setShowAddJournal(true)}
                >
                  <i className="fas fa-plus"></i>
                  New Entry
                </button>
              </div>

              {/* Journal Analytics Overview */}
              {journalAnalytics && (
                <div className="journal-overview">
                  <div className="overview-stats">
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-book"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{journalAnalytics.totalEntries}</h3>
                        <p>Total Entries</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-fire"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{journalAnalytics.writingStreak}</h3>
                        <p>Writing Streak</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-smile"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{journalAnalytics.averageMood.toFixed(1)}</h3>
                        <p>Avg Mood</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-calendar-week"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{journalAnalytics.entriesThisWeek}</h3>
                        <p>This Week</p>
                      </div>
                    </div>
                    
                    <div className="overview-stat">
                      <div className="stat-icon">
                        <i className="fas fa-align-left"></i>
                      </div>
                      <div className="stat-content">
                        <h3>{journalAnalytics.averageContentLength}</h3>
                        <p>Avg Words</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Distribution Chart */}
              {journalAnalytics && (
                <div className="mood-analytics">
                  <h3>Mood Distribution (Last 30 Days)</h3>
                  <div className="mood-chart">
                    {Object.entries(journalAnalytics.moodDistribution).map(([mood, count]) => {
                      const percentage = journalAnalytics.totalEntries > 0 
                        ? (count / journalAnalytics.totalEntries) * 100 
                        : 0
                      return (
                        <div key={mood} className="mood-bar">
                          <div className="mood-info">
                            <span className="mood-emoji">{getMoodEmoji(mood)}</span>
                            <span className="mood-name">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                            <span className="mood-count">({count})</span>
                          </div>
                          <div className="mood-progress">
                            <div 
                              className="mood-progress-fill"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: getMoodColor(mood)
                              }}
                            />
                            <span className="mood-percentage">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Top Tags */}
              {journalAnalytics && journalAnalytics.topTags.length > 0 && (
                <div className="tags-analytics">
                  <h3>Most Used Tags</h3>
                  <div className="tags-cloud">
                    {journalAnalytics.topTags.map(({ tag, count }) => (
                      <span 
                        key={tag} 
                        className="tag-item"
                        style={{ 
                          fontSize: `${Math.min(1 + (count / 10), 2)}rem`,
                          opacity: Math.max(0.6, count / 20)
                        }}
                        onClick={() => handleJournalFilterChange({ tag })}
                      >
                        #{tag} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Journal Filters */}
              <div className="journal-filters">
                <div className="filter-group">
                  <label>Mood:</label>
                  <select 
                    value={journalFilters.mood}
                    onChange={(e) => handleJournalFilterChange({ mood: e.target.value, page: 1 })}
                  >
                    <option value="all">All Moods</option>
                    <option value="excellent">😄 Excellent</option>
                    <option value="good">😊 Good</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="bad">😞 Bad</option>
                    <option value="terrible">😢 Terrible</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Tag:</label>
                  <input
                    type="text"
                    placeholder="Filter by tag..."
                    value={journalFilters.tag}
                    onChange={(e) => handleJournalFilterChange({ tag: e.target.value, page: 1 })}
                  />
                </div>
                
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setJournalFilters({ mood: 'all', tag: '', page: 1 })
                    fetchJournalEntries({ mood: 'all', tag: '', page: 1 })
                  }}
                >
                  Clear Filters
                </button>
              </div>

              {/* Journal Entries */}
              {journalEntries.length === 0 ? (
                <div className="no-journal">
                  <i className="fas fa-book-open no-journal-icon"></i>
                  <h4>No journal entries yet</h4>
                  <p>Start documenting your journey and reflect on your progress!</p>
                  <button 
                    className="btn primary"
                    onClick={() => setShowAddJournal(true)}
                  >
                    Write Your First Entry
                  </button>
                </div>
              ) : (
                <>
                  <div className="journal-entries">
                    {journalEntries.map(entry => (
                      <div key={entry._id} className="journal-entry-card">
                        <div className="entry-header">
                          <div className="entry-title-section">
                            <h4>{entry.title}</h4>
                            <div className="entry-meta">
                              <span className="entry-date">
                                <i className="fas fa-calendar"></i>
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="entry-mood" style={{ color: getMoodColor(entry.mood) }}>
                                {getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                              </span>
                              {entry.isPrivate && (
                                <span className="entry-privacy">
                                  <i className="fas fa-lock"></i>
                                  Private
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="entry-actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditJournal(entry)}
                              title="Edit entry"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteJournal(entry._id)}
                              title="Delete entry"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="entry-content">
                          <p>{entry.content.length > 200 ? `${entry.content.substring(0, 200)}...` : entry.content}</p>
                        </div>
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="entry-tags">
                            {entry.tags.map((tag, index) => (
                              <span key={index} className="entry-tag">#{tag}</span>
                            ))}
                          </div>
                        )}
                        
                        {(entry.gratitude.length > 0 || entry.achievements.length > 0 || entry.challenges.length > 0) && (
                          <div className="entry-sections">
                            {entry.gratitude.length > 0 && (
                              <div className="entry-section gratitude">
                                <h5><i className="fas fa-heart"></i> Gratitude</h5>
                                <ul>
                                  {entry.gratitude.slice(0, 2).map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                  {entry.gratitude.length > 2 && (
                                    <li className="more-items">+{entry.gratitude.length - 2} more</li>
                                  )}
                                </ul>
                              </div>
                            )}
                            
                            {entry.achievements.length > 0 && (
                              <div className="entry-section achievements">
                                <h5><i className="fas fa-trophy"></i> Achievements</h5>
                                <ul>
                                  {entry.achievements.slice(0, 2).map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                  {entry.achievements.length > 2 && (
                                    <li className="more-items">+{entry.achievements.length - 2} more</li>
                                  )}
                                </ul>
                              </div>
                            )}
                            
                            {entry.challenges.length > 0 && (
                              <div className="entry-section challenges">
                                <h5><i className="fas fa-mountain"></i> Challenges</h5>
                                <ul>
                                  {entry.challenges.slice(0, 2).map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                  {entry.challenges.length > 2 && (
                                    <li className="more-items">+{entry.challenges.length - 2} more</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {entry.habitReflections && entry.habitReflections.length > 0 && (
                          <div className="entry-reflections">
                            <h5><i className="fas fa-sync"></i> Habit Reflections</h5>
                            <div className="reflections-list">
                              {entry.habitReflections.map((reflection, index) => (
                                <div key={index} className="reflection-item">
                                  <span className="reflection-habit">{reflection.habit?.name}</span>
                                  <div className="reflection-rating">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i} 
                                        className={`fas fa-star ${i < reflection.rating ? 'filled' : ''}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {journalPagination.pages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => handleJournalFilterChange({ page: journalFilters.page - 1 })}
                        disabled={journalFilters.page <= 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                        Previous
                      </button>
                      
                      <div className="pagination-info">
                        Page {journalPagination.current} of {journalPagination.pages}
                        <span className="total-entries">({journalPagination.total} entries)</span>
                      </div>
                      
                      <button
                        className="pagination-btn"
                        onClick={() => handleJournalFilterChange({ page: journalFilters.page + 1 })}
                        disabled={journalFilters.page >= journalPagination.pages}
                      >
                        Next
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="dashboard-content">
              <div className="section-header">
                <h2><i className="fas fa-user-circle"></i> Profile</h2>
              </div>

              <div className="profile-container">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                  <div className="profile-cover"></div>
                  <div className="profile-main">
                    <div className="profile-avatar-section">
                      <div className="profile-avatar-large">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Profile" />
                        ) : (
                          <div className="avatar-placeholder-large">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </div>
                      <button 
                        className="edit-avatar-btn"
                        onClick={() => setShowProfileEdit(true)}
                        title="Edit Profile"
                      >
                        <i className="fas fa-camera"></i>
                      </button>
                    </div>
                    <div className="profile-header-info">
                      <h2>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}</h2>
                      <p className="profile-username">@{user?.username}</p>
                      {user?.bio && <p className="profile-bio-text">{user.bio}</p>}
                      <div className="profile-meta">
                        <span><i className="fas fa-calendar-alt"></i> Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="profile-details-grid">
                  {/* Contact Information */}
                  <div className="profile-detail-card">
                    <div className="detail-card-header">
                      <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                      <button 
                        className="edit-detail-btn"
                        onClick={() => setShowProfileEdit(true)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    </div>
                    <div className="detail-card-body">
                      <div className="detail-item">
                        <span className="detail-label"><i className="fas fa-envelope"></i> Email</span>
                        <span className="detail-value">{user?.email || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label"><i className="fas fa-phone"></i> Phone</span>
                        <span className="detail-value">{user?.phone || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label"><i className="fas fa-map-marker-alt"></i> Location</span>
                        <span className="detail-value">{user?.location || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label"><i className="fas fa-globe"></i> Website</span>
                        <span className="detail-value">
                          {user?.website ? (
                            <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a>
                          ) : (
                            'Not provided'
                          )}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label"><i className="fas fa-birthday-cake"></i> Birth Date</span>
                        <span className="detail-value">
                          {user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Statistics */}
                  <div className="profile-detail-card">
                    <div className="detail-card-header">
                      <h3><i className="fas fa-chart-line"></i> Statistics</h3>
                    </div>
                    <div className="detail-card-body">
                      <div className="stat-item">
                        <div className="stat-icon habits">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{habits.length}</span>
                          <span className="stat-label">Active Habits</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon completions">
                          <i className="fas fa-trophy"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{analytics?.totalCompletions || 0}</span>
                          <span className="stat-label">Total Completions</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon goals">
                          <i className="fas fa-bullseye"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{goals.length}</span>
                          <span className="stat-label">Goals Set</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon journal">
                          <i className="fas fa-book"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{journalAnalytics?.totalEntries || 0}</span>
                          <span className="stat-label">Journal Entries</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon points">
                          <i className="fas fa-star"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{userPoints.total}</span>
                          <span className="stat-label">Total Points</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="profile-detail-card">
                    <div className="detail-card-header">
                      <h3><i className="fas fa-cog"></i> Account Actions</h3>
                    </div>
                    <div className="detail-card-body">
                      <button 
                        className="profile-action-btn primary"
                        onClick={() => setShowProfileEdit(true)}
                      >
                        <i className="fas fa-user-edit"></i>
                        Edit Profile
                      </button>
                      <button 
                        className="profile-action-btn secondary"
                        onClick={() => setShowPasswordChange(true)}
                      >
                        <i className="fas fa-key"></i>
                        Change Password
                      </button>
                      <button 
                        className="profile-action-btn secondary"
                        onClick={exportData}
                      >
                        <i className="fas fa-download"></i>
                        Export Data
                      </button>
                      <button 
                        className="profile-action-btn danger"
                        onClick={() => setShowDeleteAccount(true)}
                      >
                        <i className="fas fa-trash-alt"></i>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showAddHabit && (
        <div className="modal-overlay" onClick={() => setShowAddHabit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Habit</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddHabit(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddHabit} className="modal-body">
              <div className="form-group">
                <label>Habit Name *</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  placeholder="e.g., Drink 8 glasses of water"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  placeholder="Describe your habit..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                  >
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="productivity">Productivity</option>
                    <option value="study">Study</option>
                    <option value="fitness">Fitness</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newHabit.priority}
                    onChange={(e) => setNewHabit({...newHabit, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Goal (optional)</label>
                  <input
                    type="text"
                    value={newHabit.goal}
                    onChange={(e) => setNewHabit({...newHabit, goal: e.target.value})}
                    placeholder="e.g., 30 days streak"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Reminder Time (optional)</label>
                <input
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowAddHabit(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditHabit && (
        <div className="modal-overlay" onClick={() => setShowEditHabit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Habit</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditHabit(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateHabit} className="modal-body">
              <div className="form-group">
                <label>Habit Name *</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  placeholder="e.g., Drink 8 glasses of water"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  placeholder="Describe your habit..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                  >
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="productivity">Productivity</option>
                    <option value="study">Study</option>
                    <option value="fitness">Fitness</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newHabit.priority}
                    onChange={(e) => setNewHabit({...newHabit, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Goal (optional)</label>
                  <input
                    type="text"
                    value={newHabit.goal}
                    onChange={(e) => setNewHabit({...newHabit, goal: e.target.value})}
                    placeholder="e.g., 30 days streak"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Reminder Time (optional)</label>
                <input
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowEditHabit(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="modal-overlay" onClick={() => setShowAddGoal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Goal</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddGoal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddGoal} className="modal-body">
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Lose 10 kg weight"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe your goal in detail..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  >
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="productivity">Productivity</option>
                    <option value="study">Study</option>
                    <option value="fitness">Fitness</option>
                    <option value="career">Career</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Target Value *</label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                    placeholder="e.g., 10"
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    placeholder="e.g., kg, books, hours"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Target Date *</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Related Habits (Optional)</label>
                <div className="habits-selector">
                  {habits.map(habit => (
                    <label key={habit._id} className="habit-checkbox">
                      <input
                        type="checkbox"
                        checked={newGoal.relatedHabits.includes(habit._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewGoal({
                              ...newGoal,
                              relatedHabits: [...newGoal.relatedHabits, habit._id]
                            })
                          } else {
                            setNewGoal({
                              ...newGoal,
                              relatedHabits: newGoal.relatedHabits.filter(id => id !== habit._id)
                            })
                          }
                        }}
                      />
                      <span className={`habit-name ${habit.category}`}>{habit.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowAddGoal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && (
        <div className="modal-overlay" onClick={() => setShowEditGoal(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Goal</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditGoal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateGoal} className="modal-body">
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Lose 10 kg weight"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Describe your goal in detail..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  >
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="productivity">Productivity</option>
                    <option value="study">Study</option>
                    <option value="fitness">Fitness</option>
                    <option value="career">Career</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Target Value *</label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                    placeholder="e.g., 10"
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    placeholder="e.g., kg, books, hours"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Target Date *</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Related Habits (Optional)</label>
                <div className="habits-selector">
                  {habits.map(habit => (
                    <label key={habit._id} className="habit-checkbox">
                      <input
                        type="checkbox"
                        checked={newGoal.relatedHabits.includes(habit._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewGoal({
                              ...newGoal,
                              relatedHabits: [...newGoal.relatedHabits, habit._id]
                            })
                          } else {
                            setNewGoal({
                              ...newGoal,
                              relatedHabits: newGoal.relatedHabits.filter(id => id !== habit._id)
                            })
                          }
                        }}
                      />
                      <span className={`habit-name ${habit.category}`}>{habit.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowEditGoal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && progressGoal && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Progress - {progressGoal.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProgressModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateProgress} className="modal-body">
              <div className="current-progress">
                <h4>Current Progress</h4>
                <div className="progress-display">
                  <span className="progress-value">
                    {progressGoal.currentValue} / {progressGoal.targetValue} {progressGoal.unit}
                  </span>
                  <span className="progress-percentage">
                    {getProgressPercentage(progressGoal)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(progressGoal)}%` }}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>New Progress Value *</label>
                <input
                  type="number"
                  value={progressUpdate.value}
                  onChange={(e) => setProgressUpdate({...progressUpdate, value: e.target.value})}
                  placeholder={`Current: ${progressGoal.currentValue}`}
                  required
                  min="0"
                  max={progressGoal.targetValue}
                  step="0.1"
                />
                <small>Enter your current progress towards the goal</small>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={progressUpdate.notes}
                  onChange={(e) => setProgressUpdate({...progressUpdate, notes: e.target.value})}
                  placeholder="Add any notes about your progress..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowProgressModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reward Modal */}
      {showAddReward && (
        <div className="modal-overlay" onClick={() => setShowAddReward(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Reward</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddReward(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddReward} className="modal-body">
              <div className="form-group">
                <label>Reward Title *</label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward({...newReward, title: e.target.value})}
                  placeholder="e.g., Movie Night, New Book, Favorite Meal"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                  placeholder="Describe your reward in detail..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({...newReward, category: e.target.value})}
                  >
                    <option value="entertainment">Entertainment</option>
                    <option value="food">Food</option>
                    <option value="shopping">Shopping</option>
                    <option value="experience">Experience</option>
                    <option value="relaxation">Relaxation</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newReward.priority}
                    onChange={(e) => setNewReward({...newReward, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Points Required *</label>
                  <input
                    type="number"
                    value={newReward.pointsRequired}
                    onChange={(e) => setNewReward({...newReward, pointsRequired: e.target.value})}
                    placeholder="e.g., 50"
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Cost (Optional)</label>
                  <input
                    type="number"
                    value={newReward.cost}
                    onChange={(e) => setNewReward({...newReward, cost: e.target.value})}
                    placeholder="e.g., 25.99"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  value={newReward.imageUrl}
                  onChange={(e) => setNewReward({...newReward, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowAddReward(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Add Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Reward Modal */}
      {showEditReward && (
        <div className="modal-overlay" onClick={() => setShowEditReward(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Reward</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditReward(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateReward} className="modal-body">
              <div className="form-group">
                <label>Reward Title *</label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward({...newReward, title: e.target.value})}
                  placeholder="e.g., Movie Night, New Book, Favorite Meal"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                  placeholder="Describe your reward in detail..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({...newReward, category: e.target.value})}
                  >
                    <option value="entertainment">Entertainment</option>
                    <option value="food">Food</option>
                    <option value="shopping">Shopping</option>
                    <option value="experience">Experience</option>
                    <option value="relaxation">Relaxation</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newReward.priority}
                    onChange={(e) => setNewReward({...newReward, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Points Required *</label>
                  <input
                    type="number"
                    value={newReward.pointsRequired}
                    onChange={(e) => setNewReward({...newReward, pointsRequired: e.target.value})}
                    placeholder="e.g., 50"
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Cost (Optional)</label>
                  <input
                    type="number"
                    value={newReward.cost}
                    onChange={(e) => setNewReward({...newReward, cost: e.target.value})}
                    placeholder="e.g., 25.99"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  value={newReward.imageUrl}
                  onChange={(e) => setNewReward({...newReward, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowEditReward(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Journal Entry Modal */}
      {showAddJournal && (
        <div className="modal-overlay" onClick={() => setShowAddJournal(false)}>
          <div className="modal large-modal journal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Journal Entry</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddJournal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddJournal} className="modal-body">
              <div className="form-group">
                <label>Entry Title *</label>
                <input
                  type="text"
                  value={newJournal.title}
                  onChange={(e) => setNewJournal({...newJournal, title: e.target.value})}
                  placeholder="e.g., Productive Monday, Weekend Reflections"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Mood *</label>
                  <select
                    value={newJournal.mood}
                    onChange={(e) => setNewJournal({...newJournal, mood: e.target.value})}
                    required
                  >
                    <option value="excellent">😄 Excellent</option>
                    <option value="good">😊 Good</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="bad">😞 Bad</option>
                    <option value="terrible">😢 Terrible</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Privacy</label>
                  <select
                    value={newJournal.isPrivate}
                    onChange={(e) => setNewJournal({...newJournal, isPrivate: e.target.value === 'true'})}
                  >
                    <option value="true">🔒 Private</option>
                    <option value="false">🌍 Public</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newJournal.content}
                  onChange={(e) => setNewJournal({...newJournal, content: e.target.value})}
                  placeholder="Write about your day, thoughts, experiences..."
                  rows="6"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tags (Optional)</label>
                <input
                  type="text"
                  value={newJournal.tags.join(', ')}
                  onChange={(e) => setNewJournal({
                    ...newJournal, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  placeholder="work, personal, health, goals (comma separated)"
                />
              </div>
              
              {/* Gratitude Section */}
              <div className="form-section">
                <h4><i className="fas fa-heart"></i> Gratitude</h4>
                {newJournal.gratitude.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('gratitude', index, e.target.value)}
                      placeholder="What are you grateful for today?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('gratitude', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('gratitude')}
                >
                  <i className="fas fa-plus"></i> Add Gratitude
                </button>
              </div>
              
              {/* Achievements Section */}
              <div className="form-section">
                <h4><i className="fas fa-trophy"></i> Achievements</h4>
                {newJournal.achievements.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                      placeholder="What did you accomplish today?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('achievements', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('achievements')}
                >
                  <i className="fas fa-plus"></i> Add Achievement
                </button>
              </div>
              
              {/* Challenges Section */}
              <div className="form-section">
                <h4><i className="fas fa-mountain"></i> Challenges</h4>
                {newJournal.challenges.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('challenges', index, e.target.value)}
                      placeholder="What challenges did you face?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('challenges', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('challenges')}
                >
                  <i className="fas fa-plus"></i> Add Challenge
                </button>
              </div>
              
              {/* Tomorrow Goals Section */}
              <div className="form-section">
                <h4><i className="fas fa-calendar-plus"></i> Tomorrow's Goals</h4>
                {newJournal.tomorrowGoals.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('tomorrowGoals', index, e.target.value)}
                      placeholder="What do you want to achieve tomorrow?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('tomorrowGoals', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('tomorrowGoals')}
                >
                  <i className="fas fa-plus"></i> Add Tomorrow Goal
                </button>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowAddJournal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Journal Entry Modal */}
      {showEditJournal && (
        <div className="modal-overlay" onClick={() => setShowEditJournal(false)}>
          <div className="modal large-modal journal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Journal Entry</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditJournal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleUpdateJournal} className="modal-body">
              <div className="form-group">
                <label>Entry Title *</label>
                <input
                  type="text"
                  value={newJournal.title}
                  onChange={(e) => setNewJournal({...newJournal, title: e.target.value})}
                  placeholder="e.g., Productive Monday, Weekend Reflections"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Mood *</label>
                  <select
                    value={newJournal.mood}
                    onChange={(e) => setNewJournal({...newJournal, mood: e.target.value})}
                    required
                  >
                    <option value="excellent">😄 Excellent</option>
                    <option value="good">😊 Good</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="bad">😞 Bad</option>
                    <option value="terrible">😢 Terrible</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Privacy</label>
                  <select
                    value={newJournal.isPrivate}
                    onChange={(e) => setNewJournal({...newJournal, isPrivate: e.target.value === 'true'})}
                  >
                    <option value="true">🔒 Private</option>
                    <option value="false">🌍 Public</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newJournal.content}
                  onChange={(e) => setNewJournal({...newJournal, content: e.target.value})}
                  placeholder="Write about your day, thoughts, experiences..."
                  rows="6"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tags (Optional)</label>
                <input
                  type="text"
                  value={newJournal.tags.join(', ')}
                  onChange={(e) => setNewJournal({
                    ...newJournal, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  placeholder="work, personal, health, goals (comma separated)"
                />
              </div>
              
              {/* Gratitude Section */}
              <div className="form-section">
                <h4><i className="fas fa-heart"></i> Gratitude</h4>
                {newJournal.gratitude.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('gratitude', index, e.target.value)}
                      placeholder="What are you grateful for today?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('gratitude', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('gratitude')}
                >
                  <i className="fas fa-plus"></i> Add Gratitude
                </button>
              </div>
              
              {/* Achievements Section */}
              <div className="form-section">
                <h4><i className="fas fa-trophy"></i> Achievements</h4>
                {newJournal.achievements.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                      placeholder="What did you accomplish today?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('achievements', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('achievements')}
                >
                  <i className="fas fa-plus"></i> Add Achievement
                </button>
              </div>
              
              {/* Challenges Section */}
              <div className="form-section">
                <h4><i className="fas fa-mountain"></i> Challenges</h4>
                {newJournal.challenges.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('challenges', index, e.target.value)}
                      placeholder="What challenges did you face?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('challenges', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('challenges')}
                >
                  <i className="fas fa-plus"></i> Add Challenge
                </button>
              </div>
              
              {/* Tomorrow Goals Section */}
              <div className="form-section">
                <h4><i className="fas fa-calendar-plus"></i> Tomorrow's Goals</h4>
                {newJournal.tomorrowGoals.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('tomorrowGoals', index, e.target.value)}
                      placeholder="What do you want to achieve tomorrow?"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem('tomorrowGoals', index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={() => addArrayItem('tomorrowGoals')}
                >
                  <i className="fas fa-plus"></i> Add Tomorrow Goal
                </button>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowEditJournal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay" onClick={() => {setShowProfileEdit(false); setImagePreview(null);}}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button 
                className="close-btn"
                onClick={() => {setShowProfileEdit(false); setImagePreview(null);}}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={updateProfile} className="modal-body">
              {/* Profile Image Upload */}
              <div className="form-group">
                <label>Profile Picture</label>
                <div className="image-upload-container">
                  <div className="image-preview">
                    {(imagePreview || profileData.avatar) ? (
                      <img src={imagePreview || profileData.avatar} alt="Profile Preview" />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fas fa-user"></i>
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-actions">
                    <label htmlFor="image-upload" className="upload-btn">
                      <i className="fas fa-upload"></i>
                      Choose Image
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    {(imagePreview || profileData.avatar) && (
                      <button 
                        type="button"
                        className="remove-btn"
                        onClick={removeImage}
                      >
                        <i className="fas fa-trash"></i>
                        Remove
                      </button>
                    )}
                  </div>
                  <small className="upload-hint">
                    <i className="fas fa-info-circle"></i>
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows="3"
                  maxLength="500"
                />
                <small>{profileData.bio.length}/500 characters</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="form-group">
                  <label>Birth Date</label>
                  <input
                    type="date"
                    value={profileData.birthDate}
                    onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
                
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => {setShowProfileEdit(false); setImagePreview(null);}}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordChange && (
        <div className="modal-overlay" onClick={() => setShowPasswordChange(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPasswordChange(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={changePassword} className="modal-body">
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter your new password"
                  required
                  minLength="6"
                />
                <small>Password must be at least 6 characters long</small>
              </div>
              
              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm your new password"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowPasswordChange(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="modal-overlay" onClick={() => setShowDeleteAccount(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteAccount(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={deleteAccount} className="modal-body">
              <div className="danger-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <h4>This action cannot be undone!</h4>
                <p>Deleting your account will permanently remove all your data including habits, goals, journal entries, and progress. This action is irreversible.</p>
              </div>
              
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={deleteAccountData.password}
                  onChange={(e) => setDeleteAccountData({...deleteAccountData, password: e.target.value})}
                  placeholder="Enter your password to confirm"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Type "DELETE" to confirm *</label>
                <input
                  type="text"
                  value={deleteAccountData.confirmation}
                  onChange={(e) => setDeleteAccountData({...deleteAccountData, confirmation: e.target.value})}
                  placeholder="Type DELETE to confirm"
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn secondary"
                  onClick={() => setShowDeleteAccount(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn danger"
                  disabled={deleteAccountData.confirmation !== 'DELETE'}
                >
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Streak Notification Toast */}
      {showStreakNotification && streakNotifications.length > 0 && (
        <div className="streak-notification-container">
          {streakNotifications.map((notification, index) => (
            <div key={notification.id} className="streak-notification broken" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="notification-header">
                <i className="fas fa-exclamation-triangle"></i>
                <h4>Streak Ended</h4>
                <button 
                  className="close-notification"
                  onClick={() => setShowStreakNotification(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="notification-body">
                <p className="habit-name">{notification.habitName}</p>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-stats">
                  <span className="stat">
                    <i className="fas fa-fire-alt"></i>
                    Previous: {notification.previousStreak} days
                  </span>
                  <span className="stat">
                    <i className="fas fa-calendar-times"></i>
                    {notification.daysSince} {notification.daysSince === 1 ? 'day' : 'days'} ago
                  </span>
                </div>
                <button 
                  className="restart-btn"
                  onClick={() => {
                    setShowStreakNotification(false)
                    setActiveSection('habits')
                  }}
                >
                  <i className="fas fa-redo"></i>
                  Start Fresh
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder Notification Toast */}
      {showReminderNotification && reminderNotifications.length > 0 && (
        <div className="reminder-notification-container">
          {reminderNotifications.map((reminder, index) => (
            <div key={reminder.id} className="reminder-notification" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="notification-header">
                <i className="fas fa-bell"></i>
                <h4>Habit Reminder</h4>
                <button 
                  className="close-notification"
                  onClick={() => setShowReminderNotification(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="notification-body">
                <p className="habit-name">{reminder.habitName}</p>
                <p className="notification-message">
                  ⏰ It's time to complete your habit!
                </p>
                <div className="notification-stats">
                  <span className="stat">
                    <i className="fas fa-clock"></i>
                    Reminder: {reminder.reminderTime}
                  </span>
                  <span className="stat">
                    <i className="fas fa-fire"></i>
                    Current Streak: {reminder.streak} days
                  </span>
                  <span className={`stat priority-${reminder.priority}`}>
                    <i className="fas fa-flag"></i>
                    {reminder.priority} priority
                  </span>
                </div>
                <button 
                  className="complete-now-btn"
                  onClick={() => {
                    setShowReminderNotification(false)
                    handleCompleteHabit(reminder.id)
                  }}
                >
                  <i className="fas fa-check-circle"></i>
                  Complete Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard