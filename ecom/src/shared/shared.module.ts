import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { AuthenticationGuard } from './guards/authentication.guard'
import { SharedUserRepository } from './repositories/shared-user.repository'
import { EmailService } from './services/email.service'
import { HashingService } from './services/hashing.service'
import { PrismaService } from './services/prisma.service'
import { TokenService } from './services/token.service'
import { TwoFactorService } from './services/2fa.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  SharedUserRepository,
  EmailService,
  TwoFactorService,
]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
