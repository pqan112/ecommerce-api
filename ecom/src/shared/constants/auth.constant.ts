export const REQUEST_USER_KEY = 'user'
export const AUTH_TYPE_KEY = 'authType'
export const AuthType = {
  Bearer: 'Bearer',
  None: 'None',
  ApiKey: 'ApiKey',
} as const

export const ConditionGuard = {
  And: 'and',
  Or: 'or',
} as const

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export const TypeOfVerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  LOGIN: 'LOGIN',
  DISABLE_2FA: 'DISABLE_2FA',
} as const

export type TypeOfVerificationCodeType = (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode]
export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType]
export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]
