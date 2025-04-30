<template>
  <div class="fab-container">
    <transition name="fab-expand">
      <div class="fab-menu" v-if="isExpanded">
        <div v-for="(item, index) in fabItems" :key="index" class="fab-menu-item">
          <n-tooltip :placement="'left'" trigger="hover">
            <template #trigger>
              <n-button
                  circle
                  class="fab-menu-button"
                  :type="item.type || 'primary'"
                  :ghost="item.ghost"
                  @click="handleFabItemClick(item)"
              >
                <icon-font :type="item.icon" />
              </n-button>
            </template>
            {{ item.label }}
          </n-tooltip>
        </div>
      </div>
    </transition>

    <n-button
        circle
        size="large"
        class="fab-button"
        :type="isExpanded ? 'error' : 'primary'"
        @click="toggleExpand"
    >
      <icon-font :type="isExpanded ? 'icon-close' : 'icon-plus'" />
    </n-button>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [
      {
        label: '添加书签',
        icon: 'icon-bookmark-add',
        action: 'add-bookmark'
      },
      {
        label: '导入书签',
        icon: 'icon-import',
        type: 'info',
        action: 'import-bookmarks'
      },
      {
        label: '扫描二维码',
        icon: 'icon-qrcode-scan',
        type: 'success',
        action: 'scan-qrcode'
      },
      {
        label: '浏览器插件',
        icon: 'icon-browser-extension',
        ghost: true,
        action: 'browser-extension'
      }
    ]
  }
})

const emit = defineEmits(['action'])

// 状态
const isExpanded = ref(false)

// 展开的菜单项
const fabItems = computed(() => props.items.slice().reverse())

// 切换展开状态
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// 处理菜单项点击
function handleFabItemClick(item) {
  emit('action', item.action)
  isExpanded.value = false
}
</script>

<style scoped>
.fab-container {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 90;
}

.fab-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 3;
}

.fab-button:hover {
  transform: scale(1.1);
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.fab-menu-item {
  transition: all 0.3s ease;
}

.fab-menu-button {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.fab-menu-button:hover {
  transform: scale(1.1);
}

/* 动画 */
.fab-expand-enter-active,
.fab-expand-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fab-expand-enter-from,
.fab-expand-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 子项延迟动画 */
.fab-menu-item:nth-child(1) {
  transition-delay: 0.05s;
}
.fab-menu-item:nth-child(2) {
  transition-delay: 0.1s;
}
.fab-menu-item:nth-child(3) {
  transition-delay: 0.15s;
}
.fab-menu-item:nth-child(4) {
  transition-delay: 0.2s;
}
</style>