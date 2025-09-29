import { Sequelize } from 'sequelize'
import dotenv from "dotenv";
dotenv.config();
import { setupAssociations } from './models/associations.js'

// Prefer DATABASE_URL; fall back to legacy env names if provided
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.PLATFORM_DATABASE_URL ||
  process.env.MASTER_DATABASE_URL ||
  ''

if (!databaseUrl) {
  console.warn('[db] DATABASE_URL is not set')
}

const pool = {
  max: Number(process.env.DB_POOL_MAX || 10),
  min: Number(process.env.DB_POOL_MIN || 0),
  acquire: Number(process.env.DB_POOL_ACQUIRE_MS || 30000),
  idle: Number(process.env.DB_POOL_IDLE_MS || 10000),
}

export const sequelize = new Sequelize(databaseUrl, {
  logging: process.env.LOG_SQL === 'true' ? console.log : false,
  dialect: 'postgres',
  pool,
  retry: { max: Number(process.env.DB_RETRY_MAX || 3) },
})

// Initialize models and associations
export const models = setupAssociations(sequelize)
