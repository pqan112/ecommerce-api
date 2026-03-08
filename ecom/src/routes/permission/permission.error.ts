import { UnprocessableEntityException } from '@nestjs/common'

export const PermissionAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: 'Error.Permission.PathAlreadyExists',
      path: 'path',
    },
    {
      message: 'Error.Permission.MethodAlreadyExists',
      path: 'method',
    },
  ])
