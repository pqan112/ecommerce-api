import { HttpException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository'
import { EmailService } from 'src/shared/services/email.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { SendOTPBodyDTO } from './auth.dto'
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './auth.model'
import { AuthRepository } from './auth.repository'
import { RolesService } from './roles.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
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
      email,
      code,
      type,
    })

    if (!verificationCode) {
      throw new UnprocessableEntityException([
        {
          path: 'code',
          message: 'Invalid OTP code',
        },
      ])
    }

    if (verificationCode.expiresAt < new Date()) {
      throw new UnprocessableEntityException([
        {
          path: 'code',
          message: 'OTP code has expired',
        },
      ])
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
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.REGISTER,
        }),
      ])
      return user
    } catch (error) {
      // 3. Nếu lỗi là unique constraint thì trả về lỗi email đã tồn tại
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException([
          {
            path: 'email',
            message: 'Email already exists',
          },
        ])
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // 1. nếu là gửi mã xác thực cho người dùng mới thì kiểm tra xem email đã tồn tại trong DB chưa
    const user = await this.sharedUserRepository.findUnique({ email: body.email })
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email already exists',
        },
      ])
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email does not exist',
        },
      ])
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
    })
    if (error) {
      throw new UnprocessableEntityException([
        {
          message: 'Send email failed',
          path: 'code',
        },
      ])
    }

    return { message: 'OTP has been sent successfully to your email' }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    // 1. Kiểm tra xem email có tồn tại trong DB không
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })
    if (!user) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email does not exist',
        },
      ])
    }
    // 2. Kiểm tra người dùng nhập password có đúng không
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ])
    }
    // 3. Tạo thiết bị mới để đưa vào accessToken và refreshToken
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })
    // 4. Tạo accessToken và refreshToken
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
        throw new UnauthorizedException('Refresh token has been revoked')
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
      throw new UnauthorizedException()
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
      return { message: 'Logout successfully' }
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }
      throw new UnauthorizedException()
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    // 1. Kiểm tra email đã tồn tại trong database chưa
    const user = await this.sharedUserRepository.findUnique({ email })
    if (!user) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email does not exist',
        },
      ])
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
      this.authRepository.deleteVerificationCode({ email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD }),
    ])
    // 4. Trả về thông báo thành công
    return { message: 'Password has been reset successfully' }
  }
}
