import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './roles.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService],
})
export class AuthModule {}
