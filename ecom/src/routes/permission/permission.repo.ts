import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreatePermissionBodyType,
  GetPermissionDetailResType,
  GetPermissionParamsType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType,
} from './permission.model'

@Injectable()
export class PermissionRepo {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
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

  findById({ permissionId }: GetPermissionParamsType): Promise<GetPermissionDetailResType | null> {
    return this.prismaService.permission.findUnique({
      where: {
        id: permissionId,
        deletedAt: null,
      },
    })
  }

  create({ createdById, data }: { createdById: number; data: CreatePermissionBodyType }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    data,
    id,
    updatedById,
  }: {
    data: UpdatePermissionBodyType
    id: number
    updatedById: number
  }): Promise<GetPermissionDetailResType> {
    return this.prismaService.permission.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<PermissionType> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id,
          },
        })
      : this.prismaService.permission.update({
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
