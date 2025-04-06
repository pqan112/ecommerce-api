import { Exclude } from 'class-transformer'
import { IsString } from 'class-validator'

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
  confirm_password: string
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
