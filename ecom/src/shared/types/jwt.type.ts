export interface AccessTokenPayloadCreate {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number // thời gian hết hạn
  iat: number // thời điểm khởi tạo
}

export interface RefreshTokenPayloadCreate {
  userId: number
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number
  iat: number
}
