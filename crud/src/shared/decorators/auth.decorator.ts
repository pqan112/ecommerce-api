import { SetMetadata } from '@nestjs/common'
import { AUTH_TYPE_KEY, AuthTypeType, ConditionGuardType } from '../constants/auth.constant'

export const Auth = (authTypes: AuthTypeType[], options: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options })
}
