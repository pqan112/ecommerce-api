import { Module } from '@nestjs/common'
import { PermissionService } from './permission.service'
import { PermissionController } from './permission.controller'
import { PermissionRepo } from './permission.repo'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepo],
})
export class PermissionModule {}
