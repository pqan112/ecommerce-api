import { Injectable } from '@nestjs/common'
import {
  CreateRoleBodyType,
  GetRoleParamsType,
  GetRolesQueryType,
  GetRolesResType,
  RoleType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from './role.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RoleRepo {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ])

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  findById(params: GetRoleParamsType): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findUnique({
      where: { id: params.roleId, deletedAt: null },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }): Promise<RoleType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({ data, id, updatedById }: { data: UpdateRoleBodyType; id: number; updatedById: number }): Promise<RoleType> {
    return this.prismaService.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean) {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id,
          },
        })
      : this.prismaService.role.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        })
  }
}
