// 基本设置
export interface BasicSettings {
  systemName: string
  systemDescription: string
  language: string
  theme: string
  enableNotifications: boolean
}

// 模型设置
export interface ModelSettings {
  defaultProvider: string
  defaultModel: string
  temperature: number
  maxTokens: number
  topP: number
}

// 安全设置
export interface SecuritySettings {
  passwordPolicy: string
  sessionTimeout: number
  enable2FA: boolean
  maxLoginAttempts: number
}

// 通知设置
export interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  inAppEnabled: boolean
  systemTemplate: string
  securityTemplate: string
}

// 阿里云 OSS 设置
export interface AliyunOSSSettings {
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  endpoint: string
  pathPrefix: string
}

// 七牛云设置
export interface QiniuSettings {
  accessKey: string
  secretKey: string
  bucket: string
  zone: string
  pathPrefix: string
  domain: string
}

// 云存储设置
export interface StorageSettings {
  defaultProvider: string
  aliyun: AliyunOSSSettings
  qiniu: QiniuSettings
}

// 系统设置
export interface SystemSettings {
  basic: BasicSettings
  model: ModelSettings
  security: SecuritySettings
  notification: NotificationSettings
  storage: StorageSettings
}