export enum SubscriptionPlan {
  Free = 'free',
  Basic = 'basic',
  Pro = 'pro',
  Enterprise = 'enterprise',
}
export interface UserSubscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  startDate: string
  endDate: string
  configs: {
    maxAgents: number
    maxWorkflows: number
    maxKnowledgeBaseSize: number // 以MB为单位
  }
  usedAgents: number
  usedWorkflows: number
  usedKnowledgeBaseSize: number // 以MB为单位
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPlanConfigs {
  id: number
  name: string
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
  price: number // 月费价格，以分为单位
  description: string
  quarterRate: number
  yearRate: number
  configs: {
    maxAgents: number
    maxWorkflows: number
    maxKnowledgeBaseSize: number // 以MB为单位
  }
}

// 从 auth.ts 复制的接口定义
export interface UserInfo {
  id: number | string
  username: string
  avatar: string
  status: number
}

export interface UserInfoWithSubscription extends UserInfo {
  subscription: UserSubscription | null
}
