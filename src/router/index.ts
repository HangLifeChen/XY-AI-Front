import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Layouts
import AuthLayout from '@/components/layout/AuthLayout.vue'
import MainLayout from '@/components/layout/MainLayout.vue'

// Auth views
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import Unauthorized from '@/views/Unauthorized.vue'

// Main views
import Profile from '@/views/Profile.vue'
import Settings from '@/views/Settings.vue'
import TaskList from '@/views/TaskList.vue'
import AgentManagement from '@/views/AgentManagement.vue'
import ModelManagement from '@/views/ModelManagement.vue'
import KnowledgeManagementView from '@/views/KnowledgeManagementView.vue'
import ToolManagementView from '@/views/ToolManagementView.vue'
import TemplateManagementView from '@/views/TemplateManagementView.vue'
import WorkflowLayout from '@/views/WorkflowLayout.vue'
import SubscriptionView from '@/views/SubscriptionView.vue'

// MCP views
import McpMarket from '@/views/McpMarket.vue'
import AgentMarket from '@/views/AgentMarket.vue'
import HomeView from '@/views/HomeView.vue'
import AgentExecute from '@/views/AgentExecute.vue'

// Cloud Storage view
import CloudStorageView from '@/views/CloudStorageView.vue'

// Knowledge base components
import KnowledgeBaseDetail from '@/components/knowledge/KnowledgeBaseDetail.vue'
import KnowledgeBaseSearch from '@/components/knowledge/KnowledgeBaseSearch.vue'

// 常量
const AUTH_ROUTE_NAMES = ['Login', 'Register']
const ADMIN_ROUTE_NAMES = ['McpServiceManagement']

// 路由配置
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword,
      },
      {
        path: 'unauthorized',
        name: 'Unauthorized',
        component: Unauthorized,
      },
    ],
  },
  {
    path: '/',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: TaskList,
      },
      {
        path: 'agents',
        name: 'agents',
        component: AgentManagement,
      },
      {
        path: 'agents/:id/execute',
        name: 'agent-execute',
        component: AgentExecute,
      },
      {
        path: 'models',
        name: 'ModelManagement',
        component: ModelManagement,
      },
      {
        path: 'knowledge',
        name: 'KnowledgeManagement',
        component: KnowledgeManagementView,
      },
      {
        path: 'knowledge/:id',
        name: 'KnowledgeBaseDetail',
        component: KnowledgeBaseDetail,
        props: true,
      },
      {
        path: 'knowledge/:id/search',
        name: 'KnowledgeBaseSearch',
        component: KnowledgeBaseSearch,
        props: true,
      },
      {
        path: 'tools',
        name: 'ToolManagement',
        component: ToolManagementView,
      },
      {
        path: 'templates',
        name: 'TemplateManagement',
        component: TemplateManagementView,
      },
      {
        path: 'cloud-storage',
        name: 'CloudStorage',
        component: CloudStorageView,
      },
      {
        path: 'subscription',
        name: 'Subscription',
        component: SubscriptionView,
      },
      {
        path: 'workflows',
        name: 'WorkflowLayout',
        component: WorkflowLayout,
        children: [
          {
            path: '',
            name: 'WorkflowManager',
            component: () => import('@/components/WorkflowEditor/WorkflowManager.vue'),
          },
          {
            path: ':id',
            name: 'workflow-editor',
            component: () => import('@/components/WorkflowEditor/WorkflowEditor.vue'),
          },
        ],
      },
      {
        path: 'mcp-market',
        name: 'McpMarket',
        component: McpMarket,
      },
      {
        path: 'agent-market',
        name: 'AgentMarket',
        component: AgentMarket,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isAuthenticated
  const userRole = userStore.role || 'user'

  // 检查是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ name: 'Unauthorized' })
    return
  }

  next()
})

export default router