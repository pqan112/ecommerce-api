import { Injectable } from '@nestjs/common'
import { VerificationCode } from '@prisma/client'
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RegisterBodyType, VerificationCodeType } from './auth.model'
@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    payload: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: payload,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createVerificationCode(payload: Omit<VerificationCodeType, 'id' | 'createdAt'>): Promise<VerificationCode> {
    // upsert: tạo mới hoặc cập nhật nếu đã tồn tại
    return await this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }

  async findUniqueVerificationCode(
    payload:
      | { email: string }
      | { id: number }
      | {
          email: string
          code: string
          type: TypeOfVerificationCodeType
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: payload,
    })
  }

  async createRefreshToken(payload: { token: string; userId: number; expiresAt: Date; deviceId: number }) {
    return this.prismaService.refreshToken.create({
      data: payload,
    })
  }
}
