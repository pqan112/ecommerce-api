import { Injectable } from '@nestjs/common'
import { CreateRoleBodyType, GetRoleParamsType, GetRolesQueryType, UpdateRoleBodyType } from './role.model'
import { RoleRepo } from './role.repo'
import { NotFoundRecordException, RoleAlreadyExistsException } from './role.error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}
  async list(pagination: GetRolesQueryType) {
    return this.roleRepo.list({
      page: pagination.page,
      limit: pagination.limit,
    })
  }

  async findById(params: GetRoleParamsType) {
    const role = await this.roleRepo.findById(params)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepo.create({ data, createdById })
      return role
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, id, updatedById }: { data: UpdateRoleBodyType; id: number; updatedById: number }) {
    try {
      const role = await this.roleRepo.update({ data, id, updatedById })
      return role
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.roleRepo.delete({
        id,
        deletedById,
      })
      return {
        message: 'Delete sucessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
