import { Exclude } from 'class-transformer'
import { IsString } from 'class-validator'
import { IsMatch } from 'src/shared/decorators/custom-validator.decorator'

export class LoginBodyDTO {
  @IsString()
  email: string
  @IsString()
  password: string
}

export class LoginResDTO {
  access_token: string
  refresh_token: string

  constructor(partial?: Partial<LoginResDTO>) {
    Object.assign(this, partial)
  }
}

export class RegisterBodyDTO extends LoginBodyDTO {
  @IsString()
  name: string
  @IsString()
  @IsMatch('password', { message: 'password is not match' })
  confirmPassword: string
}

export class RegisterResDTO {
  id: number
  name: string
  email: string
  @Exclude() password: string
  created_at: Date
  updated_at: Date

  constructor(partial?: Partial<RegisterResDTO>) {
    Object.assign(this, partial)
  }
}

export class RefreshTokenBodyDTO {
  @IsString()
  refreshToken: string
}

export class RefreshTokenResDTO extends LoginResDTO {}

export class LogoutBodyDTO extends RefreshTokenBodyDTO {}

export class LogoutResDTO {
  message: string
  constructor(partial?: Partial<LogoutResDTO>) {
    Object.assign(this, partial)
  }
}
