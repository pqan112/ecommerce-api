import { createParamDecorator, ExecutionContext } from '@nestjs/common'

// User-Agent là một chuỗi ký tự trong header của HTTP request, được gửi từ client (trình duyệt, ứng dụng di động, hoặc bất kỳ client nào) đến server
// Ví dụ: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36
export const UserAgent = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  return request.headers['user-agent']
})
