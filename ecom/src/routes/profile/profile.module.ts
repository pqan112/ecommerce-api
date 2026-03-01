import { Module } from '@nestjs/common'
import { SharedModule } from 'src/shared/shared.module'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'

@Module({
  imports: [SharedModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
