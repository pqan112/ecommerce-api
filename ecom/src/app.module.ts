import { HttpException, Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from './shared/shared.module'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe, // Use the custom Zod validation pipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
