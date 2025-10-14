import crypto from 'crypto'
import { defineOtpRequest } from '../models/OtpRequest.js'
import twilio from 'twilio'
import sgMail from '@sendgrid/mail'

const DEFAULT_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 180)
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5)

function generateNumericCode(length = 6) {
  const min = 10 ** (length - 1)
  const max = 10 ** length - 1
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export function createOtpService(sequelize) {
  const OtpRequest = defineOtpRequest(sequelize)
  const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null
  const twilioFrom = process.env.TWILIO_FROM_PHONE
  const sendgridKey = process.env.SENDGRID_API_KEY
  const emailFrom = process.env.EMAIL_FROM
  if (sendgridKey) {
    sgMail.setApiKey(sendgridKey)
  }

  async function requestOtp({ recipient, channel, purpose = 'login', tenantId = null, codeLength = 6, ttlSeconds = DEFAULT_TTL_SECONDS }) {
    await OtpRequest.sync()
    const code = generateNumericCode(codeLength)
    const codeHash = hashCode(code)
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

    const record = await OtpRequest.create({
      recipient,
      channel,
      purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
      tenant_id: tenantId,
    })

    // Send via provider
    if (channel === 'sms') {
      if (twilioClient && twilioFrom) {
        try {
          await twilioClient.messages.create({
            from: twilioFrom,
            to: recipient,
            body: `Your verification code is ${code}. It expires in ${Math.floor(ttlSeconds / 60)} minutes.`
          })
        } catch (err) {
          console.error('[otp] Twilio SMS send failed:', err.message)
        }
      } else {
        console.log('[otp] Twilio not configured. SMS code:', code)
      }
    } else {
      // Email channel
      if (sendgridKey && emailFrom) {
        try {
          await sgMail.send({
            to: recipient,
            from: emailFrom,
            subject: 'Your verification code',
            text: `Your verification code is ${code}. It expires in ${Math.floor(ttlSeconds / 60)} minutes.`,
            html: `<p>Your verification code is <strong>${code}</strong>. It expires in ${Math.floor(ttlSeconds / 60)} minutes.</p>`,
          })
        } catch (err) {
          console.error('[otp] SendGrid email send failed:', err.message)
        }
      } else {
        console.log('[otp] Email code to', recipient, ':', code)
      }
    }

    return { code, record }
  }

  async function verifyOtp({ recipient, code, purpose = 'login' }) {
    await OtpRequest.sync()
    const record = await OtpRequest.findOne({
      where: { recipient, purpose },
      order: [['createdAt', 'DESC']],
    })

    if (!record) return { ok: false, reason: 'not_found' }
    if (record.consumed_at) return { ok: false, reason: 'consumed' }
    if (new Date(record.expires_at) < new Date()) return { ok: false, reason: 'expired' }
    if (record.attempt_count >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' }

    const isMatch = record.code_hash === hashCode(code)
    if (!isMatch) {
      await record.update({ attempt_count: record.attempt_count + 1 })
      return { ok: false, reason: 'invalid_code' }
    }

    await record.update({ consumed_at: new Date() })
    return { ok: true, record }
  }

  return { requestOtp, verifyOtp }
}


