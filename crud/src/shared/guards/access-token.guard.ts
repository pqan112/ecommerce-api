import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { REQUEST_USER_KEY } from '../constants/auth.constant'
import { TokenService } from '../services/token.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException()
    }
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return true
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException()
    }
  }
}
