<template>
  <div class="tool-category">
    <div class="category-header">
      <div class="category-title">
        <icon-font :type="iconType" :size="24" :color="iconColor" />
        <h2>{{ title }}</h2>
      </div>
      <n-button text type="primary" @click="$emit('view-all')">
        查看全部
        <template #icon>
          <icon-font type="icon-arrow-right" />
        </template>
      </n-button>
    </div>
    <div class="tools-grid">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue';
import IconFont from '@/components/common/IconFont.vue';

defineEmits(['view-all']);

defineProps({
  title: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: undefined
  }
});
</script>

<style scoped>
.tool-category {
  margin-bottom: 32px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>