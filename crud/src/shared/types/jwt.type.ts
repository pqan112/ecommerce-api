export interface TokenPayload {
  userId: number
  exp: number // thời gian hết hạn
  iat: number // thời điểm khởi tạo
}
