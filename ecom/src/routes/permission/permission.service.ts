import { Injectable } from '@nestjs/common'
import { PermissionRepo } from './permission.repo'
import {
  CreatePermissionBodyType,
  GetPermissionDetailResType,
  GetPermissionParamsType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from './permission.model'
import { NotFoundRecordException, PermissionAlreadyExistsException } from './permission.error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

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

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepo.create({ createdById, data })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, id, updatedById }: { data: UpdatePermissionBodyType; id: number; updatedById: number }) {
    try {
      const permission = await this.permissionRepo.update({
        id,
        updatedById,
        data,
      })
      return permission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.permissionRepo.delete({
        id,
        deletedById,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
