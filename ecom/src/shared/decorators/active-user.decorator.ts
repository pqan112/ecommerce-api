import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AccessTokenPayload } from '../types/jwt.type'
import { AUTH_TYPE_KEY } from '../constants/auth.constant'

export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const user: AccessTokenPayload | undefined = request[AUTH_TYPE_KEY]
    return field ? user?.[field] : user
  },
)
