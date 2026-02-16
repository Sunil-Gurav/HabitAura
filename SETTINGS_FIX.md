# Settings API Fix

## Problem
The `/api/auth/settings` endpoint was returning a 500 Internal Server Error when trying to update user settings.

## Root Cause
The original implementation was doing a shallow merge of the settings object:
```javascript
req.user.settings = {
  ...req.user.settings,
  ...settings
}
```

This doesn't work properly for nested objects in Mongoose. When updating nested fields like `notifications.email` or `preferences.theme`, the shallow merge would replace the entire nested object instead of merging individual properties.

## Solution
Implemented a deep merge strategy that:

1. **Initializes settings if not exists** - Ensures the settings object structure exists
2. **Deep merges nested objects** - Properly merges each category (notifications, privacy, preferences, account)
3. **Marks field as modified** - Uses `req.user.markModified('settings')` to tell Mongoose the nested object changed
4. **Better error logging** - Added detailed error messages for debugging

## Fixed Code
```javascript
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
```

## How to Test
1. **Restart the backend server** (if it's running):
   ```bash
   cd backend
   npm start
   ```

2. **Test in the frontend**:
   - Go to Settings section
   - Toggle any notification setting
   - Change theme preference
   - Update privacy settings
   - All changes should now save successfully without 500 errors

## What Was Fixed
✅ Deep merge for nested settings objects
✅ Proper Mongoose field modification marking
✅ Better error logging with detailed messages
✅ Initialization of settings structure if missing
✅ Handles all setting categories: notifications, privacy, preferences, account

## Next Steps
After restarting the backend server, all settings features should work properly:
- ✅ Notification toggles
- ✅ Theme changes (apply immediately)
- ✅ Privacy settings
- ✅ Preference updates
- ✅ Account settings
