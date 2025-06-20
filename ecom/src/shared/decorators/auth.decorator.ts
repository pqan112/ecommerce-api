import { SetMetadata } from '@nestjs/common'
import { AUTH_TYPE_KEY, AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from '../constants/auth.constant'
export type AuthTypeDecoratorPayload = { authTypes: AuthTypeType[]; options: { condition: ConditionGuardType } }

export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.And } })
}

export const IsPublic = () => Auth([AuthType.None])
