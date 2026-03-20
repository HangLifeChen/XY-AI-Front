<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const route = useRoute()
const layout = computed(() => route.meta?.layout || 'main')

const layouts = {
  main: MainLayout,
  auth: AuthLayout,
}
const layoutProps = computed(() => {
  return {
    // 从路由的 meta 中读取 centerContent 的值
    // 如果 meta 中没有定义，则默认为 false
    centerContent: route.meta.centerContent || false,
    // 你可以在这里添加更多想从 meta 传递的 props
    // anotherProp: route.meta.anotherProp || 'default value'
  }
})
</script>

<template>
  <component :is="layouts[layout]" v-bind="layoutProps">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<style lang="scss">
// 全局样式已在 index.css 中定义
// 这里只添加动画相关的样式

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>