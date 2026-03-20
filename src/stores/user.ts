import { defineStore } from 'pinia'
import type { UserSubscription } from '@/types/user'
import { getCurrentSubscription } from '@/api/subscriptionService'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    isAuthenticated: false,
    token: '',
    role: '',
    refreshToken: '',
    refreshExpire: 0,
    expire: 0, // 添加过期时间字段
    subscription: null as UserSubscription | null,
  }),

  getters: {
    userInfo: (state) => ({
      id: state.id,
      name: state.name,
      username: state.username,
      email: state.email,
      phone: state.phone,
      bio: state.bio,
      avatar: state.avatar,
      role: state.role,
    }),

    // 获取用户订阅信息
    userSubscription: (state) => state.subscription,

    // 检查是否达到各种限制
    subscriptionLimits: (state) => {
      if (!state.subscription) {
        // 默认免费用户限制
        return {
          maxAgents: 1,
          maxWorkflows: 3,
          maxKnowledgeBaseSize: 100,
          usedAgents: 0,
          usedWorkflows: 0,
          usedKnowledgeBaseSize: 0,
        }
      }

      return {
        maxAgents: state.subscription.configs.maxAgents,
        maxWorkflows: state.subscription.configs.maxWorkflows,
        maxKnowledgeBaseSize: state.subscription.configs.maxKnowledgeBaseSize,
        usedAgents: state.subscription.usedAgents,
        usedWorkflows: state.subscription.usedWorkflows,
        usedKnowledgeBaseSize: state.subscription.usedKnowledgeBaseSize,
      }
    },

    // 检查是否达到限制
    isAgentLimitReached: (state) => {
      if (!state.subscription) {
        // 默认免费用户限制
        return 0 >= 1
      }
      if (state.subscription.configs.maxAgents === -1) return false // 无限制
      return state.subscription.usedAgents >= state.subscription.configs.maxAgents
    },

    isWorkflowLimitReached: (state) => {
      if (!state.subscription) {
        // 默认免费用户限制
        return 0 >= 3
      }
      if (state.subscription.configs.maxWorkflows === -1) return false // 无限制
      return state.subscription.usedWorkflows >= state.subscription.configs.maxWorkflows
    },

    isKnowledgeBaseLimitReached: (state) => {
      if (!state.subscription) {
        // 默认免费用户限制
        return 0 >= 100
      }
      if (state.subscription.configs.maxKnowledgeBaseSize === -1) return false // 无限制
      return (
        state.subscription.usedKnowledgeBaseSize >= state.subscription.configs.maxKnowledgeBaseSize
      )
    },
  },

  actions: {
    setUser(userInfo: any) {
      this.id = userInfo.id || ''
      this.name = userInfo.name || ''
      this.username = userInfo.username || ''
      this.email = userInfo.email || ''
      this.phone = userInfo.phone || ''
      this.bio = userInfo.bio || ''
      this.avatar = userInfo.avatar || ''
      this.isAuthenticated = true
      this.role = userInfo.role || ''
    },

    setToken(token: string, expire?: number) {
      this.token = token
      if (expire !== undefined) {
        this.expire = expire
      }
    },

    setAuthData(data: any) {
      // 设置用户信息和令牌
      if (data.userInfo) {
        this.setUser(data.userInfo)
      }

      if (data.token) {
        this.setToken(data.token, data.expire)
      }

      // 处理 refreshToken
      if (data.refreshToken) {
        this.refreshToken = data.refreshToken
      }

      if (data.refreshExpire) {
        // refreshExpire 已经在状态中维护
      }
    },

    clearAuthData() {
      this.id = ''
      this.name = ''
      this.username = ''
      this.email = ''
      this.phone = ''
      this.bio = ''
      this.avatar = ''
      this.isAuthenticated = false
      this.token = ''
      this.role = ''
      this.refreshToken = ''
      this.expire = 0
      this.subscription = null
    },

    logout() {
      this.$reset()
    },

    loadFromStorage() {
      // 由于使用了 Pinia 持久化插件，不再需要手动从 localStorage 加载
      // 状态会在 store 初始化时自动从存储中恢复
    },

    updateProfile(profile: any) {
      this.name = profile.name || this.name
      this.email = profile.email || this.email
      this.phone = profile.phone || this.phone
      this.bio = profile.bio || this.bio
      this.avatar = profile.avatar || this.avatar
    },

    // 设置订阅信息
    setSubscription(subscription: UserSubscription | null) {
      this.subscription = subscription
    },

    // 获取订阅信息
    async fetchSubscription() {
      try {
        const subscription = await getCurrentSubscription()
        this.setSubscription(subscription)
        return subscription
      } catch (error) {
        console.error('获取订阅信息失败:', error)
        return null
      }
    },

    // 更新已用资源数量
    updateUsedResources(usage: {
      agents?: number
      workflows?: number
      knowledgeBaseSize?: number
    }) {
      if (!this.subscription) return

      if (usage.agents !== undefined) {
        this.subscription.usedAgents = usage.agents
      }

      if (usage.workflows !== undefined) {
        this.subscription.usedWorkflows = usage.workflows
      }

      if (usage.knowledgeBaseSize !== undefined) {
        this.subscription.usedKnowledgeBaseSize = usage.knowledgeBaseSize
      }

      this.subscription.updatedAt = new Date().toISOString()
    },
  },

  // 持久化存储
  persist: {
    key: 'user-store',
    storage: localStorage,
  },
})
