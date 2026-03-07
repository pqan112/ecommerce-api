import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { RoleName } from '../constants/role.constant'
import { RoleType } from '../models/shared-role.model'

@Injectable()
export class SharedRoleRepo {
  private clientRoleId: number | null = null
  private adminRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string): Promise<RoleType> {
    // let role: RoleType
    // try {
    //   role = await this.prismaService.role.findFirstOrThrow({
    //     where: {
    //       name: roleName,
    //       deletedAt: null,
    //     },
    //   })
    // } catch (error) {
    //   if (isNotFoundPrismaError(error)) {
    //     throw new NotFoundException('Error.Role.NotFound')
    //   }
    //   throw error
    // }

    // Khi dùng partial index name khi deletedAt là null thì không dùng được findUnique
    const role = await this.prismaService.$queryRaw<RoleType[]>`
          SELECT * FROM "Role" 
          WHERE name = ${roleName} 
          AND "deletedAt" IS NULL 
          LIMIT 1;
        `
    if (role.length === 0) {
      throw new Error('Client role not found')
    }
    return role[0]
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.getRole(RoleName.Client)
    this.clientRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(RoleName.Admin)
    this.adminRoleId = role.id
    return role.id
  }
}
