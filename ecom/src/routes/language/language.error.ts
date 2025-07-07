import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const LanguageAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.LanguageAlreadyExists',
    path: 'id',
  },
])

export const NotFoundRecordException = new NotFoundException('Error.NotFound')
