import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prismaService = new PrismaService()
const hashingService = new HashingService()
const main = async () => {
  const roleCount = await prismaService.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist in the database. Skipping creation.')
  }
  const roles = await prismaService.role.createMany({
    data: [
      { name: RoleName.Admin, description: 'Admin role' },
      { name: RoleName.Client, description: 'Client role' },
      { name: RoleName.Seller, description: 'Seller role' },
    ],
  })

  const adminRole = await prismaService.role.findFirstOrThrow({
    where: { name: RoleName.Admin },
  })

  const hasedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prismaService.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hasedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONENUMBER,
      roleId: adminRole.id,
    },
  })

  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

main()
  .then((res) => {
    console.log(`Created ${res.createdRoleCount} roles`)
    console.log(`Created admin user: ${res.adminUser.email}`)
  })
  .catch(console.error)
