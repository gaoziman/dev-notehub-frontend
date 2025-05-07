<template>
  <base-tool-detail
      title="JSON格式化工具"
      description="多功能JSON数据处理工具，支持格式化、压缩、对比和结构化分析"
      iconType="icon-json"
      iconColor="var(--primary-color)"
  >
    <template #help-content>
      <div class="help-guide">
        <h4>基本功能</h4>
        <ul>
          <li><strong>格式化</strong>：使JSON数据以缩进格式显示，提升可读性</li>
          <li><strong>压缩</strong>：移除所有空格，生成最小体积的JSON</li>
          <li><strong>转换</strong>：将JSON转换为YAML、XML或JavaScript对象</li>
        </ul>
        <h4>高级功能</h4>
        <ul>
          <li><strong>JSONPath查询</strong>：使用JSONPath表达式查询复杂JSON数据</li>
          <li><strong>结构分析</strong>：查看JSON的结构信息和统计数据</li>
          <li><strong>JSON比较</strong>：对比两个JSON数据的差异</li>
        </ul>
        <h4>快捷键</h4>
        <p><kbd>Ctrl</kbd> + <kbd>Enter</kbd>：格式化 | <kbd>Ctrl</kbd> + <kbd>S</kbd>：下载 | <kbd>Ctrl</kbd> + <kbd>C</kbd>：复制</p>
      </div>
    </template>

    <div class="json-formatter-container">
      <!-- 主工具栏 -->
      <div class="main-toolbar">
        <div class="left-actions">
          <n-button-group>
            <n-button type="primary" @click="formatJson" :disabled="!hasInput">
              <template #icon>
                <icon-font type="icon-format" />
              </template>
              格式化
            </n-button>
            <n-button @click="compactJson" :disabled="!hasInput">
              <template #icon>
                <icon-font type="icon-compact" />
              </template>
              压缩
            </n-button>
          </n-button-group>

          <n-select
              v-model:value="indentSize"
              :options="indentOptions"
              size="small"
              style="width: 100px"
              :disabled="!hasInput"
          />

          <n-dropdown trigger="hover" :options="convertOptions" @select="handleConvert">
            <n-button :disabled="!hasInput">转换为</n-button>
          </n-dropdown>

          <n-dropdown trigger="hover" :options="toolOptions" @select="handleToolSelect">
            <n-button :disabled="!hasInput">高级工具</n-button>
          </n-dropdown>
        </div>

        <div class="right-actions">
          <n-button-group>
            <n-button @click="clearJson" :disabled="!hasInput">
              <template #icon>
                <icon-font type="icon-clear" />
              </template>
              清空
            </n-button>
            <n-button @click="copyJson" :disabled="!hasInput">
              <template #icon>
                <icon-font type="icon-copy" />
              </template>
              复制
            </n-button>
            <n-button @click="downloadJson" :disabled="!hasInput">
              <template #icon>
                <icon-font type="icon-download" />
              </template>
              下载
            </n-button>
          </n-button-group>
        </div>
      </div>

      <!-- 编辑区域 - 从垂直布局改为水平布局 -->
      <div class="editor-container">
        <!-- 输入区域 -->
        <div class="input-panel">
          <div class="panel-header">
            <div class="title">
              <span>输入 JSON</span>
              <n-tag v-if="isValidJson && hasInput" type="success" size="small">有效</n-tag>
              <n-tag v-else-if="hasInput" type="error" size="small">无效</n-tag>
            </div>
            <div class="actions">
              <n-button text size="small" @click="loadSample">示例</n-button>
              <n-switch v-model:value="wordWrap" size="small">
                <template #checked>自动换行</template>
                <template #unchecked>自动换行</template>
              </n-switch>
              <n-button text size="small" @click="showHistory = true">历史</n-button>
            </div>
          </div>
          <div class="panel-content">
            <div class="editor-wrapper">
              <textarea
                  ref="jsonInputArea"
                  v-model="jsonInput"
                  class="json-textarea"
                  :class="{ 'word-wrap': wordWrap }"
                  placeholder="在此输入JSON数据..."
                  @input="validateJson"
                  @keydown.ctrl.enter.prevent="formatJson"
              ></textarea>
              <div
                  v-if="hasInput && showLineNumbers"
                  class="line-numbers">
                <div
                    v-for="i in inputStats.lines"
                    :key="i"
                    class="line-number">{{ i }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果区域 -->
        <div class="output-panel">
          <div class="panel-header">
            <div class="title">
              <span>结果</span>
              <n-tag size="small" :type="resultType === 'error' ? 'error' : 'success'">
                {{ resultType === 'error' ? '错误' : resultFormat }}
              </n-tag>
            </div>
            <div class="actions">
              <n-button text size="small" @click="copyResult" :disabled="!showResult">复制</n-button>
              <n-button text size="small" @click="useResultAsInput" :disabled="!showResult">应用</n-button>
              <n-dropdown placement="bottom-end" trigger="hover" :options="viewOptions" @select="handleViewChange">
                <n-button text size="small">视图</n-button>
              </n-dropdown>
            </div>
          </div>
          <div class="panel-content result-container">
            <!-- 普通结果视图 -->
            <div
                v-show="currentView === 'plain'"
                class="json-result-wrapper"
            >
              <pre
                  class="json-result"
                  :class="{ 'word-wrap': wordWrap }"
                  v-html="highlightedResult"
              ></pre>
              <div
                  v-if="showResult && showLineNumbers"
                  class="line-numbers">
                <div
                    v-for="i in resultContent.split('\n').length"
                    :key="i"
                    class="line-number">{{ i }}</div>
              </div>
            </div>

            <!-- 树形结构视图 -->
            <div v-show="currentView === 'tree'" class="tree-view-container">
              <n-tree
                  v-if="showResult && resultType !== 'error' && jsonTree.length"
                  :data="jsonTree"
                  selectable
                  :default-expand-all="true"
                  :render-label="renderTreeLabel"
              />
              <div v-else class="tree-placeholder">
                无可用的树形结构数据
              </div>
            </div>

            <!-- JSON比较视图 -->
            <div v-show="currentView === 'diff'" class="diff-view-container">
              <div v-if="!diffData" class="diff-placeholder">
                <p>没有对比数据</p>
                <n-button @click="showDiffDialog = true">添加对比数据</n-button>
              </div>
              <div v-else class="diff-result">
                <div class="diff-stats">
                  <n-statistic label="新增" :value="diffStats.added">
                    <template #prefix>
                      <icon-font type="icon-add" color="var(--success-color)" />
                    </template>
                  </n-statistic>
                  <n-statistic label="删除" :value="diffStats.removed">
                    <template #prefix>
                      <icon-font type="icon-delete" color="var(--error-color)" />
                    </template>
                  </n-statistic>
                  <n-statistic label="修改" :value="diffStats.modified">
                    <template #prefix>
                      <icon-font type="icon-edit" color="var(--warning-color)" />
                    </template>
                  </n-statistic>
                </div>
                <div class="diff-content">
                  <pre class="diff-text" v-html="formattedDiff"></pre>
                </div>
              </div>
            </div>

            <!-- JSON Path查询结果 -->
            <div v-show="currentView === 'jsonpath'" class="jsonpath-container">
              <div class="jsonpath-input">
                <n-input-group>
                  <n-input
                      v-model:value="jsonPathQuery"
                      placeholder="输入JSONPath表达式 (例如: $.store.book[*].author)"
                  />
                  <n-button type="primary" @click="executeJsonPath">查询</n-button>
                </n-input-group>
                <p class="jsonpath-guide">常用语法: $ (根), .property (属性), [索引], [*] (所有元素), .. (递归)</p>
              </div>
              <div class="jsonpath-result">
                <div v-if="jsonPathResults.length">
                  <div class="jsonpath-matched">
                    <n-tag type="success">找到 {{ jsonPathResults.length }} 条匹配结果</n-tag>
                  </div>
                  <div v-for="(result, index) in jsonPathResults" :key="index" class="jsonpath-item">
                    <div class="jsonpath-item-path">
                      <n-tag size="small">路径 {{ index + 1 }}</n-tag>
                    </div>
                    <pre class="jsonpath-item-value">{{ JSON.stringify(result, null, 2) }}</pre>
                  </div>
                </div>
                <div v-else-if="jsonPathExecuted" class="jsonpath-no-match">
                  <n-empty description="未找到匹配结果" />
                </div>
              </div>
            </div>

            <!-- 结构分析视图 -->
            <div v-show="currentView === 'analyze'" class="analyze-container">
              <div v-if="jsonStats" class="json-stats">
                <div class="stats-cards">
                  <n-card size="small" title="基本统计">
                    <div class="stats-item">
                      <span>大小:</span>
                      <span>{{ jsonStats.sizeFormatted }}</span>
                    </div>
                    <div class="stats-item">
                      <span>嵌套深度:</span>
                      <span>{{ jsonStats.depth }}</span>
                    </div>
                    <div class="stats-item">
                      <span>节点总数:</span>
                      <span>{{ jsonStats.nodeCount }}</span>
                    </div>
                  </n-card>

                  <n-card size="small" title="数据类型">
                    <div class="stats-item">
                      <span>对象:</span>
                      <span>{{ jsonStats.types.object }}</span>
                    </div>
                    <div class="stats-item">
                      <span>数组:</span>
                      <span>{{ jsonStats.types.array }}</span>
                    </div>
                    <div class="stats-item">
                      <span>字符串:</span>
                      <span>{{ jsonStats.types.string }}</span>
                    </div>
                    <div class="stats-item">
                      <span>数字:</span>
                      <span>{{ jsonStats.types.number }}</span>
                    </div>
                    <div class="stats-item">
                      <span>布尔值:</span>
                      <span>{{ jsonStats.types.boolean }}</span>
                    </div>
                    <div class="stats-item">
                      <span>null:</span>
                      <span>{{ jsonStats.types.null }}</span>
                    </div>
                  </n-card>
                </div>

                <n-card size="small" title="结构图">
                  <div class="structure-visualization">
                    <svg ref="structureViz" width="100%" height="200"></svg>
                  </div>
                </n-card>

                <n-card size="small" title="常用路径">
                  <div v-for="(path, index) in jsonStats.commonPaths" :key="index" class="path-item">
                    <n-tag size="small">{{ path }}</n-tag>
                    <n-button size="tiny" text @click="setJsonPathQuery(path)">
                      查询
                    </n-button>
                  </div>
                </n-card>
              </div>
              <div v-else class="analyze-placeholder">
                <n-empty description="请先格式化有效的JSON数据" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误面板 -->
      <div v-if="errorMessage" class="error-panel">
        <n-alert type="error" :title="errorTitle">
          {{ errorMessage }}
          <template v-if="errorSuggestion">
            <br><strong>建议:</strong> {{ errorSuggestion }}
          </template>
        </n-alert>
      </div>

      <!-- 工具条 - 新增底部操作区 -->
      <div class="bottom-toolbar">
        <div class="tools-stats">
          <div class="stat-item">
            <span class="stat-label">字符数:</span>
            <span class="stat-value">{{ inputStats.chars }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">行数:</span>
            <span class="stat-value">{{ inputStats.lines }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">大小:</span>
            <span class="stat-value">{{ inputStats.size }}</span>
          </div>
        </div>

        <div class="quick-actions">
          <div class="format-options">
            <n-radio-group v-model:value="formatOption" size="small">
              <n-radio-button value="default">默认</n-radio-button>
              <n-radio-button value="sort">属性排序</n-radio-button>
              <n-radio-button value="minify">最小化</n-radio-button>
            </n-radio-group>
          </div>

          <n-switch v-model:value="showLineNumbers" size="small">
            <template #checked>显示行号</template>
            <template #unchecked>隐藏行号</template>
          </n-switch>

          <div class="theme-selector">
            <n-select v-model:value="codeTheme" :options="themeOptions" size="small" style="width: 120px" />
          </div>
        </div>
      </div>
    </div>

    <!-- JSON差异对比对话框 -->
    <n-modal v-model:show="showDiffDialog" preset="card" title="添加对比数据" style="max-width: 600px">
      <div class="diff-dialog-content">
        <p>请输入要与当前JSON对比的数据</p>
        <n-input
            v-model:value="diffInputJson"
            type="textarea"
            placeholder="粘贴要比较的JSON数据..."
            :autosize="{ minRows: 5, maxRows: 15 }"
        />
      </div>
      <template #footer>
        <n-button @click="showDiffDialog = false">取消</n-button>
        <n-button type="primary" @click="generateDiff">开始对比</n-button>
      </template>
    </n-modal>

    <!-- 历史记录对话框 -->
    <n-modal v-model:show="showHistory" preset="card" title="操作历史" style="max-width: 500px">
      <div class="history-list">
        <n-empty v-if="!jsonHistory.length" description="暂无历史记录" />
        <n-list v-else>
          <n-list-item v-for="(item, index) in jsonHistory" :key="index">
            <n-thing :title="item.title" :description="item.timestamp">
              <template #description>
                <span>{{ item.timestamp }}</span>
                <n-tag size="small" :type="item.type === 'error' ? 'error' : 'success'">
                  {{ item.format }}
                </n-tag>
              </template>
              <template #footer>
                <n-button text size="small" @click="restoreHistory(index)">恢复</n-button>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </div>
      <template #footer>
        <n-button type="primary" @click="showHistory = false">关闭</n-button>
        <n-button @click="clearHistory">清空历史</n-button>
      </template>
    </n-modal>
  </base-tool-detail>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { h } from 'vue';
import IconFont from '@/components/common/IconFont.vue';
import BaseToolDetail from '@/components/tools/BaseToolDetail.vue';

const message = useMessage();
const jsonInputArea = ref(null);
const structureViz = ref(null);

// 基本状态
const jsonInput = ref('');
const resultContent = ref('');
const resultType = ref('');
const resultFormat = ref('JSON');
const showResult = ref(false);
const isValidJson = ref(true);
const errorMessage = ref('');
const errorTitle = ref('');
const errorSuggestion = ref('');

// JSON树结构
const jsonTree = ref([]);

// 是否有输入内容
const hasInput = computed(() => jsonInput.value.trim().length > 0);

// 设置选项
const indentSize = ref(2);
const wordWrap = ref(true);
const formatOption = ref('default');
const codeTheme = ref('default');
const showLineNumbers = ref(true);

// 视图相关
const currentView = ref('plain'); // plain, tree, diff, jsonpath, analyze
const viewOptions = [
  { label: '普通视图', key: 'plain' },
  { label: '树形结构', key: 'tree' },
  { label: 'JSON比较', key: 'diff' },
  { label: 'JSONPath查询', key: 'jsonpath' },
  { label: '结构分析', key: 'analyze' }
];

// 主题选项
const themeOptions = [
  { label: '默认主题', value: 'default' },
  { label: '深色主题', value: 'dark' },
  { label: '柔和主题', value: 'soft' },
  { label: '高对比度', value: 'contrast' }
];

// 缩进选项
const indentOptions = [
  { label: '2个空格', value: 2 },
  { label: '4个空格', value: 4 },
  { label: '8个空格', value: 8 }
];

// 转换选项
const convertOptions = [
  { label: 'YAML', key: 'yaml' },
  { label: 'XML', key: 'xml' },
  { label: 'JavaScript对象', key: 'js' },
  { label: 'CSV', key: 'csv' },
  { label: 'Markdown表格', key: 'md' }
];

// 工具选项
const toolOptions = [
  { label: 'JSONPath查询', key: 'jsonpath' },
  { label: 'JSON对比', key: 'diff' },
  { label: '结构分析', key: 'analyze' },
  { label: 'JSON修复', key: 'fix' },
  { label: 'Schema验证', key: 'schema' }
];

// 差异对比相关
const showDiffDialog = ref(false);
const diffInputJson = ref('');
const diffData = ref(null);
const diffStats = ref({ added: 0, removed: 0, modified: 0 });
const formattedDiff = ref('');

// JSONPath相关
const jsonPathQuery = ref('');
const jsonPathResults = ref([]);
const jsonPathExecuted = ref(false);

// 历史记录相关
const showHistory = ref(false);
const jsonHistory = ref([]);

// JSON统计信息
const jsonStats = ref(null);

// 输入统计
const inputStats = computed(() => {
  const text = jsonInput.value;
  return {
    chars: text.length,
    lines: text ? text.split('\n').length : 0,
    size: formatBytes(new Blob([text]).size)
  };
});

// 高亮处理后的JSON结果
const highlightedResult = computed(() => {
  if (!resultContent.value || resultType.value === 'error') {
    return resultContent.value;
  }

  return highlightJson(resultContent.value);
});

// JSON语法高亮函数
const highlightJson = (json) => {
  if (!json) return '';

  // 对HTML特殊字符进行转义
  let highlighted = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // 高亮字符串（绿色）
  highlighted = highlighted.replace(/"(\\.|[^"\\])*"/g, '<span class="json-string">$&</span>');

  // 高亮数字（蓝色）
  highlighted = highlighted.replace(/\b(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="json-number">$&</span>');

  // 高亮布尔值和null（紫色）
  highlighted = highlighted.replace(/\b(true|false|null)\b/g, '<span class="json-keyword">$&</span>');

  // 高亮属性名和冒号（橙色）
  highlighted = highlighted.replace(/"(\\.|[^"\\])*"(?=\s*:)/g, '<span class="json-property">$&</span>');

  // 高亮括号和逗号（灰色）
  highlighted = highlighted.replace(/[{}\[\],]/g, '<span class="json-punctuation">$&</span>');

  return highlighted;
};

// 格式化字节大小
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 验证JSON
const validateJson = () => {
  if (!jsonInput.value.trim()) {
    isValidJson.value = true;
    errorMessage.value = '';
    errorSuggestion.value = '';
    return;
  }

  try {
    JSON.parse(jsonInput.value);
    isValidJson.value = true;
    errorMessage.value = '';
    errorSuggestion.value = '';
  } catch (e) {
    isValidJson.value = false;
    errorTitle.value = 'JSON语法错误';
    errorMessage.value = e.message;

    // 提供修复建议
    if (e.message.includes('Expected property name')) {
      errorSuggestion.value = '请检查属性名是否使用了双引号';
    } else if (e.message.includes('Unexpected token')) {
      errorSuggestion.value = '检查是否有多余或缺少的逗号、括号等';
    } else if (e.message.includes('Unexpected end of JSON')) {
      errorSuggestion.value = '检查JSON是否完整，可能缺少右括号或右大括号';
    } else {
      errorSuggestion.value = '请检查JSON格式是否正确';
    }
  }
};

// 格式化JSON
const formatJson = () => {
  if (!jsonInput.value.trim()) {
    message.warning('请先输入JSON数据');
    return;
  }

  try {
    // 如果JSON无效但内容不为空，尝试自动修复
    if (!isValidJson.value) {
      // 尝试修复常见问题
      const fixedJson = tryFixJson(jsonInput.value);
      if (fixedJson) {
        jsonInput.value = fixedJson;
        validateJson();
      }

      if (!isValidJson.value) {
        message.error('JSON无效，无法自动修复，请修正后再格式化');
        return;
      }
    }

    const parsed = JSON.parse(jsonInput.value);

    // 根据格式选项处理数据
    let dataToFormat = parsed;
    if (formatOption.value === 'sort') {
      dataToFormat = sortJsonKeys(parsed);
    }

    const indent = ' '.repeat(indentSize.value);
    const formatted = JSON.stringify(dataToFormat, null, formatOption.value === 'minify' ? 0 : indent);

    resultContent.value = formatted;
    resultType.value = 'success';
    resultFormat.value = formatOption.value === 'minify' ? 'JSON (压缩)' : 'JSON';
    showResult.value = true;
    message.success('JSON格式化成功');

    // 生成JSON树
    generateJsonTree(parsed);

    // 生成结构分析
    analyzeJsonStructure(parsed);

    // 添加到历史记录
    addToHistory({
      title: '格式化操作',
      format: resultFormat.value,
      type: 'success',
      content: formatted,
      timestamp: new Date().toLocaleString()
    });

    // 如果当前不是普通视图，切换到普通视图
    if (currentView.value !== 'plain') {
      currentView.value = 'plain';
    }
  } catch (e) {
    resultType.value = 'error';
    resultContent.value = `格式化出错: ${e.message}`;
    showResult.value = true;

    // 添加到历史记录
    addToHistory({
      title: '格式化失败',
      format: '错误',
      type: 'error',
      content: e.message,
      timestamp: new Date().toLocaleString()
    });
  }
};

// 排序JSON键
const sortJsonKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => sortJsonKeys(item));
  }

  // 处理对象
  return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortJsonKeys(obj[key]);
        return result;
      }, {});
};

// 尝试修复JSON
const tryFixJson = (jsonStr) => {
  if (!jsonStr) return null;

  // 替换单引号为双引号
  let fixed = jsonStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');

  // 处理值中的单引号
  fixed = fixed.replace(/:\s*'([^']*)'/g, ': "$1"');

  // 处理末尾多余的逗号
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');

  // 处理键名后缺少冒号的情况
  fixed = fixed.replace(/"([^"]+)"\s+(["{[])/g, '"$1": $2');

  // 处理值后缺少逗号的情况
  fixed = fixed.replace(/(["}0-9])\s*\n\s*"/g, '$1,\n"');

  try {
    // 测试修复后的JSON是否有效
    JSON.parse(fixed);
    return fixed;
  } catch (e) {
    return null; // 修复失败
  }
};

// 压缩JSON
const compactJson = () => {
  if (!jsonInput.value.trim()) {
    message.warning('请先输入JSON数据');
    return;
  }

  if (!isValidJson.value) {
    message.error('JSON无效，请修复后再压缩');
    return;
  }

  try {
    const parsed = JSON.parse(jsonInput.value);
    const compacted = JSON.stringify(parsed);

    resultContent.value = compacted;
    resultType.value = 'success';
    resultFormat.value = 'JSON (压缩)';
    showResult.value = true;
    message.success('JSON压缩成功');

    // 添加到历史记录
    addToHistory({
      title: '压缩操作',
      format: 'JSON (压缩)',
      type: 'success',
      content: compacted,
      timestamp: new Date().toLocaleString()
    });
  } catch (e) {
    resultType.value = 'error';
    resultContent.value = `压缩出错: ${e.message}`;
    showResult.value = true;
  }
};

// 转换JSON为其他格式
const handleConvert = (key) => {
  if (!jsonInput.value.trim()) {
    message.warning('请先输入JSON数据');
    return;
  }

  if (!isValidJson.value) {
    message.error('JSON无效，请修复后再转换');
    return;
  }

  try {
    const parsed = JSON.parse(jsonInput.value);
    let convertedResult = '';
    let formatLabel = '';

    switch (key) {
      case 'yaml':
        // YAML转换
        convertedResult = convertToYaml(parsed);
        formatLabel = 'YAML';
        break;
      case 'xml':
        // XML转换
        convertedResult = convertToXml(parsed);
        formatLabel = 'XML';
        break;
      case 'js':
        // JavaScript对象
        convertedResult = convertToJs(parsed);
        formatLabel = 'JavaScript';
        break;
      case 'csv':
        // CSV转换
        convertedResult = convertToCsv(parsed);
        formatLabel = 'CSV';
        break;
      case 'md':
        // Markdown表格
        convertedResult = convertToMarkdownTable(parsed);
        formatLabel = 'Markdown';
        break;
    }

    resultContent.value = convertedResult;
    resultType.value = 'success';
    resultFormat.value = formatLabel;
    showResult.value = true;
    message.success(`转换为${formatLabel}成功`);

    // 添加到历史记录
    addToHistory({
      title: `转换为${formatLabel}`,
      format: formatLabel,
      type: 'success',
      content: convertedResult,
      timestamp: new Date().toLocaleString()
    });
  } catch (e) {
    resultType.value = 'error';
    resultContent.value = `转换出错: ${e.message}`;
    showResult.value = true;

    // 添加到历史记录
    addToHistory({
      title: '转换失败',
      format: '错误',
      type: 'error',
      content: e.message,
      timestamp: new Date().toLocaleString()
    });
  }
};

// 处理工具选择
const handleToolSelect = (key) => {
  if (!jsonInput.value.trim()) {
    message.warning('请先输入JSON数据');
    return;
  }

  if (!isValidJson.value && key !== 'fix') {
    message.error('JSON无效，请先修复');
    return;
  }

  switch (key) {
    case 'jsonpath':
      currentView.value = 'jsonpath';
      break;
    case 'diff':
      currentView.value = 'diff';
      showDiffDialog.value = true;
      break;
    case 'analyze':
      currentView.value = 'analyze';
      if (!jsonStats.value) {
        analyzeJsonStructure(JSON.parse(jsonInput.value));
      }
      break;
    case 'fix':
      fixJson();
      break;
    case 'schema':
      message.info('Schema验证功能正在开发中');
      break;
  }
};

// 处理视图切换
const handleViewChange = (key) => {
  if (!showResult.value) {
    message.warning('请先格式化或操作JSON数据');
    return;
  }

  currentView.value = key;

  // 如果是树形视图，确保已生成树结构
  if (key === 'tree' && jsonTree.value.length === 0 && resultType.value !== 'error') {
    try {
      generateJsonTree(JSON.parse(resultContent.value));
    } catch (e) {
      message.error('生成树形结构失败');
    }
  }

  // 如果是结构分析视图，确保已生成分析数据
  if (key === 'analyze' && !jsonStats.value && resultType.value !== 'error') {
    try {
      analyzeJsonStructure(JSON.parse(resultContent.value));
    } catch (e) {
      message.error('生成结构分析失败');
    }
  }
};

// 尝试自动修复JSON
const fixJson = () => {
  if (!jsonInput.value.trim()) {
    message.warning('请先输入JSON数据');
    return;
  }

  const fixedJson = tryFixJson(jsonInput.value);
  if (fixedJson) {
    jsonInput.value = fixedJson;
    validateJson();
    formatJson();
    message.success('JSON已自动修复');
  } else {
    message.error('无法自动修复，请手动检查错误');
  }
};

// 生成JSON树结构
const generateJsonTree = (data) => {
  const buildTree = (value, key = 'root', path = '') => {
    const currentPath = path ? `${path}.${key}` : key;

    if (value === null) {
      return {
        key: currentPath,
        label: `${key}: null`,
        type: 'null'
      };
    }

    if (typeof value !== 'object') {
      let displayValue = typeof value === 'string' ? `"${value}"` : value;
      return {
        key: currentPath,
        label: `${key}: ${displayValue}`,
        type: typeof value
      };
    }

    // 处理数组
    if (Array.isArray(value)) {
      const children = value.map((item, index) =>
          buildTree(item, `[${index}]`, currentPath)
      );

      return {
        key: currentPath,
        label: `${key}: Array[${value.length}]`,
        type: 'array',
        children
      };
    }

    // 处理对象
    const children = Object.keys(value).map(childKey =>
        buildTree(value[childKey], childKey, currentPath)
    );

    return {
      key: currentPath,
      label: `${key}: Object{${Object.keys(value).length}}`,
      type: 'object',
      children
    };
  };

  const tree = buildTree(data);
  jsonTree.value = [tree];
};

// JSON结构分析
const analyzeJsonStructure = (data) => {
  // 统计节点总数、深度和类型
  const stats = {
    nodeCount: 0,
    depth: 0,
    size: new Blob([JSON.stringify(data)]).size,
    sizeFormatted: formatBytes(new Blob([JSON.stringify(data)]).size),
    types: {
      object: 0,
      array: 0,
      string: 0,
      number: 0,
      boolean: 0,
      null: 0
    },
    commonPaths: []
  };

  const paths = [];

  // 递归分析结构
  const analyze = (value, path = '$', depth = 0) => {
    stats.nodeCount++;
    stats.depth = Math.max(stats.depth, depth);

    if (value === null) {
      stats.types.null++;
      paths.push(path);
      return;
    }

    const type = Array.isArray(value) ? 'array' : typeof value;
    stats.types[type]++;

    if (type === 'object') {
      for (const key in value) {
        analyze(value[key], `${path}.${key}`, depth + 1);
      }
    } else if (type === 'array') {
      paths.push(path);
      value.forEach((item, index) => {
        analyze(item, `${path}[${index}]`, depth + 1);
      });
    } else {
      paths.push(path);
    }
  };

  analyze(data);

  // 获取有代表性的路径
  const representativePaths = paths
      .filter(path => path.indexOf('[') === -1 || path.match(/\[\d+\]/g)?.length <= 1)
      .filter((path, index, self) =>
          self.findIndex(p => p.replace(/\[\d+\]/g, '[*]') === path.replace(/\[\d+\]/g, '[*]')) === index
      )
      .map(path => path.replace(/\[\d+\]/g, '[*]'))
      .slice(0, 5);

  stats.commonPaths = representativePaths;
  jsonStats.value = stats;
};

// 渲染树形节点标签
const renderTreeLabel = ({ option }) => {
  const { type } = option;

  let color;
  switch (type) {
    case 'object':
      color = 'var(--primary-color)';
      break;
    case 'array':
      color = 'var(--info-color)';
      break;
    case 'string':
      color = 'var(--success-color)';
      break;
    case 'number':
      color = 'var(--warning-color)';
      break;
    case 'boolean':
      color = 'var(--error-color)';
      break;
    default:
      color = 'var(--text-color-base)';
  }

  return h('span', { style: { color } }, option.label);
};

// 设置JSONPath查询
const setJsonPathQuery = (path) => {
  jsonPathQuery.value = path;
  currentView.value = 'jsonpath';
  executeJsonPath();
};

// 执行JSONPath查询
const executeJsonPath = () => {
  if (!jsonPathQuery.value.trim()) {
    message.warning('请输入JSONPath表达式');
    return;
  }

  if (!isValidJson.value) {
    message.error('JSON无效，请修复后再查询');
    return;
  }

  try {
    // 简单实现JSONPath
    const query = jsonPathQuery.value;
    const data = JSON.parse(jsonInput.value);

    // 简化版JSONPath解析
    let results = [];

    // 将查询解析为路径段
    const segments = query.split('.')
        .map(s => {
          if (s.includes('[')) {
            const base = s.substring(0, s.indexOf('['));
            const indices = s.match(/\[(.*?)\]/g).map(i => i.slice(1, -1));
            return { base, indices };
          }
          return { base: s, indices: [] };
        });

    // 递归查询
    const search = (obj, segments, index, currentPath) => {
      if (index >= segments.length) {
        results.push(obj);
        return;
      }

      const { base, indices } = segments[index];

      // 处理根元素
      if (base === '$' && index === 0) {
        search(obj, segments, index + 1, '$');
        return;
      }

      // 递归下降 (..)
      if (base === '') {
        // 当前级别
        search(obj, segments, index + 1, currentPath);

        // 子元素
        if (typeof obj === 'object' && obj !== null) {
          if (Array.isArray(obj)) {
            obj.forEach((item, i) => {
              search(item, segments, index, `${currentPath}[${i}]`);
            });
          } else {
            for (const key in obj) {
              search(obj[key], segments, index, `${currentPath}.${key}`);
            }
          }
        }
        return;
      }

      // 普通属性
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        if (indices.length === 0) {
          return;
        }

        // 处理数组索引
        indices.forEach(idx => {
          if (idx === '*') {
            // 所有元素
            obj.forEach((item, i) => {
              search(item, segments, index + 1, `${currentPath}[${i}]`);
            });
          } else {
            const i = parseInt(idx);
            if (!isNaN(i) && i >= 0 && i < obj.length) {
              search(obj[i], segments, index + 1, `${currentPath}[${i}]`);
            }
          }
        });
      } else {
        // 对象属性
        if (base in obj) {
          const newPath = `${currentPath}.${base}`;
          search(obj[base], segments, index + 1, newPath);
        }
      }
    };

    search(data, segments, 0, '');
    jsonPathResults.value = results;
    jsonPathExecuted.value = true;

    if (results.length > 0) {
      message.success(`找到 ${results.length} 条匹配结果`);
    } else {
      message.info('未找到匹配结果');
    }
  } catch (e) {
    message.error(`查询执行失败: ${e.message}`);
    jsonPathResults.value = [];
    jsonPathExecuted.value = true;
  }
};

// 生成JSON差异比较
const generateDiff = () => {
  if (!diffInputJson.value.trim()) {
    message.warning('请输入对比JSON数据');
    return;
  }

  try {
    const targetJson = JSON.parse(diffInputJson.value);
    const sourceJson = JSON.parse(jsonInput.value);

    // 执行差异比较
    const diff = compareJson(sourceJson, targetJson);
    diffData.value = diff;

    // 统计差异数量
    const stats = {
      added: 0,
      removed: 0,
      modified: 0
    };

    // 格式化diff显示，添加颜色
    let formattedOutput = '';

    const processDiff = (diff, path = '') => {
      for (const key in diff) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = diff[key];

        if (Array.isArray(value)) {
          // 修改项 [oldValue, newValue]
          formattedOutput += `<span style="color: orange">~ ${currentPath}: ${JSON.stringify(value[0])} → ${JSON.stringify(value[1])}</span>\n`;
          stats.modified++;
        } else if (typeof value === 'object' && value !== null) {
          if ('__added' in value) {
            // 新增项
            formattedOutput += `<span style="color: green">+ ${currentPath}: ${JSON.stringify(value.__added)}</span>\n`;
            stats.added++;
          } else if ('__removed' in value) {
            // 删除项
            formattedOutput += `<span style="color: red">- ${currentPath}: ${JSON.stringify(value.__removed)}</span>\n`;
            stats.removed++;
          } else {
            // 递归处理嵌套对象
            processDiff(value, currentPath);
          }
        }
      }
    };

    processDiff(diff);

    if (formattedOutput) {
      formattedDiff.value = formattedOutput;
    } else {
      formattedDiff.value = '<span style="color: blue">两个JSON对象完全相同</span>';
    }

    diffStats.value = stats;
    currentView.value = 'diff';
    showDiffDialog.value = false;

    message.success('JSON对比分析完成');
  } catch (e) {
    message.error(`对比失败: ${e.message}`);
  }
};

// 比较两个JSON对象的差异
const compareJson = (source, target) => {
  const diff = {};

  // 检查删除的和修改的属性
  for (const key in source) {
    if (!(key in target)) {
      // 属性在目标对象中不存在，被删除了
      diff[key] = { __removed: source[key] };
    } else if (source[key] !== target[key]) {
      // 属性值发生了变化
      if (typeof source[key] === 'object' && typeof target[key] === 'object' &&
          source[key] !== null && target[key] !== null) {
        // 递归比较对象
        const nestedDiff = compareJson(source[key], target[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else {
        // 简单值的变化
        diff[key] = [source[key], target[key]];
      }
    }
  }

  // 检查新增的属性
  for (const key in target) {
    if (!(key in source)) {
      diff[key] = { __added: target[key] };
    }
  }

  return diff;
};

// YAML转换
const convertToYaml = (json) => {
  let result = '';

  const processObject = (obj, level = 0) => {
    const indent = '  '.repeat(level);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        result += `${indent}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        result += `${indent}${key}:\n`;
        processObject(value, level + 1);
      } else if (Array.isArray(value)) {
        result += `${indent}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            result += `${indent}  -\n`;
            processObject(item, level + 2);
          } else {
            result += `${indent}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'string') {
        result += `${indent}${key}: "${value}"\n`;
      } else {
        result += `${indent}${key}: ${value}\n`;
      }
    }
  };

  if (Array.isArray(json)) {
    json.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        result += '-\n';
        processObject(item, 1);
      } else {
        result += `- ${item}\n`;
      }
    });
  } else {
    processObject(json);
  }

  return result;
};

// XML转换
const convertToXml = (json) => {
  let result = '<?xml version="1.0" encoding="UTF-8" ?>\n';

  const processObject = (obj, nodeName = 'root') => {
    result += `<${nodeName}>\n`;

    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        result += `  <${key} />\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        processObject(value, key);
      } else if (Array.isArray(value)) {
        result += `  <${key}>\n`;
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            processObject(item, 'item');
          } else {
            result += `    <item>${item}</item>\n`;
          }
        });
        result += `  </${key}>\n`;
      } else {
        result += `  <${key}>${value}</${key}>\n`;
      }
    }

    result += `</${nodeName}>\n`;
  };

  if (Array.isArray(json)) {
    result += '<root>\n';
    json.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        processObject(item, 'item');
      } else {
        result += `  <item>${item}</item>\n`;
      }
    });
    result += '</root>\n';
  } else {
    processObject(json);
  }

  return result;
};

// JavaScript对象转换
const convertToJs = (json) => {
  const indent = ' '.repeat(indentSize.value);

  const processValue = (value, level) => {
    const indentation = indent.repeat(level);

    if (value === null) {
      return 'null';
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      const entries = Object.entries(value).map(([key, val]) => {
        const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
        return `${indentation}${indent}${keyStr}: ${processValue(val, level + 1)}`;
      });

      if (entries.length === 0) {
        return '{}';
      }

      return `{\n${entries.join(',\n')}\n${indentation}}`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }

      const items = value.map(item => `${indentation}${indent}${processValue(item, level + 1)}`);
      return `[\n${items.join(',\n')}\n${indentation}]`;
    } else if (typeof value === 'string') {
      return `'${value.replace(/'/g, "\\'")}'`;
    } else {
      return String(value);
    }
  };

  const varName = 'const data = ';
  return `${varName}${processValue(json, 0)};`;
};

// CSV转换
const convertToCsv = (json) => {
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('只有JSON数组才能转换为CSV格式');
  }

  // 获取所有可能的列标题
  const headers = new Set();
  json.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => headers.add(key));
    }
  });

  const headerArray = Array.from(headers);
  let csv = headerArray.map(h => `"${h}"`).join(',') + '\n';

  // 为每一行添加值
  json.forEach(item => {
    const row = headerArray.map(header => {
      const value = item[header];
      if (value === undefined || value === null) {
        return '';
      } else if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return value;
      }
    });
    csv += row.join(',') + '\n';
  });

  return csv;
};

// Markdown表格转换
const convertToMarkdownTable = (json) => {
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('只有JSON数组才能转换为Markdown表格');
  }

  // 获取所有可能的列标题
  const headers = new Set();
  json.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => headers.add(key));
    }
  });

  const headerArray = Array.from(headers);
  let md = '| ' + headerArray.join(' | ') + ' |\n';
  md += '| ' + headerArray.map(() => '---').join(' | ') + ' |\n';

  // 为每一行添加值
  json.forEach(item => {
    const row = headerArray.map(header => {
      const value = item[header];
      if (value === undefined || value === null) {
        return '';
      } else if (typeof value === 'object') {
        return JSON.stringify(value);
      } else {
        return String(value);
      }
    });
    md += '| ' + row.join(' | ') + ' |\n';
  });

  return md;
};

// 清空JSON
const clearJson = () => {
  jsonInput.value = '';
  resultContent.value = '';
  showResult.value = false;
  errorMessage.value = '';
  isValidJson.value = true;
  message.info('已清空');
};

// 复制JSON
const copyJson = () => {
  const textToCopy = jsonInput.value.trim();

  if (!textToCopy) {
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

// 复制结果
const copyResult = () => {
  if (!resultContent.value.trim()) {
    message.warning('没有结果可复制');
    return;
  }

  navigator.clipboard.writeText(resultContent.value)
      .then(() => {
        message.success('已复制结果到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 下载JSON
const downloadJson = () => {
  const textToDownload = jsonInput.value.trim();

  if (!textToDownload) {
    message.warning('没有内容可下载');
    return;
  }

  const filename = 'data.json';
  const blob = new Blob([textToDownload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  message.success(`已下载为 ${filename}`);
};

// 将结果应用到输入
const useResultAsInput = () => {
  if (!resultContent.value.trim()) {
    message.warning('没有结果可应用');
    return;
  }

  jsonInput.value = resultContent.value;
  validateJson();
  showResult.value = false;
  message.success('已将结果应用到输入');
};

// 添加到历史记录
const addToHistory = (item) => {
  // 限制历史记录数量
  if (jsonHistory.value.length >= 10) {
    jsonHistory.value.pop();
  }

  jsonHistory.value.unshift(item);
};

// 恢复历史记录
const restoreHistory = (index) => {
  const historyItem = jsonHistory.value[index];

  if (historyItem.type === 'error') {
    message.warning('无法恢复错误记录');
    return;
  }

  jsonInput.value = historyItem.content;
  validateJson();
  showHistory.value = false;
  message.success('已恢复历史记录');
};

// 清空历史记录
const clearHistory = () => {
  jsonHistory.value = [];
  message.success('已清空历史记录');
};

// 加载样本数据
const loadSample = () => {
  jsonInput.value = `{
  "name": "JSON格式化工具示例",
  "version": 1.0,
  "features": ["格式化", "压缩", "转换", "JSONPath查询", "结构分析"],
  "settings": {
    "indentSize": 2,
    "theme": "light",
    "autoSave": true
  },
  "sampleData": [
    {
      "id": 1,
      "type": "示例1",
      "active": true,
      "details": {
        "description": "这是第一个示例",
        "tags": ["示例", "测试"]
      }
    },
    {
      "id": 2,
      "type": "示例2",
      "active": false,
      "details": {
        "description": "这是第二个示例",
        "tags": ["示例", "演示"]
      }
    }
  ],
  "isActive": true,
  "lastUpdated": "2025-05-03T12:00:00Z"
}`;

  validateJson();
  message.success('已加载示例数据');
};

// 监听JSON输入变化
watch(jsonInput, () => {
  validateJson();
}, { debounce: 300 });

// 组件挂载
onMounted(() => {
  // 设置默认键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      formatJson();
    } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      downloadJson();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && document.getSelection().toString() === '') {
      e.preventDefault();
      copyJson();
    }
  });
});
</script>

<style scoped>
.json-formatter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 220px);
  min-height: 500px;
}

.main-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.left-actions, .right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 水平布局 */
.editor-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex: 1;
  min-height: 300px;
}

.input-panel, .output-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 50%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--divider-color);
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 编辑器改进 */
.editor-wrapper, .json-result-wrapper {
  position: relative;
  height: 100%;
  display: flex;
}

.json-textarea, .json-result {
  width: 100%;
  height: 100%;
  padding: 12px 16px 12px calc(16px + 3ch); /* 为行号留出空间 */
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  outline: none;
  resize: none;
  overflow: auto;
  background-color: transparent;
  color: var(--text-color-base);
  white-space: pre;
  flex: 1;
}

.line-numbers {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  padding: 12px 8px;
  width: 3ch;
  text-align: right;
  background-color: rgba(0, 0, 0, 0.02);
  color: var(--text-color-secondary);
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  user-select: none;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.line-number {
  opacity: 0.6;
}

.word-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-panel {
  padding: 0;
  margin: 0;
}

/* 底部工具栏 */
.bottom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tools-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: var(--text-color-secondary);
  font-size: 13px;
}

.stat-value {
  font-weight: 500;
  font-size: 13px;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* JSONPath查询 */
.jsonpath-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 12px;
  overflow: auto;
}

.jsonpath-input {
  margin-bottom: 8px;
}

.jsonpath-guide {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.jsonpath-result {
  flex: 1;
  overflow: auto;
}

.jsonpath-matched {
  margin-bottom: 8px;
}

.jsonpath-item {
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.02);
}

.jsonpath-item-path {
  margin-bottom: 4px;
}

.jsonpath-item-value {
  margin: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  font-size: 13px;
}

/* 结构分析 */
.analyze-container {
  padding: 12px;
  height: 100%;
  overflow: auto;
}

.json-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-cards {
  display: flex;
  gap: 12px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.structure-visualization {
  height: 200px;
  overflow: hidden;
}

.path-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

/* 树形结构视图 */
.tree-view-container {
  padding: 12px;
  height: 100%;
  overflow: auto;
}

.result-container {
  overflow: auto;
}

/* 比较视图 */
.diff-view-container {
  height: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.diff-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.diff-content {
  flex: 1;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
}

.diff-text {
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.diff-placeholder, .tree-placeholder, .analyze-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
}

/* 帮助指南 */
.help-guide {
  line-height: 1.6;
}

.help-guide h4 {
  margin-top: 16px;
  margin-bottom: 8px;
}

.help-guide ul {
  margin-top: 8px;
  padding-left: 20px;
}

.help-guide kbd {
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  color: var(--text-color-base);
  display: inline-block;
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1;
  padding: 2px 4px;
  margin: 0 1px;
}

/* JSON语法高亮 */
:deep(.json-string) {
  color: #008000; /* 绿色 */
}

:deep(.json-number) {
  color: #0000ff; /* 蓝色 */
}

:deep(.json-keyword) {
  color: #800080; /* 紫色 */
}

:deep(.json-property) {
  color: #a52a2a; /* 棕色 */
}

:deep(.json-punctuation) {
  color: #666666; /* 灰色 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-toolbar, .bottom-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .left-actions, .right-actions, .tools-stats, .quick-actions {
    width: 100%;
    justify-content: space-between;
  }

  .editor-container {
    flex-direction: column;
    height: auto;
    flex: 1;
  }

  .input-panel, .output-panel {
    width: 100%;
    height: 50%;
    min-height: 200px;
  }

  .stats-cards {
    flex-direction: column;
  }
}
</style>