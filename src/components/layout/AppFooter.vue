<template>
  <footer class="enhanced-footer">
    <div class="footer-container">
      <!-- 左侧：Logo和版权信息 -->
      <div class="footer-left">
        <div class="footer-logo">
          <icon-font type="icon-zhishiku1" :size="20" color="var(--primary-color)" />
          <span class="logo-text">智慧知识库</span>
        </div>
        <div class="copyright">
          © {{ currentYear }} 智能知识库 - 版权所有
        </div>
      </div>

      <!-- 中间：快速链接 -->
      <div class="footer-center">
        <div class="footer-links">
          <n-button text size="small" class="footer-link">
            <template #icon>
              <n-icon size="14">
                <icon-font type="icon-bangzhu" :size="14" />
              </n-icon>
            </template>
            使用指南
          </n-button>
          <n-button text size="small" class="footer-link">
            <template #icon>
              <n-icon size="14">
                <icon-font type="icon-yinsi" :size="14" />
              </n-icon>
            </template>
            隐私政策
          </n-button>
          <n-button text size="small" class="footer-link">
            <template #icon>
              <n-icon size="14">
                <icon-font type="icon-guanyu" :size="14" />
              </n-icon>
            </template>
            关于我们
          </n-button>
          <n-button text size="small" class="footer-link">
            <template #icon>
              <n-icon size="14">
                <icon-font type="icon-lianxi" :size="14" />
              </n-icon>
            </template>
            联系我们
          </n-button>
        </div>
      </div>

      <!-- 右侧：版本信息和主题切换 -->
      <div class="footer-right">
        <div class="version-info">
          <span class="version-tag">v1.2.0</span>
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <n-button circle text size="small" class="update-btn">
                <template #icon>
                  <n-icon>
                    <icon-font type="icon-gengxin" :size="14" />
                  </n-icon>
                </template>
              </n-button>
            </template>
            检查更新
          </n-tooltip>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import IconFont from "@/components/common/IconFont.vue";

// 获取当前年份
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.enhanced-footer {
  height: var(--footer-height);
  background-color: var(--card-color);
  border-top: 1px solid var(--divider-color);
  padding: 0;
  color: var(--text-color-tertiary);
  font-size: 13px;
}

.footer-container {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left, .footer-center, .footer-right {
  display: flex;
  align-items: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.logo-text {
  font-weight: 500;
  font-size: 14px;
  color: var(--primary-color);
}

.copyright {
  color: var(--text-color-tertiary);
  font-size: 12px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  font-size: 12px;
  height: 24px;
  padding: 0 4px;
  color: var(--text-color-secondary);
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-link:hover {
  color: var(--primary-color);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.version-tag {
  font-size: 12px;
  color: var(--text-color-tertiary);
  background-color: rgba(99, 102, 241, 0.08);
  padding: 2px 6px;
  border-radius: 10px;
}

.update-btn {
  color: var(--text-color-tertiary);
}

.update-btn:hover {
  color: var(--primary-color);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    padding: 10px 16px;
    height: auto;
    gap: 10px;
    justify-content: center;
  }

  .enhanced-footer {
    height: auto;
  }

  .footer-left, .footer-center, .footer-right {
    width: 100%;
    justify-content: center;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .footer-links {
    gap: 8px;
  }

  .footer-left {
    flex-direction: column;
    gap: 4px;
  }
}
</style>