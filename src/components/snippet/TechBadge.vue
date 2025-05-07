<template>
  <div class="tech-badge" :class="`tech-${tech}`">
    <icon-font :type="getTechIcon(tech)" :size="16" />
    <span class="tech-name">{{ getTechName(tech) }}</span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  tech: {
    type: String,
    required: true
  }
})

// 获取技术图标
const getTechIcon = (tech) => {
  const iconMap = {
    'vue3': 'icon-vue',
    'react': 'icon-react',
    'javascript': 'icon-javascript',
    'html-css': 'icon-html',
    'spring-boot': 'icon-spring-boot',
    'java': 'icon-java'
  }

  return iconMap[tech] || 'icon-code'
}

// 获取技术名称
const getTechName = (tech) => {
  const nameMap = {
    'vue3': 'Vue 3',
    'react': 'React',
    'javascript': 'JavaScript',
    'html-css': 'HTML/CSS',
    'spring-boot': 'Spring Boot',
    'java': 'Java'
  }

  return nameMap[tech] || tech
}
</script>

<style scoped>
.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tech-vue3 {
  background-color: rgba(65, 184, 131, 0.1);
  color: #41b883;
  border-color: rgba(65, 184, 131, 0.2);
}

.tech-react {
  background-color: rgba(97, 218, 251, 0.1);
  color: #61dafb;
  border-color: rgba(97, 218, 251, 0.2);
}

.tech-javascript {
  background-color: rgba(247, 223, 30, 0.1);
  color: #f0db4f;
  border-color: rgba(247, 223, 30, 0.2);
}

.tech-html-css {
  background-color: rgba(229, 77, 38, 0.1);
  color: #e54d26;
  border-color: rgba(229, 77, 38, 0.2);
}

.tech-spring-boot {
  background-color: rgba(109, 179, 63, 0.1);
  color: #6db33f;
  border-color: rgba(109, 179, 63, 0.2);
}

.tech-java {
  background-color: rgba(244, 117, 33, 0.1);
  color: #f47521;
  border-color: rgba(244, 117, 33, 0.2);
}

.tech-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>