import { BadRequestException, Injectable } from '@nestjs/common'
import {
  CreateRoleBodyType,
  GetRoleParamsType,
  GetRolesQueryType,
  UpdateRoleBodyType,
} from './role.model'
import { RoleRepo } from './role.repo'
import {
  NotFoundRecordException,
  ProhibitedActionOnBaseRoleException,
  RoleAlreadyExistsException,
} from './role.error'
import {
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helpers'
import { RoleName } from 'src/shared/constants/role.constant'

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

  async create({
    data,
    createdById,
  }: {
    data: CreateRoleBodyType
    createdById: number
  }) {
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

  /**
   * Kiểm tra xem role có thuộc 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById({ roleId })
    if (!role) {
      throw NotFoundRecordException
    }
    const baseRoles: string[] = [
      RoleName.Admin,
      RoleName.Client,
      RoleName.Seller,
    ]

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException
    }
  }

  async update({
    data,
    id,
    updatedById,
  }: {
    data: UpdateRoleBodyType
    id: number
    updatedById: number
  }) {
    try {
      await this.verifyRole(id)
      const updatedRole = await this.roleRepo.update({ data, id, updatedById })
      return updatedRole
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
      const role = await this.roleRepo.findById({ roleId: id })
      if (!role) {
        throw NotFoundRecordException
      }

      const baseRoles: string[] = [
        RoleName.Admin,
        RoleName.Client,
        RoleName.Seller,
      ]
      if (baseRoles.includes(role.name)) {
        throw ProhibitedActionOnBaseRoleException
      }

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
