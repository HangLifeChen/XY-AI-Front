import { api } from './http'
import type { UserSubscription, SubscriptionPlanConfigs, SubscriptionPlan } from '@/types/user'

// 获取当前用户的订阅信息
export const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
  try {
    return await api.get('/v1/subscription/current')
  } catch (error) {
    console.error('获取订阅信息失败:', error)
    return null
  }
}

// 获取所有订阅计划
export const getSubscriptionPlans = async (): Promise<SubscriptionPlanConfigs[]> => {
  try {
    return await api.get('/v1/subscription/plans')
  } catch (error) {
    console.error('获取订阅计划失败:', error)
    return []
  }
}

// 创建或更新订阅
export const updateSubscription = async (planType: SubscriptionPlan): Promise<UserSubscription> => {
  try {
    return await api.post('/v1/subscription', { planType })
  } catch (error) {
    console.error('更新订阅失败:', error)
    throw error
  }
}

// 取消订阅
export const cancelSubscription = async (): Promise<boolean> => {
  try {
    await api.delete('/v1/subscription')
    return true
  } catch (error) {
    console.error('取消订阅失败:', error)
    return false
  }
}

// 创建微信支付订单
export const createWeChatPaymentOrder = async (
  planType: SubscriptionPlan,
  duration: 'month' | 'quarter' | 'year',
  amount: number,
): Promise<{ orderId: string; qrCodeUrl: string }> => {
  try {
    return await api.post('/v1/subscription/wechat/order', { planType, duration, amount })
  } catch (error) {
    console.error('创建微信支付订单失败:', error)
    throw error
  }
}

// 检查支付状态
export const checkPaymentStatus = async (orderId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/v1/subscription/wechat/status/${orderId}`)
    return response.paid
  } catch (error) {
    console.error('检查支付状态失败:', error)
    throw error
  }
}
