<template>
  <a-modal
      v-model:visible="visible"
      :title="null"
      :footer="null"
      :maskClosable="false"
      :width="820"
      class="auth-modal"
      :closable="false"
      :bodyStyle="{ padding: '0' }"
      @cancel="closeModal"
  >
    <div class="modal-container">
      <!-- 左侧装饰区域 -->
      <div class="modal-decoration">
        <div class="decoration-content">
          <div class="logo-container">
            <div class="logo-box">
              <code-outlined class="logo-icon" />
            </div>
            <span class="logo-text">DevNoteHub</span>
          </div>

          <h2 class="decoration-title animate__animated animate__fadeInUp">构建知识体系</h2>
          <p class="decoration-subtitle animate__animated animate__fadeInUp animate__delay-1s">让学习更有条理、更有效率</p>

          <div class="decoration-stats animate__animated animate__fadeIn animate__delay-2s">
            <div class="stat-item">
              <div class="stat-number">10,000+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50,000+</div>
              <div class="stat-label">笔记总数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">98%</div>
              <div class="stat-label">用户满意度</div>
            </div>
          </div>

          <!-- 漂浮元素动画 -->
          <div class="floating-elements">
            <div class="floating-element note-1"></div>
            <div class="floating-element note-2"></div>
            <div class="floating-element chart"></div>
            <div class="floating-element tag-1"></div>
            <div class="floating-element tag-2"></div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="modal-form">
        <!-- 关闭按钮 -->
        <button class="close-button" @click="closeModal">
          <CloseOutlined />
        </button>

        <!-- 表单区域头部 -->
        <div class="form-header">
          <h2 class="welcome-text">{{ activeTab === 'login' ? '欢迎回来' : '加入我们' }}</h2>
          <p class="sub-text">{{ activeTab === 'login' ? '继续您的学习之旅' : '开始您的知识构建之旅' }}</p>
        </div>

        <!-- 选项卡 -->
        <div class="tab-container">
          <div
              class="tab-item"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
          >
            登录
            <div class="tab-indicator" v-show="activeTab === 'login'"></div>
          </div>
          <div
              class="tab-item"
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
          >
            注册
            <div class="tab-indicator" v-show="activeTab === 'register'"></div>
          </div>
        </div>

        <!-- 登录表单 -->
        <div v-show="activeTab === 'login'" class="form-container login-form" key="login">
          <a-form
              :model="loginForm"
              @finish="handleLoginSubmit"
              layout="vertical"
              :rules="loginRules"
              ref="loginFormRef"
          >
            <a-form-item name="username" class="form-item">
              <a-input
                  v-model:value="loginForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  class="custom-input"
              >
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" class="form-item">
              <a-input-password
                  v-model:value="loginForm.password"
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
              >
                <template #prefix>
                  <LockOutlined class="input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <div class="form-options">
              <a-checkbox v-model:checked="loginForm.remember" class="remember-me">记住我</a-checkbox>
              <a class="forget-link">忘记密码？</a>
            </div>

            <a-form-item>
              <button type="submit" class="custom-submit-button" :disabled="loginLoading">
                <span v-if="loginLoading">登录中...</span>
                <span v-else>登录</span>
              </button>
            </a-form-item>
          </a-form>

          <!-- 社交登录部分 -->
          <div class="feature-preview">
            <h4 class="feature-title">登录后即可体验完整功能</h4>
            <div class="feature-list">
              <div class="feature-item">
                <BookOutlined class="feature-icon" />
                <span>构建知识笔记</span>
              </div>
              <div class="feature-item">
                <LinkOutlined class="feature-icon" />
                <span>建立知识连接</span>
              </div>
              <div class="feature-item">
                <TeamOutlined class="feature-icon" />
                <span>团队协作</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 注册表单 -->
        <div v-show="activeTab === 'register'" class="form-container register-form" key="register">
          <div class="register-form-container">
            <a-form
                :model="registerForm"
                @finish="handleRegisterSubmit"
                layout="vertical"
                ref="registerFormRef"
            >
              <!-- 用户名 -->
              <div class="form-field-container">
                <a-form-item name="username" class="form-item">
                  <a-input
                      v-model:value="registerForm.username"
                      placeholder="请输入用户名"
                      size="large"
                      class="custom-input"
                      :status="registerFormErrors.username ? 'error' : ''"
                  >
                    <template #prefix>
                      <UserOutlined class="input-icon" />
                    </template>
                  </a-input>
                  <div class="error-placeholder">
                    <div v-if="registerFormErrors.username" class="error-message">{{ registerFormErrors.username }}</div>
                  </div>
                </a-form-item>
              </div>

              <!-- 密码 -->
              <div class="form-field-container">
                <a-form-item name="password" class="form-item">
                  <a-input-password
                      v-model:value="registerForm.password"
                      placeholder="请输入密码"
                      size="large"
                      class="custom-input"
                      :status="registerFormErrors.password ? 'error' : ''"
                  >
                    <template #prefix>
                      <LockOutlined class="input-icon" />
                    </template>
                  </a-input-password>
                  <div class="password-strength" v-if="registerForm.password">
                    <div class="strength-bar">
                      <div
                          class="strength-indicator"
                          :style="{ width: passwordStrength.percent + '%' }"
                          :class="passwordStrength.level"
                      ></div>
                    </div>
                    <span class="strength-text" :class="passwordStrength.level">
                      {{ passwordStrength.text }}
                    </span>
                  </div>
                  <div class="error-placeholder">
                    <div v-if="registerFormErrors.password" class="error-message">{{ registerFormErrors.password }}</div>
                  </div>
                </a-form-item>
              </div>

              <!-- 确认密码 -->
              <div class="form-field-container">
                <a-form-item name="confirmPassword" class="form-item">
                  <a-input-password
                      v-model:value="registerForm.confirmPassword"
                      placeholder="请再次输入密码"
                      size="large"
                      class="custom-input"
                      :status="registerFormErrors.confirmPassword ? 'error' : ''"
                  >
                    <template #prefix>
                      <LockOutlined class="input-icon" />
                    </template>
                  </a-input-password>
                  <div class="error-placeholder">
                    <div v-if="registerFormErrors.confirmPassword" class="error-message">{{ registerFormErrors.confirmPassword }}</div>
                  </div>
                </a-form-item>
              </div>

              <!-- 同意协议 -->
              <div class="form-field-container">
                <a-form-item name="agreement" class="agreement-item">
                  <a-checkbox
                      v-model:checked="registerForm.agreement"
                      :class="{ 'checkbox-error': registerFormErrors.agreement }"
                  >
                    我已阅读并同意
                    <a class="link-text">《服务条款》</a>
                    和
                    <a class="link-text">《隐私政策》</a>
                  </a-checkbox>
                  <div class="error-placeholder">
                    <div v-if="registerFormErrors.agreement" class="error-message">{{ registerFormErrors.agreement }}</div>
                  </div>
                </a-form-item>
              </div>

              <a-form-item class="register-button-container">
                <button
                    type="submit"
                    class="custom-submit-button register-button"
                    :disabled="registerLoading"
                >
                  <span v-if="registerLoading">注册中...</span>
                  <span v-else>注册</span>
                </button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  GithubOutlined,
  WechatOutlined,
  QqOutlined,
  CloseOutlined,
  CodeOutlined,
  CheckCircleFilled
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';
import { h } from 'vue';

const userStore = useUserStore();
const route = useRoute();
const emit = defineEmits(['login-success']);

// 弹窗显示控制
const visible = ref(false);
const activeTab = ref('login'); // 默认显示登录页签

// 表单引用
const loginFormRef = ref();
const registerFormRef = ref();

// 加载状态
const loginLoading = ref(false);
const registerLoading = ref(false);

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: true
});

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

// 表单错误信息
const registerFormErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agreement: ''
});

// 计算密码强度
const passwordStrength = computed(() => {
  const password = registerForm.password;
  if (!password) return { level: '', text: '', percent: 0 };

  // 密码强度评分规则
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // 返回强度级别和文本
  if (score <= 2) return { level: 'weak', text: '弱', percent: 33 };
  if (score <= 4) return { level: 'medium', text: '中等', percent: 66 };
  return { level: 'strong', text: '强', percent: 100 };
});

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
};

// 清除所有错误信息
const clearAllErrors = () => {
  Object.keys(registerFormErrors).forEach(key => {
    registerFormErrors[key as keyof typeof registerFormErrors] = '';
  });
};

// 验证单个字段
const validateField = (field: string, value: any) => {
  registerFormErrors[field as keyof typeof registerFormErrors] = '';

  switch (field) {
    case 'username':
      if (!value) {
        registerFormErrors.username = '请输入用户名';
      } else if (value.length < 3 || value.length > 20) {
        registerFormErrors.username = '用户名长度应为3-20个字符';
      }
      break;
    case 'password':
      if (!value) {
        registerFormErrors.password = '请输入密码';
      } else if (value.length < 6) {
        registerFormErrors.password = '密码长度至少为6个字符';
      }
      break;
    case 'confirmPassword':
      if (!value) {
        registerFormErrors.confirmPassword = '请确认密码';
      } else if (value !== registerForm.password) {
        registerFormErrors.confirmPassword = '两次输入的密码不一致';
      }
      break;
    case 'agreement':
      if (!value) {
        registerFormErrors.agreement = '请阅读并同意条款';
      }
      break;
  }
};

// 监听表单字段变化清除相应错误
watch(() => registerForm.username, (val) => validateField('username', val));
watch(() => registerForm.password, (val) => {
  validateField('password', val);
  if (registerForm.confirmPassword) {
    validateField('confirmPassword', registerForm.confirmPassword);
  }
});
watch(() => registerForm.confirmPassword, (val) => validateField('confirmPassword', val));
watch(() => registerForm.agreement, (val) => validateField('agreement', val));

// 监听标签页切换，添加动画效果
watch(activeTab, () => {
  nextTick(() => {
    clearAllErrors();

    // 切换动画
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => {
      if (form.classList.contains(activeTab.value + '-form')) {
        form.classList.add('form-fade-in');
        setTimeout(() => {
          form.classList.remove('form-fade-in');
        }, 500);
      }
    });
  });
});

// 打开弹窗
const openModal = (tab: 'login' | 'register' = 'login') => {
  activeTab.value = tab;
  visible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  visible.value = false;

  // 重置表单
  loginFormRef.value?.resetFields();
  registerFormRef.value?.resetFields();

  // 重置错误信息
  clearAllErrors();
};

// 登录提交
const handleLoginSubmit = async (values: any) => {
  loginLoading.value = true;

  try {
    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 示例：用户信息
    const userInfo = {
      id: '1',
      username: values.username,
      avatar: '',
      role: 'user',
      email: 'user@example.com'
    };

    // 保存用户信息到状态管理
    userStore.setUserInfo(userInfo);

    // 成功动画和消息
    message.success({
      content: '登录成功！欢迎回来，' + values.username,
      icon: () => h(CheckCircleFilled, { style: 'color: #52c41a;' }),
    });

    closeModal();
    emit('login-success');
  } catch (error) {
    message.error('登录失败，请检查用户名和密码');
    console.error('登录失败:', error);
  } finally {
    loginLoading.value = false;
  }
};

// 注册提交
const handleRegisterSubmit = async () => {
  // 清除所有错误
  clearAllErrors();

  // 表单验证
  let hasError = false;

  if (!registerForm.username) {
    registerFormErrors.username = '请输入用户名';
    hasError = true;
  } else if (registerForm.username.length < 3 || registerForm.username.length > 20) {
    registerFormErrors.username = '用户名长度应为3-20个字符';
    hasError = true;
  }

  if (!registerForm.password) {
    registerFormErrors.password = '请输入密码';
    hasError = true;
  } else if (registerForm.password.length < 6) {
    registerFormErrors.password = '密码长度至少为6个字符';
    hasError = true;
  }

  if (!registerForm.confirmPassword) {
    registerFormErrors.confirmPassword = '请确认密码';
    hasError = true;
  } else if (registerForm.confirmPassword !== registerForm.password) {
    registerFormErrors.confirmPassword = '两次输入的密码不一致';
    hasError = true;
  }

  if (!registerForm.agreement) {
    registerFormErrors.agreement = '请阅读并同意条款';
    hasError = true;
  }

  if (hasError) return;

  registerLoading.value = true;

  try {
    // 模拟注册API调用
    await new Promise(resolve => setTimeout(resolve, 1200));

    message.success({
      content: '注册成功！请登录',
      icon: () => h(CheckCircleFilled, { style: 'color: #52c41a;' }),
    });

    // 切换到登录页签并填入注册的用户名
    activeTab.value = 'login';
    loginForm.username = registerForm.username;
  } catch (error) {
    message.error('注册失败，请稍后再试');
    console.error('注册失败:', error);
  } finally {
    registerLoading.value = false;
  }
};

// 创建粒子效果函数
const addParticles = () => {
  const particles = document.createElement('div');
  particles.className = 'particles';

  nextTick(() => {
    const decorationEl = document.querySelector('.modal-decoration');
    if (!decorationEl) return;
    decorationEl.appendChild(particles);

    for (let i = 0; i < 20; i++) {
      createParticle(particles);
    }
  });
};

// 创建单个粒子
const createParticle = (container: HTMLElement) => {
  const particle = document.createElement('div');
  particle.className = 'particle';

  const size = Math.random() * 5 + 2;
  const posX = Math.random() * 100;
  const posY = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = Math.random() * 10 + 10;
  const opacity = Math.random() * 0.5 + 0.1;

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${posX}%`;
  particle.style.top = `${posY}%`;
  particle.style.opacity = opacity.toString();
  particle.style.animation = `floating ${duration}s infinite ease-in-out`;
  particle.style.animationDelay = `${delay}s`;

  container.appendChild(particle);
};

// 检查URL参数，如果有showLogin参数，则自动打开登录弹窗
onMounted(() => {
  if (route.query.showLogin === 'true') {
    openModal(route.query.loginTab as 'login' | 'register' || 'login');
  }

  // 添加粒子效果
  addParticles();
});

// 导出组件方法
defineExpose({
  openModal,
  closeModal
});
</script>

<style scoped>
.auth-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-container {
  display: flex;
  height: 580px;
  position: relative;
}

/* 左侧装饰区域 */
.modal-decoration {
  flex: 1;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  position: relative;
  color: white; /* 确保所有文字为白色 */
  overflow: hidden;
  border-radius: 16px 0 0 16px;
}

.decoration-content {
  position: relative;
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.logo-box {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.logo-icon {
  color: white;
  font-size: 20px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.decoration-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  animation: glow 2s ease-in-out infinite alternate;
}

.decoration-subtitle {
  font-size: 16px;
  margin-bottom: 40px;
  opacity: 0.9;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.decoration-stats {
  display: flex;
  gap: 30px;
  margin-top: auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  color: white;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.3), 0 0 10px rgba(255, 255, 255, 0.2);
  }
  to {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3);
  }
}

/* 漂浮元素动画 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation-duration: 15s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.note-1 {
  width: 120px;
  height: 140px;
  top: 20%;
  right: -20px;
  transform: rotate(10deg);
  animation-name: float1;
}

.note-2 {
  width: 90px;
  height: 110px;
  top: 50%;
  left: 10%;
  transform: rotate(-8deg);
  animation-name: float2;
  animation-delay: 1s;
}

.chart {
  width: 160px;
  height: 80px;
  bottom: 25%;
  right: 15%;
  animation-name: float3;
  animation-delay: 2s;
}

.tag-1 {
  width: 70px;
  height: 30px;
  top: 35%;
  left: 20%;
  animation-name: float4;
  animation-delay: 0.5s;
}

.tag-2 {
  width: 80px;
  height: 30px;
  bottom: 20%;
  left: 5%;
  animation-name: float5;
  animation-delay: 1.5s;
}

@keyframes float1 {
  0%, 100% {
    transform: translate(0, 0) rotate(10deg);
  }
  50% {
    transform: translate(-10px, 15px) rotate(15deg);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translate(0, 0) rotate(-8deg);
  }
  50% {
    transform: translate(15px, -10px) rotate(-5deg);
  }
}

@keyframes float3 {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-15px, 10px);
  }
}

@keyframes float4 {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10px, 10px);
  }
}

@keyframes float5 {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(5px, -15px);
  }
}

/* 右侧表单区域 */
.modal-form {
  flex: 1;
  padding: 40px;
  position: relative;
  background: white;
  border-radius: 0 16px 16px 0;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
  color: #333;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.welcome-text {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #333;
  transition: all 0.3s ease;
}

.sub-text {
  font-size: 14px;
  color: #666;
  margin: 0;
  transition: all 0.3s ease;
}

.tab-container {
  display: flex;
  margin-bottom: 24px;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  color: #666;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #1C4ED8;
  font-weight: 500;
}

.tab-indicator {
  position: absolute;
  bottom: -1px;
  left: 30%;
  width: 40%;
  height: 2px;
  background-color: #1C4ED8;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.form-container {
  margin-top: 24px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.form-fade-in {
  animation: fadeIn 0.5s ease;
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

/* 注册表单容器 */
.register-form-container {
  position: relative;
}

/* 表单字段容器 - 包含输入框和错误信息 */
.form-field-container {
  margin-bottom: 10px !important; /* 将间距从15px减小到10px，并使用!important确保优先级 */
  position: relative;
}

.login-form {
  margin-top: 8px; /* 稍微减小顶部间距 */
}

.register-form {
  margin-top: 8px; /* 与登录表单保持一致 */
}

/* 5. 确保记住我和忘记密码选项之间有足够空间 */
.form-options {
  margin-bottom: 28px; /* 增加底部间距 */
}

.login-form .form-item {
  margin-bottom: 20px !important; /* 与注册表单保持一致 */
}

.form-item {
  margin-bottom: 4px !important;
}

.custom-input {
  height: 48px;
  border-radius: 8px;
}

.input-icon {
  color: #bbb;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  color: #666;
}

.forget-link {
  color: #1C4ED8;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
  font-weight: 500;
}

.forget-link:hover {
  color: #3662D9;
  text-decoration: underline;
}

/* 固定高度的错误信息占位符 */
.error-placeholder {
  height: 14px; /* 减小高度 */
  margin-top: 2px; /* 减小上边距 */
}

/* 错误信息样式 */
.error-message {
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.5;
  animation: errorFadeIn 0.3s;
}

@keyframes errorFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 自定义按钮样式 */
.custom-submit-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: white !important;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(28, 78, 216, 0.3);
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
}

/* 按钮光效 */
.custom-submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transition: all 0.8s ease;
}

.custom-submit-button:hover::before {
  left: 100%;
}

.custom-submit-button:hover {
  background: linear-gradient(135deg, #0F38A9 0%, #1C4ED8 100%);
  box-shadow: 0 6px 15px rgba(28, 78, 216, 0.4);
  transform: translateY(-2px);
}

.custom-submit-button:disabled {
  background: linear-gradient(135deg, #9BAAE0 0%, #B1BFE7 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 6px rgba(155, 170, 224, 0.3);
  opacity: 0.8;
}

/* 特别强调注册按钮 */
.register-button {
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  animation: gradientShift 5s ease infinite;
}

.register-button:hover {
  background: linear-gradient(135deg, #0F38A9 0%, #1C4ED8 100%);
}

.register-button-container {
  margin-top: 24px;
}

/* 按钮渐变动画 */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 5px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-right: 8px;
}

.strength-indicator {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-indicator.weak {
  background-color: #ff4d4f;
}

.strength-indicator.medium {
  background-color: #faad14;
}

.strength-indicator.strong {
  background-color: #52c41a;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
}

.strength-text.weak {
  color: #ff4d4f;
}

.strength-text.medium {
  color: #faad14;
}

.strength-text.strong {
  color: #52c41a;
}

.agreement-item {
  margin-bottom: 0 !important;
}

.agreement-item :deep(.ant-checkbox + span) {
  color: #333;
}

.checkbox-error :deep(.ant-checkbox + span) {
  color: #ff4d4f;
}

.link-text {
  color: #1C4ED8;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}

.link-text:hover {
  text-decoration: underline;
  color: #3662D9;
}


/* 美化左侧背景 */
.modal-decoration::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
      radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
  animation: rotate 60s linear infinite;
  z-index: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 表单元素聚焦时的样式增强 */
.custom-input:focus {
  border-color: #1C4ED8 !important;
  box-shadow: 0 0 0 2px rgba(28, 78, 216, 0.2) !important;
}

.custom-input:hover {
  border-color: #3662D9 !important;
}

/* 添加输入框聚焦动画 */
.form-item:focus-within {
  animation: formItemFocus 0.3s forwards;
}

@keyframes formItemFocus {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(0);
  }
}

/* 添加粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 修饰元素的细节样式 */
.note-1::before,
.note-2::before {
  content: '';
  position: absolute;
  width: 70%;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  top: 20px;
  left: 15%;
}

.note-1::after,
.note-2::after {
  content: '';
  position: absolute;
  width: 60%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  top: 40px;
  left: 20%;
  box-shadow: 0 10px 0 rgba(255, 255, 255, 0.15), 0 20px 0 rgba(255, 255, 255, 0.15);
}

.chart::before {
  content: '';
  position: absolute;
  width: 80%;
  height: 50%;
  bottom: 10px;
  left: 10%;
  background: linear-gradient(to top,
  rgba(255, 255, 255, 0.25) 0%,
  rgba(255, 255, 255, 0.15) 40%,
  rgba(255, 255, 255, 0.05) 100%);
  clip-path: polygon(
      0% 100%, 15% 70%, 30% 85%, 45% 60%, 60% 75%,
      75% 40%, 90% 60%, 100% 30%, 100% 100%
  );
  border-radius: 4px;
}

.tag-1::before,
.tag-2::before {
  content: '';
  position: absolute;
  width: 70%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  top: 12px;
  left: 15%;
}

/* Animate.css 类 */
.animate__animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.animate__delay-1s {
  animation-delay: 0.2s;
}

.animate__delay-2s {
  animation-delay: 0.4s;
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.animate__fadeInUp {
  animation-name: fadeInUp;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .modal-container {
    flex-direction: column;
    height: auto;
  }

  .modal-decoration {
    display: none;
  }

  .modal-form {
    padding: 30px 20px;
    border-radius: 16px;
  }

  .form-header {
    margin-top: 10px;
  }

  .auth-modal :deep(.ant-modal-content) {
    max-height: 90vh;
    overflow-y: auto;
  }
}
/* 4. 确保按钮文字颜色为白色 */
.custom-submit-button,
.custom-submit-button:hover,
.custom-submit-button:active,
.custom-submit-button:focus,
.register-button,
.register-button:hover {
  color: #ffffff !important; /* 使用完整的白色十六进制值 */
  font-weight: 600;
}

/* 5. 确保注册按钮也有白色文字 */
.register-button span,
.custom-submit-button span {
  color: #ffffff !important;
}

/* 6. 减少注册按钮容器上边距 */
.register-button-container {
  margin-top: 15px; /* 从24px减少 */
}

/* 7. 调整协议复选框与按钮之间的间距 */
.form-field-container:last-of-type {
  margin-bottom: 5px !important;
}

/* 8. 调整登录表单项目间距 */
.login-form .form-item {
  margin-bottom: 15px !important; /* 从20px减少 */
}
/* 新增功能预览区域样式 */
.feature-preview {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.feature-title {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 16px;
}

.feature-list {
  display: flex;
  justify-content: space-between;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(28, 78, 216, 0.03);
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(28, 78, 216, 0.07);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 20px;
  color: #1C4ED8;
  margin-bottom: 8px;
}

.feature-item span {
  font-size: 12px;
  color: #333;
}

/* 为注册表单底部也添加一个装饰元素 */
.register-form::after {
  content: '';
  display: block;
  height: 4px;
  background: linear-gradient(90deg, #1C4ED8, #3662D9, #1C4ED8);
  margin-top: 20px;
  border-radius: 2px;
  animation: gradientMove 3s infinite linear;
  background-size: 200% 100%;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}
</style>