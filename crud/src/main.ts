import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { ValidationError } from 'class-validator'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field mà không được khai báo decorator trong DTO
      forbidNonWhitelisted: true, // Nếu client gửi lên các field không được khai báo decorator trong DTO thì sẽ báo lỗi
      transformOptions: {
        enableImplicitConversion: true,
        // Chuyển đổi kiểu dữ liệu mà client gửi lên server
        // VD: client gửi 123 khi qua @IsString() decorator sẽ được chuyển đổi thành kiểu string "123"
      },
      exceptionFactory: (validationErrors: ValidationError[]) => {
        return new UnprocessableEntityException(
          validationErrors.map((error) => ({
            field: error.property,
            error: Object.values(error.constraints as any).join(', '),
          })),
        )
      },
    }),
  )
  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
