import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_ROLE_PERMISSIONS } from '../constants/auth.constant'
import { RolePermissionsType } from '../models/shared-role.model'

export const ActiveRolePermissions = createParamDecorator(
  (field: keyof RolePermissionsType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const rolePermission = request[REQUEST_ROLE_PERMISSIONS]
    return field ? rolePermission?.[field] : rolePermission
  },
)
