<template>
  <base-tool-detail
      title="SQL格式化工具"
      description="美化和格式化SQL查询语句，支持多种SQL方言"
      iconType="icon-sql"
      iconColor="var(--primary-color)"
  >
    <div class="sql-formatter-container">
      <!-- 主工具栏 -->
      <div class="main-toolbar">
        <!-- 方言和缩进选择 -->
        <div class="toolbar-group">
          <n-select
              v-model:value="sqlDialect"
              :options="dialectOptions"
              size="small"
              placeholder="选择SQL方言"
              class="dialect-select"
          />

          <n-select
              v-model:value="indentStyle"
              :options="indentOptions"
              size="small"
              placeholder="缩进样式"
              class="indent-select"
          />
        </div>

        <!-- 主要操作按钮 -->
        <div class="toolbar-group primary-actions">
          <n-button-group>
            <n-button @click="formatSql" type="primary" class="action-button">
              <template #icon>
                <icon-font type="icon-format" :size="16" />
              </template>
              格式化
            </n-button>
            <n-button @click="minifySql" secondary class="action-button">
              <template #icon>
                <icon-font type="icon-minify" :size="16" />
              </template>
              压缩
            </n-button>
          </n-button-group>

          <n-button-group>
            <n-button @click="copySql" class="action-button">
              <template #icon>
                <icon-font type="icon-copy" :size="16" />
              </template>
              复制
            </n-button>
            <n-button @click="downloadSql" class="action-button">
              <template #icon>
                <icon-font type="icon-download" :size="16" />
              </template>
              下载
            </n-button>
            <n-button @click="clearSql" class="action-button">
              <template #icon>
                <icon-font type="icon-clear" :size="16" />
              </template>
              清空
            </n-button>
          </n-button-group>
        </div>

        <!-- 辅助功能按钮 -->
        <div class="toolbar-group secondary-actions">
          <div class="feature-switches">
            <n-switch v-model:value="showLineNumbers" class="feature-switch">
              <template #checked>行号</template>
              <template #unchecked>行号</template>
            </n-switch>

            <n-switch v-model:value="darkMode" class="feature-switch">
              <template #checked>暗色</template>
              <template #unchecked>亮色</template>
            </n-switch>
          </div>

          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button class="sample-button" secondary circle>
                <icon-font type="icon-sample" :size="16" />
              </n-button>
            </template>
            <div class="sample-popover">
              <h3 class="sample-title">SQL示例</h3>
              <n-space vertical>
                <n-button size="small" @click="loadSample('select')" class="sample-option">
                  <template #icon>
                    <icon-font type="icon-select-query" :size="14" />
                  </template>
                  SELECT查询示例
                </n-button>
                <n-button size="small" @click="loadSample('insert')" class="sample-option">
                  <template #icon>
                    <icon-font type="icon-insert" :size="14" />
                  </template>
                  INSERT示例
                </n-button>
                <n-button size="small" @click="loadSample('complex')" class="sample-option">
                  <template #icon>
                    <icon-font type="icon-complex-query" :size="14" />
                  </template>
                  复杂查询示例
                </n-button>
              </n-space>
            </div>
          </n-tooltip>
        </div>
      </div>

      <!-- 快捷键提示条 -->
      <div class="shortcuts-bar">
        <div class="shortcut-pills">
          <div class="shortcut-pill"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> <span>格式化</span></div>
          <div class="shortcut-pill"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> <span>压缩</span></div>
          <div class="shortcut-pill"><kbd>Ctrl</kbd> + <kbd>C</kbd> <span>复制</span></div>
          <div class="shortcut-pill"><kbd>Ctrl</kbd> + <kbd>S</kbd> <span>下载</span></div>
        </div>
      </div>

      <!-- 主编辑区域 -->
      <div class="editor-area">
        <!-- 输入面板 -->
        <div class="editor-panel input-panel">
          <div class="editor-header">
            <div class="header-content">
              <div class="header-title">
                <span class="panel-title">SQL输入</span>
                <div class="status-indicators">
                  <n-tag v-if="isValidSql" type="success" size="small" class="status-tag">有效</n-tag>
                  <n-tag v-else-if="sqlInput.trim()" type="error" size="small" class="status-tag">无效</n-tag>
                  <n-tag v-if="sqlInput.trim()" size="small" class="line-count-tag">
                    {{ inputLineCount }} 行
                  </n-tag>
                </div>
              </div>
              <div class="header-actions">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="small" @click="toggleHistoryPanel">
                      <icon-font type="icon-history" :size="14" />
                    </n-button>
                  </template>
                  历史记录
                </n-tooltip>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="small" @click="expandInput">
                      <icon-font type="icon-expand" :size="14" />
                    </n-button>
                  </template>
                  全屏编辑
                </n-tooltip>
              </div>
            </div>
          </div>
          <div class="editor-content">
            <textarea
                ref="sqlInputArea"
                v-model="sqlInput"
                class="sql-editor"
                :class="{
                'with-line-numbers': showLineNumbers,
                'dark-theme': darkMode,
                'has-error': !isValidSql && sqlInput.trim()
              }"
                placeholder="在此输入SQL查询语句..."
                @input="validateSql"
                @keydown.tab.prevent="insertTab"
            ></textarea>
            <div v-if="showLineNumbers" class="line-numbers">
              <div
                  v-for="i in inputLineCount"
                  :key="`input-${i}`"
                  class="line-number"
                  :class="{ 'error-line': errorLine === i }"
              >
                {{ i }}
              </div>
            </div>
          </div>
        </div>

        <!-- 控制区 -->
        <div class="panel-controls">
          <n-button circle secondary @click="swapPanels" class="swap-button">
            <icon-font type="icon-swap" :size="16" />
          </n-button>
        </div>

        <!-- 输出面板 -->
        <div class="editor-panel output-panel">
          <div class="editor-header">
            <div class="header-content">
              <div class="header-title">
                <span class="panel-title">格式化结果</span>
                <div class="status-indicators">
                  <n-tag v-if="formattedSql.trim()" type="info" size="small" class="status-tag">已格式化</n-tag>
                  <n-tag v-if="formattedSql.trim()" size="small" class="line-count-tag">
                    {{ outputLineCount }} 行
                  </n-tag>
                </div>
              </div>
              <div class="header-actions">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="small" @click="copySql">
                      <icon-font type="icon-copy" :size="14" />
                    </n-button>
                  </template>
                  复制结果
                </n-tooltip>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle size="small" @click="shareSql">
                      <icon-font type="icon-share" :size="14" />
                    </n-button>
                  </template>
                  分享
                </n-tooltip>
              </div>
            </div>
          </div>
          <div class="editor-content">
            <div
                class="sql-output"
                :class="{
                'with-line-numbers': showLineNumbers,
                'dark-theme': darkMode
              }"
                v-html="highlightedSql || '<span class=\'placeholder-text\'>格式化结果将显示在这里...</span>'"
            ></div>
            <div v-if="showLineNumbers" class="line-numbers">
              <div
                  v-for="i in outputLineCount"
                  :key="`output-${i}`"
                  class="line-number"
              >
                {{ i }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="sqlError" class="error-message-container">
        <n-alert type="error" :title="sqlError.title" class="error-alert">
          <template #icon>
            <icon-font type="icon-error" :size="18" />
          </template>
          <div class="error-text">
            <p>{{ sqlError.message }}</p>
            <p v-if="errorLine" class="error-location">
              错误位置: 第 <strong>{{ errorLine }}</strong> 行
            </p>
          </div>
        </n-alert>
      </div>

      <!-- 底部设置区 -->
      <div class="settings-area">
        <div class="settings-tabs">
          <n-tabs type="line" size="small" animated class="compact-tabs">
            <n-tab-pane name="highlight" tab="语法高亮">
              <div class="settings-grid">
                <n-space wrap :size="[24, 16]">
                  <div class="setting-item">
                    <n-checkbox v-model:checked="highlightSettings.keywords">
                      <span class="sample-keyword">SELECT</span>
                      <span class="setting-label">关键字高亮</span>
                    </n-checkbox>
                  </div>

                  <div class="setting-item">
                    <n-checkbox v-model:checked="highlightSettings.functions">
                      <span class="sample-function">COUNT()</span>
                      <span class="setting-label">函数高亮</span>
                    </n-checkbox>
                  </div>

                  <div class="setting-item">
                    <n-checkbox v-model:checked="highlightSettings.numbers">
                      <span class="sample-number">123.45</span>
                      <span class="setting-label">数字高亮</span>
                    </n-checkbox>
                  </div>

                  <div class="setting-item">
                    <n-checkbox v-model:checked="highlightSettings.comments">
                      <span class="sample-comment">-- 注释</span>
                      <span class="setting-label">注释高亮</span>
                    </n-checkbox>
                  </div>
                </n-space>
              </div>
            </n-tab-pane>

            <n-tab-pane name="format" tab="格式化设置">
              <div class="settings-grid">
                <n-grid :cols="3" :x-gap="24" :y-gap="16">
                  <n-grid-item>
                    <div class="format-option">
                      <div class="option-label">大小写转换:</div>
                      <n-radio-group v-model:value="formatSettings.case" size="small" class="case-radio-group">
                        <n-radio value="unchanged">保持不变</n-radio>
                        <n-radio value="upper">转大写</n-radio>
                        <n-radio value="lower">转小写</n-radio>
                      </n-radio-group>
                    </div>
                  </n-grid-item>

                  <n-grid-item>
                    <div class="format-option">
                      <div class="option-label">缩进大小:</div>
                      <n-input-number
                          v-model:value="formatSettings.indentSize"
                          :min="1"
                          :max="8"
                          size="small"
                          class="indent-control"
                      />
                    </div>
                  </n-grid-item>

                  <n-grid-item>
                    <div class="format-option">
                      <n-checkbox v-model:checked="formatSettings.alignKeywords">
                        <span class="setting-label">对齐关键字</span>
                        <n-tooltip placement="top">
                          <template #trigger>
                            <icon-font type="icon-info" :size="12" />
                          </template>
                          垂直对齐SELECT、FROM等关键字
                        </n-tooltip>
                      </n-checkbox>
                    </div>
                  </n-grid-item>

                  <n-grid-item>
                    <div class="format-option">
                      <n-checkbox v-model:checked="formatSettings.removeComments">
                        <span class="setting-label">删除注释</span>
                        <n-tooltip placement="top">
                          <template #trigger>
                            <icon-font type="icon-info" :size="12" />
                          </template>
                          从结果中移除所有注释
                        </n-tooltip>
                      </n-checkbox>
                    </div>
                  </n-grid-item>
                </n-grid>
              </div>
            </n-tab-pane>

            <n-tab-pane name="validate" tab="验证设置">
              <div class="settings-grid">
                <n-space :size="24" wrap>
                  <div class="validation-option">
                    <n-checkbox v-model:checked="validationSettings.checkSyntax">
                      <span class="setting-label">检查语法错误</span>
                      <n-tooltip placement="top">
                        <template #trigger>
                          <icon-font type="icon-info" :size="12" />
                        </template>
                        输入时验证SQL语法
                      </n-tooltip>
                    </n-checkbox>
                  </div>

                  <div class="validation-option">
                    <n-checkbox v-model:checked="validationSettings.checkSemicolons">
                      <span class="setting-label">检查分号结尾</span>
                      <n-tooltip placement="top">
                        <template #trigger>
                          <icon-font type="icon-info" :size="12" />
                        </template>
                        确保语句以分号结尾
                      </n-tooltip>
                    </n-checkbox>
                  </div>

                  <div class="validation-option">
                    <n-checkbox v-model:checked="validationSettings.checkTableExistence">
                      <span class="setting-label">检查表存在性</span>
                      <n-tooltip placement="top">
                        <template #trigger>
                          <icon-font type="icon-info" :size="12" />
                        </template>
                        警告可能不存在的表
                      </n-tooltip>
                    </n-checkbox>
                  </div>
                </n-space>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>

      <!-- 历史记录侧边栏 -->
      <n-drawer v-model:show="showHistoryPanel" :width="360" placement="left">
        <n-drawer-content title="SQL历史记录" closable>
          <div class="history-panel">
            <div v-if="sqlHistory.length === 0" class="empty-history">
              <icon-font type="icon-history-empty" :size="48" color="var(--text-color-disabled)" />
              <p>暂无历史记录</p>
            </div>
            <div v-else class="history-list">
              <div v-for="(item, index) in sqlHistory" :key="index" class="history-item">
                <div class="history-item-header">
                  <span class="history-timestamp">{{ item.timestamp }}</span>
                  <n-space>
                    <n-button quaternary circle size="small" @click="loadFromHistory(item)">
                      <icon-font type="icon-load" :size="14" />
                    </n-button>
                    <n-button quaternary circle size="small" @click="removeFromHistory(index)">
                      <icon-font type="icon-delete" :size="14" />
                    </n-button>
                  </n-space>
                </div>
                <div class="history-item-content">
                  <pre>{{ item.sql.substring(0, 150) + (item.sql.length > 150 ? '...' : '') }}</pre>
                </div>
              </div>
            </div>
            <div class="history-actions">
              <n-button block @click="clearHistory" :disabled="sqlHistory.length === 0">
                清空历史记录
              </n-button>
            </div>
          </div>
        </n-drawer-content>
      </n-drawer>

      <!-- 全屏编辑模态框 -->
      <n-modal v-model:show="showFullscreenEditor" preset="card" style="width: 90vw; max-width: 1400px">
        <template #header>
          <div class="fullscreen-header">
            <h3>全屏编辑 SQL</h3>
            <n-space>
              <n-button @click="formatSqlInFullscreen" type="primary">格式化</n-button>
              <n-button @click="applyFullscreenChanges" type="primary">应用更改</n-button>
            </n-space>
          </div>
        </template>
        <div class="fullscreen-editor">
          <textarea
              v-model="fullscreenSql"
              class="fullscreen-textarea"
              :class="{ 'dark-theme': darkMode }"
          ></textarea>
        </div>
      </n-modal>
    </div>

    <template #help-content>
      <div class="help-content">
        <h4>SQL格式化工具使用指南</h4>
        <p>本工具帮助您格式化和美化SQL查询语句，使其更具可读性。支持多种SQL方言和格式化选项。</p>

        <h5>基本使用</h5>
        <ol>
          <li>在左侧输入区域输入SQL查询语句</li>
          <li>选择适当的SQL方言（如MySQL、PostgreSQL等）</li>
          <li>点击"格式化"按钮生成格式化结果</li>
          <li>使用"复制"或"下载"按钮保存结果</li>
        </ol>

        <h5>格式化选项</h5>
        <ul>
          <li><strong>方言选择</strong>：不同的SQL方言有不同的语法规则和关键字，选择正确的方言可以获得更准确的格式化结果</li>
          <li><strong>缩进样式</strong>：可以选择使用空格或制表符进行缩进</li>
          <li><strong>大小写转换</strong>：可以将SQL关键字转换为大写或小写</li>
          <li><strong>对齐关键字</strong>：启用此选项可以使SELECT、FROM、WHERE等关键字垂直对齐</li>
        </ul>

        <h5>快捷键</h5>
        <ul>
          <li><strong>Ctrl+Enter</strong>：格式化SQL</li>
          <li><strong>Ctrl+Shift+M</strong>：压缩SQL</li>
          <li><strong>Ctrl+C</strong>：复制格式化结果</li>
          <li><strong>Ctrl+S</strong>：下载SQL文件</li>
          <li><strong>Tab</strong>：在输入区域插入缩进</li>
        </ul>

        <h5>特殊功能</h5>
        <ul>
          <li><strong>SQL验证</strong>：工具会检查SQL语法并提示可能的错误</li>
          <li><strong>批量格式化</strong>：可以同时格式化多个SQL语句（以分号分隔）</li>
          <li><strong>语法高亮</strong>：可自定义关键字、函数、字符串等元素的高亮显示</li>
          <li><strong>历史记录</strong>：保存您最近格式化的SQL查询，方便重用</li>
          <li><strong>全屏编辑</strong>：提供更大的编辑空间处理复杂查询</li>
        </ul>

        <h5>支持的SQL方言</h5>
        <ul>
          <li>MySQL</li>
          <li>PostgreSQL</li>
          <li>SQL Server (T-SQL)</li>
          <li>Oracle</li>
          <li>SQLite</li>
          <li>标准SQL</li>
        </ul>
      </div>
    </template>
  </base-tool-detail>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';
import BaseToolDetail from '@/components/tools/BaseToolDetail.vue';

const message = useMessage();
const sqlInputArea = ref(null);

// 状态变量
const sqlInput = ref('');
const formattedSql = ref('');
const highlightedSql = ref('');
const sqlDialect = ref('mysql');
const indentStyle = ref('spaces');
const showLineNumbers = ref(true);
const darkMode = ref(false);
const isValidSql = ref(true);
const sqlError = ref(null);
const errorLine = ref(null);

// 新增状态变量
const showHistoryPanel = ref(false);
const showFullscreenEditor = ref(false);
const fullscreenSql = ref('');
const sqlHistory = ref([]);

// 方言选项
const dialectOptions = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'SQL Server', value: 'tsql' },
  { label: 'Oracle', value: 'oracle' },
  { label: 'SQLite', value: 'sqlite' },
  { label: '标准SQL', value: 'sql' }
];

// 缩进选项
const indentOptions = [
  { label: '空格', value: 'spaces' },
  { label: '制表符', value: 'tabs' }
];

// 格式化设置
const formatSettings = ref({
  case: 'upper',
  indentSize: 2,
  alignKeywords: true,
  removeComments: false
});

// 高亮设置
const highlightSettings = ref({
  keywords: true,
  functions: true,
  strings: true,
  numbers: true,
  comments: true
});

// 验证设置
const validationSettings = ref({
  checkSyntax: true,
  checkSemicolons: true,
  checkTableExistence: false
});

// 计算属性：行数
const inputLineCount = computed(() => {
  return (sqlInput.value.match(/\n/g) || []).length + 1;
});

const outputLineCount = computed(() => {
  return formattedSql.value ? (formattedSql.value.match(/\n/g) || []).length + 1 : 1;
});

// SQL关键字列表（用于简单验证和高亮）
const sqlKeywords = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
  'TABLE', 'VIEW', 'INDEX', 'INTO', 'VALUES', 'SET', 'JOIN', 'LEFT', 'RIGHT', 'INNER',
  'OUTER', 'FULL', 'ON', 'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
  'ALL', 'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE',
  'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ADD', 'COLUMN', 'COMMENT',
  'ENGINE', 'DEFAULT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'VARCHAR', 'BIGINT',
  'INT', 'TINYINT', 'TEXT', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'NUMERIC', 'DECIMAL',
  'FLOAT', 'DOUBLE', 'CHAR', 'CONSTRAINT', 'CHECK', 'UNIQUE', 'IF', 'EXISTS', 'ALTER',
  'ADD', 'MODIFY', 'RENAME', 'TO', 'CASCADE', 'RESTRICT', 'TRUNCATE', 'PROCEDURE',
  'FUNCTION', 'TRIGGER', 'TEMPORARY', 'WITH', 'WITHOUT', 'AUTO_INCREMENT', 'CHARACTER',
  'COLLATE', 'FOR', 'EACH', 'ROW', 'CURSOR', 'WHILE', 'LOOP', 'DECLARE', 'CONTINUE',
  'UNSIGNED', 'ZEROFILL', 'AFTER', 'BEFORE', 'BINARY', 'PARTITION'
];

// SQL函数列表（用于高亮）
const sqlFunctions = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER',
  'DATE', 'TIME', 'NOW', 'CURRENT_TIMESTAMP', 'COALESCE', 'IFNULL', 'NVL', 'CAST',
  'CONVERT', 'ROUND', 'FLOOR', 'CEILING', 'ABS', 'RAND', 'LENGTH', 'CHAR_LENGTH',
  'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'DATE_FORMAT', 'IF', 'CASE',
  'REGEXP', 'REPLACE', 'FORMAT', 'TRUNCATE', 'STRCMP', 'EXTRACT', 'DATEDIFF', 'TIMEDIFF',
  'LAST_INSERT_ID', 'ISNULL', 'GREATEST', 'LEAST'
];

// 监听高亮设置变化，重新应用高亮
watch([highlightSettings, formattedSql], () => {
  applyHighlighting();
}, { deep: true });

// 新增功能方法
const toggleHistoryPanel = () => {
  showHistoryPanel.value = !showHistoryPanel.value;
};

const expandInput = () => {
  fullscreenSql.value = sqlInput.value;
  showFullscreenEditor.value = true;
};

const formatSqlInFullscreen = () => {
  try {
    // 分析和格式化SQL
    let formatted = parseSql(fullscreenSql.value);

    // 应用设置
    if (formatSettings.value.case === 'upper') {
      formatted = applyUppercase(formatted);
    } else if (formatSettings.value.case === 'lower') {
      formatted = applyLowercase(formatted);
    }

    if (formatSettings.value.alignKeywords) {
      formatted = alignKeywords(formatted);
    }

    if (formatSettings.value.removeComments) {
      formatted = removeComments(formatted);
    }

    fullscreenSql.value = formatted;
    message.success('SQL格式化成功');
  } catch (error) {
    message.error('SQL格式化失败: ' + error.message);
  }
};

const applyFullscreenChanges = () => {
  sqlInput.value = fullscreenSql.value;
  showFullscreenEditor.value = false;
  validateSql();
};

const loadFromHistory = (item) => {
  sqlInput.value = item.sql;
  validateSql();
  showHistoryPanel.value = false;
  message.success('已从历史记录加载SQL');
};

const removeFromHistory = (index) => {
  sqlHistory.value.splice(index, 1);
  message.success('已从历史记录中移除');
};

const clearHistory = () => {
  sqlHistory.value = [];
  message.success('已清空历史记录');
};

const swapPanels = () => {
  if (formattedSql.value) {
    sqlInput.value = formattedSql.value;
    validateSql();
    message.info('已将格式化结果设为当前输入');
  }
};

const shareSql = () => {
  if (!formattedSql.value.trim()) {
    message.warning('没有可分享的SQL');
    return;
  }

  // 简单实现分享功能
  navigator.clipboard.writeText(formattedSql.value)
      .then(() => {
        message.success('SQL已复制到剪贴板，可以粘贴分享');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 格式化SQL方法
const formatSql = () => {
  if (!sqlInput.value.trim()) {
    message.warning('请输入SQL语句');
    return;
  }

  try {
    // 分析和格式化SQL
    let formatted = parseSql(sqlInput.value);

    // 应用大小写转换
    if (formatSettings.value.case === 'upper') {
      formatted = applyUppercase(formatted);
    } else if (formatSettings.value.case === 'lower') {
      formatted = applyLowercase(formatted);
    }

    // 应用关键字对齐（如果启用）
    if (formatSettings.value.alignKeywords) {
      formatted = alignKeywords(formatted);
    }

    // 删除注释（如果启用）
    if (formatSettings.value.removeComments) {
      formatted = removeComments(formatted);
    }

    // 更新格式化结果
    formattedSql.value = formatted;

    // 应用语法高亮
    applyHighlighting();

    isValidSql.value = true;
    sqlError.value = null;

    // 添加到历史记录
    addToHistory(sqlInput.value);

    message.success('SQL格式化成功');
  } catch (error) {
    handleFormatError(error);
  }
};

// 应用语法高亮到格式化结果
const applyHighlighting = () => {
  if (!formattedSql.value) {
    highlightedSql.value = '';
    return;
  }

  let html = formattedSql.value;

  // 转义HTML特殊字符
  html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // 将换行符转换为<br>标签以保持格式
  html = html.split('\n').map(line => {
    let highlightedLine = line;

    // 只有在启用相应高亮设置时才应用高亮
    if (highlightSettings.value.keywords) {
      // 高亮关键字 (注意使用单词边界\b防止部分匹配)
      sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        highlightedLine = highlightedLine.replace(regex, match =>
            `<span class="sql-keyword">${match}</span>`
        );
      });
    }

    if (highlightSettings.value.functions) {
      // 高亮函数 (包括括号)
      sqlFunctions.forEach(func => {
        const regex = new RegExp(`\\b${func}\\s*\\(`, 'gi');
        highlightedLine = highlightedLine.replace(regex, match =>
            `<span class="sql-function">${match.substring(0, match.length - 1)}</span>(`
        );
      });
    }

    if (highlightSettings.value.strings) {
      // 高亮字符串 (单引号和双引号)
      highlightedLine = highlightedLine
          .replace(/('.*?')/g, '<span class="sql-string">$1</span>')
          .replace(/(".*?")/g, '<span class="sql-string">$2</span>');
    }

    if (highlightSettings.value.numbers) {
      // 高亮数字
      highlightedLine = highlightedLine.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="sql-number">$1</span>');
    }

    if (highlightSettings.value.comments) {
      // 高亮注释 (以--开头)
      highlightedLine = highlightedLine.replace(/(--.*$)/g, '<span class="sql-comment">$1</span>');
    }

    return highlightedLine;
  }).join('<br>');

  highlightedSql.value = html;
};

// 添加到历史记录
const addToHistory = (sql) => {
  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  // 检查是否已有完全相同的SQL
  const isDuplicate = sqlHistory.value.some(item => item.sql === sql);

  if (!isDuplicate) {
    sqlHistory.value.unshift({
      sql,
      timestamp
    });

    // 限制历史记录数量
    if (sqlHistory.value.length > 10) {
      sqlHistory.value.pop();
    }
  }
};

// 压缩SQL方法
const minifySql = () => {
  if (!sqlInput.value.trim()) {
    message.warning('请输入SQL语句');
    return;
  }

  try {
    // 移除多余的空白字符和换行符
    let minified = sqlInput.value
        .replace(/\s+/g, ' ')     // 将多个空白字符替换为单个空格
        .replace(/\s*([(),])\s*/g, '$1') // 移除括号和逗号周围的空白
        .replace(/\s*=\s*/g, '=')  // 移除等号周围的空白
        .replace(/\s*>\s*/g, '>')  // 移除大于号周围的空白
        .replace(/\s*<\s*/g, '<')  // 移除小于号周围的空白
        .replace(/\s*<>\s*/g, '<>')  // 移除不等号周围的空白
        .trim();                  // 移除首尾空白

    // 保留关键字之间的一个空格
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      minified = minified.replace(regex, match => {
        return match.toUpperCase();
      });
    });

    // 在关键字之间添加适当的空格
    minified = minified.replace(/(\b)(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN)(\b)/gi, '$1$2 $3');

    formattedSql.value = minified;

    // 应用语法高亮
    applyHighlighting();

    isValidSql.value = true;
    sqlError.value = null;

    // 添加到历史记录
    addToHistory(sqlInput.value);

    message.success('SQL压缩成功');
  } catch (error) {
    handleFormatError(error);
  }
};

// 复制SQL方法
const copySql = () => {
  const textToCopy = formattedSql.value || sqlInput.value;

  if (!textToCopy.trim()) {
    message.warning('没有内容可复制');
    return;
  }

  navigator.clipboard.writeText(textToCopy)
      .then(() => {
        message.success('已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 下载SQL方法
const downloadSql = () => {
  const textToDownload = formattedSql.value || sqlInput.value;

  if (!textToDownload.trim()) {
    message.warning('没有内容可下载');
    return;
  }

  const blob = new Blob([textToDownload], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'formatted_sql.sql';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  message.success('SQL文件已下载');
};

// 清空SQL方法
const clearSql = () => {
  sqlInput.value = '';
  formattedSql.value = '';
  highlightedSql.value = '';
  sqlError.value = null;
  isValidSql.value = true;
  message.info('已清空');
};

// 插入Tab方法
const insertTab = (e) => {
  e.preventDefault();

  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // 插入缩进（空格或制表符）
  const indent = indentStyle.value === 'spaces'
      ? ' '.repeat(formatSettings.value.indentSize)
      : '\t';

  sqlInput.value = sqlInput.value.substring(0, start) + indent + sqlInput.value.substring(end);

  // 设置光标位置
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + indent.length;
  }, 0);
};

// 加载示例SQL方法
const loadSample = (type) => {
  switch (type) {
    case 'select':
      sqlInput.value = `-- 基本SELECT查询示例
SELECT
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  COUNT(o.order_id) AS order_count,
  SUM(o.total_amount) AS total_spent
FROM
  customers c
LEFT JOIN
  orders o ON c.customer_id = o.customer_id
WHERE
  c.status = 'active'
  AND c.created_at >= '2023-01-01'
GROUP BY
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email
HAVING
  COUNT(o.order_id) > 0
ORDER BY
  total_spent DESC
LIMIT 10;`;
      break;
    case 'insert':
      sqlInput.value = `-- INSERT语句示例
INSERT INTO products (
  product_name,
  category_id,
  price,
  description,
  stock_quantity,
  created_at
) VALUES
  ('智能手机X1', 3, 4999.00, '最新款5G智能手机，搭载高通骁龙处理器', 100, NOW()),
  ('超薄笔记本Pro', 2, 6999.00, '轻薄商务本，16GB内存，512GB固态硬盘', 50, NOW()),
  ('无线蓝牙耳机', 4, 899.00, '主动降噪，续航30小时，IPX4防水', 200, NOW()),
  ('4K智能电视', 1, 3499.00, '55英寸4K屏幕，杜比音效，智能语音控制', 30, NOW()),
  ('智能手表S2', 5, 1299.00, '多功能运动监测，心率血氧检测，14天续航', 150, NOW());`;
      break;
    case 'complex':
      sqlInput.value = `-- 复杂查询示例，包含子查询、CTE和窗口函数
WITH monthly_sales AS (
  SELECT
    p.category_id,
    c.category_name,
    DATE_FORMAT(o.order_date, '%Y-%m') AS month,
    SUM(oi.quantity * oi.unit_price) AS total_sales
  FROM
    order_items oi
  JOIN
    orders o ON oi.order_id = o.order_id
  JOIN
    products p ON oi.product_id = p.product_id
  JOIN
    categories c ON p.category_id = c.category_id
  WHERE
    o.order_date BETWEEN '2023-01-01' AND '2023-12-31'
    AND o.status = 'completed'
  GROUP BY
    p.category_id,
    c.category_name,
    DATE_FORMAT(o.order_date, '%Y-%m')
),
category_ranking AS (
  SELECT
    category_id,
    category_name,
    month,
    total_sales,
    RANK() OVER (PARTITION BY month ORDER BY total_sales DESC) AS sales_rank
  FROM
    monthly_sales
)
SELECT
  cr.category_id,
  cr.category_name,
  cr.month,
  cr.total_sales,
  cr.sales_rank,
  ROUND((cr.total_sales / ms.month_total) * 100, 2) AS percentage_of_monthly_sales,
  LAG(cr.total_sales) OVER (PARTITION BY cr.category_id ORDER BY cr.month) AS prev_month_sales,
  CASE
    WHEN LAG(cr.total_sales) OVER (PARTITION BY cr.category_id ORDER BY cr.month) IS NULL THEN NULL
    ELSE ROUND(((cr.total_sales - LAG(cr.total_sales) OVER (PARTITION BY cr.category_id ORDER BY cr.month)) /
         LAG(cr.total_sales) OVER (PARTITION BY cr.category_id ORDER BY cr.month)) * 100, 2)
  END AS growth_percentage
FROM
  category_ranking cr
JOIN (
  SELECT
    month,
    SUM(total_sales) AS month_total
  FROM
    monthly_sales
  GROUP BY
    month
) ms ON cr.month = ms.month
WHERE
  cr.sales_rank <= 5
ORDER BY
  cr.month,
  cr.sales_rank;`;
      break;
  }

  // 验证加载的SQL
  validateSql();

  message.success(`已加载${type === 'select' ? 'SELECT查询' : type === 'insert' ? 'INSERT' : '复杂查询'}示例`);
};

// 验证SQL方法
const validateSql = () => {
  if (!sqlInput.value.trim()) {
    isValidSql.value = true;
    sqlError.value = null;
    errorLine.value = null;
    return;
  }

  if (!validationSettings.value.checkSyntax) {
    isValidSql.value = true;
    sqlError.value = null;
    return;
  }

  // 简单的SQL语法验证
  try {
    // 检查括号是否成对
    const openParenCount = (sqlInput.value.match(/\(/g) || []).length;
    const closeParenCount = (sqlInput.value.match(/\)/g) || []).length;

    if (openParenCount !== closeParenCount) {
      throw new Error('括号不匹配');
    }

    // 检查引号是否成对
    const singleQuoteCount = (sqlInput.value.match(/'/g) || []).length;
    const doubleQuoteCount = (sqlInput.value.match(/"/g) || []).length;

    if (singleQuoteCount % 2 !== 0) {
      throw new Error('单引号不匹配');
    }

    if (doubleQuoteCount % 2 !== 0) {
      throw new Error('双引号不匹配');
    }

    // 检查语句结尾是否有分号（如果启用）
    if (validationSettings.value.checkSemicolons) {
      const statements = sqlInput.value.split(';').filter(s => s.trim());
      const lastStatement = statements[statements.length - 1];

      if (lastStatement && lastStatement.trim() && !sqlInput.value.trim().endsWith(';')) {
        throw new Error('语句结尾缺少分号');
      }
    }

    // 更多复杂验证规则可以在这里添加...

    isValidSql.value = true;
    sqlError.value = null;
    errorLine.value = null;
  } catch (error) {
    isValidSql.value = false;
    sqlError.value = {
      title: 'SQL语法错误',
      message: error.message
    };

    // 尝试确定错误行号（简化版）
    if (error.message.includes('括号不匹配')) {
      const lines = sqlInput.value.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const openCount = (lines[i].match(/\(/g) || []).length;
        const closeCount = (lines[i].match(/\)/g) || []).length;
        if (openCount !== closeCount) {
          errorLine.value = i + 1;
          break;
        }
      }
    } else if (error.message.includes('引号不匹配')) {
      const lines = sqlInput.value.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const singleQuoteCount = (lines[i].match(/'/g) || []).length;
        const doubleQuoteCount = (lines[i].match(/"/g) || []).length;
        if (singleQuoteCount % 2 !== 0 || doubleQuoteCount % 2 !== 0) {
          errorLine.value = i + 1;
          break;
        }
      }
    }
  }
};

// 处理格式化错误
const handleFormatError = (error) => {
  isValidSql.value = false;
  sqlError.value = {
    title: '格式化错误',
    message: error.message
  };
  formattedSql.value = '';
  highlightedSql.value = '';

  message.error('SQL格式化失败');
};

// SQL解析和格式化（简化版）
const parseSql = (sql) => {
  // 移除前后空白
  sql = sql.trim();

  // 如果SQL为空，直接返回
  if (!sql) return '';

  // 分割为语句（以分号结尾）
  const statements = sql.split(';').filter(stmt => stmt.trim());

  // 格式化每个语句
  const formattedStatements = statements.map(stmt => {
    return formatStatement(stmt.trim());
  });

  // 组合格式化后的语句
  return formattedStatements.join(';\n\n') + (statements.length > 0 ? ';' : '');
};

// 格式化单个SQL语句
const formatStatement = (stmt) => {
  // 处理注释
  const commentPattern = /--.*$/gm;
  const comments = [];
  let commentCounter = 0;

  // 保存注释并替换为占位符
  const stmtWithoutComments = stmt.replace(commentPattern, match => {
    const placeholder = `--COMMENT${commentCounter}--`;
    comments.push({ placeholder, text: match });
    commentCounter++;
    return placeholder;
  });

  // 分离字符串文字，避免在字符串内部进行格式化
  const stringPattern = /'([^']*(?:''[^']*)*)'|"([^"]*(?:""[^"]*)*)"|\[(.*?)\]/g;
  const strings = [];
  let stringCounter = 0;

  const stmtWithoutStrings = stmtWithoutComments.replace(stringPattern, match => {
    const placeholder = `--STRING${stringCounter}--`;
    strings.push({ placeholder, text: match });
    stringCounter++;
    return placeholder;
  });

  // 对主要关键字进行简单识别和格式化
  const indent = indentStyle.value === 'spaces'
      ? ' '.repeat(formatSettings.value.indentSize)
      : '\t';

  let formattedStmt = stmtWithoutStrings;

  // 根据SQL方言应用适当的格式化规则
  switch (sqlDialect.value) {
    case 'mysql':
    case 'postgresql':
    case 'sql':
      formattedStmt = formatStandardSql(formattedStmt, indent);
      break;
    case 'tsql':
      formattedStmt = formatTSql(formattedStmt, indent);
      break;
    case 'oracle':
      formattedStmt = formatOracleSql(formattedStmt, indent);
      break;
    case 'sqlite':
      formattedStmt = formatSqliteSql(formattedStmt, indent);
      break;
  }

  // 恢复字符串文字
  strings.forEach(({ placeholder, text }) => {
    formattedStmt = formattedStmt.replace(placeholder, text);
  });

  // 恢复注释
  comments.forEach(({ placeholder, text }) => {
    formattedStmt = formattedStmt.replace(placeholder, text);
  });

  return formattedStmt;
};

// 格式化标准SQL（MySQL, PostgreSQL, 标准SQL）
const formatStandardSql = (stmt, indent) => {
  // 识别并格式化主要关键字
  stmt = stmt
      // SELECT 子句
      .replace(/\b(SELECT)\b/gi, '\n$1')
      // DISTINCT 关键字
      .replace(/\b(SELECT)\s+\b(DISTINCT)\b/gi, '$1 $2')
      // FROM 子句
      .replace(/\b(FROM)\b/gi, '\n$1')
      // JOIN 子句
      .replace(/\b(JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|NATURAL\s+JOIN)\b/gi, `\n${indent}$1`)
      // WHERE 子句
      .replace(/\b(WHERE)\b/gi, '\n$1')
      // GROUP BY 子句
      .replace(/\b(GROUP\s+BY)\b/gi, '\n$1')
      // HAVING 子句
      .replace(/\b(HAVING)\b/gi, '\n$1')
      // ORDER BY 子句
      .replace(/\b(ORDER\s+BY)\b/gi, '\n$1')
      // LIMIT 和 OFFSET 子句
      .replace(/\b(LIMIT|OFFSET)\b/gi, '\n$1')
      // UNION 操作
      .replace(/\b(UNION|UNION\s+ALL|INTERSECT|EXCEPT)\b/gi, '\n\n$1\n\n')
      // INSERT 语句
      .replace(/\b(INSERT\s+INTO)\b/gi, '\n$1')
      // VALUES 子句
      .replace(/\b(VALUES)\b/gi, '\n$1')
      // UPDATE 语句
      .replace(/\b(UPDATE)\b/gi, '\n$1')
      // SET 子句
      .replace(/\b(SET)\b/gi, '\n$1')
      // DELETE 语句
      .replace(/\b(DELETE\s+FROM)\b/gi, '\n$1')
      // CREATE 语句
      .replace(/\b(CREATE\s+TABLE|CREATE\s+VIEW|CREATE\s+INDEX|CREATE\s+PROCEDURE|CREATE\s+FUNCTION|CREATE\s+TRIGGER)\b/gi, '\n$1')
      // ALTER 语句
      .replace(/\b(ALTER\s+TABLE|ALTER\s+VIEW|ALTER\s+INDEX)\b/gi, '\n$1')
      // 格式化列表和条件
      .replace(/,/g, ',\n' + indent)
      .replace(/\b(AND|OR)\b/gi, '\n' + indent + '$1');

  // 缩进所有行（除了以关键字开始的行）
  const lines = stmt.split('\n').filter(line => line.trim());
  const formattedLines = lines.map((line, index) => {
    const trimmedLine = line.trimStart();

    // 主要子句不缩进
    if (/^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE|ALTER|UNION|UNION ALL|INTERSECT|EXCEPT)/i.test(trimmedLine)) {
      return trimmedLine;
    }

    // ON 条件减少缩进
    if (/^(ON)\b/i.test(trimmedLine)) {
      return indent + trimmedLine;
    }

    // 其他行增加缩进
    return indent + indent + trimmedLine;
  });

  return formattedLines.join('\n');
};

// 格式化T-SQL（SQL Server）
const formatTSql = (stmt, indent) => {
  // 在这里添加T-SQL特定的格式化规则
  // 目前使用标准SQL格式化作为基础
  let formatted = formatStandardSql(stmt, indent);

  // 添加T-SQL特有关键字的格式化
  formatted = formatted
      .replace(/\b(TOP)\b/gi, ' $1 ')
      .replace(/\b(OUTPUT)\b/gi, '\n$1')
      .replace(/\b(MERGE)\b/gi, '\n$1')
      .replace(/\b(WHEN\s+MATCHED|WHEN\s+NOT\s+MATCHED)\b/gi, '\n' + indent + '$1')
      .replace(/\b(THEN)\b/gi, '\n' + indent + indent + '$1')
      .replace(/\b(OVER)\b\s*\(/gi, ' $1 (');

  return formatted;
};

// 格式化Oracle SQL
const formatOracleSql = (stmt, indent) => {
  // 在这里添加Oracle特定的格式化规则
  // 目前使用标准SQL格式化作为基础
  let formatted = formatStandardSql(stmt, indent);

  // 添加Oracle特有关键字的格式化
  formatted = formatted
      .replace(/\b(START\s+WITH|CONNECT\s+BY)\b/gi, '\n$1')
      .replace(/\b(MODEL)\b/gi, '\n$1')
      .replace(/\b(PIVOT|UNPIVOT)\b/gi, '\n' + indent + '$1')
      .replace(/\b(RETURNING)\b/gi, '\n$1');

  return formatted;
};

// 格式化SQLite SQL
const formatSqliteSql = (stmt, indent) => {
  // 在这里添加SQLite特定的格式化规则
  // 目前使用标准SQL格式化作为基础
  let formatted = formatStandardSql(stmt, indent);

  // SQLite相对简单，不需要太多特殊处理
  return formatted;
};

// 应用大小写转换
const applyUppercase = (sql) => {
  // 将所有SQL关键字转换为大写
  let result = sql;

  // 对所有关键字应用大写转换
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, keyword.toUpperCase());
  });

  // 对所有函数应用大写转换
  sqlFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'gi');
    result = result.replace(regex, func.toUpperCase());
  });

  return result;
};

// 应用小写转换
const applyLowercase = (sql) => {
  // 将所有SQL关键字转换为小写
  let result = sql;

  // 对所有关键字应用小写转换
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, keyword.toLowerCase());
  });

  // 对所有函数应用小写转换
  sqlFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'gi');
    result = result.replace(regex, func.toLowerCase());
  });

  return result;
};

// 对齐关键字
const alignKeywords = (sql) => {
  // 在这个简化版中，我们只做基本的对齐处理
  const lines = sql.split('\n');
  const keywordsToAlign = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING'];
  const maxLength = keywordsToAlign.reduce((max, keyword) => Math.max(max, keyword.length), 0);

  // 简单对齐（实际应用中可能需要更复杂的算法）
  const alignedLines = lines.map(line => {
    const trimmedLine = line.trimStart();
    for (const keyword of keywordsToAlign) {
      if (new RegExp(`^${keyword}\\b`, 'i').test(trimmedLine)) {
        const padding = ' '.repeat(maxLength - keyword.length);
        return trimmedLine.replace(new RegExp(`^${keyword}\\b`, 'i'), match => match + padding);
      }
    }
    return line;
  });

  return alignedLines.join('\n');
};

// 删除注释
const removeComments = (sql) => {
  // 移除单行注释
  let result = sql.replace(/--.*$/gm, '');

  // 移除多行注释
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // 移除空行
  result = result.split('\n')
      .filter(line => line.trim())
      .join('\n');

  return result;
};

// 键盘快捷键处理
const handleKeyDown = (e) => {
  if (e.ctrlKey) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        formatSql();
        break;
      case 'M':
        if (e.shiftKey) {
          e.preventDefault();
          minifySql();
        }
        break;
      case 'c':
        // 不阻止默认的复制行为
        break;
      case 's':
        e.preventDefault();
        downloadSql();
        break;
    }
  }
};

// 组件挂载
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

// 组件卸载
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.sql-formatter-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  min-height: 600px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 主工具栏样式 */
.main-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(to right, var(--body-color), var(--card-color));
  border-bottom: 1px solid var(--divider-color);
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.primary-actions {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.dialect-select {
  width: 140px;
  transition: all 0.2s ease;
}

.dialect-select:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.indent-select {
  width: 100px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 32px;
  transition: transform 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
}

.secondary-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-switches {
  display: flex;
  gap: 12px;
  padding: 0 4px;
  border-radius: 4px;
}

.sample-button {
  color: var(--primary-color);
  width: 32px;
  height: 32px;
  transition: transform 0.2s ease;
}

.sample-button:hover {
  transform: rotate(15deg);
}

.sample-popover {
  width: 240px;
  padding: 12px;
}

.sample-title {
  font-size: 15px;
  margin: 0 0 12px 0;
  color: var(--text-color-base);
  position: relative;
  padding-bottom: 8px;
}

.sample-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: var(--primary-color);
}

.sample-option {
  text-align: left;
  width: 100%;
  margin-bottom: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sample-option:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

/* 快捷键提示条样式 */
.shortcuts-bar {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  background-color: var(--body-color);
  border-bottom: 1px solid var(--divider-color);
  font-size: 12px;
}

.shortcut-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.shortcut-pill {
  display: flex;
  align-items: center;
  background-color: rgba(var(--primary-color-rgb), 0.05);
  border-radius: 16px;
  padding: 4px 12px;
  color: var(--text-color-secondary);
}

.shortcut-pill kbd {
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--divider-color);
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 11px;
  padding: 1px 5px;
  margin: 0 2px;
}

.shortcut-pill span {
  margin-left: 6px;
  font-weight: 500;
  white-space: nowrap;
}

/* 主编辑区域样式 */
.editor-area {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: var(--body-color);
}

.editor-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
  border: none;
  transition: all 0.3s ease;
  margin: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: var(--card-color);
}

.input-panel {
  margin-right: 4px;
}

.output-panel {
  margin-left: 4px;
}

.panel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  z-index: 2;
}

.swap-button {
  width: 28px;
  height: 28px;
  transition: transform 0.3s ease;
}

.swap-button:hover {
  transform: rotate(180deg);
}

.editor-header {
  padding: 10px 16px;
  background: linear-gradient(to right, var(--body-color), var(--card-color));
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid var(--divider-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color-base);
}

.status-indicators {
  display: flex;
  gap: 6px;
}

.status-tag, .line-count-tag {
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.editor-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.sql-editor, .sql-output {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  padding: 12px 16px 12px 48px; /* 左侧留空显示行号 */
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  tab-size: 4;
  white-space: pre;
  overflow: auto;
  color: var(--text-color-base);
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.sql-output {
  margin: 0;
  /* 移除 pointer-events: none; 属性，允许滚动 */
}

.placeholder-text {
  color: var(--text-color-tertiary);
  font-style: italic;
}

.sql-editor:focus {
  box-shadow: inset 0 0 0 1px rgba(var(--primary-color-rgb), 0.2);
}

.has-error {
  background-color: rgba(var(--error-color-rgb), 0.05);
}

/* 行号样式 */
.line-numbers {
  position: absolute;
  top: 12px;
  left: 0;
  width: 36px;
  height: calc(100% - 24px);
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  text-align: right;
  padding-right: 8px;
  color: var(--text-color-tertiary);
  user-select: none;
  overflow: hidden;
  pointer-events: none;
  border-right: 1px solid rgba(var(--divider-color-rgb), 0.5);
}

.line-number {
  padding: 0 4px;
}

.error-line {
  background-color: rgba(var(--error-color-rgb), 0.15);
  color: var(--error-color);
  font-weight: bold;
}

/* 错误提示样式 */
.error-message-container {
  padding: 0 16px 16px;
  background-color: var(--body-color);
  animation: slideIn 0.3s ease-in-out;
}

.error-alert {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(var(--error-color-rgb), 0.2);
}

.error-text {
  line-height: 1.5;
}

.error-location {
  margin-top: 8px;
  font-size: 13px;
  color: var(--error-color);
}

/* 设置区域样式 */
.settings-area {
  background-color: var(--body-color);
  border-top: 1px solid var(--divider-color);
  padding: 0 16px 8px;
  margin-top: auto;
}

.settings-tabs {
  position: relative;
  margin-top: -1px;
}

.compact-tabs :deep(.n-tabs-nav) {
  padding: 0 10px;
}

.compact-tabs :deep(.n-tabs-nav-item) {
  padding: 10px 16px 8px;
  font-size: 13px;
}

.compact-tabs :deep(.n-tabs-nav-item.n-tabs-nav-item--active) {
  font-weight: 600;
}

.settings-grid {
  padding: 12px 16px;
  background-color: var(--card-color);
  border-radius: 0 0 8px 8px;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.02);
}

.setting-item, .format-option, .validation-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  margin-left: 6px;
  white-space: nowrap;
}

.case-radio-group {
  display: flex;
  gap: 12px;
}

.indent-control {
  width: 80px;
}

.option-label {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-right: 4px;
  white-space: nowrap;
}

/* 历史记录面板样式 */
.history-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-disabled);
  padding: 40px 0;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-item {
  padding: 12px;
  margin-bottom: 12px;
  background-color: var(--card-color);
  border-radius: 8px;
  border: 1px solid var(--divider-color);
  transition: all 0.2s ease;
}

.history-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-timestamp {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.history-item-content {
  max-height: 120px;
  overflow: hidden;
  position: relative;
  border-radius: 4px;
  background-color: var(--body-color);
  padding: 8px;
}

.history-item-content:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: linear-gradient(to bottom, transparent, var(--body-color));
  pointer-events: none;
}

.history-item-content pre {
  margin: 0;
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--text-color-secondary);
}

.history-actions {
  padding: 16px;
  border-top: 1px solid var(--divider-color);
}

/* 全屏编辑样式 */
.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fullscreen-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--primary-color);
}

.fullscreen-editor {
  height: 70vh;
  position: relative;
}

.fullscreen-textarea {
  width: 100%;
  height: 100%;
  border: 1px solid var(--divider-color);
  border-radius: 8px;
  resize: none;
  padding: 16px;
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
}

/* 语法高亮样式 */
:deep(.sql-keyword) {
  color: #0074D9;
  font-weight: bold;
}

:deep(.sql-function) {
  color: #2ECC40;
}

:deep(.sql-string) {
  color: #FF4136;
}

:deep(.sql-number) {
  color: #B10DC9;
}

:deep(.sql-comment) {
  color: #AAAAAA;
  font-style: italic;
}

/* 示例高亮 */
.sample-keyword {
  display: inline-block;
  color: #0074D9;
  font-weight: bold;
  margin-right: 6px;
  min-width: 40px;
}

.sample-function {
  display: inline-block;
  color: #2ECC40;
  margin-right: 6px;
  min-width: 50px;
}

.sample-string {
  display: inline-block;
  color: #FF4136;
  margin-right: 6px;
  min-width: 70px;
}

.sample-number {
  display: inline-block;
  color: #B10DC9;
  margin-right: 6px;
  min-width: 40px;
}

.sample-comment {
  display: inline-block;
  color: #AAAAAA;
  font-style: italic;
  margin-right: 6px;
  min-width: 60px;
}

/* 黑暗主题样式 */
.dark-theme {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

/* 帮助内容样式 */
.help-content h4 {
  margin-top: 0;
  color: var(--primary-color);
}

.help-content h5 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--text-color-base);
}

.help-content p, .help-content li {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.help-content ul, .help-content ol {
  padding-left: 24px;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-group {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .primary-actions {
    flex-direction: column;
    gap: 8px;
  }

  .secondary-actions {
    justify-content: center;
    margin-top: 8px;
  }

  .editor-area {
    flex-direction: column;
  }

  .editor-panel {
    height: 300px;
    margin: 8px;
  }

  .panel-controls {
    padding: 8px;
    flex-direction: row;
    justify-content: center;
  }

  .shortcut-pills {
    flex-direction: column;
    align-items: center;
  }

  .history-item-content {
    max-height: 80px;
  }

  .settings-grid {
    padding: 8px;
  }
}
</style>