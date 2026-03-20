<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="settings-tabs">
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicSettings"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
            </el-form-item>

            <el-form-item label="系统描述">
              <el-input
                v-model="basicSettings.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>

            <el-form-item label="默认语言">
              <el-select v-model="basicSettings.language" placeholder="请选择默认语言">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>

            <el-form-item label="主题">
              <el-radio-group v-model="basicSettings.theme">
                <el-radio value="light">浅色</el-radio>
                <el-radio value="dark">深色</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="启用通知">
              <el-switch v-model="basicSettings.enableNotifications" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="模型配置" name="model">
          <el-alert
            title="模型配置说明"
            type="info"
            description="配置系统支持的AI模型提供商和默认模型参数"
            show-icon
            style="margin-bottom: 20px"
          />

          <el-form
            ref="modelFormRef"
            :model="modelSettings"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="默认模型提供商">
              <el-select v-model="modelSettings.defaultProvider" placeholder="请选择默认模型提供商">
                <el-option label="OpenAI" value="openai" />
                <el-option label="Anthropic" value="anthropic" />
                <el-option label="Ollama" value="ollama" />
              </el-select>
            </el-form-item>

            <el-form-item label="默认模型">
              <el-select v-model="modelSettings.defaultModel" placeholder="请选择默认模型">
                <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                <el-option label="GPT-4" value="gpt-4" />
                <el-option label="Claude 2" value="claude-2" />
                <el-option label="LLaMA 2" value="llama2" />
              </el-select>
            </el-form-item>

            <el-divider>默认参数</el-divider>

            <el-form-item label="温度 (Temperature)">
              <el-slider
                v-model="modelSettings.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                style="width: 300px"
              />
            </el-form-item>

            <el-form-item label="最大Token数">
              <el-input-number
                v-model="modelSettings.maxTokens"
                :min="1"
                :max="10000000"
                :step="100"
              />
            </el-form-item>

            <el-form-item label="Top P">
              <el-slider
                v-model="modelSettings.topP"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                style="width: 300px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveModelSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="securityFormRef"
            :model="securitySettings"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="密码策略">
              <el-radio-group v-model="securitySettings.passwordPolicy">
                <el-radio value="simple">简单（至少6位）</el-radio>
                <el-radio value="medium">中等（字母+数字）</el-radio>
                <el-radio value="strong">强（字母+数字+特殊字符）</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="会话超时（分钟）">
              <el-input-number
                v-model="securitySettings.sessionTimeout"
                :min="1"
                :max="1440"
                :step="5"
              />
            </el-form-item>

            <el-form-item label="启用双因素认证">
              <el-switch v-model="securitySettings.enable2FA" />
            </el-form-item>

            <el-form-item label="登录失败尝试次数">
              <el-input-number
                v-model="securitySettings.maxLoginAttempts"
                :min="1"
                :max="10"
                :step="1"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="通知设置" name="notification">
          <el-form
            ref="notificationFormRef"
            :model="notificationSettings"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.emailEnabled" />
            </el-form-item>

            <el-form-item label="短信通知">
              <el-switch v-model="notificationSettings.smsEnabled" />
            </el-form-item>

            <el-form-item label="站内信通知">
              <el-switch v-model="notificationSettings.inAppEnabled" />
            </el-form-item>

            <el-divider>通知模板</el-divider>

            <el-form-item label="系统通知模板">
              <el-input
                v-model="notificationSettings.systemTemplate"
                type="textarea"
                :rows="3"
                placeholder="请输入系统通知模板"
              />
            </el-form-item>

            <el-form-item label="安全通知模板">
              <el-input
                v-model="notificationSettings.securityTemplate"
                type="textarea"
                :rows="3"
                placeholder="请输入安全通知模板"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改云存储设置选项卡 -->
        <el-tab-pane label="云存储设置" name="storage">
          <el-alert
            title="云存储配置说明"
            type="info"
            description="配置系统支持的云存储服务，可设置默认存储服务"
            show-icon
            style="margin-bottom: 20px"
          />

          <el-form
            ref="storageFormRef"
            :model="storageSettings"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="默认存储服务">
              <el-radio-group v-model="storageSettings.defaultProvider">
                <el-radio value="aliyun">阿里云 OSS</el-radio>
                <el-radio value="qiniu">七牛云</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-divider>阿里云 OSS 配置</el-divider>

            <el-form-item label="Access Key ID">
              <el-input
                v-model="storageSettings.aliyun.accessKeyId"
                placeholder="请输入阿里云 Access Key ID"
                type="password"
              />
            </el-form-item>

            <el-form-item label="Access Key Secret">
              <el-input
                v-model="storageSettings.aliyun.accessKeySecret"
                placeholder="请输入阿里云 Access Key Secret"
                type="password"
              />
            </el-form-item>

            <el-form-item label="Bucket 名称">
              <el-input v-model="storageSettings.aliyun.bucket" placeholder="请输入 Bucket 名称" />
            </el-form-item>

            <el-form-item label="Endpoint">
              <el-input
                v-model="storageSettings.aliyun.endpoint"
                placeholder="请输入 Endpoint，如：oss-cn-hangzhou.aliyuncs.com"
              />
            </el-form-item>

            <el-form-item label="存储路径前缀">
              <el-input
                v-model="storageSettings.aliyun.pathPrefix"
                placeholder="请输入存储路径前缀，如：uploads/"
              />
            </el-form-item>

            <el-divider>七牛云存储配置</el-divider>

            <el-form-item label="Access Key">
              <el-input
                v-model="storageSettings.qiniu.accessKey"
                placeholder="请输入七牛云 Access Key"
                type="password"
              />
            </el-form-item>

            <el-form-item label="Secret Key">
              <el-input
                v-model="storageSettings.qiniu.secretKey"
                placeholder="请输入七牛云 Secret Key"
                type="password"
              />
            </el-form-item>

            <el-form-item label="Bucket 名称">
              <el-input v-model="storageSettings.qiniu.bucket" placeholder="请输入 Bucket 名称" />
            </el-form-item>

            <el-form-item label="存储区域">
              <el-select v-model="storageSettings.qiniu.zone" placeholder="请选择存储区域">
                <el-option label="华东" value="z0" />
                <el-option label="华北" value="z1" />
                <el-option label="华南" value="z2" />
                <el-option label="北美" value="na0" />
                <el-option label="东南亚" value="as0" />
              </el-select>
            </el-form-item>

            <el-form-item label="存储路径前缀">
              <el-input
                v-model="storageSettings.qiniu.pathPrefix"
                placeholder="请输入存储路径前缀，如：uploads/"
              />
            </el-form-item>

            <el-form-item label="访问域名">
              <el-input
                v-model="storageSettings.qiniu.domain"
                placeholder="请输入访问域名，如：http://example.qiniudn.com"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveStorageSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SettingsService } from '@/api/settingsService'

const activeTab = ref('basic')

const basicFormRef = ref()
const modelFormRef = ref()
const securityFormRef = ref()
const notificationFormRef = ref()
const storageFormRef = ref()

const basicSettings = reactive({
  systemName: '智能体工作流系统',
  systemDescription: '一个基于Vue 3 + TypeScript + Pinia + Element Plus的智能体工作流管理系统',
  language: 'zh-CN',
  theme: 'light',
  enableNotifications: true,
})

const modelSettings = reactive({
  defaultProvider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
})

const securitySettings = reactive({
  passwordPolicy: 'medium',
  sessionTimeout: 30,
  enable2FA: false,
  maxLoginAttempts: 5,
})

const notificationSettings = reactive({
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  systemTemplate: '您有一条新的系统通知：{{content}}',
  securityTemplate: '您的账户有安全相关的操作：{{content}}',
})

// 修改云存储设置
const storageSettings = reactive({
  defaultProvider: 'aliyun', // 默认使用阿里云 OSS
  aliyun: {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    endpoint: '',
    pathPrefix: '',
  },
  qiniu: {
    accessKey: '',
    secretKey: '',
    bucket: '',
    zone: 'z0',
    pathPrefix: '',
    domain: '',
  },
})

// 加载设置
onMounted(() => {
  loadSettings()
})

const loadSettings = async () => {
  try {
    const settings = await SettingsService.getSettings()
    Object.assign(basicSettings, settings.basic || {})
    Object.assign(modelSettings, settings.model || {})
    Object.assign(securitySettings, settings.security || {})
    Object.assign(notificationSettings, settings.notification || {})
    Object.assign(
      storageSettings,
      settings.storage || {
        defaultProvider: 'aliyun',
        aliyun: {
          accessKeyId: '',
          accessKeySecret: '',
          bucket: '',
          endpoint: '',
          pathPrefix: '',
        },
        qiniu: {
          accessKey: '',
          secretKey: '',
          bucket: '',
          zone: 'z0',
          pathPrefix: '',
          domain: '',
        },
      },
    )
  } catch (error) {
    console.error('加载设置失败:', error)
    ElMessage.error('加载设置失败: ' + error.message)
  }
}

const saveSettings = async (type, settingsData) => {
  try {
    // 构造完整的设置对象
    const currentSettings = {
      basic: basicSettings,
      model: modelSettings,
      security: securitySettings,
      notification: notificationSettings,
      storage: storageSettings,
    }

    // 如果是更新特定模块，使用模块更新接口
    if (settingsData && type) {
      await SettingsService.updateSettingsModule(type, settingsData)
    } else {
      // 否则更新所有设置
      await SettingsService.updateSettings(currentSettings)
    }

    ElMessage.success(`${type}设置保存成功`)
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败: ' + error.message)
  }
}

const saveBasicSettings = () => {
  saveSettings('basic', basicSettings)
}

const saveModelSettings = () => {
  saveSettings('model', modelSettings)
}

const saveSecuritySettings = () => {
  saveSettings('security', securitySettings)
}

const saveNotificationSettings = () => {
  saveSettings('notification', notificationSettings)
}

const saveStorageSettings = () => {
  saveSettings('storage', storageSettings)
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.settings-form {
  margin-top: 20px;
}

.settings-tabs :deep(.el-tabs__content) {
  padding: 20px 0;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>
