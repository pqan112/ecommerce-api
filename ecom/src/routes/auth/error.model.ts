import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

export const InvalidOTPException = new UnprocessableEntityException([
  {
    path: 'code',
    message: 'Error.InvalidOTP',
  },
])
export const ExpiredOTPException = new UnprocessableEntityException([
  {
    path: 'code',
    message: 'Error.ExpiredOTP',
  },
])

export const EmailAlreadyInUseException = new UnprocessableEntityException([
  {
    path: 'email',
    message: 'Error.EmailAlreadyInUse',
  },
])
export const EmailNotFoundException = new UnprocessableEntityException([
  {
    path: 'email',
    message: 'Error.EmailNotFound',
  },
])

export const EmailSendFailureException = new UnprocessableEntityException([
  {
    path: 'code',
    message: 'Error.EmailSendFailure',
  },
])

export const RefreshTokenAlreadyUsedException = new UnauthorizedException('Error.RefreshTokenAlreadyUsed')
export const UnauthorizedAccessException = new UnauthorizedException('Error.UnauthorizedAccess')

export const IncorrectPasswordException = new UnprocessableEntityException([
  {
    path: 'password',
    message: 'Error.IncorrectPassword',
  },
])

export const InvalidTOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTP',
    path: 'totpCode',
  },
])
export const TOTPAlreadyEnableException = new UnprocessableEntityException([
  {
    path: 'totpCode',
    message: 'Error.TOTPAlreadyEnabled',
  },
])
export const TOTPNotEnabledException = new UnprocessableEntityException([
  {
    path: 'totpCode',
    message: 'Error.TOTPNotEnabled',
  },
])
export const InvalidTOTPAndCodeException = new UnprocessableEntityException([
  {
    path: 'totpCode',
    message: 'Error.InvalidTOTPAndCode',
  },
  {
    path: 'code',
    message: 'Error.InvalidTOTPAndCode',
  },
])
