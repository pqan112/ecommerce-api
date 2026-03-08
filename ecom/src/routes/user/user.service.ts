import { ForbiddenException, Injectable } from '@nestjs/common'
import { UserRepo } from './user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository'
import { SharedRoleRepo } from 'src/shared/repositories/shared-role.repo'
import {
  CreateUserBodyType,
  GetUsersQueryType,
  UpdateUserBodyType,
} from './user.model'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constant'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helpers'
import {
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
} from './user.error'

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepo,
    private hashingService: HashingService,
    private sharedUserRepo: SharedUserRepository,
    private sharedRoleRepo: SharedRoleRepo,
  ) {}

  async list(pagination: GetUsersQueryType) {
    return this.userRepo.list(pagination)
  }

  async findById(id: number) {
    const user = await this.sharedUserRepo.findUniqueIncludeRolePermissions({
      id,
      deletedAt: null,
    })
    if (!user) {
      throw NotFoundRecordException
    }
    return user
  }

  /**
   * Không cho phép update hoặc xóa chính mình
   */
  private verifyYourself({
    userAgentId,
    userTargetId,
  }: {
    userAgentId: number
    userTargetId: number
  }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException
    }
  }

  /**
   * Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
   * Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
   * Còn nếu không phải admin thì không được phép tác động đến admin
   */
  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    // Agent là admin thì cho phép
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      // Agent không phải admin thì roleIdTarget phải khác admin
      const adminRoleId = await this.sharedRoleRepo.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException()
      }
      return true
    }
  }

  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.sharedUserRepo.findUnique({
      id: userId,
      deletedAt: null,
    })
    if (!currentUser) {
      throw NotFoundRecordException
    }
    return currentUser.roleId
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType
    createdById: number
    createdByRoleName: string
  }) {
    try {
      // Chỉ có admin agent mới có quyền tạo user với role là admin
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      })
      // Hash the password
      const hashedPassword = await this.hashingService.hash(data.password)

      const user = await this.userRepo.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword,
        },
      })
      return user
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    id: number
    data: UpdateUserBodyType
    updatedById: number
    updatedByRoleName: string
  }) {
    try {
      // Không thể cập nhật chính mình
      this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id,
      })

      // Lấy roleId ban đầu của người được update để kiểm tra xem liệu người update có quyền update không
      // Không dùng data.roleId vì dữ liệu này có thể bị cố tình truyền sai
      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: updatedByRoleName,
        roleIdTarget,
      })

      const updatedUser = await this.sharedUserRepo.update(
        { id, deletedAt: null },
        {
          ...data,
          updatedById,
        },
      )
      return updatedUser
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }
      throw error
    }
  }

  async delete({
    id,
    deletedById,
    deletedByRoleName,
  }: {
    id: number
    deletedById: number
    deletedByRoleName: string
  }) {
    try {
      // Không thể xóa chính mình
      this.verifyYourself({
        userAgentId: deletedById,
        userTargetId: id,
      })

      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      })

      await this.userRepo.delete({
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
