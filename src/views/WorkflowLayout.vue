<template>
  <div class="workflow-layout">
    <!-- <div class="header">
      <h2 class="title">工作流管理</h2>
      <div class="breadcrumb">
        <router-link
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          :to="crumb.path"
          class="breadcrumb-item"
        >
          {{ crumb.title }}
          <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
        </router-link>
      </div>
    </div> -->
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 模态框容器 -->
    <router-view name="modal" v-slot="{ Component }">
      <transition name="modal">
        <component :is="Component" v-if="$route.meta.modal" @close="closeModal" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const crumbs: Array<{ title: string; path: string }> = []
  let matched = route.matched.filter((r) => r.meta.breadcrumb)

  matched.forEach((routeRecord, index) => {
    const path = routeRecord.path.startsWith('/')
      ? routeRecord.path
      : matched
          .slice(0, index + 1)
          .map((r) => r.path)
          .join('/')

    crumbs.push({
      title: routeRecord.meta.breadcrumb as string,
      path: index === matched.length - 1 ? '' : path,
    })
  })

  return crumbs
})

const closeModal = () => {
  if (route.meta.modal) {
    window.history.back()
  }
}
</script>

<style scoped>
.workflow-layout {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 110px);
  background-color: #f5f5f5;
}

.header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  color: #cc1616;
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb-item:hover {
  color: #40a9ff;
}

.separator {
  margin: 0 8px;
  color: #999;
}

.content {
  flex: 1;
  padding: 10px;
  overflow: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
