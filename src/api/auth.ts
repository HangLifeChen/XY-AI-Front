import { api } from './http'
import type {
  AuthData,
  LoginParams,
  RegisterParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  verifyCodeParams,
} from '@/types/auth'

export const login = async (params: LoginParams): Promise<AuthData> => {
  return await api.post('/v1/auth/login', params)
}

export const register = async (params: RegisterParams): Promise<AuthData> => {
  return await api.post('/v1/auth/register', params)
}

export const logout = (): Promise<void> => {
  return api.post('/v1/auth/logout')
}

export const forgotPassword = async (params: ForgotPasswordParams): Promise<void> => {
  return await api.post('/v1/auth/forgot-password', params)
}

export const resetPassword = async (params: ResetPasswordParams): Promise<void> => {
  return await api.post('/v1/auth/reset-password', params)
}
export const verifyCode = async (
  params: verifyCodeParams,
): Promise<{ message: string; token: string }> => {
  return await api.post('/v1/auth/verify-code', params)
}
