import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { RoleRepo } from './role.repo'

@Module({
  controllers: [RoleController, RoleRepo],
  providers: [RoleService],
})
export class RoleModule {}
