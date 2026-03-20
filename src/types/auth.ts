export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email?: string
}

export interface ForgotPasswordParams {
  email: string
}

export interface ResetPasswordParams {
  email: string
  token: string
  newPassword: string
}
export interface verifyCodeParams {
  email: string
  code: string
}
export interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    email?: string
    createdAt: string
  }
}

export interface UserInfo {
  id: number | string
  username: string
  email?: string
  avatar: string
  status: number
}

export interface AuthData {
  userInfo: UserInfo
  token: string
  expire: number // token 过期时间 (秒)
  refreshToken: string
  refreshExpire: number // refreshToken 过期时间 (秒)
}
export interface RefreshTokenResponse {
  code: number
  data: AuthData
  message: string
}
