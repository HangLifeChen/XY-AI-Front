<template>
  <div class="home-container">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 欢迎区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">释放AI潜能，构建智能未来</h1>
          <p class="slogan">您的全能私人智能助理</p>
          <p class="hero-subtitle">一站式智能体与工作流管理平台，助您轻松创建、部署和管理AI应用</p>
          <div class="hero-actions" v-if="!isAuthenticated">
            <router-link to="/register" class="cta-button primary">免费开始</router-link>
            <router-link to="/login" class="cta-button secondary">登录账户</router-link>
          </div>
          <div class="hero-actions" v-else>
            <router-link to="/agents" class="cta-button primary">创建智能体</router-link>
            <router-link to="/workflows" class="cta-button secondary">设计工作流</router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-placeholder">
            <div class="grid-animation">
              <div class="grid-item" v-for="(item, index) in gridItems" :key="index">
                <el-icon :size="35" class="grid-icon">
                  <component :is="item.iconComponent" />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 核心功能 -->
      <section class="core-features">
        <div class="section-header">
          <h2>核心能力</h2>
          <p>构建、部署和管理AI应用的完整工具链</p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in coreFeatures" :key="index">
            <div class="feature-icon">
              <el-icon :size="32"><component :is="feature.icon" /></el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- 系统概览 -->
      <section v-if="isAuthenticated" class="system-overview">
        <div class="section-header">
          <h2>您的AI资产</h2>
          <p>实时掌握智能体和工作流状态</p>
        </div>

        <div class="overview-stats">
          <div class="stat-card" v-for="(stat, key) in stats" :key="key">
            <div class="stat-icon">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 使用指南 -->
      <section class="usage-guide">
        <div class="section-header">
          <h2>三步上手</h2>
          <p>快速创建您的第一个AI应用</p>
        </div>

        <div class="guide-steps">
          <div class="step" v-for="(step, index) in steps" :key="index">
            <div class="step-icon">
              <span class="step-number">{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA 区域 -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>开启您的AI之旅</h2>
          <p>立即加入数万开发者，共同构建下一代AI应用</p>
          <div class="cta-actions">
            <router-link to="/register" class="cta-button primary large">免费试用</router-link>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  Avatar,
  Connection,
  Reading,
  Document,
  Tools,
  Monitor,
  Operation,
  Setting,
  DataAnalysis,
  MagicStick,
  Comment,
  User,
  UserFilled,
  Shop,
  SetUp,
} from '@element-plus/icons-vue'

const userStore = useUserStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)

// 网格动画项目数据
const gridItems = ref([
  { iconComponent: markRaw(Avatar) }, // 智能体
  { iconComponent: markRaw(Connection) }, // 工作流
  { iconComponent: markRaw(Tools) }, // 工具
  { iconComponent: markRaw(Reading) }, // 知识库
  { iconComponent: markRaw(Document) }, // 模板
  { iconComponent: markRaw(Shop) }, // MCP市场
  { iconComponent: markRaw(Monitor) }, // 模型管理
  { iconComponent: markRaw(SetUp) }, // 系统设置
  { iconComponent: markRaw(MagicStick) }, // 实时测试
])

// 核心功能数据
const coreFeatures = ref([
  {
    title: '智能体工厂',
    description:
      '创建具有独特角色和能力的AI智能体，赋予其个性和专业知识，支持关联工具、工作流和知识库',
    icon: markRaw(Avatar),
  },
  {
    title: '可视化编排',
    description: '通过直观的拖拽界面设计复杂的工作流程，支持多种节点类型和高级控制逻辑',
    icon: markRaw(Connection),
  },
  {
    title: '工具生态',
    description: '丰富的工具库，支持MCP集成，轻松扩展智能体能力，支持自定义HTTP API工具',
    icon: markRaw(Tools),
  },
  {
    title: '知识增强',
    description: '将外部知识整合到智能体中，提升其回答准确性，支持文档上传和智能检索',
    icon: markRaw(Reading),
  },
  {
    title: '模板市场',
    description: '使用预设模板快速创建常见工作流和智能体，大幅提升开发效率',
    icon: markRaw(Document),
  },
  {
    title: '实时测试',
    description: '在部署前对智能体和工作流进行实时测试和调试，确保最佳性能',
    icon: markRaw(MagicStick),
  },
])

// 使用步骤数据（优化文案）
const steps = ref([
  {
    title: '定义智能体',
    description: '创建具有特定角色和能力的AI智能体，配置系统提示词和行为规则',
  },
  {
    title: '编排工作流',
    description: '通过可视化界面构建自动化流程，整合多种AI能力和业务逻辑',
  },
  {
    title: '部署与监控',
    description: '一键发布应用并实时监控执行状态，持续优化性能表现',
  },
])

// 统计数据
const stats = ref({
  agents: {
    value: 12,
    label: '智能体',
    icon: Avatar,
  },
  workflows: {
    value: 24,
    label: '工作流',
    icon: Connection,
  },
  tools: {
    value: 18,
    label: '工具',
    icon: Tools,
  },
  knowledgeBases: {
    value: 8,
    label: '知识库',
    icon: Reading,
  },
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
}

/* 英雄区域 */
.hero-section {
  padding: 6rem 4rem;
  display: flex;
  align-items: center;
  gap: 4rem;
  width: 100%;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(90deg, #0f172a, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slogan {
  font-size: 1.5rem;
  color: #cc1616;
  font-weight: 600;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.cta-button {
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cta-button.large {
  padding: 1.125rem 2rem;
  font-size: 1.125rem;
}

.primary {
  background: linear-gradient(90deg, #cc1616 0%, #e53939 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(204, 22, 22, 0.3);
}

.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(204, 22, 22, 0.4);
}

.secondary {
  background-color: white;
  color: #cc1616;
  border: 2px solid #cc1616;
}

.secondary:hover {
  background-color: #fef2f2;
  transform: translateY(-3px);
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
}

.visual-placeholder {
  width: 100%;
  max-width: 500px;
  height: 400px;
  position: relative;
}

.grid-animation {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  height: 100%;
}

.grid-item {
  background: linear-gradient(135deg, #cc1616 0%, #e53939 100%);
  border-radius: 16px;
  opacity: 0.9;
  animation: pulse 2s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-item:nth-child(2n) {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  animation-delay: 0.2s;
}

.grid-item:nth-child(3n) {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  animation-delay: 0.4s;
}

.grid-icon {
  color: white;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
}

/* 核心功能 */
.core-features {
  padding: 6rem 4rem;
  width: 100%;
  margin: 0;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cc1616;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #64748b;
  line-height: 1.7;
}

/* 系统概览 */
.system-overview {
  padding: 6rem 4rem;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  width: 100%;
  margin: 0;
}

.system-overview .section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.system-overview .section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
}

.system-overview .section-header p {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cc1616;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
}

/* 使用指南 */
.usage-guide {
  padding: 6rem 4rem;
  width: 100%;
  margin: 0;
}

.usage-guide .section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.usage-guide .section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
}

.usage-guide .section-header p {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.guide-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
}

.step {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.step:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.step-icon {
  flex-shrink: 0;
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #cc1616 0%, #e53939 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 4px 10px rgba(204, 22, 22, 0.3);
}

.step-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
}

.step-content p {
  color: #64748b;
  line-height: 1.7;
}

/* CTA 区域 */
.cta-section {
  padding: 6rem 4rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  width: 100%;
  margin: 0;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
  color: white;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.cta-content p {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.cta-actions .cta-button.primary {
  background: linear-gradient(90deg, #cc1616 0%, #e53939 100%);
  color: white;
  font-size: 1.125rem;
  padding: 1.25rem 3rem;
  box-shadow: 0 10px 25px rgba(204, 22, 22, 0.4);
}

.cta-actions .cta-button.primary:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(204, 22, 22, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .features-grid,
  .overview-stats,
  .guide-steps {
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 4rem 2rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .visual-placeholder {
    height: 300px;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .section-header p {
    font-size: 1.125rem;
  }

  .feature-card,
  .stat-card,
  .step {
    padding: 1.75rem;
  }

  .stat-value {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section,
  .system-overview,
  .core-features,
  .usage-guide,
  .cta-section {
    padding: 3rem 1.5rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid,
  .overview-stats,
  .guide-steps {
    grid-template-columns: 1fr;
  }

  .step {
    flex-direction: column;
    text-align: center;
  }

  .visual-placeholder {
    height: 250px;
  }

  .grid-item {
    border-radius: 12px;
  }

  .cta-content h2 {
    font-size: 2rem;
  }

  .cta-content p {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .hero-section,
  .system-overview,
  .core-features,
  .usage-guide,
  .cta-section {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  .feature-card,
  .stat-card,
  .step {
    padding: 1.5rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .cta-content h2 {
    font-size: 1.75rem;
  }
}
</style>