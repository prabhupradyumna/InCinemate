import { defineUser } from '../models/User.js'
import { definePermission } from '../models/Permission.js'
import { defineAdminPermission } from '../models/AdminPermission.js'
import { HTTP_STATUS, API_MESSAGES } from '../constants.js'

/**
 * Middleware to check if user has specific permission
 * @param {string} permissionName - The name of the permission to check
 * @returns {Function} Express middleware function
 */
export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next()
      }

      // Only admin users can have permissions
      if (req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: API_MESSAGES.ERROR.INSUFFICIENT_ROLE,
          message: 'Permission required'
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Permission = definePermission(sequelize)
      const AdminPermission = defineAdminPermission(sequelize)
      
      await Promise.all([User.sync(), Permission.sync(), AdminPermission.sync()])

      // Check if user has the required permission
      const hasPermission = await AdminPermission.findOne({
        where: {
          user_id: req.user.userId,
        },
        include: [{
          model: Permission,
          where: { name: permissionName },
          required: true
        }]
      })

      if (!hasPermission) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: `Permission '${permissionName}' required`,
          message: 'Access denied'
        })
      }

      next()
    } catch (err) {
      console.error(`[PermissionMiddleware]-[requirePermission]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Permission check failed'
      })
    }
  }
}

/**
 * Middleware to check if user has any of the specified permissions
 * @param {string[]} permissionNames - Array of permission names to check
 * @returns {Function} Express middleware function
 */
export const requireAnyPermission = (permissionNames) => {
  return async (req, res, next) => {
    try {
      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next()
      }

      // Only admin users can have permissions
      if (req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: API_MESSAGES.ERROR.INSUFFICIENT_ROLE,
          message: 'Permission required'
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Permission = definePermission(sequelize)
      const AdminPermission = defineAdminPermission(sequelize)
      
      await Promise.all([User.sync(), Permission.sync(), AdminPermission.sync()])

      // Check if user has any of the required permissions
      const hasPermission = await AdminPermission.findOne({
        where: {
          user_id: req.user.userId,
        },
        include: [{
          model: Permission,
          where: { name: permissionNames },
          required: true
        }]
      })

      if (!hasPermission) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: `One of the following permissions required: ${permissionNames.join(', ')}`,
          message: 'Access denied'
        })
      }

      next()
    } catch (err) {
      console.error(`[PermissionMiddleware]-[requireAnyPermission]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Permission check failed'
      })
    }
  }
}

/**
 * Middleware to check if user has all of the specified permissions
 * @param {string[]} permissionNames - Array of permission names to check
 * @returns {Function} Express middleware function
 */
export const requireAllPermissions = (permissionNames) => {
  return async (req, res, next) => {
    try {
      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next()
      }

      // Only admin users can have permissions
      if (req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: API_MESSAGES.ERROR.INSUFFICIENT_ROLE,
          message: 'Permission required'
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      const Permission = definePermission(sequelize)
      const AdminPermission = defineAdminPermission(sequelize)
      
      await Promise.all([User.sync(), Permission.sync(), AdminPermission.sync()])

      // Check if user has all required permissions
      const userPermissions = await AdminPermission.findAll({
        where: {
          user_id: req.user.userId,
        },
        include: [{
          model: Permission,
          where: { name: permissionNames },
          required: true
        }]
      })

      if (userPermissions.length !== permissionNames.length) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: `All of the following permissions required: ${permissionNames.join(', ')}`,
          message: 'Access denied'
        })
      }

      next()
    } catch (err) {
      console.error(`[PermissionMiddleware]-[requireAllPermissions]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Permission check failed'
      })
    }
  }
}
