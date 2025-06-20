import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from '../config'

@Injectable()
export class TwoFactorService {
  private createTOTP(email: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    })
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email)
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    }
  }

  verifyTOTP({ email, token }: { email: string; token: string }) {
    const totp = this.createTOTP(email)
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  }
}
