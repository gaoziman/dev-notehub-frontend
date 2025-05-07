<template>
  <base-tool-detail
      title="配色方案生成器"
      description="创建和管理专业级配色方案，支持多种色彩模式和导出格式"
      iconType="icon-color"
      iconColor="#f44336"
  >
    <div class="color-picker-container">
      <!-- 主工具栏 -->
      <div class="main-toolbar">
        <!-- 配色模式选择 -->
        <div class="toolbar-group">
          <n-select
              v-model:value="colorMode"
              :options="colorModeOptions"
              size="small"
              placeholder="色彩模式"
              class="mode-select"
          />

          <n-select
              v-model:value="harmonyRule"
              :options="harmonyRuleOptions"
              size="small"
              placeholder="和谐规则"
              class="harmony-select"
          />
        </div>

        <!-- 主要操作按钮 -->
        <div class="toolbar-group primary-actions">
          <n-button-group>
            <n-button @click="generateScheme" type="primary" class="action-button">
              <template #icon>
                <icon-font type="icon-generate" :size="16" />
              </template>
              生成方案
            </n-button>
            <n-button @click="randomizeColors" secondary class="action-button">
              <template #icon>
                <icon-font type="icon-random" :size="16" />
              </template>
              随机生成
            </n-button>
          </n-button-group>

          <n-button-group>
            <n-button @click="copyScheme" class="action-button">
              <template #icon>
                <icon-font type="icon-copy" :size="16" />
              </template>
              复制方案
            </n-button>
            <n-button @click="exportScheme" class="action-button">
              <template #icon>
                <icon-font type="icon-download" :size="16" />
              </template>
              导出
            </n-button>
            <n-button @click="clearScheme" class="action-button">
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
            <n-switch v-model:value="showColorCodes" class="feature-switch">
              <template #checked>显示色值</template>
              <template #unchecked>显示色值</template>
            </n-switch>

            <n-switch v-model:value="showAccessibility" class="feature-switch">
              <template #checked>辅助检查</template>
              <template #unchecked>辅助检查</template>
            </n-switch>
          </div>

          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-button class="sample-button" secondary circle>
                <icon-font type="icon-template" :size="16" />
              </n-button>
            </template>
            <div class="sample-popover">
              <h3 class="sample-title">配色模板</h3>
              <n-space vertical>
                <n-button size="small" @click="loadTemplate('material')" class="sample-option">
                  <template #icon>
                    <icon-font type="icon-material" :size="14" />
                  </template>
                  Material Design
                </n-button>
                <n-button size="small" @click="loadTemplate('colorful')" class="sample-option">
                  <template #icon>
                    <icon-font type="icon-colorful" :size="14" />
                  </template>
                  活力多彩
                </n-button>
                <n-button size="small" @click="loadTemplate('pastel')" class="sample-option">
                  <template #icon>
                    <icon-font type="icon-pastel" :size="14" />
                  </template>
                  柔和渐变
                </n-button>
              </n-space>
            </div>
          </n-tooltip>
        </div>
      </div>

      <!-- 快捷键提示条 -->
      <div class="shortcuts-bar">
        <div class="shortcut-pills">
          <div class="shortcut-pill"><kbd>空格</kbd> <span>随机生成</span></div>
          <div class="shortcut-pill"><kbd>S</kbd> <span>保存方案</span></div>
          <div class="shortcut-pill"><kbd>C</kbd> <span>复制当前色值</span></div>
          <div class="shortcut-pill"><kbd>L</kbd> <span>锁定/解锁色块</span></div>
        </div>
      </div>

      <!-- 主色选择区域 -->
      <div class="primary-color-section">
        <div class="section-header">
          <h2 class="section-title">主色调</h2>
          <div class="section-actions">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button quaternary circle size="small">
                  <icon-font type="icon-info" :size="14" />
                </n-button>
              </template>
              选择一个主色调作为配色方案的基础
            </n-tooltip>
          </div>
        </div>

        <div class="color-picker-panel">
          <div class="color-wheel-container">
            <div class="color-wheel" ref="colorWheel">
              <!-- 这里用canvas实现颜色轮，但在模板中用div作为占位符 -->
              <div class="color-wheel-placeholder"></div>
              <div class="color-wheel-selector" :style="{ left: selectorPosition.x + 'px', top: selectorPosition.y + 'px' }"></div>
            </div>
            <div class="color-slider-container">
              <div class="color-slider-label">亮度</div>
              <n-slider
                  v-model:value="brightness"
                  :min="0"
                  :max="100"
                  :step="1"
                  vertical
                  class="brightness-slider"
                  @update:value="updatePrimaryColor"
              />
            </div>
          </div>

          <div class="selected-color-info">
            <div class="selected-color-preview" :style="{ backgroundColor: primaryColor }"></div>
            <div class="color-info-tabs">
              <n-tabs type="line" size="small" animated v-model:value="colorFormat">
                <n-tab-pane name="hex" tab="HEX">
                  <div class="color-value-field">
                    <n-input v-model:value="colorValues.hex" @blur="updateFromHex">
                      <template #prefix>#</template>
                    </n-input>
                  </div>
                </n-tab-pane>
                <n-tab-pane name="rgb" tab="RGB">
                  <div class="rgb-fields">
                    <n-input-number v-model:value="colorValues.rgb.r" :min="0" :max="255" size="small" @update:value="updateFromRGB" />
                    <n-input-number v-model:value="colorValues.rgb.g" :min="0" :max="255" size="small" @update:value="updateFromRGB" />
                    <n-input-number v-model:value="colorValues.rgb.b" :min="0" :max="255" size="small" @update:value="updateFromRGB" />
                  </div>
                </n-tab-pane>
                <n-tab-pane name="hsl" tab="HSL">
                  <div class="hsl-fields">
                    <n-input-number v-model:value="colorValues.hsl.h" :min="0" :max="360" size="small" @update:value="updateFromHSL">
                      <template #suffix>°</template>
                    </n-input-number>
                    <n-input-number v-model:value="colorValues.hsl.s" :min="0" :max="100" size="small" @update:value="updateFromHSL">
                      <template #suffix>%</template>
                    </n-input-number>
                    <n-input-number v-model:value="colorValues.hsl.l" :min="0" :max="100" size="small" @update:value="updateFromHSL">
                      <template #suffix>%</template>
                    </n-input-number>
                  </div>
                </n-tab-pane>
              </n-tabs>
            </div>
          </div>
        </div>
      </div>

      <!-- 色彩方案展示区域 -->
      <div class="color-scheme-section">
        <div class="section-header">
          <h2 class="section-title">配色方案</h2>
          <div class="color-scheme-actions">
            <n-switch v-model:value="showVariants" class="scheme-switch">
              <template #checked>显示色阶</template>
              <template #unchecked>显示色阶</template>
            </n-switch>
            <n-select
                v-model:value="paletteSize"
                :options="paletteSizeOptions"
                size="small"
                class="palette-size-select"
            />
          </div>
        </div>

        <div class="color-palette-container">
          <div
              v-for="(color, index) in colorPalette"
              :key="index"
              class="color-palette-item"
              :class="{ 'locked': lockedColors[index] }"
          >
            <div class="color-box" :style="{ backgroundColor: color }">
              <div class="color-box-actions">
                <n-button quaternary circle size="small" @click="toggleLockColor(index)">
                  <icon-font :type="lockedColors[index] ? 'icon-lock' : 'icon-unlock'" :size="14" />
                </n-button>
                <n-button quaternary circle size="small" @click="copyColor(color)">
                  <icon-font type="icon-copy" :size="14" />
                </n-button>
              </div>
              <div v-if="showColorCodes" class="color-code">{{ getFormattedColorCode(color) }}</div>
            </div>
            <div v-if="showVariants" class="color-variants">
              <div
                  v-for="(variant, vIndex) in generateVariants(color, 5)"
                  :key="`${index}-${vIndex}`"
                  class="color-variant"
                  :style="{ backgroundColor: variant }"
                  @click="selectVariant(index, variant)"
              >
                <div v-if="showColorCodes" class="variant-code">{{ vIndex * 100 + 100 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 辅助工具区域 -->
      <div class="color-tools-section">
        <n-tabs type="line" size="medium" animated v-model:value="activeToolTab">
          <n-tab-pane name="accessibility" tab="无障碍检查">
            <div class="accessibility-checker" v-if="showAccessibility">
              <div class="text-contrast-check">
                <h3 class="tool-subtitle">文本对比度检查</h3>
                <div class="contrast-sample-container">
                  <div class="contrast-backgrounds">
                    <div
                        v-for="(color, index) in colorPalette.slice(0, 3)"
                        :key="`bg-${index}`"
                        class="contrast-background"
                        :style="{ backgroundColor: color }"
                    >
                      <div class="contrast-text-samples">
                        <div
                            v-for="(textColor, tIndex) in [contrastTextColors.light, contrastTextColors.dark]"
                            :key="`text-${tIndex}`"
                            class="contrast-text-sample"
                        >
                          <div
                              class="text-sample large"
                              :style="{ color: textColor }"
                              :class="{ 'pass': checkContrast(color, textColor, 'large'), 'fail': !checkContrast(color, textColor, 'large') }"
                          >
                            Aa 大标题
                          </div>
                          <div
                              class="text-sample small"
                              :style="{ color: textColor }"
                              :class="{ 'pass': checkContrast(color, textColor, 'small'), 'fail': !checkContrast(color, textColor, 'small') }"
                          >
                            Aa 正文文本
                          </div>
                          <div class="contrast-ratio">
                            {{ getContrastRatio(color, textColor) }}
                            <span
                                class="contrast-badge"
                                :class="getContrastClass(color, textColor)"
                            >
                              {{ getContrastLabel(color, textColor) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="color-blindness-preview">
                <h3 class="tool-subtitle">色盲模拟</h3>
                <div class="color-blindness-types">
                  <n-grid :cols="3" :x-gap="12" :y-gap="12">
                    <n-grid-item v-for="(type, index) in colorBlindnessTypes" :key="index">
                      <div class="color-blindness-type">
                        <h4 class="type-title">{{ type.label }}</h4>
                        <div class="type-preview">
                          <div
                              v-for="(color, cIndex) in colorPalette"
                              :key="`${type.value}-${cIndex}`"
                              class="blindness-color-sample"
                              :style="{ backgroundColor: simulateColorBlindness(color, type.value) }"
                          ></div>
                        </div>
                      </div>
                    </n-grid-item>
                  </n-grid>
                </div>
              </div>
            </div>
            <div v-else class="accessibility-disabled">
              <div class="feature-notice">
                <icon-font type="icon-accessibility" :size="48" color="var(--text-color-disabled)" />
                <p>请在顶部工具栏启用"辅助检查"功能查看无障碍分析</p>
                <n-button @click="showAccessibility = true">启用辅助检查</n-button>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="gradient" tab="渐变工具">
            <div class="gradient-tool">
              <div class="gradient-creator">
                <div class="gradient-preview" :style="{ background: gradientPreview }"></div>
                <div class="gradient-controls">
                  <div class="gradient-type-selector">
                    <n-radio-group v-model:value="gradientType" size="small">
                      <n-radio-button value="linear">线性渐变</n-radio-button>
                      <n-radio-button value="radial">径向渐变</n-radio-button>
                      <n-radio-button value="conic">锥形渐变</n-radio-button>
                    </n-radio-group>
                  </div>

                  <div class="gradient-angle-slider" v-if="gradientType === 'linear'">
                    <span class="slider-label">角度: {{ gradientAngle }}°</span>
                    <n-slider v-model:value="gradientAngle" :min="0" :max="360" :step="1" />
                  </div>

                  <div class="gradient-stops">
                    <div
                        v-for="(stop, index) in gradientStops"
                        :key="index"
                        class="gradient-stop"
                        :style="{ left: `${stop.position}%` }"
                    >
                      <div
                          class="stop-handle"
                          :style="{ backgroundColor: stop.color }"
                          @mousedown="startDragStop(index, $event)"
                      ></div>
                      <n-button
                          v-if="gradientStops.length > 2"
                          quaternary
                          circle
                          size="tiny"
                          class="stop-remove"
                          @click="removeGradientStop(index)"
                      >
                        <icon-font type="icon-close" :size="10" />
                      </n-button>
                    </div>
                  </div>

                  <div class="gradient-stop-controls">
                    <n-button size="small" @click="addGradientStop">添加色标</n-button>
                    <n-button size="small" @click="applyPaletteToGradient">使用配色方案</n-button>
                    <n-button size="small" type="primary" @click="copyGradientCSS">复制CSS</n-button>
                  </div>
                </div>
              </div>

              <div class="gradient-presets">
                <h3 class="tool-subtitle">渐变预设</h3>
                <div class="preset-grid">
                  <div
                      v-for="(preset, index) in gradientPresets"
                      :key="index"
                      class="gradient-preset"
                      :style="{ background: preset.value }"
                      @click="applyGradientPreset(preset)"
                  >
                    <div class="preset-label">{{ preset.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="palettes" tab="我的方案">
            <div class="saved-palettes">
              <div class="palettes-header">
                <h3 class="tool-subtitle">已保存的配色方案</h3>
                <n-button size="small" @click="savePalette">
                  <template #icon>
                    <icon-font type="icon-save" :size="14" />
                  </template>
                  保存当前方案
                </n-button>
              </div>

              <div v-if="savedPalettes.length === 0" class="empty-palettes">
                <icon-font type="icon-empty" :size="48" color="var(--text-color-disabled)" />
                <p>暂无保存的配色方案</p>
                <n-button @click="savePalette">保存当前方案</n-button>
              </div>

              <div v-else class="palettes-grid">
                <div
                    v-for="(palette, index) in savedPalettes"
                    :key="index"
                    class="saved-palette"
                >
                  <div class="palette-preview">
                    <div
                        v-for="(color, cIndex) in palette.colors"
                        :key="`${index}-${cIndex}`"
                        class="palette-color"
                        :style="{ backgroundColor: color }"
                    ></div>
                  </div>

                  <div class="palette-info">
                    <div class="palette-name">{{ palette.name }}</div>
                    <div class="palette-date">{{ palette.date }}</div>
                  </div>

                  <div class="palette-actions">
                    <n-button quaternary circle size="small" @click="loadPalette(index)">
                      <icon-font type="icon-load" :size="14" />
                    </n-button>
                    <n-button quaternary circle size="small" @click="deletePalette(index)">
                      <icon-font type="icon-delete" :size="14" />
                    </n-button>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="export" tab="导出选项">
            <div class="export-options">
              <div class="export-format-selector">
                <h3 class="tool-subtitle">导出格式</h3>
                <n-radio-group v-model:value="exportFormat" size="medium">
                  <n-space>
                    <n-radio-button value="css">CSS 变量</n-radio-button>
                    <n-radio-button value="sass">SASS/SCSS</n-radio-button>
                    <n-radio-button value="tailwind">Tailwind 配置</n-radio-button>
                    <n-radio-button value="json">JSON</n-radio-button>
                    <n-radio-button value="image">PNG 图片</n-radio-button>
                  </n-space>
                </n-radio-group>
              </div>

              <div class="export-preview">
                <div class="preview-header">
                  <h3 class="preview-title">导出预览</h3>
                  <n-button size="small" @click="copyExportCode">
                    <template #icon>
                      <icon-font type="icon-copy" :size="14" />
                    </template>
                    复制代码
                  </n-button>
                </div>

                <div class="code-preview">
                  <pre><code>{{ exportPreviewCode }}</code></pre>
                </div>

                <div class="export-actions">
                  <n-button type="primary" @click="downloadExport">
                    <template #icon>
                      <icon-font type="icon-download" :size="16" />
                    </template>
                    下载文件
                  </n-button>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <!-- 名称输入弹窗 -->
    <n-modal v-model:show="showNameInput" preset="dialog" title="保存配色方案">
      <template #content>
        <n-input v-model:value="paletteName" placeholder="输入配色方案名称" />
      </template>
      <template #action>
        <n-button @click="showNameInput = false">取消</n-button>
        <n-button type="primary" @click="confirmSavePalette">保存</n-button>
      </template>
    </n-modal>

    <template #help-content>
      <div class="help-content">
        <h4>配色方案生成器使用指南</h4>
        <p>本工具帮助您创建和管理专业级的配色方案，适用于网站设计、应用程序界面、品牌设计等多种场景。</p>

        <h5>基本使用</h5>
        <ol>
          <li>使用颜色轮或直接输入色值来选择主色调</li>
          <li>选择适当的色彩模式和和谐规则</li>
          <li>点击"生成方案"按钮创建完整的配色方案</li>
          <li>调整个别颜色或锁定喜欢的颜色</li>
          <li>导出或保存您的配色方案</li>
        </ol>

        <h5>色彩模式</h5>
        <ul>
          <li><strong>单色系统</strong>：基于单一色相的明暗变化</li>
          <li><strong>类似色</strong>：使用邻近色相的颜色组合</li>
          <li><strong>互补色</strong>：使用色环上相对的颜色</li>
          <li><strong>三点式</strong>：选择色环上均匀分布的三种颜色</li>
          <li><strong>四点式</strong>：选择色环上均匀分布的四种颜色</li>
        </ul>

        <h5>特殊功能</h5>
        <ul>
          <li><strong>色阶生成</strong>：为每个颜色生成不同明暗度的变体</li>
          <li><strong>无障碍检查</strong>：分析颜色对比度，确保符合WCAG标准</li>
          <li><strong>色盲模拟</strong>：预览不同类型色盲人士看到的效果</li>
          <li><strong>渐变工具</strong>：基于您的方案创建复杂的渐变效果</li>
          <li><strong>多格式导出</strong>：支持CSS变量、SASS、Tailwind配置等多种格式</li>
        </ul>

        <h5>快捷键</h5>
        <ul>
          <li><strong>空格键</strong>：随机生成新的配色方案</li>
          <li><strong>S键</strong>：保存当前配色方案</li>
          <li><strong>C键</strong>：复制当前选中的颜色</li>
          <li><strong>L键</strong>：锁定/解锁当前选中的颜色</li>
        </ul>

        <h5>小提示</h5>
        <ul>
          <li>锁定喜欢的颜色后再随机生成，可以保留锁定的颜色不变</li>
          <li>尝试不同的和谐规则，找到最适合您项目的配色方案</li>
          <li>使用无障碍检查确保您的配色方案对所有用户友好</li>
          <li>右侧的色阶可以帮助您为UI设计选择适当的明暗变化</li>
        </ul>
      </div>
    </template>
  </base-tool-detail>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useMessage } from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';
import BaseToolDetail from '@/components/tools/BaseToolDetail.vue';

const message = useMessage();
const colorWheel = ref(null);

// 颜色选择器状态
const primaryColor = ref('#6366f1'); // 默认主色为品牌蓝色
const brightness = ref(50);
const selectorPosition = ref({ x: 150, y: 150 }); // 默认位置
const colorFormat = ref('hex');
const colorValues = ref({
  hex: '6366f1',
  rgb: { r: 99, g: 102, b: 241 },
  hsl: { h: 239, s: 84, l: 67 }
});

// 配色方案状态
const colorMode = ref('analogous');
const harmonyRule = ref('60-30-10');
const paletteSize = ref(5);
const colorPalette = ref(['#6366f1', '#818cf8', '#4f46e5', '#7c3aed', '#a855f7']);
const lockedColors = ref([false, false, false, false, false]);
const showVariants = ref(true);
const showColorCodes = ref(true);

// 辅助工具状态
const activeToolTab = ref('accessibility');
const showAccessibility = ref(false);
const contrastTextColors = ref({
  light: '#ffffff',
  dark: '#1f2937'
});

// 渐变工具状态
const gradientType = ref('linear');
const gradientAngle = ref(90);
const gradientStops = ref([
  { color: '#6366f1', position: 0 },
  { color: '#a855f7', position: 100 }
]);
const activeDragStop = ref(null);

// 保存的配色方案
const savedPalettes = ref([
  {
    name: '品牌蓝紫',
    colors: ['#6366f1', '#818cf8', '#4f46e5', '#7c3aed', '#a855f7'],
    date: '2023-04-15'
  },
  {
    name: '自然绿色',
    colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
    date: '2023-04-10'
  },
  {
    name: '温暖橙色',
    colors: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
    date: '2023-04-05'
  }
]);

// 导出选项
const exportFormat = ref('css');
const showNameInput = ref(false);
const paletteName = ref('我的配色方案');

// 选项数据
const colorModeOptions = [
  { label: '单色系统', value: 'monochromatic' },
  { label: '类似色', value: 'analogous' },
  { label: '互补色', value: 'complementary' },
  { label: '三点式', value: 'triadic' },
  { label: '四点式', value: 'tetradic' }
];

const harmonyRuleOptions = [
  { label: '60-30-10比例', value: '60-30-10' },
  { label: '黄金比例', value: 'golden-ratio' },
  { label: '等分布', value: 'equal' }
];

const paletteSizeOptions = [
  { label: '3色', value: 3 },
  { label: '5色', value: 5 },
  { label: '7色', value: 7 }
];

const colorBlindnessTypes = [
  { label: '正常视觉', value: 'normal' },
  { label: '红色盲 (Protanopia)', value: 'protanopia' },
  { label: '绿色盲 (Deuteranopia)', value: 'deuteranopia' },
  { label: '蓝色盲 (Tritanopia)', value: 'tritanopia' },
  { label: '全色盲 (Achromatopsia)', value: 'achromatopsia' },
  { label: '非典型色盲 (Anomalous)', value: 'anomalous' }
];

const gradientPresets = [
  { label: '蓝紫渐变', value: 'linear-gradient(45deg, #6366f1, #a855f7)' },
  { label: '日落', value: 'linear-gradient(to right, #ff7e5f, #feb47b)' },
  { label: '青柠水', value: 'linear-gradient(to right, #43cea2, #185a9d)' },
  { label: '粉色天空', value: 'linear-gradient(to top, #fbc2eb, #a6c1ee)' },
  { label: '霓虹灯', value: 'linear-gradient(to right, #ff00cc, #333399)' },
  { label: '橙红', value: 'linear-gradient(135deg, #ff8177, #b12a5b)' },
  { label: '海洋', value: 'radial-gradient(circle, #209cff, #68e0cf)' },
  { label: '森林', value: 'linear-gradient(to bottom, #134e5e, #71b280)' }
];

// 计算属性
const gradientPreview = computed(() => {
  if (gradientType.value === 'linear') {
    const stopsString = gradientStops.value
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');
    return `linear-gradient(${gradientAngle.value}deg, ${stopsString})`;
  } else if (gradientType.value === 'radial') {
    const stopsString = gradientStops.value
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');
    return `radial-gradient(circle, ${stopsString})`;
  } else if (gradientType.value === 'conic') {
    const stopsString = gradientStops.value
        .map(stop => `${stop.color} ${stop.position * 3.6}deg`)
        .join(', ');
    return `conic-gradient(from 0deg, ${stopsString})`;
  }
});

const exportPreviewCode = computed(() => {
  switch (exportFormat.value) {
    case 'css':
      return generateCSSVariables();
    case 'sass':
      return generateSassVariables();
    case 'tailwind':
      return generateTailwindConfig();
    case 'json':
      return generateJSONFormat();
    default:
      return 'Select an export format to see preview';
  }
});

// 方法
// 颜色选择与转换方法
const updatePrimaryColor = () => {
  // 这里应该根据色轮选择和亮度调整更新主色
  // 简化版实现：仅根据HSL值的L调整
  const { h, s } = colorValues.value.hsl;
  const l = brightness.value;
  colorValues.value.hsl.l = l;

  // 更新HSL颜色并转换到其他格式
  const rgbColor = hslToRgb(h, s, l);
  colorValues.value.rgb = rgbColor;
  colorValues.value.hex = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
  primaryColor.value = `#${colorValues.value.hex}`;

  // 如果不是锁定的颜色，则根据新的主色更新配色方案
  if (!lockedColors.value.some(locked => locked)) {
    generateScheme();
  }
};

const updateFromHex = () => {
  const hex = colorValues.value.hex.replace('#', '');
  const rgb = hexToRgb(hex);
  colorValues.value.rgb = rgb;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  colorValues.value.hsl = hsl;
  brightness.value = hsl.l;
  primaryColor.value = `#${hex}`;

  // 更新选择器位置（简化版）
  updateSelectorPosition(hsl.h, hsl.s);
};

const updateFromRGB = () => {
  const { r, g, b } = colorValues.value.rgb;
  colorValues.value.hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  colorValues.value.hsl = hsl;
  brightness.value = hsl.l;
  primaryColor.value = `#${colorValues.value.hex}`;

  // 更新选择器位置
  updateSelectorPosition(hsl.h, hsl.s);
};

const updateFromHSL = () => {
  const { h, s, l } = colorValues.value.hsl;
  const rgb = hslToRgb(h, s, l);
  colorValues.value.rgb = rgb;
  colorValues.value.hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  brightness.value = l;
  primaryColor.value = `#${colorValues.value.hex}`;

  // 更新选择器位置
  updateSelectorPosition(h, s);
};

const updateSelectorPosition = (h, s) => {
  // 这是一个简化实现，实际应该根据颜色轮的尺寸和形状计算
  const radius = 150 * (s / 100);
  const angle = (h * Math.PI) / 180;
  const x = 150 + radius * Math.cos(angle);
  const y = 150 - radius * Math.sin(angle);
  selectorPosition.value = { x, y };
};

// 颜色方案生成方法
const generateScheme = () => {
  const { h, s, l } = colorValues.value.hsl;
  let newPalette = [];

  switch (colorMode.value) {
    case 'monochromatic':
      newPalette = generateMonochromaticScheme(h, s, l);
      break;
    case 'analogous':
      newPalette = generateAnalogousScheme(h, s, l);
      break;
    case 'complementary':
      newPalette = generateComplementaryScheme(h, s, l);
      break;
    case 'triadic':
      newPalette = generateTriadicScheme(h, s, l);
      break;
    case 'tetradic':
      newPalette = generateTetradicScheme(h, s, l);
      break;
  }

  // 调整数组大小以匹配所需的调色板大小
  newPalette = resizePalette(newPalette, paletteSize.value);

  // 保留锁定的颜色
  const updatedPalette = newPalette.map((color, index) => {
    return lockedColors.value[index] ? colorPalette.value[index] : color;
  });

  colorPalette.value = updatedPalette;
  // message.success('配色方案已生成');
};

const randomizeColors = () => {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.floor(Math.random() * 30); // 70-100 范围
  const l = 50 + Math.floor(Math.random() * 20); // 50-70 范围

  // 更新主色
  colorValues.value.hsl = { h, s, l };
  updateFromHSL();

  // 生成配色方案
  generateScheme();
};

const generateMonochromaticScheme = (h, s, l) => {
  // 生成在相同色相上不同亮度的颜色
  const colors = [];
  const baseL = Math.min(Math.max(l, 30), 70); // 确保基本亮度适中

  colors.push(hslToHexColor(h, s, baseL));
  colors.push(hslToHexColor(h, s, Math.min(baseL + 15, 95)));
  colors.push(hslToHexColor(h, s, Math.max(baseL - 15, 15)));
  colors.push(hslToHexColor(h, s - 20, baseL + 5));
  colors.push(hslToHexColor(h, s + 10, baseL - 5));
  colors.push(hslToHexColor(h, s - 10, baseL + 20));
  colors.push(hslToHexColor(h, s + 20, baseL - 10));

  return colors;
};

const generateAnalogousScheme = (h, s, l) => {
  // 生成在色轮上相邻的颜色
  const colors = [];

  colors.push(hslToHexColor(h, s, l)); // 主色
  colors.push(hslToHexColor((h + 30) % 360, s, l)); // +30度
  colors.push(hslToHexColor((h - 30 + 360) % 360, s, l)); // -30度
  colors.push(hslToHexColor((h + 60) % 360, s - 10, l + 5)); // +60度
  colors.push(hslToHexColor((h - 60 + 360) % 360, s - 10, l + 5)); // -60度
  colors.push(hslToHexColor((h + 15) % 360, s + 5, l - 10)); // +15度
  colors.push(hslToHexColor((h - 15 + 360) % 360, s + 5, l - 10)); // -15度

  return colors;
};

const generateComplementaryScheme = (h, s, l) => {
  // 生成互补色方案
  const complementaryH = (h + 180) % 360;
  const colors = [];

  colors.push(hslToHexColor(h, s, l)); // 主色
  colors.push(hslToHexColor(complementaryH, s, l)); // 互补色
  colors.push(hslToHexColor(h, s - 15, l + 10)); // 主色变体1
  colors.push(hslToHexColor(complementaryH, s - 15, l + 10)); // 互补色变体1
  colors.push(hslToHexColor(h, s + 10, l - 10)); // 主色变体2
  colors.push(hslToHexColor(complementaryH, s + 10, l - 10)); // 互补色变体2
  colors.push(hslToHexColor((h + 210) % 360, s - 20, l + 15)); // 额外色

  return colors;
};

const generateTriadicScheme = (h, s, l) => {
  // 三点式配色，在色轮上均匀分布三个颜色
  const colors = [];
  const h2 = (h + 120) % 360;
  const h3 = (h + 240) % 360;

  colors.push(hslToHexColor(h, s, l)); // 主色
  colors.push(hslToHexColor(h2, s, l)); // +120度
  colors.push(hslToHexColor(h3, s, l)); // +240度
  colors.push(hslToHexColor(h, s - 15, l + 15)); // 主色变体
  colors.push(hslToHexColor(h2, s - 10, l + 10)); // 第二色变体
  colors.push(hslToHexColor(h3, s - 10, l + 10)); // 第三色变体
  colors.push(hslToHexColor(h, s + 10, l - 15)); // 主色暗变体

  return colors;
};

const generateTetradicScheme = (h, s, l) => {
  // 四点式配色，在色轮上均匀分布四个颜色
  const colors = [];
  const h2 = (h + 90) % 360;
  const h3 = (h + 180) % 360;
  const h4 = (h + 270) % 360;

  colors.push(hslToHexColor(h, s, l)); // 主色
  colors.push(hslToHexColor(h2, s - 10, l)); // +90度
  colors.push(hslToHexColor(h3, s - 5, l + 5)); // +180度
  colors.push(hslToHexColor(h4, s - 10, l + 5)); // +270度
  colors.push(hslToHexColor(h, s + 10, l - 10)); // 主色变体
  colors.push(hslToHexColor(h2, s, l - 5)); // 第二色变体
  colors.push(hslToHexColor(h3, s + 5, l - 10)); // 第三色变体

  return colors;
};

const resizePalette = (palette, size) => {
  if (palette.length === size) {
    return palette;
  } else if (palette.length > size) {
    return palette.slice(0, size);
  } else {
    // 如果调色板太小，添加更多颜色（这里简单复制现有颜色）
    const extraColors = [];
    while (palette.length + extraColors.length < size) {
      const idx = extraColors.length % palette.length;
      extraColors.push(palette[idx]);
    }
    return [...palette, ...extraColors];
  }
};

// 颜色变体和操作方法
const generateVariants = (color, count) => {
  const variants = [];
  const rgb = hexToRgb(color.replace('#', ''));
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 生成从浅到深的变体
  const step = Math.min(90, 100 - hsl.l) / (count - 1);

  for (let i = 0; i < count; i++) {
    const variantL = hsl.l + step * i;
    variants.push(hslToHexColor(hsl.h, hsl.s, Math.min(variantL, 95)));
  }

  return variants;
};

const toggleLockColor = (index) => {
  lockedColors.value[index] = !lockedColors.value[index];
  message.success(lockedColors.value[index] ? '颜色已锁定' : '颜色已解锁');
};

const copyColor = (color) => {
  navigator.clipboard.writeText(color)
      .then(() => {
        message.success(`颜色 ${color} 已复制到剪贴板`);
      })
      .catch(() => {
        message.error('复制失败');
      });
};

const selectVariant = (paletteIndex, variantColor) => {
  colorPalette.value[paletteIndex] = variantColor;
  message.success('颜色变体已应用');
};

// 辅助工具方法
const checkContrast = (bgColor, textColor, size) => {
  const ratio = getContrastRatio(bgColor, textColor);
  if (size === 'large') {
    return ratio >= 3; // WCAG AA 大文本标准
  } else {
    return ratio >= 4.5; // WCAG AA 标准文本标准
  }
};

const getContrastRatio = (bgColor, textColor) => {
  const bg = hexToRgb(bgColor.replace('#', ''));
  const text = hexToRgb(textColor.replace('#', ''));

  // 计算相对亮度
  const bgLuminance = calculateLuminance(bg.r, bg.g, bg.b);
  const textLuminance = calculateLuminance(text.r, text.g, text.b);

  // 计算对比度
  const brightest = Math.max(bgLuminance, textLuminance);
  const darkest = Math.min(bgLuminance, textLuminance);

  return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
};

const calculateLuminance = (r, g, b) => {
  // sRGB 颜色空间的相对亮度计算
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastClass = (bgColor, textColor) => {
  const ratio = parseFloat(getContrastRatio(bgColor, textColor));
  if (ratio >= 7) return 'aaa';
  if (ratio >= 4.5) return 'aa';
  if (ratio >= 3) return 'aa-large';
  return 'fail';
};

const getContrastLabel = (bgColor, textColor) => {
  const ratio = parseFloat(getContrastRatio(bgColor, textColor));
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA大文本';
  return '不合格';
};

const simulateColorBlindness = (color, type) => {
  // 这是一个简化的色盲模拟实现
  // 在实际应用中，应该使用更准确的色盲模拟算法
  const rgb = hexToRgb(color.replace('#', ''));

  switch (type) {
    case 'protanopia': // 红色盲
      return rgbToHexColor(
          rgb.r * 0.567 + rgb.g * 0.433 + rgb.b * 0,
          rgb.r * 0.558 + rgb.g * 0.442 + rgb.b * 0,
          rgb.r * 0 + rgb.g * 0.242 + rgb.b * 0.758
      );
    case 'deuteranopia': // 绿色盲
      return rgbToHexColor(
          rgb.r * 0.625 + rgb.g * 0.375 + rgb.b * 0,
          rgb.r * 0.7 + rgb.g * 0.3 + rgb.b * 0,
          rgb.r * 0 + rgb.g * 0.3 + rgb.b * 0.7
      );
    case 'tritanopia': // 蓝色盲
      return rgbToHexColor(
          rgb.r * 0.95 + rgb.g * 0.05 + rgb.b * 0,
          rgb.r * 0 + rgb.g * 0.433 + rgb.b * 0.567,
          rgb.r * 0 + rgb.g * 0.475 + rgb.b * 0.525
      );
    case 'achromatopsia': // 全色盲
      const avg = (rgb.r + rgb.g + rgb.b) / 3;
      return rgbToHexColor(avg, avg, avg);
    case 'anomalous':
      return rgbToHexColor(
          rgb.r * 0.8 + rgb.g * 0.2 + rgb.b * 0,
          rgb.r * 0.25 + rgb.g * 0.7 + rgb.b * 0.05,
          rgb.r * 0 + rgb.g * 0.1 + rgb.b * 0.9
      );
    default:
      return color; // 正常视觉
  }
};

// 渐变工具方法
const startDragStop = (index, event) => {
  activeDragStop.value = index;
  document.addEventListener('mousemove', moveGradientStop);
  document.addEventListener('mouseup', stopDragStop);
  event.preventDefault();
};

const moveGradientStop = (event) => {
  if (activeDragStop.value === null) return;

  // 计算相对于渐变轨道的位置
  const trackRect = document.querySelector('.gradient-stops').getBoundingClientRect();
  const newPosition = ((event.clientX - trackRect.left) / trackRect.width) * 100;

  // 限制在0-100范围内
  const clampedPosition = Math.max(0, Math.min(100, newPosition));

  // 更新位置
  gradientStops.value[activeDragStop.value].position = clampedPosition;

  // 按位置排序色标
  gradientStops.value.sort((a, b) => a.position - b.position);

  // 更新activeDragStop为当前色标在排序后的索引
  const currentColor = gradientStops.value[activeDragStop.value].color;
  activeDragStop.value = gradientStops.value.findIndex(stop => stop.color === currentColor);
};

const stopDragStop = () => {
  activeDragStop.value = null;
  document.removeEventListener('mousemove', moveGradientStop);
  document.removeEventListener('mouseup', stopDragStop);
};

const addGradientStop = () => {
  if (gradientStops.value.length >= 10) {
    message.warning('最多只能添加10个色标');
    return;
  }

  // 找到两个色标之间的中点
  const stops = [...gradientStops.value].sort((a, b) => a.position - b.position);
  let targetPosition = 50;
  let targetColor = '#ffffff';

  if (stops.length >= 2) {
    // 找到最大间隔
    let maxGap = 0;
    let gapIndex = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const gap = stops[i + 1].position - stops[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        gapIndex = i;
      }
    }

    targetPosition = stops[gapIndex].position + maxGap / 2;

    // 计算在这两个颜色之间混合的颜色
    const startRgb = hexToRgb(stops[gapIndex].color.replace('#', ''));
    const endRgb = hexToRgb(stops[gapIndex + 1].color.replace('#', ''));

    const blendFactor = 0.5;
    const blendedRgb = {
      r: Math.round(startRgb.r * (1 - blendFactor) + endRgb.r * blendFactor),
      g: Math.round(startRgb.g * (1 - blendFactor) + endRgb.g * blendFactor),
      b: Math.round(startRgb.b * (1 - blendFactor) + endRgb.b * blendFactor)
    };

    targetColor = rgbToHexColor(blendedRgb.r, blendedRgb.g, blendedRgb.b);
  }

  gradientStops.value.push({
    color: targetColor,
    position: targetPosition
  });

  message.success('已添加新色标');
};

const removeGradientStop = (index) => {
  if (gradientStops.value.length <= 2) {
    message.warning('至少需要保留两个色标');
    return;
  }

  gradientStops.value.splice(index, 1);
  message.success('已移除色标');
};

const applyPaletteToGradient = () => {
  if (colorPalette.value.length < 2) {
    message.warning('配色方案需要至少两种颜色');
    return;
  }

  // 根据配色方案创建新的渐变色标
  const newStops = [];
  const colors = [...colorPalette.value];

  for (let i = 0; i < colors.length; i++) {
    newStops.push({
      color: colors[i],
      position: (i / (colors.length - 1)) * 100
    });
  }

  gradientStops.value = newStops;
  message.success('已应用配色方案到渐变');
};

const copyGradientCSS = () => {
  const cssText = `background: ${gradientPreview.value};`;
  navigator.clipboard.writeText(cssText)
      .then(() => {
        message.success('CSS已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 配色方案管理方法
const savePalette = () => {
  showNameInput.value = true;
};

const confirmSavePalette = () => {
  if (!paletteName.value.trim()) {
    message.warning('请输入配色方案名称');
    return;
  }

  const now = new Date();
  const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  savedPalettes.value.unshift({
    name: paletteName.value,
    colors: [...colorPalette.value],
    date: dateString
  });

  showNameInput.value = false;
  paletteName.value = '我的配色方案';
  message.success('配色方案已保存');

  // 切换到我的方案标签
  activeToolTab.value = 'palettes';
};

const loadPalette = (index) => {
  colorPalette.value = [...savedPalettes.value[index].colors];

  // 更新主色为调色板的第一个颜色
  const mainColor = colorPalette.value[0];
  primaryColor.value = mainColor;
  const rgb = hexToRgb(mainColor.replace('#', ''));
  colorValues.value.rgb = rgb;
  colorValues.value.hex = mainColor.replace('#', '');
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  colorValues.value.hsl = hsl;
  brightness.value = hsl.l;

  // 更新选择器位置
  updateSelectorPosition(hsl.h, hsl.s);

  // 重置锁定状态
  lockedColors.value = Array(colorPalette.value.length).fill(false);

  message.success(`已加载配色方案: ${savedPalettes.value[index].name}`);
};

const deletePalette = (index) => {
  savedPalettes.value.splice(index, 1);
  message.success('配色方案已删除');
};

// 导出功能
const copyScheme = () => {
  const colorsText = colorPalette.value.join(', ');
  navigator.clipboard.writeText(colorsText)
      .then(() => {
        message.success('配色方案已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

const exportScheme = () => {
  activeToolTab.value = 'export';
};

const clearScheme = () => {
  // 重置锁定状态
  lockedColors.value = Array(colorPalette.value.length).fill(false);
  randomizeColors();
};

// 模板加载方法
const loadTemplate = (type) => {
  switch (type) {
    case 'material':
      colorPalette.value = ['#6200ee', '#03dac6', '#b00020', '#3700b3', '#018786'];
      break;
    case 'colorful':
      colorPalette.value = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0'];
      break;
    case 'pastel':
      colorPalette.value = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff'];
      break;
  }

  // 更新主色为调色板的第一个颜色
  updatePrimaryFromPalette();

  message.success(`已加载${type === 'material' ? 'Material Design' : type === 'colorful' ? '活力多彩' : '柔和渐变'}模板`);
};

const updatePrimaryFromPalette = () => {
  const mainColor = colorPalette.value[0];
  primaryColor.value = mainColor;
  const rgb = hexToRgb(mainColor.replace('#', ''));
  colorValues.value.rgb = rgb;
  colorValues.value.hex = mainColor.replace('#', '');
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  colorValues.value.hsl = hsl;
  brightness.value = hsl.l;

  // 更新选择器位置
  updateSelectorPosition(hsl.h, hsl.s);
};

// 导出格式生成方法
const generateCSSVariables = () => {
  let css = ':root {\n';

  colorPalette.value.forEach((color, index) => {
    css += `  --color-${index + 1}: ${color};\n`;

    if (showVariants) {
      const variants = generateVariants(color, 5);
      variants.forEach((variant, vIndex) => {
        css += `  --color-${index + 1}-${(vIndex + 1) * 100}: ${variant};\n`;
      });
    }
  });

  css += '}\n\n';
  css += '/* 使用示例 */\n';
  css += '.primary-bg { background-color: var(--color-1); }\n';
  css += '.accent-bg { background-color: var(--color-2); }\n';
  css += '.text-primary { color: var(--color-3); }\n';

  return css;
};

const generateSassVariables = () => {
  let sass = '// 主色变量\n';

  colorPalette.value.forEach((color, index) => {
    sass += `$color-${index + 1}: ${color};\n`;
  });

  if (showVariants) {
    sass += '\n// 色阶变量\n';
    colorPalette.value.forEach((color, index) => {
      const variants = generateVariants(color, 5);
      variants.forEach((variant, vIndex) => {
        sass += `$color-${index + 1}-${(vIndex + 1) * 100}: ${variant};\n`;
      });
    });
  }

  sass += '\n// 混合器\n';
  sass += '@mixin with-theme($property) {\n';
  sass += '  #{$property}: $color-1;\n';
  sass += '  .dark-theme & {\n';
  sass += '    #{$property}: $color-3;\n';
  sass += '  }\n';
  sass += '}\n\n';
  sass += '// 使用示例\n';
  sass += '.button {\n';
  sass += '  @include with-theme(background-color);\n';
  sass += '  color: $color-2;\n';
  sass += '}\n';

  return sass;
};

const generateTailwindConfig = () => {
  let tailwind = '// tailwind.config.js\n';
  tailwind += 'module.exports = {\n';
  tailwind += '  theme: {\n';
  tailwind += '    extend: {\n';
  tailwind += '      colors: {\n';

  colorPalette.value.forEach((color, index) => {
    const name = index === 0 ? 'primary' :
        index === 1 ? 'secondary' :
            index === 2 ? 'accent' :
                index === 3 ? 'neutral' : `custom${index}`;

    if (showVariants) {
      const variants = generateVariants(color, 5);
      tailwind += `        ${name}: {\n`;
      tailwind += `          DEFAULT: '${color}',\n`;
      variants.forEach((variant, vIndex) => {
        tailwind += `          '${(vIndex + 1) * 100}': '${variant}'${vIndex === 4 ? '' : ','}\n`;
      });
      tailwind += '        },\n';
    } else {
      tailwind += `        ${name}: '${color}',\n`;
    }
  });

  tailwind += '      }\n';
  tailwind += '    }\n';
  tailwind += '  }\n';
  tailwind += '};\n\n';
  tailwind += '// 使用示例: bg-primary text-secondary hover:bg-primary-200';

  return tailwind;
};

const generateJSONFormat = () => {
  const result = {
    palette: colorPalette.value.map((color, index) => {
      const obj = { color };

      if (showVariants) {
        obj.variants = generateVariants(color, 5).reduce((acc, variant, vIndex) => {
          acc[`${(vIndex + 1) * 100}`] = variant;
          return acc;
        }, {});
      }

      return obj;
    })
  };

  return JSON.stringify(result, null, 2);
};

const copyExportCode = () => {
  navigator.clipboard.writeText(exportPreviewCode.value)
      .then(() => {
        message.success('代码已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
};

const downloadExport = () => {
  let filename = `color-scheme-${paletteName.value.replace(/\s+/g, '-').toLowerCase()}`;
  let content = exportPreviewCode.value;
  let mimeType = 'text/plain';

  switch (exportFormat.value) {
    case 'css':
      filename += '.css';
      break;
    case 'sass':
      filename += '.scss';
      break;
    case 'tailwind':
      filename += '.tailwind.js';
      break;
    case 'json':
      filename += '.json';
      mimeType = 'application/json';
      break;
    case 'image':
      // 在实际应用中，这里应该生成一个图像文件
      // 下面是简化实现
      message.info('图片导出功能开发中');
      return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  message.success(`已下载 ${filename}`);
};

// 格式化颜色代码
const getFormattedColorCode = (color) => {
  switch (colorFormat.value) {
    case 'rgb':
      const rgb = hexToRgb(color.replace('#', ''));
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl':
      const rgb2 = hexToRgb(color.replace('#', ''));
      const hsl = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
      return `hsl(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    default:
      return color;
  }
};

// 颜色转换工具函数
function hexToRgb(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHexColor(r, g, b) {
  return '#' + rgbToHex(r, g, b);
}

function hslToHexColor(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return '#' + rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 无彩色
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 灰度
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// 键盘快捷键
const handleKeyDown = (e) => {
  // 不拦截输入框内的按键
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  switch (e.key) {
    case ' ': // 空格键
      e.preventDefault();
      randomizeColors();
      break;
    case 's':
    case 'S':
      e.preventDefault();
      savePalette();
      break;
    case 'c':
    case 'C':
      e.preventDefault();
      copyColor(primaryColor.value);
      break;
    case 'l':
    case 'L':
      e.preventDefault();
      toggleLockColor(0); // 锁定/解锁主色
      break;
  }
};

// 生命周期钩子
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);

  // 颜色轮的初始化通常在这里实现
  // 为简化起见，本示例不实现实际的交互式颜色轮

  // 生成初始配色方案
  generateScheme();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  // 停止渐变拖拽（如果正在进行）
  if (activeDragStop.value !== null) {
    document.removeEventListener('mousemove', moveGradientStop);
    document.removeEventListener('mouseup', stopDragStop);
  }
});

// 监听配色方案变化以更新渐变预设
watch([colorPalette], () => {
  // 如果渐变色标少于2个，自动添加
  if (gradientStops.value.length < 2) {
    gradientStops.value = [
      { color: colorPalette.value[0], position: 0 },
      { color: colorPalette.value[1] || '#ffffff', position: 100 }
    ];
  }
});
</script>

<style scoped>
.color-picker-container {
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

.mode-select {
  width: 130px;
}

.harmony-select {
  width: 130px;
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

/* 主色选择区域样式 */
.primary-color-section {
  padding: 20px;
  border-bottom: 1px solid var(--divider-color);
  background-color: var(--body-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker-panel {
  display: flex;
  gap: 24px;
  max-height: 300px;
}

.color-wheel-container {
  display: flex;
  gap: 16px;
}

.color-wheel {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
}

.color-wheel-placeholder {
  width: 100%;
  height: 100%;
  background: conic-gradient(
      red, yellow, lime, aqua, blue, magenta, red
  );
  border-radius: 50%;
}

.color-wheel-selector {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 300px;
}

.color-slider-label {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.brightness-slider {
  height: 270px;
}

.selected-color-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-color-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--divider-color);
}

.color-info-tabs {
  flex: 1;
}

.color-value-field {
  margin: 12px 0;
}

.rgb-fields, .hsl-fields {
  display: flex;
  gap: 12px;
  margin: 12px 0;
}

/* 色彩方案展示区域样式 */
.color-scheme-section {
  padding: 20px;
  border-bottom: 1px solid var(--divider-color);
  background-color: var(--card-color);
}

.color-scheme-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.scheme-switch {
  margin-right: 8px;
}

.palette-size-select {
  width: 90px;
}

.color-palette-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 4px;
}

.color-palette-item {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.color-palette-item.locked::after {
  content: '';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2h1zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>');
  background-size: contain;
  opacity: 0.8;
  pointer-events: none;
}

.color-box {
  height: 120px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.color-box:hover {
  transform: translateY(-4px);
}

.color-box-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
  gap: 4px;
}

.color-box:hover .color-box-actions {
  display: flex;
}

.color-code {
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.color-variants {
  display: flex;
  height: 30px;
  border-radius: 4px;
  overflow: hidden;
}

.color-variant {
  flex: 1;
  height: 100%;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-variant:hover {
  transform: translateY(-3px);
  z-index: 1;
}

.variant-code {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* 辅助工具区域样式 */
.color-tools-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--card-color);
}

.tool-subtitle {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: var(--text-color-base);
}

/* 无障碍检查样式 */
.accessibility-checker {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.accessibility-disabled {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.feature-notice {
  text-align: center;
  color: var(--text-color-tertiary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.text-contrast-check {
  margin-bottom: 24px;
}

.contrast-sample-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contrast-backgrounds {
  display: flex;
  gap: 16px;
}

.contrast-background {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contrast-text-samples {
  display: flex;
  justify-content: space-around;
}

.contrast-text-sample {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.text-sample {
  border-radius: 4px;
  padding: 4px 8px;
}

.text-sample.large {
  font-size: 24px;
  font-weight: bold;
}

.text-sample.small {
  font-size: 14px;
}

.text-sample.pass {
  outline: 1px solid rgba(39, 174, 96, 0.5);
}

.text-sample.fail {
  outline: 1px solid rgba(231, 76, 60, 0.5);
}

.contrast-ratio {
  font-size: 12px;
  margin-top: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.contrast-badge {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
  text-transform: uppercase;
}

.contrast-badge.aaa {
  background-color: #27ae60;
  color: white;
}

.contrast-badge.aa {
  background-color: #2ecc71;
  color: white;
}

.contrast-badge.aa-large {
  background-color: #f39c12;
  color: white;
}

.contrast-badge.fail {
  background-color: #e74c3c;
  color: white;
}

.color-blindness-preview {
  margin-top: 32px;
}

.color-blindness-types {
  margin-top: 16px;
}

.color-blindness-type {
  background-color: var(--body-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.type-title {
  font-size: 14px;
  margin: 0 0 12px 0;
  color: var(--text-color-base);
}

.type-preview {
  display: flex;
  gap: 4px;
  height: 30px;
  border-radius: 4px;
  overflow: hidden;
}

.blindness-color-sample {
  flex: 1;
  height: 100%;
}

/* 渐变工具样式 */
.gradient-tool {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.gradient-creator {
  margin-bottom: 24px;
  background-color: var(--body-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.gradient-preview {
  height: 150px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gradient-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.gradient-type-selector {
  margin-bottom: 12px;
}

.gradient-angle-slider {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slider-label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.gradient-stops {
  height: 24px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  margin: 16px 0;
  position: relative;
}

.gradient-stop {
  position: absolute;
  transform: translateX(-50%);
  top: -6px;
  width: 24px;
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stop-handle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: grab;
  transition: transform 0.2s ease;
}

.stop-handle:hover {
  transform: scale(1.1);
}

.stop-handle:active {
  cursor: grabbing;
}

.stop-remove {
  margin-top: 4px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.stop-remove:hover {
  opacity: 1;
}

.gradient-stop-controls {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.gradient-presets {
  margin-top: 32px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
}

.gradient-preset {
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.gradient-preset:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preset-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 12px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 我的方案部分样式 */
.saved-palettes {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.palettes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.empty-palettes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 0;
  color: var(--text-color-tertiary);
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.saved-palette {
  background-color: var(--body-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.saved-palette:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.palette-preview {
  height: 60px;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
}

.palette-color {
  flex: 1;
  height: 100%;
}

.palette-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.palette-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color-base);
}

.palette-date {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

.palette-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 导出选项部分样式 */
.export-options {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.export-format-selector {
  margin-bottom: 24px;
}

.export-preview {
  background-color: var(--body-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color-base);
}

.code-preview {
  background-color: var(--card-color);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.code-preview pre {
  margin: 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-color-base);
  white-space: pre-wrap;
}

.export-actions {
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }

  .toolbar-group {
    width: 100%;
    justify-content: space-between;
  }

  .primary-actions {
    flex-direction: column;
    gap: 8px;
  }

  .secondary-actions {
    justify-content: center;
    margin-top: 8px;
  }

  .color-picker-panel {
    flex-direction: column;
    gap: 16px;
  }

  .color-wheel-container {
    justify-content: center;
  }

  .color-wheel {
    width: 250px;
    height: 250px;
  }

  .color-scheme-section {
    padding: 12px;
  }

  .color-palette-container {
    flex-direction: column;
    gap: 8px;
  }

  .color-palette-item {
    min-width: auto;
  }

  .color-box {
    height: 80px;
  }

  .contrast-backgrounds {
    flex-direction: column;
  }

  .preset-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .palettes-grid {
    grid-template-columns: 1fr;
  }
}
</style>