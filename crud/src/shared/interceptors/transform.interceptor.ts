import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse()
    const statusCode = response.statusCode
    return next.handle().pipe(
      map((data) => {
        if (response.req.originalUrl === '/auth/login') {
          return { data, statusCode: 200 } // Custom status for login route
        }
        return { data, statusCode } // Default response structure with statusCode
      }),
    )
  }
}
