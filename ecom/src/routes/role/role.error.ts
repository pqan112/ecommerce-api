import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException(
  'Error.Role.NotFound',
)

export const RoleAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.Role.AlreadyExists',
    path: 'name',
  },
])

export const ProhibitedActionOnBaseRoleException = new ForbiddenException(
  'Error.ProhibitedActionOnBaseRole',
)

export const OneOfPermissionIdsHasBeenDeleted = new Error(
  'Error.Role.OneOfPermissionIdsHasBeenDeleted',
)
