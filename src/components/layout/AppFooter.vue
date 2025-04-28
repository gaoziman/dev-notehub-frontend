<template>
  <footer class="footer">
    <div class="copyright">
      © {{ currentYear }} 智能知识库 - 版权所有
    </div>
    <div class="links">
      <n-button text size="small">使用指南</n-button>
      <n-button text size="small">隐私政策</n-button>
      <n-button text size="small">关于我们</n-button>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

// 获取当前年份
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  height: var(--footer-height);
  background-color: var(--card-color);
  border-top: 1px solid var(--divider-color);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-color-tertiary);
  font-size: 13px;
}

.links {
  display: flex;
  gap: 8px;
}
</style>