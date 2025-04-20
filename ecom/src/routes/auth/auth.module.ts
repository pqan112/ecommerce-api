import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './roles.service'
import { AuthRepository } from './auth.repository'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository],
})
export class AuthModule {}
