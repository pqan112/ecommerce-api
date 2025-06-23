import { HttpException, Injectable } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository'
import { EmailService } from 'src/shared/services/email.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './auth.model'
import { AuthRepository } from './auth.repo'
import {
  EmailAlreadyInUseException,
  EmailNotFoundException,
  EmailSendFailureException,
  ExpiredOTPException,
  IncorrectPasswordException,
  InvalidOTPException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnableException,
  TOTPNotEnabledException,
  UnauthorizedAccessException,
} from './error.model'
import { RolesService } from './roles.service'
import { TwoFactorService } from 'src/shared/services/2fa.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  private async generateTokens(payload: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: payload.userId,
        deviceId: payload.deviceId,
        roleId: payload.roleId,
        roleName: payload.roleName,
      }),
      this.tokenService.signRefreshToken(payload),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId: payload.deviceId,
    })
    return { accessToken, refreshToken }
  }

  /**
   * validateVerificationCode: Kiểm tra mã xác thực có hợp lệ không
   * @param email
   * @param code
   * @param type
   */
  private async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        code,
        type,
      },
    })

    if (!verificationCode) {
      throw InvalidOTPException
    }

    if (verificationCode.expiresAt < new Date()) {
      throw ExpiredOTPException
    }
  }

  async register(body: RegisterBodyType) {
    try {
      // 1. Kiểm tra mã xác thực có hợp lệ không
      await this.validateVerificationCode({
        code: body.code,
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
      })
      // 2. Đăng ký
      // mặc định đăng ký tài khoản là người dùng là client -> getClientRoleId
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.REGISTER,
          },
        }),
      ])
      return user
    } catch (error) {
      // 3. Nếu lỗi là unique constraint thì trả về lỗi email đã tồn tại
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyInUseException
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // 1. nếu là gửi mã xác thực cho người dùng mới thì kiểm tra xem email đã tồn tại trong DB chưa
    const user = await this.sharedUserRepository.findUnique({ email: body.email })
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyInUseException
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
    }
    // 2. tạo mã OTP
    const code = generateOTP()
    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    // 3. gửi email
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
      type: body.type,
    })
    if (error) {
      throw EmailSendFailureException
    }
    // 4. trả về thông báo thành công
    return { message: 'Message.SendOTPSuccessfully' }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    // 1. Kiểm tra xem email có tồn tại trong DB không
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })
    if (!user) {
      throw EmailNotFoundException
    }
    // 2. Kiểm tra người dùng nhập password có đúng không
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw IncorrectPasswordException
    }
    // 3. Nếu user đã bật mã 2FA thì kiểm tra mã 2FA TOTP code hoặc OTP code (email)
    if (user.totpSecret) {
      // nếu không có mã TOTP code và mã OTP code thì báo lỗi
      if (!body.totpCode && !body.code) {
        throw InvalidTOTPAndCodeException
      }

      if (body.totpCode) {
        const isValid = this.twoFactorService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        })
        if (!isValid) {
          throw InvalidTOTPException
        }
      }
    } else if (body.code) {
      // Kiểm tra mã OTP có hợp lệ không
      await this.validateVerificationCode({
        email: user.email,
        code: body.code,
        type: TypeOfVerificationCode.LOGIN,
      })
    }
    // 4. Tạo thiết bị mới để đưa vào accessToken và refreshToken
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })
    // 5. Tạo accessToken và refreshToken
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return tokens
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      const refreshTokenIncludeUserRole = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!refreshTokenIncludeUserRole) {
        throw RefreshTokenAlreadyUsedException
      }
      const { deviceId, user } = refreshTokenIncludeUserRole
      // 3. Cập nhật device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      })
      // 4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({ token: refreshToken })
      // 5. Tạo mới accessToken và refreshToken
      const $generateTokens = this.generateTokens({ userId, deviceId, roleId: user.roleId, roleName: user.role.name })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $generateTokens])
      return tokens
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã được sử dụng -> xóa mất rồi
      if (error instanceof HttpException) {
        throw error
      }
      throw UnauthorizedAccessException
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Xóa refreshToken trong database
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({ token: refreshToken })
      // 3. Cập nhật device là đã logout
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, { isActive: false })
      // 4. Trả về thông báo thành công
      return { message: 'Message.LogoutSuccessfully' }
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw UnauthorizedAccessException
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    // 1. Kiểm tra email đã tồn tại trong database chưa
    const user = await this.sharedUserRepository.findUnique({ email })
    if (!user) {
      throw EmailNotFoundException
    }
    // 2. Kiểm tra mã OTP có hợp lệ không
    await this.validateVerificationCode({
      email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    })
    // 3. Cập nhật lại mật khẩu mới và xóa mã OTP
    const hashedPassword = await this.hashingService.hash(newPassword)
    await Promise.all([
      this.authRepository.updateUser(
        { id: user.id },
        {
          password: hashedPassword,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email,
          code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ])
    // 4. Trả về thông báo thành công
    return { message: 'Message.ResetPasswordSuccessfully' }
  }

  async setupTwoFactorAuth(userId: number) {
    // 1. Lấy thông tin người dùng, kiểm tra user có tồn tại không và đã enable 2FA chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId })
    if (!user) {
      throw EmailNotFoundException
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnableException
    }

    // 2. Tạo ra secret và uri
    const { secret, uri } = this.twoFactorService.generateTOTPSecret(user.email)
    // 3. Cập nhật secret vào bảng user trong database
    await this.authRepository.updateUser({ id: userId }, { totpSecret: secret })
    // 4. Trả về secret và uri
    return {
      secret,
      uri,
    }
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, code, totpCode } = data
    // 1. Lấy thông tin user, kiểm tra user đã bật 2FA chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId })
    if (!user) {
      throw EmailNotFoundException
    }
    if (!user.totpSecret) {
      throw TOTPNotEnabledException
    }
    // 2. Kiểm tra mã TOTP có hợp lệ không
    if (totpCode) {
      const isValid = this.twoFactorService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      })
      if (!isValid) {
        throw InvalidTOTPException
      }
    } else if (code) {
      // 3. Kiểm tra mã OTP email có hợp lệ không
      await this.validateVerificationCode({
        email: user.email,
        code,
        type: TypeOfVerificationCode.DISABLE_2FA,
      })
    }
    // 4. Cập nhật secret thành null
    await this.authRepository.updateUser({ id: userId }, { totpSecret: null })
    return {
      message: 'Message.DisableTwoFactorAuthSuccessfully',
    }
  }
}
