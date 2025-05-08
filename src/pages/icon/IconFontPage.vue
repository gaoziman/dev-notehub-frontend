<template>
  <div class="icon-font-page">
    <n-card title="图标库管理" :bordered="false" class="main-card">
      <!-- 顶部控制面板 -->
      <n-space vertical size="large">
        <n-space align="center">
          <n-input
              v-model:value="iconUrl"
              placeholder="请输入iconfont链接，例如: //at.alicdn.com/t/c/font_xxx.js"
              class="url-input"
              clearable
          >
            <template #prefix>
              <icon-font type="icon-sousuo-" :size="15" />
            </template>
          </n-input>
          <n-button type="primary" @click="updateIconLibrary" :loading="loading">
            更新图标库
          </n-button>
          <n-tooltip trigger="hover" placement="top">
            <template #trigger>
              <icon-font type="icon-icon-moon1" :size="32" />
            </template>
            请输入阿里巴巴iconfont项目的在线JS链接，点击更新图标库按钮即可加载图标。
          </n-tooltip>
        </n-space>

        <!-- 图标设置 -->
        <n-space align="center" justify="space-between" wrap>
          <n-space>
            <n-text>图标大小：</n-text>
            <n-slider
                v-model:value="iconSize"
                :step="4"
                :min="16"
                :max="64"
                style="width: 120px"
            />
            <n-input-number
                v-model:value="iconSize"
                size="small"
                :min="16"
                :max="64"
                style="width: 80px"
            >
              <template #suffix>px</template>
            </n-input-number>
          </n-space>

          <n-space>
            <n-input
                v-model:value="searchText"
                placeholder="搜索图标"
                clearable
                style="width: 200px"
            >
              <template #prefix>
                <icon-font type="icon-sousuo-" :size="15" />
              </template>
            </n-input>
          </n-space>
        </n-space>

        <!-- 图标展示区域 -->
        <div class="icons-container">
          <n-empty v-if="filteredIcons.length === 0" description="暂无图标" />
          <template v-else>
            <div
                v-for="icon in paginatedIcons"
                :key="icon"
                class="icon-item"
                @click="copyIconCode(icon)"
            >
              <div class="icon-preview">
                <icon-font
                    :type="icon"
                    :size="iconSize"
                />
              </div>
              <div class="icon-name">{{ icon }}</div>
            </div>
          </template>
        </div>

        <!-- 分页控制 -->
        <n-pagination
            v-model:page="currentPage"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-sizes="[20, 40, 80, 100]"
            v-model:page-size="pageSize"
            show-size-picker
            show-quick-jumper
        />
      </n-space>
    </n-card>

    <!-- 复制成功提示 - 重新设计的精简弹窗 -->
    <n-modal
        v-model:show="showCopiedModal"
        preset="card"
        style="width: 450px; max-width: 90vw;"
        title="复制成功"
        :bordered="false"
        :auto-focus="false"
        :mask-closable="true"
        class="copied-modal"
    >
      <div class="copy-dialog-content">
        <!-- 图标预览和基本信息 -->
        <div class="icon-copy-preview">
          <div class="icon-display">
            <icon-font
                :type="copiedIcon"
                :color="iconColor || undefined"
                :size="48"
            />
          </div>
          <div class="icon-info">
            <n-ellipsis style="max-width: 240px;" :tooltip="false">
              {{ copiedIcon }}
            </n-ellipsis>
            <n-space class="icon-actions">
              <n-button size="small" @click="copyIconId" secondary>
                <template #icon>
                  <icon-font type="icon-copy" :size="16" />
                </template>
                复制ID
              </n-button>
              <n-color-picker
                  v-model:value="iconColor"
                  :swatches="colorPresets"
                  size="small"
              />
              <n-button size="small" @click="copyWithCurrentColor" type="primary">
                <template #icon>
                  <icon-font type="icon-code" :size="16" />
                </template>
                复制代码
              </n-button>
            </n-space>
          </div>
        </div>

        <!-- 标签页，切换不同的代码示例 -->
        <n-tabs type="line" animated class="code-tabs">
          <n-tab-pane name="component" tab="组件使用">
            <div class="code-preview">
              <n-code :code="copiedComponentCode" language="html" word-wrap />
            </div>
          </n-tab-pane>
          <n-tab-pane name="css" tab="CSS使用">
            <div class="code-preview">
              <n-code :code="copiedCssCode" language="css" word-wrap />
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import IconFont from '@/components/common/IconFont.vue';
import { colors } from '@/theme/themeConfig';
import { message } from '@/utils/message';



// 图标集
const iconList = ref<string[]>([]);
const loading = ref(false);

// 图标链接
const iconUrl = ref('//at.alicdn.com/t/c/font_4909170_xn92u1cx56o.js');

// 图标设置
const iconColor = ref('');
const iconSize = ref(32);
const searchText = ref('');

// 颜色预设
const colorPresets = [
  colors.primary,
  colors.info,
  colors.success,
  colors.warning,
  colors.error,
  colors.textBase,
  colors.textSecondary,
  colors.textTertiary
];

// 分页设置
const currentPage = ref(1);
const pageSize = ref(40);

// 复制相关
const showCopiedModal = ref(false);
const copiedIcon = ref('');

// 图标搜索过滤
const filteredIcons = computed(() => {
  if (!searchText.value) return iconList.value;

  return iconList.value.filter(icon =>
      icon.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 分页计算
const pageCount = computed(() => {
  const count = Math.ceil(filteredIcons.value.length / pageSize.value);
  return count || 1; // 确保至少返回1，避免分页异常
});

const paginatedIcons = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredIcons.value.slice(startIndex, endIndex);
});

// 复制代码计算
const copiedComponentCode = computed(() => {
  if (iconColor.value) {
    return `<icon-font type="${copiedIcon.value}" :size="${iconSize.value}" color="${iconColor.value}" />`;
  } else {
    return `<icon-font type="${copiedIcon.value}" :size="${iconSize.value}" />`;
  }
});

const copiedCssCode = computed(() => {
  let cssCode = `.${copiedIcon.value}::before {
  content: "\\${copiedIcon.value.replace('icon-', '')}";
  font-family: "iconfont";`;

  if (iconColor.value) {
    cssCode += `\n  color: ${iconColor.value};`;
  }

  cssCode += `\n  font-size: ${iconSize.value}px;\n}`;
  return cssCode;
});

// 监听筛选条件变化，重置当前页
watch([searchText], () => {
  currentPage.value = 1;
});

// 更新图标库
const updateIconLibrary = async () => {
  if (!iconUrl.value) {
    message.warning('请输入iconfont链接');
    return;
  }

  loading.value = true;

  try {
    // 移除旧的图标库脚本
    const oldScript = document.getElementById('iconfont-script');
    if (oldScript) {
      document.head.removeChild(oldScript);
    }

    // 创建新的图标库脚本
    const script = document.createElement('script');
    script.id = 'iconfont-script';
    script.src = iconUrl.value.startsWith('//') ? iconUrl.value : `//${iconUrl.value}`;

    // 加载完成后解析图标
    script.onload = () => {
      parseIconsFromSymbol();
      loading.value = false;
      message.success('图标库更新成功');
    };

    script.onerror = () => {
      loading.value = false;
      message.error('图标库加载失败，请检查链接是否正确');
    };

    document.head.appendChild(script);
  } catch (error) {
    loading.value = false;
    message.error('更新图标库发生错误');
    console.error('更新图标库发生错误:', error);
  }
};

// 从Symbol解析图标
const parseIconsFromSymbol = () => {
  const symbols = document.querySelectorAll('svg symbol');
  const icons: string[] = [];

  symbols.forEach(symbol => {
    const id = symbol.id;
    if (id) {
      icons.push(id);
    }
  });

  iconList.value = icons;
  currentPage.value = 1;
};

// 复制图标代码
const copyIconCode = (icon: string) => {
  copiedIcon.value = icon;
  iconColor.value = ''; // 初始时不设置颜色

  // 复制默认颜色的图标代码到剪贴板
  navigator.clipboard.writeText(`<icon-font type="${icon}" :size="${iconSize.value}" />`)
      .then(() => {
        showCopiedModal.value = true;
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
};

// 仅复制图标ID
const copyIconId = () => {
  navigator.clipboard.writeText(copiedIcon.value)
      .then(() => {
        showCopiedModal.value = false;
        message.success(`图标ID "${copiedIcon.value}" 已复制到剪贴板`);
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
};

// 使用当前颜色复制
const copyWithCurrentColor = () => {
  navigator.clipboard.writeText(copiedComponentCode.value)
      .then(() => {
        showCopiedModal.value = false;
        message.success('带颜色的组件代码已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
};

// 加载默认图标库
onMounted(() => {
  updateIconLibrary();
});
</script>

<style scoped>
.icon-font-page {
  width: 100%;
  height: 100%;
  background-color: var(--body-color);
  padding: 16px;
}

.main-card {
  margin-bottom: 20px;
  box-shadow: var(--box-shadow-1);
}

.url-input {
  min-width: 400px;
  max-width: 600px;
}

.icons-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin: 20px 0;
  min-height: 400px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s var(--transition-timing-function);
  padding: 8px;
  overflow: hidden;
  background-color: var(--card-color);
  position: relative;
}

.icon-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-1);
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 100%;
}

.icon-name {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 8px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* 新增的样式 - 复制弹窗 */
.copy-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.icon-copy-preview {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background-color: var(--body-color);
  border-radius: var(--border-radius);
}

.icon-display {
  background-color: var(--card-color);
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.icon-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.icon-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.code-tabs {
  margin-top: 8px;
}

.code-preview {
  background-color: var(--body-color);
  border-radius: var(--border-radius);
  max-height: 150px;
  overflow: auto;
}

.copied-modal :deep(.n-card-header) {
  padding-bottom: 0;
}

.copied-modal :deep(.n-code) {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .url-input {
    min-width: 200px;
  }

  .icons-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .icon-item {
    height: 90px;
  }

  .icon-copy-preview {
    flex-direction: column;
    text-align: center;
  }

  .icon-info {
    align-items: center;
  }
}
</style>