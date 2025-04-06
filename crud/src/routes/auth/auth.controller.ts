import { Body, Controller, Post } from '@nestjs/common'
import { RegisterBodyDTO, RegisterResDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterBodyDTO) {
    console.log('auth controller')
    return new RegisterResDTO(await this.authService.register(body))
  }
}
