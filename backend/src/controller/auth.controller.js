import { defineUser } from '../models/User.js'
import { defineRefreshToken } from '../models/RefreshToken.js'
import { defineTenant } from '../models/Tenant.js'
import { comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken, hashPassword } from '../util/auth.util.js'

export default class AuthController {
  static async superAdminLogin(req, res) {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required', message: 'Super-admin login failed' })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      await User.sync()

      const superAdmin = await User.findOne({ 
        where: { email, role: 'super_admin' } 
      })
      
      if (!superAdmin) {
        return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Super-admin login failed' })
      }

      const isPasswordValid = await comparePassword(password, superAdmin.password_hash)
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Super-admin login failed' })
      }

      const accessToken = generateAccessToken({
        userId: superAdmin.id,
        email: superAdmin.email,
        role: 'super_admin',
        tenantId: null,
      })

      const refreshToken = generateRefreshToken({
        userId: superAdmin.id,
        email: superAdmin.email,
        tenantId: null,
      })

      // Store refresh token
      const RefreshToken = defineRefreshToken(sequelize)
      await RefreshToken.sync()
      
      await RefreshToken.create({
        user_id: superAdmin.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        tenant_id: null,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
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

      // Store refresh token
      const RefreshToken = defineRefreshToken(sequelize)
      await RefreshToken.sync()
      
      await RefreshToken.create({
        user_id: admin.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        tenant_id: admin.tenant_id,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
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

      // Revoke old token and create new one
      await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } })
      await RefreshToken.create({
        user_id: user.id,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tenant_id: user.tenant_id,
      })

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
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

      // Revoke refresh token
      await RefreshToken.update({ revoked: true }, {
        where: { token: refreshToken, user_id: payload.userId }
      })

      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
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
}
