import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'

const sharedServices = [PrismaService]

@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices,
})
export class SharedModule {}
