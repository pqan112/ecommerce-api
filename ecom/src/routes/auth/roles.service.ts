import { Injectable, NotFoundException } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RoleType } from './auth.model'
import { isNotFoundPrismaError } from 'src/shared/helpers'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    // Khi dùng partial index name khi deletedAt là null thì không dùng được findUnique
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE name = ${RoleName.Client} AND "deletedAt" IS NULL LIMIT 1;
    `.then((res: RoleType[]) => {
      if (res.length === 0) {
        throw new Error('Client role not found')
      }
      return res[0]
    })

    // let role: RoleType
    // try {
    //   role = await this.prismaService.role.findFirstOrThrow({
    //     where: {
    //       name: RoleName.Client,
    //       deletedAt: null,
    //     },
    //   })
    // } catch (error) {
    //   if (isNotFoundPrismaError(error)) {
    //     throw new NotFoundException('Error.Role.NotFound')
    //   }
    //   throw error
    // }

    this.clientRoleId = role.id
    return role.id
  }
}

new RolesService(new PrismaService()).getClientRoleId()
