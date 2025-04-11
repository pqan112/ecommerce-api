import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: RegisterBodyDTO) {
    const hashedPassword = await this.hashingService.hash(body.password)
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword,
        },
      })
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('User is already existed')
      }
    }
  }

  async login(body: LoginBodyDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Account does not exist')
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)

    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([{ field: 'password', error: 'Password is incorrect' }])
    }

    const tokens = await this.generateTokens({ userId: user.id })
    return tokens
  }

  async refreshToken(refresh_token: string) {
    try {
      const { userId } = await this.tokenService.verifyRefreshToken(refresh_token)
      // Kiểm tra refreshToken có tồn tại trong database không
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refresh_token,
        },
      })
      // Xóa refreshToken cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: refresh_token,
        },
      })
      // tạo mới accessToken và refreshToken
      return await this.generateTokens({ userId })
    } catch (error) {
      // trường hợp đã refreshtoken rồi, thông báo cho user biết
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }

      throw new UnauthorizedException()
    }
  }

  async logout(refresh_token: string) {
    try {
      await this.tokenService.verifyRefreshToken(refresh_token)
      // Kiểm tra refreshToken có tồn tại trong database không
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refresh_token,
        },
      })
      // Xóa refreshToken cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: refresh_token,
        },
      })
      return { message: 'Logout successfully' }
    } catch (error) {
      // trường hợp đã refreshtoken rồi, thông báo cho user biết
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }
      throw new UnauthorizedException()
    }
  }

  private async generateTokens(payload: { userId: number }) {
    const [access_token, refresh_token] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refresh_token)
    await this.prismaService.refreshToken.create({
      data: {
        token: refresh_token,
        user_id: payload.userId,
        exprired_at: new Date(decodedRefreshToken.exp * 1000),
      },
    })
    return { access_token, refresh_token }
  }
}
