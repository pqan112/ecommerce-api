import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import OTPEmail from 'emails/otp'
import { TypeOfVerificationCodeType } from '../constants/auth.constant'
// import fs from 'fs'
// import path from 'path'
// const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-template/otp.html'), 'utf8')

@Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string; type: TypeOfVerificationCodeType }) {
    const subject = 'OTP code'
    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      to: [payload.email],
      subject: 'OTP code',
      react: <OTPEmail otpCode={payload.code} title={subject} type={payload.type} />,
      // html: otpTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
    })
  }
}
