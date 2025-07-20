import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  GetPermissionDetailResType,
  GetPermissionParamsType,
  GetPermissionsQueryType,
  GetPermissionsResType,
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
}
