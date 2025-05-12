<template>
  <base-tool-detail
      title="效率工具箱"
      description="多功能开发者工具集合，包含编码转换、时间处理、随机数据生成等功能"
      icon-type="icon-toolkit"
      icon-color="#18a058"
  >
    <!-- 主要内容 -->
    <template #default>
      <!-- Tab 导航 -->
      <div class="tab-navigation">
        <n-tabs type="line" animated v-model:value="activeTab" size="large">
          <n-tab-pane name="base64" tab="Base64" />
          <n-tab-pane name="time" tab="时间工具" />
          <n-tab-pane name="ip" tab="IP查询" />
          <n-tab-pane name="random-string" tab="随机字符串" />
          <n-tab-pane name="random-person" tab="随机个人信息" />
        </n-tabs>
      </div>

      <!-- Tab 内容区域 -->
      <div class="tab-content-container">
        <!-- Base64 编码/解码 -->
        <div v-if="activeTab === 'base64'" class="tab-content">
          <div class="function-toolbar">
            <n-tabs type="segment" v-model:value="base64Mode" size="medium">
              <n-tab-pane name="encode" tab="编码" />
              <n-tab-pane name="decode" tab="解码" />
            </n-tabs>
            <n-space>
              <n-button @click="clearBase64" size="medium">清空</n-button>
              <n-button @click="copyToClipboard(base64Result)" type="primary" size="medium">
                复制结果
              </n-button>
            </n-space>
          </div>

          <div class="content-area">
            <template v-if="base64Mode === 'encode'">
              <div class="input-section">
                <label class="section-label">输入文本</label>
                <n-input
                    v-model:value="base64Input"
                    type="textarea"
                    placeholder="输入需要编码的文本..."
                    :rows="8"
                    @input="handleBase64Encode"
                />
              </div>

              <div class="output-section">
                <label class="section-label">编码结果</label>
                <n-input
                    :value="base64Result"
                    type="textarea"
                    placeholder="编码结果将在这里显示..."
                    :rows="8"
                    readonly
                />
              </div>
            </template>

            <template v-if="base64Mode === 'decode'">
              <div class="input-section">
                <label class="section-label">输入 Base64</label>
                <n-input
                    v-model:value="base64Decode"
                    type="textarea"
                    placeholder="输入需要解码的Base64文本..."
                    :rows="8"
                    @input="handleBase64Decode"
                />
              </div>

              <div class="output-section">
                <label class="section-label">解码结果</label>
                <n-input
                    :value="base64Result"
                    type="textarea"
                    placeholder="解码结果将在这里显示..."
                    :rows="8"
                    readonly
                />
              </div>
            </template>
          </div>
        </div>

        <!-- 时间工具 -->
        <div v-if="activeTab === 'time'" class="tab-content">
          <div class="function-toolbar">
            <h3 class="toolbar-title">时间工具</h3>
          </div>

          <div class="content-area">
            <!-- 当前时间显示 -->
            <div class="time-section">
              <h4 class="section-title">当前时间</h4>
              <div class="time-grid">
                <div class="time-card" v-for="(time, key) in timeFormats" :key="key">
                  <span class="time-label">{{ time.label }}</span>
                  <span class="time-value">{{ time.value }}</span>
                  <n-button
                      text
                      class="copy-btn"
                      @click="copyToClipboard(time.value)"
                  >
                    <icon-font type="icon-copy" :size="14" />
                  </n-button>
                </div>
              </div>
            </div>

            <n-divider style="margin: 32px 0;" />

            <!-- 时间戳转换 -->
            <div class="convert-section">
              <h4 class="section-title">时间戳转换</h4>
              <div class="converter-container">
                <div class="input-group">
                  <n-input
                      v-model:value="timestampInput"
                      placeholder="输入时间戳(支持秒或毫秒)"
                      @input="handleTimestampConvert"
                      size="large"
                      clearable
                  />
                  <n-button type="primary" size="large" @click="copyToClipboard(convertedTime)">
                    复制结果
                  </n-button>
                </div>
                <div v-if="convertedTime" class="result-display">
                  <span class="result-label">转换结果:</span>
                  <span class="result-value">{{ convertedTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- IP查询 -->
        <div v-if="activeTab === 'ip'" class="tab-content">
          <div class="function-toolbar">
            <h3 class="toolbar-title">IP地址查询</h3>
          </div>

          <div class="content-area">
            <div class="ip-section">
              <div class="query-container">
                <div class="input-group">
                  <n-input
                      v-model:value="ipInput"
                      placeholder="输入IP地址(留空查询本机IP)"
                      size="large"
                      clearable
                  />
                  <n-button type="primary" size="large" @click="queryIpInfo" :loading="ipLoading">
                    查询IP信息
                  </n-button>
                </div>

                <div v-if="ipInfo" class="ip-result">
                  <n-descriptions :column="1" bordered size="large">
                    <n-descriptions-item label="IP地址">
                      <n-space>
                        <span class="ip-value">{{ ipInfo.ip }}</span>
                        <n-button text @click="copyToClipboard(ipInfo.ip)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <n-descriptions-item label="国家">
                      <span class="ip-value">{{ ipInfo.country || 'N/A' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="地区">
                      <span class="ip-value">{{ ipInfo.region || 'N/A' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="城市">
                      <span class="ip-value">{{ ipInfo.city || 'N/A' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="ISP">
                      <span class="ip-value">{{ ipInfo.isp || 'N/A' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="地理位置">
                      <n-space>
                        <span class="ip-value">{{ ipInfo.loc || 'N/A' }}</span>
                        <n-button v-if="ipInfo.loc" text @click="openMap">
                          <icon-font type="icon-location" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                  </n-descriptions>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 随机字符串生成 -->
        <div v-if="activeTab === 'random-string'" class="tab-content">
          <div class="function-toolbar">
            <h3 class="toolbar-title">随机字符串生成器</h3>
            <n-space>
              <n-button type="primary" @click="generateRandomString" size="medium">
                生成随机字符串
              </n-button>
              <n-button @click="copyToClipboard(randomString)" size="medium">
                复制结果
              </n-button>
            </n-space>
          </div>

          <div class="content-area">
            <div class="config-section">
              <n-form :label-width="120" label-placement="left" size="medium">
                <n-form-item label="字符串长度">
                  <n-input-number v-model:value="randomConfig.length" :min="1" :max="1000" style="width: 200px;" />
                </n-form-item>
                <n-form-item label="字符类型">
                  <n-space>
                    <n-checkbox v-model:checked="randomConfig.includeUpperCase">大写字母</n-checkbox>
                    <n-checkbox v-model:checked="randomConfig.includeLowerCase">小写字母</n-checkbox>
                    <n-checkbox v-model:checked="randomConfig.includeNumbers">数字</n-checkbox>
                    <n-checkbox v-model:checked="randomConfig.includeSymbols">特殊符号</n-checkbox>
                  </n-space>
                </n-form-item>
              </n-form>
            </div>

            <div class="output-section">
              <label class="section-label">生成结果</label>
              <n-input
                  :value="randomString"
                  placeholder="生成的随机字符串将在这里显示..."
                  readonly
                  size="large"
              />
            </div>
          </div>
        </div>

        <!-- 随机个人信息生成 -->
        <div v-if="activeTab === 'random-person'" class="tab-content">
          <div class="function-toolbar">
            <h3 class="toolbar-title">随机个人信息生成器</h3>
            <n-space>
              <n-button type="primary" @click="generateRandomPersonInfo" size="medium">
                生成随机个人信息
              </n-button>
              <n-button v-if="randomPersonInfo" @click="copyPersonInfo" size="medium">
                复制全部信息
              </n-button>
            </n-space>
          </div>

          <div class="content-area">
            <div v-if="randomPersonInfo" class="person-info">
              <!-- 使用两列布局展示个人信息 -->
              <div class="person-info-grid">
                <!-- 左列：基本信息 -->
                <div class="person-info-column">
                  <h5 class="column-title">基本信息</h5>
                  <n-descriptions :column="1" bordered size="large">
                    <n-descriptions-item label="姓名">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.name }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.name)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <n-descriptions-item label="性别">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.gender }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.gender)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <n-descriptions-item label="年龄">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.age }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.age.toString())">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <n-descriptions-item label="手机号">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.phone }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.phone)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                  </n-descriptions>
                </div>

                <!-- 右列：联系信息 -->
                <div class="person-info-column">
                  <h5 class="column-title">联系信息</h5>
                  <n-descriptions :column="1" bordered size="large">
                    <n-descriptions-item label="邮箱">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.email }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.email)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <n-descriptions-item label="身份证号">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.idCard }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.idCard)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <n-descriptions-item label="地址">
                      <n-space>
                        <span class="person-value">{{ randomPersonInfo.address }}</span>
                        <n-button text @click="copyToClipboard(randomPersonInfo.address)">
                          <icon-font type="icon-copy" :size="14" />
                        </n-button>
                      </n-space>
                    </n-descriptions-item>
                    <!-- 添加一个空项来平衡高度 -->
                    <n-descriptions-item label="" style="opacity: 0; pointer-events: none;">
                      <span style="height: 20px; display: block;"></span>
                    </n-descriptions-item>
                  </n-descriptions>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <n-empty description="点击上方按钮生成随机个人信息" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 帮助内容 -->
    <template #help-content>
      <div class="help-content">
        <h4>效率工具箱使用指南</h4>
        <n-space vertical>
          <div>
            <h5>Base64 编码/解码</h5>
            <p>支持文本与 Base64 格式之间的相互转换，适用于数据编码传输场景。</p>
          </div>
          <div>
            <h5>时间工具</h5>
            <p>提供当前时间的多种格式显示，支持时间戳转换功能。</p>
          </div>
          <div>
            <h5>IP查询</h5>
            <p>查询 IP 地址的地理位置信息，包括国家、地区、城市等详细信息。</p>
          </div>
          <div>
            <h5>随机生成器</h5>
            <p>提供随机字符串和随机个人信息生成功能，适用于测试数据准备。</p>
          </div>
        </n-space>
      </div>
    </template>
  </base-tool-detail>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue';
import {useMessage} from 'naive-ui';
import BaseToolDetail from '@/components/tools/BaseToolDetail.vue';
import IconFont from '@/components/common/IconFont.vue';

const message = useMessage();

// 主 Tab 状态
const activeTab = ref('base64');

// Base64 相关状态
const base64Mode = ref('encode');
const base64Input = ref('');
const base64Decode = ref('');
const base64Result = ref('');

// 时间相关状态
const currentTime = ref({
  standard: '',
  timestamp: '',
  milliseconds: '',
  iso: ''
});
const timestampInput = ref('');
const convertedTime = ref('');

// IP查询相关状态
const ipInput = ref('');
const ipInfo = ref(null);
const ipLoading = ref(false);

// 随机字符串相关状态
const randomConfig = ref({
  length: 16,
  includeUpperCase: true,
  includeLowerCase: true,
  includeNumbers: true,
  includeSymbols: false
});
const randomString = ref('');

// 随机个人信息相关状态
const randomPersonInfo = ref(null);

// 定时器
let timeInterval = null;

// 计算属性：时间格式显示
const timeFormats = computed(() => ({
  standard: {label: '标准格式', value: currentTime.value.standard},
  timestamp: {label: '时间戳(秒)', value: currentTime.value.timestamp.toString()},
  milliseconds: {label: '时间戳(毫秒)', value: currentTime.value.milliseconds.toString()},
  iso: {label: 'ISO格式', value: currentTime.value.iso}
}));

// Base64 编码
const handleBase64Encode = () => {
  if (!base64Input.value) {
    base64Result.value = '';
    return;
  }
  try {
    base64Result.value = btoa(unescape(encodeURIComponent(base64Input.value)));
  } catch (error) {
    message.error('编码失败，请检查输入内容');
  }
};

// Base64 解码
const handleBase64Decode = () => {
  if (!base64Decode.value) {
    base64Result.value = '';
    return;
  }
  try {
    base64Result.value = decodeURIComponent(escape(atob(base64Decode.value)));
  } catch (error) {
    message.error('解码失败，请检查Base64格式');
  }
};

// 清空Base64
const clearBase64 = () => {
  base64Input.value = '';
  base64Decode.value = '';
  base64Result.value = '';
};

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = {
    standard: now.toLocaleString('zh-CN'),
    timestamp: Math.floor(now.getTime() / 1000),
    milliseconds: now.getTime(),
    iso: now.toISOString()
  };
};

// 时间戳转换
const handleTimestampConvert = () => {
  if (!timestampInput.value) {
    convertedTime.value = '';
    return;
  }

  try {
    let timestamp = parseInt(timestampInput.value);
    // 如果是秒级时间戳，转换为毫秒
    if (timestamp < 10000000000) {
      timestamp *= 1000;
    }

    const date = new Date(timestamp);
    convertedTime.value = date.toLocaleString('zh-CN');
  } catch (error) {
    message.error('无效的时间戳');
  }
};

// 查询IP信息
const queryIpInfo = async () => {
  ipLoading.value = true;
  try {
    const targetIp = ipInput.value.trim() || '';
    // 使用免费的IP查询API
    const response = await fetch(`https://ipapi.co/${targetIp}/json/`);
    const data = await response.json();

    if (data.error) {
      message.error(data.reason || '查询IP信息失败');
      return;
    }

    ipInfo.value = {
      ip: data.ip,
      country: data.country_name,
      region: data.region,
      city: data.city,
      isp: data.org,
      loc: `${data.latitude}, ${data.longitude}`
    };
  } catch (error) {
    message.error('查询IP信息失败，请检查网络连接');
  } finally {
    ipLoading.value = false;
  }
};

// 打开地图
const openMap = () => {
  if (ipInfo.value && ipInfo.value.loc) {
    const [lat, lng] = ipInfo.value.loc.split(', ');
    window.open(`https://www.google.com/maps/@${lat},${lng},15z`, '_blank');
  }
};

// 生成随机字符串
const generateRandomString = () => {
  let chars = '';

  if (randomConfig.value.includeUpperCase) {
    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (randomConfig.value.includeLowerCase) {
    chars += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (randomConfig.value.includeNumbers) {
    chars += '0123456789';
  }
  if (randomConfig.value.includeSymbols) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (!chars) {
    message.warning('请至少选择一种字符类型');
    return;
  }

  let result = '';
  for (let i = 0; i < randomConfig.value.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  randomString.value = result;
};

// 生成随机个人信息
const generateRandomPersonInfo = () => {
  // 姓氏库
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗', '郑'];

  // 名字库
  const maleNames = ['明', '峰', '军', '强', '伟', '华', '建', '国', '杰', '波', '超', '勇', '磊', '刚', '毅', '涛', '飞', '鹏', '辉', '雄'];
  const femaleNames = ['丽', '娜', '静', '芳', '霞', '红', '燕', '凤', '玲', '萍', '雪', '梅', '琳', '敏', '秀', '兰', '慧', '洁', '蓉', '颖'];

  // 地址前缀
  const provinces = ['北京市', '上海市', '广东省', '山东省', '江苏省', '浙江省', '河南省', '四川省', '湖南省', '湖北省'];
  const cities = ['中山路', '解放路', '建设路', '人民路', '文化路', '胜利路', '光明路', '民主路', '新华路', '南京路'];

  const isGenderMale = Math.random() > 0.5;
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const firstName = isGenderMale
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];

  // 生成身份证号(假数据)
  const generateIdCard = () => {
    const area = ['110000', '310000', '440000', '370000', '320000', '330000'];
    const areaCode = area[Math.floor(Math.random() * area.length)];
    const year = 1970 + Math.floor(Math.random() * 35);
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const genderCode = isGenderMale ? '1' : '0';

    return `${areaCode}${year}${month}${day}${sequence}${genderCode}`;
  };

  // 生成手机号(假数据)
  const generatePhone = () => {
    const prefixes = ['138', '139', '137', '136', '135', '134', '159', '158', '152', '151'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    return `${prefix}${suffix}`;
  };

  randomPersonInfo.value = {
    name: surname + firstName,
    gender: isGenderMale ? '男' : '女',
    age: 18 + Math.floor(Math.random() * 50),
    email: `${firstName.toLowerCase()}${Math.floor(Math.random() * 9999)}@example.com`,
    phone: generatePhone(),
    idCard: generateIdCard(),
    address: `${provinces[Math.floor(Math.random() * provinces.length)]}${cities[Math.floor(Math.random() * cities.length)]}${Math.floor(Math.random() * 999) + 1}号`
  };
};

// 复制到剪贴板
const copyToClipboard = async (text) => {
  if (!text) {
    message.warning('暂无内容可复制');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功');
  } catch (error) {
    // 兼容处理：如果新API不支持，使用传统方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    message.success('复制成功');
  }
};

// 复制个人信息
const copyPersonInfo = () => {
  const info = randomPersonInfo.value;
  const text = `姓名: ${info.name}
性别: ${info.gender}
年龄: ${info.age}
邮箱: ${info.email}
手机号: ${info.phone}
身份证号: ${info.idCard}
地址: ${info.address}`;

  copyToClipboard(text);
};

// 组件挂载时
onMounted(() => {
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 1000);
});

// 组件卸载时
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
/* Tab 导航样式 */
.tab-navigation {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

/* Tab 内容容器 */
.tab-content-container {
  min-height: 400px;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 功能工具栏 */
.function-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.toolbar-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

/* 内容区域 */
.content-area {
  padding: 0;
}

/* 各种内容区域样式 */
.input-section,
.output-section,
.config-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color-secondary);
  margin-bottom: 10px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--text-color);
}

/* 时间显示样式 */
.time-section {
  margin-bottom: 32px;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.time-card {
  position: relative;
  background-color: var(--card-color);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.time-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.time-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.time-value {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  word-break: break-all;
  display: block;
  padding-right: 30px;
}

.copy-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}

.time-card:hover .copy-btn {
  opacity: 1;
}

/* 转换器样式 */
.convert-section {
  max-width: 800px;
}

.converter-container {
  width: 100%;
}

.input-group {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.input-group .n-input {
  flex: 1;
}

.result-display {
  padding: 16px;
  background-color: var(--card-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.result-label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-right: 12px;
}

.result-value {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-weight: 600;
  color: var(--primary-color);
  word-break: break-all;
}

/* IP 查询样式 */
.ip-section {
  max-width: 800px;
}

.query-container {
  width: 100%;
}

.ip-result {
  margin-top: 24px;
}

.ip-value {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-weight: 500;
}

/* 个人信息样式 - 新的两列布局 */
.person-info {
  width: 100%;
}

.person-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  /* 确保两列等高 */
  align-items: start;
}

.person-info-column {
  background-color: var(--card-color);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
  /* 设置最小高度确保视觉平衡 */
  min-height: 300px;
}

.column-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--text-color);
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.person-value {
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .function-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .input-group {
    flex-direction: column;
  }

  .time-grid {
    grid-template-columns: 1fr;
  }

  .time-card {
    padding: 16px;
  }

  .copy-btn {
    opacity: 1;
  }

  /* 移动端改为单列布局 */
  .person-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .person-info-column {
    min-height: auto;
  }
}

/* 帮助内容样式 */
.help-content h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--text-color);
}

.help-content h5 {
  margin: 0 0 8px;
  font-size: 1rem;
  color: var(--text-color);
}

.help-content p {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

/* 细节优化 */
:deep(.n-tabs .n-tabs-tab) {
  font-weight: 500;
}

:deep(.n-tabs .n-tabs-tab.n-tabs-tab--active) {
  color: var(--primary-color);
}

:deep(.n-input__placeholder) {
  color: var(--text-color-tertiary);
}
</style>