import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException('Error.Permission.NotFound')

export const PermissionAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.Permission.PathAlreadyExists',
    path: 'path',
  },
  {
    message: 'Error.Permission.MethodAlreadyExists',
    path: 'method',
  },
])
