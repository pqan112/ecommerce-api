import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { HashingService } from './services/hashing.service'
import { PrismaService } from './services/prisma.service'
import { TokenService } from './services/token.service'

const sharedServices = [PrismaService, HashingService, TokenService]

@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
