import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PASSWORD_CONFIG, TOKEN_CONFIG } from '../constants.js'

const SALT_ROUNDS = PASSWORD_CONFIG.SALT_ROUNDS

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

export const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role || null,
        tenantId: payload.tenantId || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.EXPIRY }
    )
    return token
  } catch (error) {
    console.error(`[auth.util]-[generateAccessToken]: ${error.message}`)
    throw new Error('Error generating access token: ' + error.message)
  }
}

export const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      { userId: payload.userId, email: payload.email, tenantId: payload.tenantId || null },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: TOKEN_CONFIG.REFRESH_TOKEN.EXPIRY }
    )
    return token
  } catch (error) {
    console.error(`[auth.util]-[generateRefreshToken]: ${error.message}`)
    throw new Error('Error generating refresh token: ' + error.message)
  }
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    console.error(`[auth.util]-[verifyToken]: ${error.message}`)
    throw error
  }
}

export const verifyRefreshToken = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided')
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    return decoded
  } catch (error) {
    console.error(`[auth.util]-[verifyRefreshToken]: ${error.message}`)
    throw error
  }
}

export const generateTemporaryPassword = () => {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one character from each category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)] // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // special char
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}