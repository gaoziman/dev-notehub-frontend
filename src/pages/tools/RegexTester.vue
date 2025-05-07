<template>
  <base-tool-detail
      title="正则表达式测试器"
      description="测试、调试和优化正则表达式，提供直观的匹配结果展示和丰富的工具辅助"
      iconType="icon-regex"
      iconColor="var(--primary-color)"
  >
    <div class="regex-tester-container">
      <!-- 主界面区域 -->
      <div class="regex-main-area">
        <div class="regex-panel">
          <n-card title="正则表达式" size="small">
            <div class="regex-input-container">
              <n-input-group>
                <div class="regex-delimiter">/</div>
                <n-input
                    v-model:value="regexForm.pattern"
                    placeholder="输入正则表达式..."
                    @update:value="updateRegex"
                />
                <div class="regex-delimiter">/</div>
                <n-input
                    v-model:value="regexForm.flags"
                    placeholder="gmi"
                    style="width: 80px"
                    @update:value="updateRegex"
                />
              </n-input-group>
              <div class="regex-actions">
                <n-button-group>
                  <n-button type="primary" @click="testRegex">
                    <template #icon>
                      <icon-font type="icon-test" :size="16" />
                    </template>
                    测试
                  </n-button>
                  <n-dropdown trigger="hover" :options="regexTemplates" @select="selectTemplate">
                    <n-button>
                      <template #icon>
                        <icon-font type="icon-template" :size="16" />
                      </template>
                      模板
                    </n-button>
                  </n-dropdown>
                  <n-dropdown trigger="hover" :options="savedRegexOptions" @select="handleSavedRegex">
                    <n-button>
                      <template #icon>
                        <icon-font type="icon-history" :size="16" />
                      </template>
                      历史
                    </n-button>
                  </n-dropdown>
                </n-button-group>
              </div>
            </div>

            <div class="regex-options">
              <n-space>
                <n-checkbox v-model:checked="regexForm.realTime">
                  实时测试
                </n-checkbox>
                <n-checkbox v-model:checked="highlightMatches">
                  高亮匹配
                </n-checkbox>
                <n-checkbox v-model:checked="showGroups">
                  显示捕获组
                </n-checkbox>
              </n-space>

              <n-space>
                <n-tooltip trigger="hover" placement="bottom">
                  <template #trigger>
                    <n-button quaternary circle @click="copyRegex">
                      <icon-font type="icon-copy" :size="16" />
                    </n-button>
                  </template>
                  复制正则表达式
                </n-tooltip>
                <n-tooltip trigger="hover" placement="bottom">
                  <template #trigger>
                    <n-button quaternary circle @click="saveRegex">
                      <icon-font type="icon-save" :size="16" />
                    </n-button>
                  </template>
                  保存正则表达式
                </n-tooltip>
                <n-tooltip trigger="hover" placement="bottom">
                  <template #trigger>
                    <n-button quaternary circle @click="clearRegex">
                      <icon-font type="icon-clear" :size="16" />
                    </n-button>
                  </template>
                  清空
                </n-tooltip>
                <n-tooltip trigger="hover" placement="bottom">
                  <template #trigger>
                    <n-button quaternary circle @click="openRegexBuilder">
                      <icon-font type="icon-build" :size="16" />
                    </n-button>
                  </template>
                  可视化构建器
                </n-tooltip>
              </n-space>
            </div>

            <div v-if="regexValid && regexForm.pattern" class="regex-explanation">
              <n-alert title="正则表达式说明" type="info">
                <div class="explanation-content">
                  {{ regexExplanation }}
                </div>
              </n-alert>
            </div>

            <div v-if="regexError" class="regex-error">
              <n-alert title="错误" type="error">
                {{ regexError }}
              </n-alert>
            </div>
          </n-card>

          <n-card title="测试文本" size="small" class="mt-4">
            <div class="test-input-container">
              <n-input
                  v-model:value="regexForm.testString"
                  type="textarea"
                  placeholder="输入要测试的文本..."
                  :autosize="{ minRows: 6, maxRows: 10 }"
                  @update:value="updateRegex"
              />
            </div>
            <div class="test-actions">
              <n-space>
                <n-button-group>
                  <n-button @click="loadSampleText('email')">邮箱示例</n-button>
                  <n-button @click="loadSampleText('url')">URL示例</n-button>
                  <n-button @click="loadSampleText('json')">JSON示例</n-button>
                </n-button-group>
                <n-button-group>
                  <n-tooltip trigger="hover" placement="bottom">
                    <template #trigger>
                      <n-button @click="uploadTextFile">
                        <template #icon>
                          <icon-font type="icon-upload" :size="16" />
                        </template>
                        导入文件
                      </n-button>
                    </template>
                    上传文本文件作为测试文本
                  </n-tooltip>
                  <n-tooltip trigger="hover" placement="bottom">
                    <template #trigger>
                      <n-button @click="clearTestText">
                        <template #icon>
                          <icon-font type="icon-clear" :size="16" />
                        </template>
                        清空
                      </n-button>
                    </template>
                    清空测试文本
                  </n-tooltip>
                </n-button-group>
              </n-space>
            </div>
          </n-card>
        </div>

        <div class="results-panel mt-4">
          <n-card title="匹配结果" size="small">
            <template #header-extra>
              <n-statistic v-if="matches.length && regexValid" label="匹配数量" :value="matches.length" :show-separator="true" />
            </template>
            <n-tabs type="line" animated>
              <n-tab-pane name="highlighted" tab="高亮视图">
                <div v-if="regexValid && regexForm.pattern && regexForm.testString">
                  <div v-if="highlightMatches" class="highlighted-text" :class="{ 'dark-mode': isDarkMode }">
                    <div v-html="highlightedText"></div>
                  </div>
                  <n-empty v-if="!matches.length" description="无匹配结果" />
                </div>
                <n-empty v-else description="输入正则表达式和测试文本后查看匹配结果" />
              </n-tab-pane>

              <n-tab-pane name="details" tab="详细结果">
                <div v-if="regexValid && regexForm.pattern && regexForm.testString">
                  <n-empty v-if="!matches.length" description="无匹配结果" />
                  <div v-else class="match-results">
                    <n-collapse>
                      <n-collapse-item
                          v-for="(match, index) in matches"
                          :key="index"
                          :title="`匹配 #${index + 1}: ${match[0].substring(0, 50)}${match[0].length > 50 ? '...' : ''}`"
                      >
                        <div class="match-details">
                          <div class="match-content">
                            <div class="match-label">完整匹配:</div>
                            <n-code :code="match[0]" language="plaintext" show-line-numbers />
                          </div>

                          <div v-if="match.length > 1 && showGroups" class="match-groups">
                            <div class="match-label">捕获组:</div>
                            <div v-for="(group, groupIndex) in match.slice(1)" :key="`group-${groupIndex}`" class="match-group">
                              <n-tag type="info" size="small">组 {{ groupIndex + 1 }}</n-tag>
                              <n-code :code="group || '(空)'" language="plaintext" />
                            </div>
                          </div>

                          <div class="match-position">
                            <div class="match-label">匹配位置:</div>
                            <div class="match-position-info">
                              <n-tag type="success" size="small">
                                开始: {{ match.index }}
                              </n-tag>
                              <n-tag type="error" size="small">
                                结束: {{ match.index + match[0].length - 1 }}
                              </n-tag>
                              <n-tag type="warning" size="small">
                                长度: {{ match[0].length }}
                              </n-tag>
                            </div>
                          </div>

                          <div class="match-context">
                            <div class="match-label">上下文:</div>
                            <div class="match-context-text">
                              <span class="context-before">{{ getContextBefore(match.index, 30) }}</span>
                              <span class="context-match">{{ match[0] }}</span>
                              <span class="context-after">{{ getContextAfter(match.index + match[0].length, 30) }}</span>
                            </div>
                          </div>
                        </div>
                      </n-collapse-item>
                    </n-collapse>
                  </div>
                </div>
                <n-empty v-else description="输入正则表达式和测试文本后查看匹配结果" />
              </n-tab-pane>

              <n-tab-pane name="replace" tab="替换">
                <div class="replace-panel">
                  <n-form-item label="替换文本">
                    <n-input
                        v-model:value="replaceString"
                        placeholder="输入替换文本（可使用$1, $2等引用捕获组）..."
                        @update:value="performReplace"
                    />
                  </n-form-item>

                  <div class="replace-actions">
                    <n-button type="primary" @click="performReplace">
                      <template #icon>
                        <icon-font type="icon-replace" :size="16" />
                      </template>
                      替换
                    </n-button>
                    <n-button @click="replaceAll">
                      <template #icon>
                        <icon-font type="icon-replace-all" :size="16" />
                      </template>
                      全部替换
                    </n-button>
                  </div>

                  <div v-if="replacementResult" class="replacement-result">
                    <div class="replacement-header">
                      <div>替换结果:</div>
                      <n-space>
                        <n-button text type="primary" size="small" @click="copyReplacement">
                          <template #icon>
                            <icon-font type="icon-copy" :size="16" />
                          </template>
                          复制
                        </n-button>
                        <n-button text type="success" size="small" @click="applyReplacement">
                          <template #icon>
                            <icon-font type="icon-apply" :size="16" />
                          </template>
                          应用到测试文本
                        </n-button>
                      </n-space>
                    </div>
                    <n-code :code="replacementResult" language="plaintext" show-line-numbers />
                  </div>
                </div>
              </n-tab-pane>

              <n-tab-pane name="performance" tab="性能">
                <div class="performance-panel">
                  <n-card title="匹配性能" size="small">
                    <n-grid :cols="3" :x-gap="12">
                      <n-grid-item>
                        <n-statistic label="匹配耗时">
                          {{ performanceData.matchTime }}ms
                        </n-statistic>
                      </n-grid-item>
                      <n-grid-item>
                        <n-statistic label="处理字符数">
                          {{ regexForm.testString.length }}
                        </n-statistic>
                      </n-grid-item>
                      <n-grid-item>
                        <n-statistic label="每秒处理字符">
                          {{ performanceData.charsPerSecond }}
                        </n-statistic>
                      </n-grid-item>
                    </n-grid>

                    <div v-if="performanceData.backtrackingCount > 0" class="mt-4">
                      <n-alert title="性能提示" type="warning">
                        检测到可能的回溯问题，回溯次数: {{ performanceData.backtrackingCount }}。
                        考虑优化您的正则表达式以提高性能。
                      </n-alert>
                    </div>

                    <div v-if="performanceData.suggestions.length > 0" class="mt-4">
                      <n-collapse>
                        <n-collapse-item title="优化建议">
                          <n-list>
                            <n-list-item v-for="(suggestion, index) in performanceData.suggestions" :key="index">
                              {{ suggestion }}
                            </n-list-item>
                          </n-list>
                        </n-collapse-item>
                      </n-collapse>
                    </div>
                  </n-card>
                </div>
              </n-tab-pane>

              <n-tab-pane name="cheatsheet" tab="速查表">
                <div class="cheatsheet">
                  <n-card title="语法速查" size="small" class="mb-4">
                    <n-tabs type="segment">
                      <n-tab-pane name="basic" tab="基础语法">
                        <n-descriptions bordered size="small" :column="2" class="mt-2">
                          <n-descriptions-item label="字符匹配">
                            <n-space vertical>
                              <div><code>.</code> - 匹配任意字符（除换行符外）</div>
                              <div><code>\d</code> - 匹配数字 [0-9]</div>
                              <div><code>\D</code> - 匹配非数字</div>
                              <div><code>\w</code> - 匹配字母、数字、下划线 [A-Za-z0-9_]</div>
                              <div><code>\W</code> - 匹配非字母、数字、下划线</div>
                              <div><code>\s</code> - 匹配空白字符</div>
                              <div><code>\S</code> - 匹配非空白字符</div>
                            </n-space>
                          </n-descriptions-item>

                          <n-descriptions-item label="位置匹配">
                            <n-space vertical>
                              <div><code>^</code> - 匹配行首</div>
                              <div><code>$</code> - 匹配行尾</div>
                              <div><code>\b</code> - 匹配单词边界</div>
                              <div><code>\B</code> - 匹配非单词边界</div>
                            </n-space>
                          </n-descriptions-item>

                          <n-descriptions-item label="重复">
                            <n-space vertical>
                              <div><code>*</code> - 0次或多次</div>
                              <div><code>+</code> - 1次或多次</div>
                              <div><code>?</code> - 0次或1次</div>
                              <div><code>{n}</code> - 恰好n次</div>
                              <div><code>{n,}</code> - 至少n次</div>
                              <div><code>{n,m}</code> - n到m次</div>
                            </n-space>
                          </n-descriptions-item>

                          <n-descriptions-item label="字符集">
                            <n-space vertical>
                              <div><code>[abc]</code> - 匹配a、b或c</div>
                              <div><code>[^abc]</code> - 匹配除a、b和c之外的任何字符</div>
                              <div><code>[a-z]</code> - 匹配小写字母</div>
                              <div><code>[A-Z]</code> - 匹配大写字母</div>
                              <div><code>[0-9]</code> - 匹配数字</div>
                            </n-space>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-tab-pane>
                      <n-tab-pane name="advanced" tab="高级语法">
                        <n-descriptions bordered size="small" :column="2" class="mt-2">
                          <n-descriptions-item label="分组与捕获">
                            <n-space vertical>
                              <div><code>(expr)</code> - 捕获组</div>
                              <div><code>(?:expr)</code> - 非捕获组</div>
                              <div><code>(?&lt;name&gt;expr)</code> - 命名捕获组</div>
                            </n-space>
                          </n-descriptions-item>

                          <n-descriptions-item label="零宽断言">
                            <n-space vertical>
                              <div><code>(?=expr)</code> - 正向肯定断言</div>
                              <div><code>(?!expr)</code> - 正向否定断言</div>
                              <div><code>(?&lt;=expr)</code> - 反向肯定断言</div>
                              <div><code>(?&lt;!expr)</code> - 反向否定断言</div>
                            </n-space>
                          </n-descriptions-item>

                          <n-descriptions-item label="替换">
                            <n-space vertical>
                              <div><code>$1, $2, ...</code> - 引用捕获组</div>
                              <div><code>$&</code> - 引用整个匹配</div>
                              <div><code>$`</code> - 引用匹配前内容</div>
                              <div><code>$'</code> - 引用匹配后内容</div>
                            </n-space>
                          </n-descriptions-item>

                          <n-descriptions-item label="修饰符">
                            <n-space vertical>
                              <div><code>g</code> - 全局匹配</div>
                              <div><code>i</code> - 忽略大小写</div>
                              <div><code>m</code> - 多行模式</div>
                              <div><code>s</code> - 点号匹配所有字符（包括换行符）</div>
                              <div><code>u</code> - Unicode模式</div>
                              <div><code>y</code> - 粘性模式</div>
                            </n-space>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-tab-pane>
                    </n-tabs>
                  </n-card>

                  <n-card title="常用正则示例" size="small">
                    <n-collapse>
                      <n-collapse-item title="数据验证">
                        <n-descriptions bordered size="small" :column="1">
                          <n-descriptions-item label="电子邮箱">
                            <code>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}</code>
                            <n-button text size="small" @click="applyExampleRegex('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')">
                              应用
                            </n-button>
                          </n-descriptions-item>
                          <n-descriptions-item label="中国手机号">
                            <code>1[3-9]\d{9}</code>
                            <n-button text size="small" @click="applyExampleRegex('1[3-9]\\d{9}')">
                              应用
                            </n-button>
                          </n-descriptions-item>
                          <n-descriptions-item label="URL">
                            <code>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)</code>
                            <n-button text size="small" @click="applyExampleRegex('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')">
                              应用
                            </n-button>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-collapse-item>
                      <n-collapse-item title="文本处理">
                        <n-descriptions bordered size="small" :column="1">
                          <n-descriptions-item label="HTML标签">
                            <code>&lt;([a-z][a-z0-9]*)\b[^>]*&gt;(.*?)&lt;\/\1&gt;</code>
                            <n-button text size="small" @click="applyExampleRegex('<([a-z][a-z0-9]*)\\b[^>]*>(.*?)<\\/\\1>')">
                              应用
                            </n-button>
                          </n-descriptions-item>
                          <n-descriptions-item label="删除多余空格">
                            <code>\s{2,}</code>
                            <n-button text size="small" @click="applyExampleRegex('\\s{2,}')">
                              应用
                            </n-button>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-collapse-item>
                    </n-collapse>
                  </n-card>
                </div>
              </n-tab-pane>
            </n-tabs>
          </n-card>
        </div>
      </div>
    </div>

    <!-- 正则表达式构建器对话框 -->
    <n-modal v-model:show="showRegexBuilder" preset="card" style="max-width: 800px" title="正则表达式可视化构建器">
      <div class="regex-builder">
        <div class="builder-sections">
          <n-collapse accordion>
            <n-collapse-item title="字符匹配" name="character">
              <n-grid :cols="3" :x-gap="12">
                <n-grid-item>
                  <n-button block @click="addToBuilder('\\d')">数字 (\d)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('\\w')">字母数字 (\w)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('\\s')">空白字符 (\s)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('.')">任意字符 (.)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('\\D')">非数字 (\D)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('\\W')">非字母数字 (\W)</n-button>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>

            <n-collapse-item title="量词" name="quantifiers">
              <n-grid :cols="3" :x-gap="12">
                <n-grid-item>
                  <n-button block @click="addToBuilder('*')">零或多个 (*)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('+')">一或多个 (+)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('?')">零或一个 (?)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('{n}')">恰好n次 ({n})</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('{n,}')">至少n次 ({n,})</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('{n,m}')">n到m次 ({n,m})</n-button>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>

            <n-collapse-item title="字符集" name="character-classes">
              <n-space vertical>
                <div class="builder-character-set">
                  <n-input v-model:value="characterSetContent" placeholder="输入字符集内容..." />
                  <n-button @click="addCharacterSet">添加字符集</n-button>
                </div>
                <n-grid :cols="2" :x-gap="12">
                  <n-grid-item>
                    <n-button block @click="addToBuilder('[a-z]')">小写字母 [a-z]</n-button>
                  </n-grid-item>
                  <n-grid-item>
                    <n-button block @click="addToBuilder('[A-Z]')">大写字母 [A-Z]</n-button>
                  </n-grid-item>
                  <n-grid-item>
                    <n-button block @click="addToBuilder('[0-9]')">数字 [0-9]</n-button>
                  </n-grid-item>
                  <n-grid-item>
                    <n-button block @click="addToBuilder('[a-zA-Z0-9]')">字母数字 [a-zA-Z0-9]</n-button>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-collapse-item>

            <n-collapse-item title="分组与捕获" name="groups">
              <n-grid :cols="2" :x-gap="12">
                <n-grid-item>
                  <n-button block @click="addToBuilder('()')">捕获组 ()</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('(?:)')">非捕获组 (?:)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('(?<name>)')">命名组 (?&lt;name&gt;)</n-button>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>

            <n-collapse-item title="边界与断言" name="assertions">
              <n-grid :cols="2" :x-gap="12">
                <n-grid-item>
                  <n-button block @click="addToBuilder('^')">行首 (^)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('$')">行尾 ($)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('\\b')">单词边界 (\b)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('(?=)')">肯定前瞻 (?=)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('(?!)')">否定前瞻 (?!)</n-button>
                </n-grid-item>
                <n-grid-item>
                  <n-button block @click="addToBuilder('(?<=)')">肯定后顾 (?<=)</n-button>
                </n-grid-item>
              </n-grid>
            </n-collapse-item>
          </n-collapse>
        </div>

        <div class="builder-result mt-4">
          <n-form-item label="构建结果">
            <div class="builder-regex-input">
              <n-input-group>
                <div class="regex-delimiter">/</div>
                <n-input
                    v-model:value="builderResult"
                    placeholder="使用上方按钮构建正则表达式..."
                />
                <div class="regex-delimiter">/</div>
                <n-input
                    v-model:value="builderFlags"
                    placeholder="gmi"
                    style="width: 80px"
                />
              </n-input-group>
            </div>
          </n-form-item>

          <div class="builder-actions">
            <n-space>
              <n-button type="primary" @click="applyBuilder">应用到正则表达式</n-button>
              <n-button @click="clearBuilder">清空</n-button>
            </n-space>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 保存正则表达式对话框 -->
    <n-modal v-model:show="showSaveDialog" preset="card" style="max-width: 500px" title="保存正则表达式">
      <n-form>
        <n-form-item label="名称">
          <n-input v-model:value="saveForm.name" placeholder="输入一个便于识别的名称..." />
        </n-form-item>
        <n-form-item label="描述">
          <n-input
              v-model:value="saveForm.description"
              type="textarea"
              placeholder="描述该正则表达式的用途..."
              :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
        <n-form-item label="正则表达式">
          <n-input-group>
            <div class="regex-delimiter">/</div>
            <n-input
                v-model:value="saveForm.pattern"
                disabled
            />
            <div class="regex-delimiter">/</div>
            <n-input
                v-model:value="saveForm.flags"
                disabled
                style="width: 80px"
            />
          </n-input-group>
        </n-form-item>
        <n-form-item label="测试文本">
          <n-input
              v-model:value="saveForm.testString"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              disabled
          />
        </n-form-item>
      </n-form>
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
        <n-button @click="showSaveDialog = false">取消</n-button>
        <n-button type="primary" @click="confirmSaveRegex">保存</n-button>
      </div>
    </n-modal>

    <!-- 帮助内容插槽 -->
    <template #help-content>
      <div class="help-content">
        <h4>正则表达式测试器使用指南</h4>
        <p>本工具帮助您测试、调试和优化正则表达式，提供直观的匹配结果展示和丰富的辅助功能。</p>

        <h5>基本用法</h5>
        <ol>
          <li>在"正则表达式"输入框中输入您的正则表达式，无需添加开始和结束的斜杠</li>
          <li>在右侧输入框中添加正则表达式标志（如g表示全局匹配、i表示忽略大小写等）</li>
          <li>在"测试文本"区域输入您想要测试的文本</li>
          <li>点击"测试"按钮或启用"实时测试"选项自动查看结果</li>
        </ol>

        <h5>高级功能</h5>
        <ul>
          <li><strong>可视化构建器</strong>：使用可视化界面构建正则表达式，无需记忆复杂语法</li>
          <li><strong>性能分析</strong>：评估正则表达式的执行效率，获取优化建议</li>
          <li><strong>正则历史</strong>：保存和加载之前使用过的正则表达式</li>
          <li><strong>文本导入</strong>：从文件导入测试文本，方便处理大量数据</li>
          <li><strong>替换预览</strong>：测试替换效果并可应用到测试文本中</li>
        </ul>

        <h5>使用技巧</h5>
        <ul>
          <li>使用"模板"按钮快速选择常用正则表达式模式</li>
          <li>查看"速查表"了解正则表达式的完整语法</li>
          <li>测试复杂的正则表达式时，先关闭"实时测试"以提高响应速度</li>
          <li>"高亮匹配"可以直观地看到所有匹配项在文本中的位置</li>
          <li>使用"保存"功能将有用的正则表达式存储以备后用</li>
        </ul>

        <h5>最佳实践</h5>
        <ul>
          <li>正则表达式应尽量简单，避免过度复杂的模式</li>
          <li>谨慎使用贪婪量词（*、+），它们可能导致性能问题</li>
          <li>使用非捕获组 (?:) 代替普通捕获组可以提高性能</li>
          <li>对于重复匹配的模式，考虑使用预编译的正则表达式</li>
          <li>始终在实际数据上测试您的正则表达式</li>
        </ul>
      </div>
    </template>
  </base-tool-detail>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useMessage} from 'naive-ui';
import IconFont from '@/components/common/IconFont.vue';
import BaseToolDetail from '@/components/tools/BaseToolDetail.vue';

const message = useMessage();

// 表单数据与状态
const regexForm = ref({
  pattern: '',
  flags: 'g',
  testString: '',
  realTime: true
});

const replaceString = ref('');
const replacementResult = ref('');
const regexValid = ref(true);
const regexError = ref('');
const matches = ref([]);
const highlightMatches = ref(true);
const showGroups = ref(true);
const isDarkMode = ref(false);

// 性能数据
const performanceData = ref({
  matchTime: 0,
  charsPerSecond: 0,
  backtrackingCount: 0,
  suggestions: []
});

// 模态框控制
const showRegexBuilder = ref(false);
const showSaveDialog = ref(false);

// 构建器状态
const builderResult = ref('');
const builderFlags = ref('g');
const characterSetContent = ref('');

// 保存表单
const saveForm = ref({
  name: '',
  description: '',
  pattern: '',
  flags: '',
  testString: '',
  date: null
});

// 历史记录
const savedRegexes = ref([]);

// 加载保存的正则表达式
const loadSavedRegexes = () => {
  try {
    const saved = localStorage.getItem('saved-regex');
    if (saved) {
      savedRegexes.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载保存的正则表达式失败', e);
  }
};

// 格式化保存的正则选项
const savedRegexOptions = computed(() => {
  const options = savedRegexes.value.map((item, index) => ({
    label: item.name || `正则表达式 #${index + 1}`,
    key: index.toString(),
    regex: item
  }));

  if (options.length === 0) {
    return [{
      label: '无保存的正则表达式',
      key: 'none',
      disabled: true
    }];
  }

  return [
    ...options,
    {
      type: 'divider',
      key: 'd1'
    },
    {
      label: '管理保存的正则表达式',
      key: 'manage'
    }
  ];
});

// 处理保存的正则表达式选择
const handleSavedRegex = (key) => {
  if (key === 'manage') {
    message.info('正则表达式管理功能正在开发中');
    return;
  }

  const index = parseInt(key);
  if (isNaN(index) || index < 0 || index >= savedRegexes.value.length) {
    return;
  }

  const regex = savedRegexes.value[index];
  regexForm.value.pattern = regex.pattern;
  regexForm.value.flags = regex.flags;
  if (regex.testString) {
    regexForm.value.testString = regex.testString;
  }

  updateRegex();
  message.success(`已加载"${regex.name || '保存的正则表达式'}"`, {
    duration: 2000
  });
};

// 正则表达式模板
const regexTemplates = [
  {
    label: '常用模式',
    key: 'common',
    children: [
      {label: '邮箱地址', key: 'email'},
      {label: '手机号码', key: 'phone'},
      {label: '身份证号', key: 'idcard'},
      {label: '网址', key: 'url'},
      {label: 'IP地址', key: 'ip'}
    ]
  },
  {
    label: '数据验证',
    key: 'validation',
    children: [
      {label: '日期 (YYYY-MM-DD)', key: 'date'},
      {label: '时间 (HH:MM:SS)', key: 'time'},
      {label: '整数', key: 'integer'},
      {label: '浮点数', key: 'float'},
      {label: '强密码', key: 'password'}
    ]
  },
  {
    label: '文本处理',
    key: 'text',
    children: [
      {label: '提取HTML标签', key: 'html-tag'},
      {label: '提取引号内内容', key: 'quotes'},
      {label: '提取单词', key: 'words'},
      {label: '删除多余空格', key: 'whitespace'},
      {label: 'CSV解析', key: 'csv'}
    ]
  },
  {
    label: '编程相关',
    key: 'programming',
    children: [
      {label: 'JSON键值对', key: 'json-key-value'},
      {label: '编程变量名', key: 'variable-name'},
      {label: '函数声明', key: 'function-declaration'},
      {label: 'URL参数', key: 'url-params'}
    ]
  }
];

// 选择模板
const selectTemplate = (key) => {
  let pattern = '';
  let flags = 'g';
  let testString = '';

  switch (key) {
    case 'email':
      pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
      testString = 'test@example.com\nfake-email@domain.co.uk\ninvalid.email\nname@website.cn';
      break;
    case 'phone':
      pattern = '1[3-9]\\d{9}';
      testString = '13812345678\n15987654321\n12345678\n139abcdefg';
      break;
    case 'idcard':
      pattern = '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)';
      testString = '110101199001011234\n11010119900101123x\n110101990101123\nabc123456789';
      break;
    case 'url':
      pattern = 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)';
      testString = 'https://www.example.com\nhttp://domain.co.uk/path?query=123\nexample.com\nftp://invalid.url';
      break;
    case 'ip':
      pattern = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
      testString = '192.168.1.1\n10.0.0.255\n256.0.0.1\n192.168.1';
      break;
    case 'date':
      pattern = '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])';
      testString = '2023-05-15\n2023-13-01\n2023-02-31\n01-01-2023';
      break;
    case 'time':
      pattern = '(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d';
      testString = '13:45:30\n25:05:10\n12:60:30\n5:15:20';
      break;
    case 'integer':
      pattern = '^-?\\d+$';
      testString = '12345\n-789\n3.14\nabc123';
      break;
    case 'float':
      pattern = '^-?\\d+(\\.\\d+)?$';
      testString = '12.345\n-78.9\n123\nabc12.3';
      break;
    case 'password':
      pattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';
      testString = 'Password123!\npassword\nPASS123!\nPass123';
      break;
    case 'html-tag':
      pattern = '<([a-z][a-z0-9]*)(\\s[^>]*)?>(.*?)<\\/\\1>';
      flags = 'gis';
      testString = '<div class="container">内容</div>\n<p>段落</p>\n<img src="image.jpg">\n<span>不闭合的标签';
      break;
    case 'quotes':
      pattern = '"([^"]*)"';
      testString = '他说："这是一个测试"，然后继续工作。\n"第一句话"和"第二句话"都很重要。';
      break;
    case 'words':
      pattern = '\\b[a-zA-Z]+\\b';
      testString = 'Hello, 你好 world! 这是一个测试123。';
      break;
    case 'whitespace':
      pattern = '\\s{2,}';
      testString = '这是  一个   有很多    空格的文本。';
      break;
    case 'csv':
      pattern = '(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))';
      testString = 'id,name,age\n1,"Zhang, San",30\n2,"Li, Si",25';
      break;
    case 'json-key-value':
      pattern = '"([^"]+)"\\s*:\\s*"([^"]*)"';
      testString = '{\n  "name": "张三",\n  "age": "30",\n  "email": "zhangsan@example.com"\n}';
      break;
    case 'variable-name':
      pattern = '\\b[a-zA-Z_][a-zA-Z0-9_]*\\b';
      testString = 'let userName = "张三";\nconst MAX_COUNT = 100;\nvar _privateVar = true;\n1invalidName = "错误";';
      break;
    case 'function-declaration':
      pattern = 'function\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(([^)]*)\\)';
      testString = 'function calculateTotal(price, quantity) {\n  return price * quantity;\n}\n\nconst getUser = function(id) { return users[id]; }';
      break;
    case 'url-params':
      pattern = '[?&]([^=&]+)=([^&]*)';
      testString = 'https://example.com/search?query=regex&page=1&limit=20';
      break;
    default:
      return;
  }

  regexForm.value.pattern = pattern;
  regexForm.value.flags = flags;
  regexForm.value.testString = testString;

  updateRegex();
  message.success(`已加载${getTemplateLabel(key)}模板`, {
    duration: 2000
  });
};

// 获取模板名称
const getTemplateLabel = (key) => {
  for (const category of regexTemplates) {
    for (const item of category.children) {
      if (item.key === key) {
        return item.label;
      }
    }
  }
  return '未知';
};

// 样本文本加载
const loadSampleText = (type) => {
  let text = '';

  switch (type) {
    case 'email':
      text = 'admin@example.com\nuser.name@company.co.uk\nsupport@website.org\ninvalid-email\ncontact@domain.中国\ntest_123@school.edu.cn';
      break;
    case 'url':
      text = 'https://www.example.com\nhttp://subdomain.site.org/path/to/page.html\nhttps://website.com/search?q=查询&lang=zh\nftp://files.example.org\nwww.invalid-url\nhttps://localhost:8080/api/v1/users';
      break;
    case 'json':
      text = '{\n  "name": "张三",\n  "age": 30,\n  "isStudent": false,\n  "courses": ["数学", "物理", "编程"],\n  "address": {\n    "city": "北京",\n    "district": "海淀区",\n    "zipCode": "100081"\n  },\n  "contact": null\n}';
      break;
    default:
      text = '';
  }

  regexForm.value.testString = text;
  updateRegex();
};

// 清空测试文本
const clearTestText = () => {
  regexForm.value.testString = '';
  matches.value = [];
  regexError.value = '';
};

// 上传文本文件
const uploadTextFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.csv,.json,.html,.js,.css,.xml';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      regexForm.value.testString = event.target.result;
      updateRegex();
      message.success(`已加载文件: ${file.name}`, {
        duration: 2000
      });
    };

    reader.onerror = () => {
      message.error('读取文件失败');
    };

    reader.readAsText(file);
  };

  input.click();
};

// 获取匹配前的上下文
const getContextBefore = (index, length) => {
  const start = Math.max(0, index - length);
  return regexForm.value.testString.substring(start, index);
};

// 获取匹配后的上下文
const getContextAfter = (index, length) => {
  const end = Math.min(regexForm.value.testString.length, index + length);
  return regexForm.value.testString.substring(index, end);
};

// 根据当前正则表达式解释其含义
const regexExplanation = computed(() => {
  if (!regexForm.value.pattern) return '';

  try {
    let explanation = '该正则表达式将匹配';

    // 根据模式提供不同的解释
    if (/^\d+$/.test(regexForm.value.pattern)) {
      explanation += `恰好${regexForm.value.pattern}个数字。`;
    } else if (/^\[.*\]$/.test(regexForm.value.pattern)) {
      explanation += `字符集${regexForm.value.pattern}中的任意一个字符。`;
    } else if (/^\\[dDwWsS]$/.test(regexForm.value.pattern)) {
      const charMap = {
        '\\d': '任意数字',
        '\\D': '任意非数字字符',
        '\\w': '任意字母、数字或下划线',
        '\\W': '任意非字母、数字、下划线字符',
        '\\s': '任意空白字符',
        '\\S': '任意非空白字符'
      };
      explanation += `${charMap[regexForm.value.pattern]}。`;
    } else if (/^\\[bB]$/.test(regexForm.value.pattern)) {
      explanation += regexForm.value.pattern === '\\b' ? '一个单词边界。' : '一个非单词边界。';
    } else if (regexForm.value.pattern === '.') {
      if (regexForm.value.flags.includes('s')) {
        explanation += '任意字符，包括换行符。';
      } else {
        explanation += '任意字符，除了换行符。';
      }
    } else if (/^\^.*$/.test(regexForm.value.pattern)) {
      explanation += `在行首匹配"${regexForm.value.pattern.substring(1)}"。`;
    } else if (/^.*\$$/.test(regexForm.value.pattern)) {
      explanation += `在行尾匹配"${regexForm.value.pattern.substring(0, regexForm.value.pattern.length - 1)}"。`;
    } else {
      explanation += `包含"${regexForm.value.pattern}"的文本。`;
    }

    // 添加标志的解释
    if (regexForm.value.flags) {
      explanation += ' 使用的标志有：';

      if (regexForm.value.flags.includes('g')) {
        explanation += '全局匹配(g)，';
      }
      if (regexForm.value.flags.includes('i')) {
        explanation += '忽略大小写(i)，';
      }
      if (regexForm.value.flags.includes('m')) {
        explanation += '多行模式(m)，';
      }
      if (regexForm.value.flags.includes('s')) {
        explanation += '点号匹配所有字符(s)，';
      }
      if (regexForm.value.flags.includes('u')) {
        explanation += 'Unicode模式(u)，';
      }
      if (regexForm.value.flags.includes('y')) {
        explanation += '粘性匹配(y)，';
      }

      // 移除最后多余的逗号和空格
      explanation = explanation.replace(/，\s*$/, '。');
    } else {
      explanation += '。';
    }

    return explanation;
  } catch (e) {
    return '无法解析当前正则表达式。';
  }
});

// 更新正则表达式测试结果
const updateRegex = () => {
  if (!regexForm.value.pattern || !regexForm.value.testString) {
    matches.value = [];
    regexError.value = '';
    regexValid.value = true;
    return;
  }

  if (!regexForm.value.realTime) {
    return;
  }

  testRegex();
};

// 测试正则表达式
const testRegex = () => {
  if (!regexForm.value.pattern) {
    message.warning('请输入正则表达式');
    return;
  }

  try {
    const regex = new RegExp(regexForm.value.pattern, regexForm.value.flags);
    regexValid.value = true;
    regexError.value = '';

    if (!regexForm.value.testString) {
      matches.value = [];
      message.info('请输入测试文本');
      return;
    }

    // 开始计时以测量性能
    const startTime = performance.now();

    // 执行匹配
    const result = [];
    let match;

    if (regexForm.value.flags.includes('g')) {
      while ((match = regex.exec(regexForm.value.testString)) !== null) {
        result.push(match);
      }
    } else {
      match = regex.exec(regexForm.value.testString);
      if (match) {
        result.push(match);
      }
    }

    // 计算执行时间
    const endTime = performance.now();
    const matchTime = endTime - startTime;

    matches.value = result;

    // 更新性能数据
    updatePerformanceData(matchTime);

    if (result.length > 0) {
      message.success(`找到 ${result.length} 个匹配`, {
        duration: 2000
      });
    } else {
      message.info('没有找到匹配项', {
        duration: 2000
      });
    }

    // 执行替换预览
    if (replaceString.value) {
      performReplace();
    }
  } catch (e) {
    regexValid.value = false;
    regexError.value = e.message;
    matches.value = [];
    message.error('正则表达式无效', {
      duration: 2000
    });
  }
};

// 更新性能数据
const updatePerformanceData = (matchTime) => {
  const textLength = regexForm.value.testString.length;
  const charsPerSecond = matchTime > 0 ? Math.round((textLength / matchTime) * 1000) : 0;

  // 检测潜在的回溯问题
  let backtrackingCount = 0;
  const potentialBacktrackingPatterns = [
    /\w+\w+/, // 重复的字符类
    /.*.*/, // 重复的任意字符匹配
    /(\w|\d)+/, // 使用选择操作符的重复
    /\b.+\b/ // 边界条件与贪婪量词结合
  ];

  for (const pattern of potentialBacktrackingPatterns) {
    if (pattern.test(regexForm.value.pattern)) {
      backtrackingCount++;
    }
  }

  // 生成优化建议
  const suggestions = [];

  if (regexForm.value.pattern.includes('.*') && !regexForm.value.pattern.includes('.*?')) {
    suggestions.push('考虑使用非贪婪匹配 ".*?" 代替 ".*" 以减少回溯');
  }

  if (regexForm.value.pattern.includes('+') && !regexForm.value.pattern.includes('+?')) {
    suggestions.push('对于长文本，考虑使用非贪婪匹配 "+?" 代替 "+" 以提高效率');
  }

  if (regexForm.value.pattern.includes('(') && !regexForm.value.pattern.includes('(?:')) {
    suggestions.push('对于不需要捕获的组，使用非捕获组 "(?:...)" 可以提高性能');
  }

  if (matchTime > 100 && textLength > 5000) {
    suggestions.push('当前正则表达式在大文本上性能较低，考虑简化模式或限制匹配范围');
  }

  performanceData.value = {
    matchTime: matchTime.toFixed(2),
    charsPerSecond,
    backtrackingCount,
    suggestions
  };
};

// 高亮匹配结果
const highlightedText = computed(() => {
  if (!regexValid.value || !regexForm.value.pattern || !regexForm.value.testString || !highlightMatches.value) {
    return regexForm.value.testString;
  }

  try {
    const escapedText = regexForm.value.testString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // 执行匹配以获取所有匹配的索引和捕获组
    const matchPositions = [];
    const regex = new RegExp(regexForm.value.pattern, regexForm.value.flags.includes('g') ? regexForm.value.flags : regexForm.value.flags + 'g');

    let match;
    while ((match = regex.exec(regexForm.value.testString)) !== null) {
      matchPositions.push({
        start: match.index,
        end: match.index + match[0].length,
        groups: match.slice(1) // 捕获组
      });

      if (!regexForm.value.flags.includes('g')) break;
    }

    // 根据匹配位置插入高亮标记
    let result = escapedText;
    let offset = 0;

    matchPositions.sort((a, b) => b.start - a.start); // 从后向前处理，避免索引偏移问题

    for (const pos of matchPositions) {
      const highlightStart = `<mark class="match-highlight">`;
      const highlightEnd = `</mark>`;

      result =
          result.substring(0, pos.start + offset) +
          highlightStart +
          result.substring(pos.start + offset, pos.end + offset) +
          highlightEnd +
          result.substring(pos.end + offset);

      offset += highlightStart.length + highlightEnd.length;
    }

    // 保留换行符格式
    return result.replace(/\n/g, '<br>');
  } catch (e) {
    console.error("高亮处理错误", e);
    return regexForm.value.testString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
  }
});

// 执行替换
const performReplace = () => {
  if (!regexValid.value || !regexForm.value.pattern || !regexForm.value.testString) {
    replacementResult.value = '';
    return;
  }

  try {
    const regex = new RegExp(regexForm.value.pattern, regexForm.value.flags);
    replacementResult.value = regexForm.value.testString.replace(regex, replaceString.value);
  } catch (e) {
    message.error('替换失败：' + e.message);
    replacementResult.value = '';
  }
};

// 执行全部替换
const replaceAll = () => {
  if (!regexValid.value || !regexForm.value.pattern || !regexForm.value.testString) {
    replacementResult.value = '';
    return;
  }

  try {
    // 确保使用全局标志
    const flags = regexForm.value.flags.includes('g')
        ? regexForm.value.flags
        : regexForm.value.flags + 'g';

    const regex = new RegExp(regexForm.value.pattern, flags);
    replacementResult.value = regexForm.value.testString.replace(regex, replaceString.value);

    message.success(`替换完成，共影响${replacementResult.value !== regexForm.value.testString ? matches.value.length : 0}处`, {
      duration: 2000
    });
  } catch (e) {
    message.error('替换失败：' + e.message);
    replacementResult.value = '';
  }
};

// 应用替换结果到测试文本
const applyReplacement = () => {
  if (!replacementResult.value) {
    message.warning('没有替换结果可应用');
    return;
  }

  regexForm.value.testString = replacementResult.value;
  updateRegex();
  message.success('已应用替换结果到测试文本', {
    duration: 2000
  });
};

// 复制正则表达式
const copyRegex = () => {
  if (!regexForm.value.pattern) {
    message.warning('没有正则表达式可复制');
    return;
  }

  const regexString = `/${regexForm.value.pattern}/${regexForm.value.flags}`;
  navigator.clipboard.writeText(regexString)
      .then(() => {
        message.success('正则表达式已复制到剪贴板', {
          duration: 2000
        });
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 复制替换结果
const copyReplacement = () => {
  if (!replacementResult.value) {
    message.warning('没有替换结果可复制');
    return;
  }

  navigator.clipboard.writeText(replacementResult.value)
      .then(() => {
        message.success('替换结果已复制到剪贴板', {
          duration: 2000
        });
      })
      .catch(() => {
        message.error('复制失败');
      });
};

// 保存正则表达式
const saveRegex = () => {
  if (!regexForm.value.pattern) {
    message.warning('没有正则表达式可保存');
    return;
  }

  // 准备保存表单
  saveForm.value = {
    name: '',
    description: '',
    pattern: regexForm.value.pattern,
    flags: regexForm.value.flags,
    testString: regexForm.value.testString,
    date: new Date().toISOString()
  };

  showSaveDialog.value = true;
};

// 确认保存正则表达式
const confirmSaveRegex = () => {
  if (!saveForm.value.name) {
    message.warning('请输入名称');
    return;
  }

  try {
    const savedList = JSON.parse(localStorage.getItem('saved-regex') || '[]');
    savedList.push(saveForm.value);
    localStorage.setItem('saved-regex', JSON.stringify(savedList));

    // 更新本地缓存
    savedRegexes.value = savedList;

    message.success('正则表达式已保存');
    showSaveDialog.value = false;
  } catch (e) {
    message.error('保存失败');
  }
};

// 清空正则表达式
const clearRegex = () => {
  regexForm.value.pattern = '';
  regexForm.value.testString = '';
  replaceString.value = '';
  replacementResult.value = '';
  matches.value = [];
  regexError.value = '';
  message.info('已清空', {
    duration: 2000
  });
};

// 打开正则表达式构建器
const openRegexBuilder = () => {
  builderResult.value = regexForm.value.pattern;
  builderFlags.value = regexForm.value.flags;
  showRegexBuilder.value = true;
};

// 添加到构建器
const addToBuilder = (pattern) => {
  const cursorPosition = document.activeElement === document.querySelector('input[value="' + builderResult.value + '"]')
      ? document.activeElement.selectionStart
      : builderResult.value.length;

  builderResult.value =
      builderResult.value.substring(0, cursorPosition) +
      pattern +
      builderResult.value.substring(cursorPosition);
};

// 添加字符集
const addCharacterSet = () => {
  if (!characterSetContent.value) {
    message.warning('请输入字符集内容');
    return;
  }

  addToBuilder(`[${characterSetContent.value}]`);
  characterSetContent.value = '';
};

// 应用构建器结果
const applyBuilder = () => {
  if (!builderResult.value) {
    message.warning('请先构建正则表达式');
    return;
  }

  regexForm.value.pattern = builderResult.value;
  regexForm.value.flags = builderFlags.value;
  showRegexBuilder.value = false;
  updateRegex();

  message.success('已应用构建的正则表达式', {
    duration: 2000
  });
};

// 清空构建器
const clearBuilder = () => {
  builderResult.value = '';
  characterSetContent.value = '';
};

// 应用示例正则表达式
const applyExampleRegex = (pattern) => {
  regexForm.value.pattern = pattern;
  updateRegex();
};

// 监听输入变化
watch([() => regexForm.value.pattern, () => regexForm.value.flags, () => regexForm.value.testString], () => {
  if (regexForm.value.realTime) {
    updateRegex();
  }
});

// 组件挂载时加载保存的正则表达式
onMounted(() => {
  loadSavedRegexes();

  // 检测系统主题
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  isDarkMode.value = prefersDark;
});
</script>

<style scoped>
.regex-tester-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.regex-main-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.regex-panel, .results-panel {
  border-radius: var(--border-radius);
}

.regex-input-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.regex-delimiter {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 8px;
  color: var(--primary-color);
  background-color: var(--body-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-weight: 600;
}

.regex-actions {
  flex-shrink: 0;
}

.test-input-container {
  width: 100%;
  margin-bottom: 16px;
}

.test-actions {
  display: flex;
  justify-content: space-between;
}

.regex-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.regex-explanation {
  margin-bottom: 16px;
}

.explanation-content {
  color: var(--text-color-base);
  line-height: 1.5;
}

.regex-error {
  margin-bottom: 16px;
}

.match-statistics {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.match-results {
  margin-top: 16px;
}

.match-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-content, .match-groups, .match-position, .match-context {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-label {
  font-weight: 500;
  color: var(--text-color-secondary);
  margin-bottom: 4px;
}

.match-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background-color: var(--body-color);
  border-radius: var(--border-radius);
}

.match-position-info {
  display: flex;
  gap: 12px;
}

.match-context-text {
  padding: 8px;
  background-color: var(--body-color);
  border-radius: var(--border-radius);
  font-family: monospace;
  white-space: pre-wrap;
}

.context-before, .context-after {
  opacity: 0.6;
}

.context-match {
  background-color: rgba(99, 102, 241, 0.2);
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: bold;
}

.highlighted-text {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--body-color);
  white-space: pre-wrap;
  margin-bottom: 16px;
  max-height: 400px;
  overflow: auto;
  font-family: monospace;
  line-height: 1.6;
}

.highlighted-text.dark-mode :deep(.match-highlight) {
  background-color: rgba(129, 140, 248, 0.3);
  color: #fff;
  border-radius: 2px;
  padding: 2px 0;
}

:deep(.match-highlight) {
  background-color: rgba(99, 102, 241, 0.2);
  border-radius: 2px;
  padding: 2px 0;
  font-weight: bold;
}

.replace-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.replace-actions {
  display: flex;
  gap: 12px;
}

.replacement-result {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--body-color);
}

.replacement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.performance-panel {
  padding: 16px 0;
}

.cheatsheet {
  max-height: 600px;
  overflow: auto;
}

.builder-sections {
  margin-bottom: 24px;
}

.builder-character-set {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.builder-regex-input {
  margin-bottom: 16px;
}

.builder-actions {
  display: flex;
  justify-content: flex-end;
}

.help-content {
  line-height: 1.6;
}

.help-content h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--primary-color);
}

.help-content h5 {
  margin-top: 20px;
  margin-bottom: 12px;
  color: var(--text-color-base);
}

.help-content p, .help-content li {
  margin-bottom: 8px;
  color: var(--text-color-secondary);
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .regex-input-container {
    flex-direction: column;
  }

  .regex-actions {
    width: 100%;
    margin-top: 12px;
  }

  .test-actions {
    flex-direction: column;
    gap: 12px;
  }

  .regex-options {
    flex-direction: column;
    gap: 12px;
  }

  .match-position-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>