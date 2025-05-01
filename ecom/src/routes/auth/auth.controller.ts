import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthService } from 'src/routes/auth/auth.service'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { LoginBodyDTO, RegisterBodyDTO, RegisterResDTO, SendOTPBodyDTO } from './auth.dto'
import { IP } from 'src/shared/decorators/ip.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @IP() ip: string) {
    console.log('@@', ip)
    return this.authService.login({ ...body, userAgent, ip })
  }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Body() body: any) {
  //   return this.authService.refreshToken(body.refreshToken)
  // }

  @Post('logout')
  async logout(@Body() body: any) {
    return this.authService.logout(body.refreshToken)
  }
}
