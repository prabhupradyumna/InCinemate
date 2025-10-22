import moment from 'moment'
import { TOKEN_CONFIG } from '../constants.js'

/**
 * Date utility functions using moment.js
 * Provides consistent date handling across the application
 */

// Set default timezone (optional - can be configured via environment)
moment.tz.setDefault(process.env.TZ || 'UTC')

/**
 * Get current date and time
 * @returns {moment.Moment} Current moment object
 */
export const now = () => moment()

/**
 * Get current date in ISO format
 * @returns {string} Current date in ISO format
 */
export const nowISO = () => moment().toISOString()

/**
 * Add days to current date
 * @param {number} days - Number of days to add
 * @returns {moment.Moment} Moment object with added days
 */
export const addDays = (days) => moment().add(days, 'days')

/**
 * Add days to a specific date
 * @param {Date|string|moment.Moment} date - Base date
 * @param {number} days - Number of days to add
 * @returns {moment.Moment} Moment object with added days
 */
export const addDaysTo = (date, days) => moment(date).add(days, 'days')

/**
 * Add hours to current date
 * @param {number} hours - Number of hours to add
 * @returns {moment.Moment} Moment object with added hours
 */
export const addHours = (hours) => moment().add(hours, 'hours')

/**
 * Add hours to a specific date
 * @param {Date|string|moment.Moment} date - Base date
 * @param {number} hours - Number of hours to add
 * @returns {moment.Moment} Moment object with added hours
 */
export const addHoursTo = (date, hours) => moment(date).add(hours, 'hours')

/**
 * Add minutes to current date
 * @param {number} minutes - Number of minutes to add
 * @returns {moment.Moment} Moment object with added minutes
 */
export const addMinutes = (minutes) => moment().add(minutes, 'minutes')

/**
 * Add minutes to a specific date
 * @param {Date|string|moment.Moment} date - Base date
 * @param {number} minutes - Number of minutes to add
 * @returns {moment.Moment} Moment object with added minutes
 */
export const addMinutesTo = (date, minutes) => moment(date).add(minutes, 'minutes')

/**
 * Get date 7 days from now (for refresh token expiry)
 * @returns {Date} Date object 7 days from now
 */
export const getRefreshTokenExpiry = () => addDays(7).toDate()

/**
 * Get date 30 minutes from now (for access token expiry)
 * @returns {Date} Date object 30 minutes from now
 */
export const getAccessTokenExpiry = () => addMinutes(30).toDate()

/**
 * Get date 1 hour from now (for general short-term expiry)
 * @returns {Date} Date object 1 hour from now
 */
export const getOneHourFromNow = () => addHours(1).toDate()

/**
 * Get date 24 hours from now (for daily expiry)
 * @returns {Date} Date object 24 hours from now
 */
export const getOneDayFromNow = () => addDays(1).toDate()

/**
 * Format date to ISO string
 * @param {Date|string|moment.Moment} date - Date to format
 * @returns {string} ISO formatted date string
 */
export const toISOString = (date) => moment(date).toISOString()

/**
 * Format date to readable string
 * @param {Date|string|moment.Moment} date - Date to format
 * @param {string} format - Moment format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => moment(date).format(format)

/**
 * Check if date is in the past
 * @param {Date|string|moment.Moment} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date) => moment(date).isBefore(moment())

/**
 * Check if date is in the future
 * @param {Date|string|moment.Moment} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (date) => moment(date).isAfter(moment())

/**
 * Check if date is today
 * @param {Date|string|moment.Moment} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => moment(date).isSame(moment(), 'day')

/**
 * Get difference between two dates in days
 * @param {Date|string|moment.Moment} date1 - First date
 * @param {Date|string|moment.Moment} date2 - Second date
 * @returns {number} Difference in days
 */
export const diffInDays = (date1, date2) => moment(date1).diff(moment(date2), 'days')

/**
 * Get difference between two dates in hours
 * @param {Date|string|moment.Moment} date1 - First date
 * @param {Date|string|moment.Moment} date2 - Second date
 * @returns {number} Difference in hours
 */
export const diffInHours = (date1, date2) => moment(date1).diff(moment(date2), 'hours')

/**
 * Get difference between two dates in minutes
 * @param {Date|string|moment.Moment} date1 - First date
 * @param {Date|string|moment.Moment} date2 - Second date
 * @returns {number} Difference in minutes
 */
export const diffInMinutes = (date1, date2) => moment(date1).diff(moment(date2), 'minutes')

/**
 * Parse date string to moment object
 * @param {string} dateString - Date string to parse
 * @param {string} format - Expected format (optional)
 * @returns {moment.Moment} Parsed moment object
 */
export const parseDate = (dateString, format = null) => {
  return format ? moment(dateString, format) : moment(dateString)
}

/**
 * Get start of day for a date
 * @param {Date|string|moment.Moment} date - Date to get start of day for
 * @returns {moment.Moment} Start of day moment object
 */
export const startOfDay = (date) => moment(date).startOf('day')

/**
 * Get end of day for a date
 * @param {Date|string|moment.Moment} date - Date to get end of day for
 * @returns {moment.Moment} End of day moment object
 */
export const endOfDay = (date) => moment(date).endOf('day')

/**
 * Get start of week for a date
 * @param {Date|string|moment.Moment} date - Date to get start of week for
 * @returns {moment.Moment} Start of week moment object
 */
export const startOfWeek = (date) => moment(date).startOf('week')

/**
 * Get end of week for a date
 * @param {Date|string|moment.Moment} date - Date to get end of week for
 * @returns {moment.Moment} End of week moment object
 */
export const endOfWeek = (date) => moment(date).endOf('week')

/**
 * Get start of month for a date
 * @param {Date|string|moment.Moment} date - Date to get start of month for
 * @returns {moment.Moment} Start of month moment object
 */
export const startOfMonth = (date) => moment(date).startOf('month')

/**
 * Get end of month for a date
 * @param {Date|string|moment.Moment} date - Date to get end of month for
 * @returns {moment.Moment} End of month moment object
 */
export const endOfMonth = (date) => moment(date).endOf('month')

// Export moment for direct use if needed
export { moment }

export default {
  now,
  nowISO,
  addDays,
  addDaysTo,
  addHours,
  addHoursTo,
  addMinutes,
  addMinutesTo,
  getRefreshTokenExpiry,
  getAccessTokenExpiry,
  getOneHourFromNow,
  getOneDayFromNow,
  toISOString,
  formatDate,
  isPast,
  isFuture,
  isToday,
  diffInDays,
  diffInHours,
  diffInMinutes,
  parseDate,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  moment
}
