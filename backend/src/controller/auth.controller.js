import { defineUser } from '../models/User.js'
import { defineRefreshToken } from '../models/RefreshToken.js'
import { defineTenant } from '../models/Tenant.js'
import { comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken, hashPassword } from '../util/auth.util.js'
import TokenCacheService from '../services/tokenCache.js'
import { getRefreshTokenExpiry, addDays, moment } from '../util/date.util.js'
import { ROLES, TOKEN_CONFIG, API_MESSAGES, HTTP_STATUS } from '../constants.js'
import { createOtpService } from '../services/otpService.js'

export default class AuthController {
  static async superAdminLogin(req, res) {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          success: false, 
          error: API_MESSAGES.ERROR.EMAIL_PASSWORD_REQUIRED, 
          message: 'Super-admin login failed' 
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      await User.sync()

      const superAdmin = await User.findOne({ 
        where: { email, role: ROLES.SUPER_ADMIN } 
      })
      
      if (!superAdmin) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
          success: false, 
          error: API_MESSAGES.ERROR.INVALID_CREDENTIALS, 
          message: 'Super-admin login failed' 
        })
      }

      const isPasswordValid = await comparePassword(password, superAdmin.password_hash)
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
          success: false, 
          error: API_MESSAGES.ERROR.INVALID_CREDENTIALS, 
          message: 'Super-admin login failed' 
        })
      }

      const accessToken = generateAccessToken({
        userId: superAdmin.id,
        email: superAdmin.email,
        role: ROLES.SUPER_ADMIN,
        tenantId: null,
      })

      const refreshToken = generateRefreshToken({
        userId: superAdmin.id,
        email: superAdmin.email,
        tenantId: null,
      })

      // Store access token in Redis cache
      const userInfo = {
        userId: superAdmin.id,
        email: superAdmin.email,
        role: ROLES.SUPER_ADMIN,
        tenantId: null,
      }
      await TokenCacheService.storeAccessToken(accessToken, userInfo)

      // Store refresh token in database (long-lived)
      const RefreshToken = defineRefreshToken(sequelize)
      await RefreshToken.sync()
      
      await RefreshToken.create({
        user_id: superAdmin.id,
        token: refreshToken,
        expires_at: getRefreshTokenExpiry(), // 7 days using moment.js
        tenant_id: null,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: TOKEN_CONFIG.COOKIE.HTTP_ONLY,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        sameSite: TOKEN_CONFIG.COOKIE.SAME_SITE,
        secure: TOKEN_CONFIG.COOKIE.SECURE,
        path: TOKEN_CONFIG.COOKIE.PATH
      })

      return res.json({
        data: {
          accessToken,
          user: { userId: superAdmin.id, email: superAdmin.email, role: 'super_admin' }
        },
        message: 'Super-admin login successful'
      })
    } catch (err) {
      console.error(`[AuthController]-[superAdminLogin]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'Super-admin login error' })
    }
  }

  static async adminLogin(req, res) {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required', message: 'Admin login failed' })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Tenant = defineTenant(sequelize)
      await Promise.all([User.sync(), Tenant.sync()])

      // Find admin user by email and role
      const admin = await User.findOne({ 
        where: { email, role: 'admin' } 
      })
      
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Admin login failed' })
      }

      // Verify admin has a tenant_id and tenant is active
      if (!admin.tenant_id) {
        return res.status(401).json({ success: false, error: 'Admin not assigned to any tenant', message: 'Admin login failed' })
      }

      const tenant = await Tenant.findOne({ 
        where: { tenant_id: admin.tenant_id, is_active: true } 
      })
      
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Invalid or inactive tenant', message: 'Admin login failed' })
      }

      const isPasswordValid = await comparePassword(password, admin.password_hash)
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Admin login failed' })
      }

      const accessToken = generateAccessToken({
        userId: admin.id,
        email: admin.email,
        role: 'admin',
        tenantId: admin.tenant_id,
      })

      const refreshToken = generateRefreshToken({
        userId: admin.id,
        email: admin.email,
        tenantId: admin.tenant_id,
      })

      // Store access token in Redis cache
      const userInfo = {
        userId: admin.id,
        email: admin.email,
        role: 'admin',
        tenantId: admin.tenant_id,
      }
      await TokenCacheService.storeAccessToken(accessToken, userInfo)

      // Store refresh token in database (long-lived)
      const RefreshToken = defineRefreshToken(sequelize)
      await RefreshToken.sync()
      
      await RefreshToken.create({
        user_id: admin.id,
        token: refreshToken,
        expires_at: getRefreshTokenExpiry(), // 7 days using moment.js
        tenant_id: admin.tenant_id,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: TOKEN_CONFIG.COOKIE.HTTP_ONLY,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        sameSite: TOKEN_CONFIG.COOKIE.SAME_SITE,
        secure: TOKEN_CONFIG.COOKIE.SECURE,
        path: TOKEN_CONFIG.COOKIE.PATH
      })

      return res.json({
        data: {
          accessToken,
          user: { userId: admin.id, email: admin.email, role: 'admin', tenantId: admin.tenant_id }
        },
        message: 'Admin login successful'
      })
    } catch (err) {
      console.error(`[AuthController]-[adminLogin]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'Admin login error' })
    }
  }

  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken
      
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: 'Refresh token required', message: 'Token refresh failed' })
      }

      const payload = verifyRefreshToken(refreshToken)
      if (!payload || !payload.userId) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token', message: 'Token refresh failed' })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const RefreshToken = defineRefreshToken(sequelize)
      await Promise.all([User.sync(), RefreshToken.sync()])

      // Find and validate refresh token
      const tokenRecord = await RefreshToken.findOne({
        where: { 
          token: refreshToken, 
          user_id: payload.userId, 
          revoked: false, 
          expires_at: { [sequelize.Sequelize.Op.gt]: new Date() } 
        }
      })

      if (!tokenRecord) {
        return res.status(401).json({ success: false, error: 'Invalid or revoked refresh token', message: 'Token refresh failed' })
      }

      // Get user
      const user = await User.findByPk(payload.userId)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found', message: 'Token refresh failed' })
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      })

      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        tenantId: user.tenant_id,
      })

      // Store new access token in Redis cache
      const userInfo = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      }
      await TokenCacheService.storeAccessToken(newAccessToken, userInfo)

      // Revoke old refresh token and create new one
      await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } })
      await RefreshToken.create({
        user_id: user.id,
        token: newRefreshToken,
        expires_at: getRefreshTokenExpiry(), // 7 days using moment.js
        tenant_id: user.tenant_id,
      })

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: TOKEN_CONFIG.COOKIE.HTTP_ONLY,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        sameSite: TOKEN_CONFIG.COOKIE.SAME_SITE,
        secure: TOKEN_CONFIG.COOKIE.SECURE,
        path: TOKEN_CONFIG.COOKIE.PATH
      })

      return res.json({
        data: { 
          accessToken: newAccessToken, 
          user: { userId: user.id, email: user.email, role: user.role, tenantId: user.tenant_id } 
        },
        message: 'Token refreshed successfully'
      })
    } catch (err) {
      console.error(`[AuthController]-[refresh]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'Refresh error' })
    }
  }

  static async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken
      const authHeader = req.headers['authorization']
      const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
      
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: 'Refresh token required', message: 'Logout failed' })
      }

      const payload = verifyRefreshToken(refreshToken)
      if (!payload || !payload.userId) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token', message: 'Logout failed' })
      }

      const sequelize = req.db
      const RefreshToken = defineRefreshToken(sequelize)
      await RefreshToken.sync()

      // Blacklist access token if provided
      if (accessToken) {
        await TokenCacheService.blacklistToken(accessToken)
      }

      // Revoke refresh token
      await RefreshToken.update({ revoked: true }, {
        where: { token: refreshToken, user_id: payload.userId }
      })

      res.clearCookie('refreshToken', {
        httpOnly: TOKEN_CONFIG.COOKIE.HTTP_ONLY,
        sameSite: TOKEN_CONFIG.COOKIE.SAME_SITE,
        secure: TOKEN_CONFIG.COOKIE.SECURE,
        path: TOKEN_CONFIG.COOKIE.PATH
      })

      return res.json({ message: 'Logged out successfully' })
    } catch (err) {
      console.error(`[AuthController]-[logout]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'Logout failed' })
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const { userId, role, tenantId } = req.user

      const sequelize = req.db
      const User = defineUser(sequelize)
      await User.sync()

      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found', message: 'Failed to fetch current user' })
      }

      const userProfile = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        fullName: user.full_name,
        phone: user.phone,
        isActive: user.is_active,
      }

      return res.json({ data: userProfile, message: 'Current user fetched' })
    } catch (err) {
      console.error(`[AuthController]-[getCurrentUser]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch current user' })
    }
  }

  // ==============================
  // CUSTOMER OTP AUTH
  // ==============================

  static async requestCustomerOtp(req, res) {
    try {
      const { email, phone, channel = email ? 'email' : 'sms', purpose = 'login' } = req.body
      const recipient = channel === 'sms' ? phone : email
      if (!recipient) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'recipient required', message: 'OTP request failed' })
      }

      const sequelize = req.db
      const { requestOtp } = createOtpService(sequelize)
      const tenantId = req.tenantId || null
      const { code } = await requestOtp({ recipient, channel, purpose, tenantId })

      // Send via provider: for now log in non-production
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[otp] ${channel} OTP to ${recipient}: ${code}`)
      }

      return res.json({ message: 'OTP sent' })
    } catch (err) {
      console.error(`[AuthController]-[requestCustomerOtp]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'OTP request error' })
    }
  }

  static async verifyCustomerOtp(req, res) {
    try {
      const { email, phone, code, channel = email ? 'email' : 'sms' } = req.body
      const recipient = channel === 'sms' ? phone : email
      if (!recipient || !code) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'recipient and code required', message: 'OTP verification failed' })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const RefreshToken = defineRefreshToken(sequelize)
      await Promise.all([User.sync(), RefreshToken.sync()])

      const { verifyOtp } = createOtpService(sequelize)
      const result = await verifyOtp({ recipient, code, purpose: 'login' })
      if (!result.ok) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: result.reason, message: 'OTP verification failed' })
      }

      // Upsert user
      let user = await User.findOne({ where: channel === 'sms' ? { phone: recipient } : { email: recipient } })
      if (!user) {
        const payload = {
          email: channel === 'email' ? recipient : null,
          phone: channel === 'sms' ? recipient : null,
          role: ROLES.CUSTOMER,
          password_hash: null,
          tenant_id: null,
          is_active: true,
        }
        user = await User.create(payload)
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: ROLES.CUSTOMER,
        tenantId: user.tenant_id,
      })

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        tenantId: user.tenant_id,
      })

      await TokenCacheService.storeAccessToken(accessToken, {
        userId: user.id,
        email: user.email,
        role: ROLES.CUSTOMER,
        tenantId: user.tenant_id,
      })

      await RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
        expires_at: getRefreshTokenExpiry(),
        tenant_id: user.tenant_id,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: TOKEN_CONFIG.COOKIE.HTTP_ONLY,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: TOKEN_CONFIG.COOKIE.SAME_SITE,
        secure: TOKEN_CONFIG.COOKIE.SECURE,
        path: TOKEN_CONFIG.COOKIE.PATH
      })

      return res.json({
        data: {
          accessToken,
          user: { userId: user.id, email: user.email, role: ROLES.CUSTOMER }
        },
        message: 'OTP verified successfully'
      })
    } catch (err) {
      console.error(`[AuthController]-[verifyCustomerOtp]: ${err.message}`)
      return res.status(500).json({ success: false, error: err.message, message: 'OTP verification error' })
    }
  }
}
