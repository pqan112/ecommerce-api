import { NotFoundException } from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException('Error.Permission.NotFound')
