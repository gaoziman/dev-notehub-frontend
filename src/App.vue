<template>
  <n-config-provider :theme="activeTheme" :theme-overrides="themeOverrides">
    <slot>
      <n-message-provider>
        <StyleTest></StyleTest>
      </n-message-provider>
    </slot>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOsTheme, darkTheme } from 'naive-ui'
import { themeOverrides } from '@/theme/themeConfig'
import StyleTest from "@/pages/StyleTest.vue";

// 检测系统主题
const osThemeRef = useOsTheme()

// 用户选择的主题模式: 'auto' | 'light' | 'dark'
const themeMode = ref('auto')

// 计算当前应该使用的主题
const activeTheme = computed(() => {
  if (themeMode.value === 'auto') {
    return osThemeRef.value === 'dark' ? darkTheme : null
  }
  return themeMode.value === 'dark' ? darkTheme : null
})

// 切换主题的方法，可以导出供其他组件使用
const toggleTheme = (mode) => {
  themeMode.value = mode
}

// 导出切换主题的方法
defineExpose({
  toggleTheme
})
</script>