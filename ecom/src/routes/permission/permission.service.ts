import { Injectable } from '@nestjs/common'
import { PermissionRepo } from './permission.repo'
import { GetPermissionDetailResType, GetPermissionParamsType, GetPermissionsQueryType } from './permission.model'
import { NotFoundRecordException } from './permission.error'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}

  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepo.list({
      limit: pagination.limit,
      page: pagination.page,
    })

    return data
  }

  async findById(params: GetPermissionParamsType): Promise<GetPermissionDetailResType> {
    const permission = await this.permissionRepo.findById(params)
    if (!permission) {
      throw NotFoundRecordException
    }
    return permission
  }
}
