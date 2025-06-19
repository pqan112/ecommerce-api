import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthService } from 'src/routes/auth/auth.service'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import {
  ForgotPasswordDTO,
  LoginBodyDTO,
  LoginResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
} from './auth.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  @HttpCode(HttpStatus.OK)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('otp')
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @ZodSerializerDto(LoginResDTO)
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({ ...body, userAgent, ip })
  }

  @Post('refresh-token')
  @ZodSerializerDto(RefreshTokenResDTO)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  logout(@Body() body: any) {
    return this.authService.logout(body.refreshToken)
  }

  @Post('forgot-password')
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: ForgotPasswordDTO) {
    return this.authService.forgotPassword(body)
  }
}
