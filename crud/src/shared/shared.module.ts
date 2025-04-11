import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { HashingService } from './services/hashing.service'
import { PrismaService } from './services/prisma.service'
import { TokenService } from './services/token.service'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from './guards/authentication.guard'

const sharedServices = [PrismaService, HashingService, TokenService]

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
