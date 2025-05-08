<template>
  <n-modal :show="show" transform-origin="center" :mask-closable="false">
    <div class="auth-modal-wrapper">
      <n-card
          :title="false"
          :bordered="false"
          size="huge"
          class="auth-modal-card"
      >
        <div class="auth-modal-inner">
          <!-- 左侧插图区域 -->
          <div class="auth-modal-illustration" v-animate="'fade-in'">
            <div class="illustration-glow"></div>
            <div class="illustration-background"></div>
            <div class="illustration-grid"></div>

            <div class="illustration-content">
              <div class="logo-container">
                <icon-font type="icon-zhishiku1" :size="76" class="illustration-icon" />
                <div class="logo-glow"></div>
              </div>

              <h2 class="illustration-title">智慧知识库</h2>
              <p class="illustration-text">您的个人知识管理解决方案</p>

              <div class="illustration-features">
                <div class="illustration-feature" v-for="(feature, index) in features" :key="index"
                     :style="{ animationDelay: `${0.2 + index * 0.1}s` }">
                  <div class="feature-icon-container">
                    <icon-font type="icon-check" :size="16" class="feature-check" />
                  </div>
                  <span>{{ feature }}</span>
                </div>
              </div>

              <div class="illustration-stats">
                <div class="stat-item">
                  <div class="stat-value">98<span class="percent">%</span></div>
                  <div class="stat-label">用户满意度</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-value">2.5<span class="plus">K+</span></div>
                  <div class="stat-label">每日活跃用户</div>
                </div>
              </div>
            </div>

            <div class="illustration-decoration">
              <div class="decoration-circle circle-1"></div>
              <div class="decoration-circle circle-2"></div>
              <div class="decoration-circle circle-3"></div>
              <div class="decoration-dot dot-1"></div>
              <div class="decoration-dot dot-2"></div>
              <div class="decoration-dot dot-3"></div>
              <div class="decoration-dot dot-4"></div>
              <div class="decoration-dot dot-5"></div>
              <div class="decoration-line line-1"></div>
              <div class="decoration-line line-2"></div>
            </div>
          </div>

          <!-- 右侧表单区域 -->
          <div class="auth-modal-form" v-animate="'fade-in'">
            <div class="auth-modal-header">
              <div
                  class="auth-tab"
                  :class="{ active: mode === 'login' }"
                  @click="mode = 'login'"
              >
                <icon-font type="icon-login" :size="18" />
                <span>登录</span>
              </div>
              <div
                  class="auth-tab"
                  :class="{ active: mode === 'register' }"
                  @click="mode = 'register'"
              >
                <icon-font type="icon-register" :size="18" />
                <span>注册</span>
              </div>
              <div class="sliding-highlight" :class="mode"></div>
            </div>

            <!-- 登录表单 -->
            <div v-if="mode === 'login'" v-animate="'fade-in'" class="form-container">
              <h2 class="form-title">欢迎回来</h2>
              <p class="form-subtitle">登录您的账号继续使用智慧知识库</p>

              <n-form
                  ref="loginFormRef"
                  :model="loginForm"
                  :rules="loginRules"
                  label-placement="left"
                  label-width="0"
                  require-mark-placement="right-hanging"
                  class="compact-form"
                  :show-feedback="true"
                  :show-label="false"
                  :show-require-mark="false"
              >
                <div class="form-field">
                  <label class="field-label">用户名</label>
                  <n-form-item path="username" :show-feedback="true">
                    <n-input
                        v-model:value="loginForm.username"
                        placeholder="请输入您的用户名"
                        size="large"
                        class="custom-input"
                        @keyup.enter="handleSubmit"
                        clearable
                    >
                      <template #prefix>
                        <icon-font type="icon-user" />
                      </template>
                    </n-input>
                  </n-form-item>
                </div>

                <div class="form-field">
                  <label class="field-label">密码</label>
                  <n-form-item path="password" :show-feedback="true">
                    <n-input
                        v-model:value="loginForm.password"
                        type="password"
                        show-password-on="click"
                        placeholder="请输入您的密码"
                        size="large"
                        class="custom-input"
                        @keyup.enter="handleSubmit"
                    >
                      <template #prefix>
                        <icon-font type="icon-password" />
                      </template>
                    </n-input>
                  </n-form-item>
                </div>

                <div class="form-actions">
                  <div class="remember-me">
                    <n-checkbox v-model:checked="rememberMe">
                      <span class="checkbox-label">记住我</span>
                    </n-checkbox>
                  </div>
                  <n-button text size="small" class="forgot-password">忘记密码?</n-button>
                </div>
              </n-form>

              <!-- 安全提示和装饰元素 -->
              <div class="auth-extras" v-animate="'fade-in'">
                <div class="security-tip">
                  <icon-font type="icon-safe" :size="16" class="tip-icon" />
                  <span>我们采用高级加密技术保护您的账户安全</span>
                </div>

                <div class="auth-divider">
                  <div class="divider-line"></div>
                  <div class="divider-icon">
                    <icon-font type="icon-zhishiku1" :size="14" />
                  </div>
                  <div class="divider-line"></div>
                </div>

              </div>
            </div>

            <!-- 注册表单 -->
            <div v-if="mode === 'register'" v-animate="'fade-in'" class="form-container">
              <h2 class="form-title">注册新账号</h2>
              <p class="form-subtitle">开始您的知识管理之旅</p>

              <n-form
                  ref="registerFormRef"
                  :model="registerForm"
                  :rules="registerRules"
                  label-placement="left"
                  label-width="0"
                  require-mark-placement="right-hanging"
                  class="compact-form"
                  :show-feedback="true"
                  :show-label="false"
                  :show-require-mark="false"
              >
                <div class="form-field">
                  <label class="field-label">用户名</label>
                  <n-form-item path="username" :show-feedback="true">
                    <n-input
                        v-model:value="registerForm.username"
                        placeholder="请设置您的用户名"
                        size="large"
                        class="custom-input"
                        @keyup.enter="handleSubmit"
                        clearable
                    >
                      <template #prefix>
                        <icon-font type="icon-user" />
                      </template>
                    </n-input>
                  </n-form-item>
                </div>

                <div class="form-field">
                  <label class="field-label">密码</label>
                  <n-form-item path="password" :show-feedback="true">
                    <n-input
                        v-model:value="registerForm.password"
                        type="password"
                        show-password-on="click"
                        placeholder="请设置您的密码"
                        size="large"
                        class="custom-input"
                        @keyup.enter="handleSubmit"
                    >
                      <template #prefix>
                        <icon-font type="icon-password" />
                      </template>
                    </n-input>
                  </n-form-item>
                </div>

                <div class="form-field">
                  <label class="field-label">确认密码</label>
                  <n-form-item path="confirmPassword" :show-feedback="true">
                    <n-input
                        v-model:value="registerForm.confirmPassword"
                        type="password"
                        show-password-on="click"
                        placeholder="请再次输入密码"
                        size="large"
                        class="custom-input"
                        @keyup.enter="handleSubmit"
                    >
                      <template #prefix>
                        <icon-font type="icon-password" />
                      </template>
                    </n-input>
                  </n-form-item>
                </div>

                <div class="password-strength" v-if="registerForm.password">
                  <div class="strength-label">密码强度:</div>
                  <div class="strength-meter">
                    <div class="strength-bar" :class="passwordStrengthClass"></div>
                  </div>
                  <div class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</div>
                </div>

                <div class="form-agreement">
                  <n-form-item path="agreeTerms" :show-feedback="true">
                    <n-checkbox v-model:checked="agreeTerms">
                      <span class="agreement-text">
                        我已阅读并同意
                        <n-button text size="small" type="primary" class="agreement-link">服务条款</n-button>
                        和
                        <n-button text size="small" type="primary" class="agreement-link">隐私政策</n-button>
                      </span>
                    </n-checkbox>
                  </n-form-item>
                </div>
              </n-form>
            </div>

            <div class="auth-modal-footer" v-animate="'fade-in-up'">
              <n-button
                  quaternary
                  size="large"
                  @click="handleCancel"
                  class="cancel-button"
              >
                取消
              </n-button>
              <n-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  @click="handleSubmit"
                  class="submit-button"
                  :disabled="mode === 'register' && !agreeTerms"
              >
                {{ mode === 'login' ? '登录' : '注册' }}
                <div class="button-shine"></div>
              </n-button>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import type { FormInst, FormRules, FormItemRule } from 'naive-ui'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  defaultMode: {
    type: String,
    default: 'login',
    validator: (value: string) => ['login', 'register'].includes(value)
  }
})

const emit = defineEmits(['update:show', 'login-success', 'register-success'])

// 路由和状态
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 登录/注册模式
const mode = ref(props.defaultMode as 'login' | 'register')

// 特性列表
const features = ref([
  '简单直观的界面',
  '强大的搜索功能',
  '跨设备同步',
  '多种资源管理'
])

// 监听props变化更新内部状态
watch(() => props.defaultMode, (newMode) => {
  if (newMode === 'login' || newMode === 'register') {
    mode.value = newMode
  }
})

// 表单引用
const loginFormRef = ref<FormInst | null>(null)
const registerFormRef = ref<FormInst | null>(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 记住我选项
const rememberMe = ref(false)

// 同意条款
const agreeTerms = ref(false)

// 加载状态
const loading = ref(false)

// ESC键关闭功能
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    handleCancel()
  }
}

// 挂载和卸载时添加/移除事件监听器
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = registerForm.password;
  if (!password) return 0;

  let strength = 0;

  // 长度检查
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // 复杂度检查
  if (/[A-Z]/.test(password)) strength += 1; // 大写字母
  if (/[a-z]/.test(password)) strength += 1; // 小写字母
  if (/[0-9]/.test(password)) strength += 1; // 数字
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // 特殊字符

  return Math.min(5, strength);
});

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'very-weak';
  if (strength === 2) return 'weak';
  if (strength === 3) return 'medium';
  if (strength === 4) return 'strong';
  return 'very-strong';
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return '非常弱';
  if (strength === 2) return '弱';
  if (strength === 3) return '中等';
  if (strength === 4) return '强';
  return '非常强';
});

// 用户名检验规则
const validateUsername = (rule: FormItemRule, value: string): boolean => {
  // 用户名必须为3-20位字母、数字、下划线或中文字符
  const usernamePattern = /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,20}$/;
  return usernamePattern.test(value);
};

// 密码检验规则
const validatePassword = (rule: FormItemRule, value: string): boolean => {
  // 密码必须至少包含6个字符，并且包含字母和数字
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordPattern.test(value);
};

// 登录表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    { validator: validateUsername, message: '用户名格式不正确，请使用3-20位字母、数字、下划线或中文', trigger: ['blur'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    { min: 6, message: '密码长度至少为6个字符', trigger: ['blur'] }
  ]
}

// 注册表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    { min: 3, max: 20, message: '用户名长度需在3-20个字符之间', trigger: ['blur', 'input'] },
    { validator: validateUsername, message: '用户名只能包含中文、字母、数字和下划线', trigger: ['blur'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    { min: 6, message: '密码长度至少为6个字符', trigger: ['blur', 'input'] },
    { validator: validatePassword, message: '密码必须包含字母和数字', trigger: ['blur'] }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: ['blur', 'input'] },
    {
      validator: (rule: FormItemRule, value: string): boolean => value === registerForm.password,
      message: '两次输入密码不一致',
      trigger: ['blur', 'input', 'password-input']
    }
  ]
}

// 监听密码变化，触发确认密码的验证
watch(() => registerForm.password, () => {
  if (registerForm.confirmPassword) {
    registerFormRef.value?.validateField('confirmPassword');
  }
});

// 取消按钮
const handleCancel = () => {
  // 重置表单
  if (mode.value === 'login') {
    loginFormRef.value?.restoreValidation();
    loginForm.username = '';
    loginForm.password = '';
  } else {
    registerFormRef.value?.restoreValidation();
    registerForm.username = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
    agreeTerms.value = false;
  }
  emit('update:show', false);
}

// 提交表单 - 已修改，移除了表单验证错误的全局消息提示
const handleSubmit = () => {
  if (mode.value === 'login') {
    loginFormRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          loading.value = true
          const success = await userStore.login(loginForm.username, loginForm.password)

          if (success) {
            message.success('登录成功')
            emit('login-success')
            emit('update:show', false)
            router.push('/dashboard')
          } else {
            message.error('用户名或密码错误')
          }
        } finally {
          loading.value = false
        }
      }
      // 移除了这里的 message.error 调用，仅依靠表单内的错误提示
    })
  } else {
    registerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        if (!agreeTerms.value) {
          message.warning('请阅读并同意服务条款和隐私政策');
          return;
        }

        try {
          loading.value = true
          // 注意：根据您的 userStore.register 方法实现，可能需要调整参数
          const success = await userStore.register(
              registerForm.username,
              registerForm.password
          )

          if (success) {
            message.success('注册成功')
            // 填充登录表单
            loginForm.username = registerForm.username
            loginForm.password = registerForm.password
            // 切换到登录
            mode.value = 'login'
            emit('register-success', registerForm.username, registerForm.password)
          } else {
            message.error('注册失败，用户名可能已存在')
          }
        } finally {
          loading.value = false
        }
      }
      // 移除了这里的 message.error 调用，仅依靠表单内的错误提示
    })
  }
}
</script>

<style scoped>
.auth-modal-wrapper {
  perspective: 1200px;
}

.auth-modal-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(124, 85, 194, 0.25);
  backdrop-filter: blur(8px);
  transform-style: preserve-3d;
  animation: card-appear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  width: 860px;
  max-width: 95vw;
}

@keyframes card-appear {
  0% {
    transform: translateY(20px) rotateX(5deg);
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotateX(0);
    opacity: 1;
  }
}

.auth-modal-inner {
  display: grid;
  grid-template-columns: 43% 57%;
  min-height: 600px;
}

/* 左侧插图区域 */
.auth-modal-illustration {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #7e57c2, #b388ff);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
  text-align: center;
  position: relative;
  box-shadow: inset -5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.illustration-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(179, 136, 255, 0.6) 0%, rgba(126, 87, 194, 0) 70%);
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  filter: blur(25px);
  z-index: 0;
  animation: glow-pulse 8s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% {
    opacity: 0.5;
    transform: translateX(-50%) scale(0.9);
  }
  100% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1.1);
  }
}

.illustration-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.15;
  z-index: 1;
}

.illustration-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 50px 50px;
  background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  z-index: 2;
}

.illustration-content {
  position: relative;
  z-index: 10;
  width: 100%;
}

.logo-container {
  position: relative;
  width: 128px;
  height: 128px;
  margin: 0 auto 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
  animation: float-icon 5s ease-in-out infinite;
}

@keyframes float-icon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(8px);
  z-index: 1;
  animation: logo-pulse 3s infinite alternate;
}

@keyframes logo-pulse {
  0% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.illustration-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(to right, #ffffff, #e0d7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.illustration-text {
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.illustration-features {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  align-items: flex-start;
  text-align: left;
  margin-bottom: 2.5rem;
  position: relative;
}

.illustration-feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  opacity: 0;
  animation: feature-slide-in 0.5s ease-out forwards;
  position: relative;
}

.feature-icon-container {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1),
  inset 0 1px 1px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.feature-icon-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  border-radius: 50%;
}

.feature-check {
  color: #ffffff;
  z-index: 1;
}

@keyframes feature-slide-in {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.illustration-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
  inset 0 1px 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.illustration-stats::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
  rgba(255, 255, 255, 0),
  rgba(255, 255, 255, 0.5),
  rgba(255, 255, 255, 0));
}

.stat-item {
  text-align: center;
  flex: 1;
  position: relative;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom,
  rgba(255, 255, 255, 0),
  rgba(255, 255, 255, 0.3),
  rgba(255, 255, 255, 0));
  margin: 0 15px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.percent, .plus {
  font-size: 1rem;
  margin-left: 2px;
  opacity: 0.8;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 300;
}

.illustration-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 180px;
  height: 180px;
  top: -90px;
  left: -90px;
  animation: float-slow 18s ease-in-out infinite alternate;
}

.circle-2 {
  width: 140px;
  height: 140px;
  bottom: 15%;
  right: -70px;
  animation: float-slow 15s ease-in-out infinite alternate-reverse;
}

.circle-3 {
  width: 90px;
  height: 90px;
  bottom: -45px;
  left: 25%;
  animation: float-slow 12s ease-in-out infinite alternate;
}

.decoration-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.dot-1 {
  width: 8px;
  height: 8px;
  top: 20%;
  right: 15%;
  animation: blink 5s infinite alternate;
}

.dot-2 {
  width: 5px;
  height: 5px;
  top: 35%;
  right: 25%;
  animation: blink 7s infinite alternate-reverse;
}

.dot-3 {
  width: 6px;
  height: 6px;
  bottom: 30%;
  right: 10%;
  animation: blink 6s infinite alternate;
}

.dot-4 {
  width: 4px;
  height: 4px;
  top: 15%;
  left: 20%;
  animation: blink 8s infinite alternate-reverse;
}

.dot-5 {
  width: 7px;
  height: 7px;
  bottom: 15%;
  left: 35%;
  animation: blink 4s infinite alternate;
}

@keyframes blink {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

.decoration-line {
  position: absolute;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  height: 1px;
}

.line-1 {
  width: 120px;
  transform: rotate(45deg);
  top: 30%;
  right: 10%;
  animation: fade-in-out 8s infinite alternate;
}

.line-2 {
  width: 80px;
  transform: rotate(-30deg);
  bottom: 20%;
  left: 15%;
  animation: fade-in-out 6s infinite alternate-reverse;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes float-slow {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(15px, 15px);
  }
}

/* 右侧表单区域 */
.auth-modal-form {
  display: flex;
  flex-direction: column;
  padding: 2.5rem 3.5rem;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.8));
  position: relative;
  overflow: hidden;
}

.auth-modal-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
  z-index: 0;
}

.auth-modal-header {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.auth-tab {
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  z-index: 2;
  font-size: 1.1rem;
  color: #666;
}

.auth-tab:hover {
  color: #7e57c2;
}

.auth-tab.active {
  color: #7e57c2;
}

.sliding-highlight {
  position: absolute;
  height: 3px;
  bottom: -1px;
  background: linear-gradient(90deg, #7e57c2, #b388ff);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 50%;
  border-radius: 3px 3px 0 0;
  z-index: 1;
  box-shadow: 0 -1px 10px rgba(126, 87, 194, 0.3);
}

.sliding-highlight.login {
  left: 0;
}

.sliding-highlight.register {
  left: 50%;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.form-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #7e57c2, #b388ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-field {
  margin-bottom: 0.5rem; /* 减少表单字段间的间距 */
}

.field-label {
  display: block;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

/* 优化表单项样式 */
:deep(.n-form-item .n-form-item-feedback-wrapper) {
  min-height: 1.25em; /* 保持错误提示的空间 */
}

:deep(.n-form-item-feedback) {
  font-size: 0.8rem; /* 减小错误信息字体大小 */
}

:deep(.n-form-item.n-form-item--error .n-input) {
  border-color: #ff4d4f;
}

.custom-input {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  transition: all 0.3s;
}

.custom-input:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0 0.5rem;
  align-items: center;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #555;
}

.forgot-password {
  color: #7e57c2;
  font-weight: 500;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
}

.forgot-password::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #7e57c2;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.forgot-password:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* 安全提示和装饰元素样式 */
.auth-extras {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  animation: fade-in 0.5s ease-out forwards;
}

.security-tip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  background: rgba(126, 87, 194, 0.05);
  border-radius: 12px;
  border-left: 3px solid rgba(126, 87, 194, 0.5);
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.tip-icon {
  color: #7e57c2;
  flex-shrink: 0;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 0.8rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg,
  rgba(126, 87, 194, 0.05),
  rgba(126, 87, 194, 0.2),
  rgba(126, 87, 194, 0.05));
}

.divider-icon {
  margin: 0 0.8rem;
  padding: 0.3rem;
  background: rgba(126, 87, 194, 0.05);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #7e57c2;
}

.login-benefits {
  display: flex;
  justify-content: space-around;
  margin-top: 0.8rem;
  text-align: center;
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #666;
  padding: 0.6rem 0.5rem;
  border-radius: 10px;
  background: rgba(126, 87, 194, 0.03);
  width: 30%;
  transition: all 0.3s;
}

.benefit-item:hover {
  background: rgba(126, 87, 194, 0.08);
  transform: translateY(-2px);
}

.benefit-icon {
  color: #7e57c2;
  margin-bottom: 0.2rem;
}

.register-welcome {
  text-align: center;
  margin-top: 0.8rem;
}

.welcome-message {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

.highlight {
  color: #7e57c2;
  font-weight: 600;
  margin: 0 0.2rem;
}

.dots-decoration {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(126, 87, 194, 0.3);
  display: inline-block;
  animation: dot-pulse 1.5s infinite alternate;
}

.dot:nth-child(2) {
  animation-delay: 0.5s;
}

.dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes dot-pulse {
  0% {
    transform: scale(0.7);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* 密码强度指示器 */
.password-strength {
  margin: 0.5rem 0 0.8rem;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.8rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.strength-label {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.strength-meter {
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.strength-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease, background-color 0.4s ease;
}

.strength-bar.very-weak {
  width: 20%;
  background: linear-gradient(to right, #ff5252, #ff7676);
}

.strength-bar.weak {
  width: 40%;
  background: linear-gradient(to right, #ff9800, #ffb74d);
}

.strength-bar.medium {
  width: 60%;
  background: linear-gradient(to right, #ffd600, #ffea00);
}

.strength-bar.strong {
  width: 80%;
  background: linear-gradient(to right, #9ccc65, #aed581);
}

.strength-bar.very-strong {
  width: 100%;
  background: linear-gradient(to right, #4caf50, #66bb6a);
}

.strength-text {
  font-size: 0.85rem;
  text-align: right;
  font-weight: 500;
}

.strength-text.very-weak,
.strength-text.weak {
  color: #ff5252;
}

.strength-text.medium {
  color: #ff9800;
}

.strength-text.strong,
.strength-text.very-strong {
  color: #4caf50;
}

.form-agreement {
  margin: 0.8rem 0 0.5rem;
}

.agreement-text {
  font-size: 0.9rem;
  color: #555;
}

.agreement-link {
  color: #7e57c2;
  font-weight: 500;
  text-decoration: none;
  position: relative;
}

.agreement-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #7e57c2;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.agreement-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.auth-modal-footer {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 0.5rem;
  padding-top: 0;
  position: relative;
  z-index: 1;
}

.cancel-button {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.3s;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.cancel-button:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.submit-button {
  position: relative;
  overflow: hidden;
  min-width: 130px;
  background: linear-gradient(135deg, #7e57c2, #b388ff);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(126, 87, 194, 0.3);
  transition: all 0.3s;
  padding-left: 1.8rem;
  padding-right: 1.8rem;
  z-index: 1;
}

.submit-button:hover {
  box-shadow: 0 6px 20px rgba(126, 87, 194, 0.4);
  transform: translateY(-2px);
}

.button-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-20deg) translateX(-100%);
  animation: button-shine 4s infinite;
}

@keyframes button-shine {
  0% {
    transform: skewX(-20deg) translateX(-100%);
  }
  15% {
    transform: skewX(-20deg) translateX(100%);
  }
  100% {
    transform: skewX(-20deg) translateX(100%);
  }
}

/* 动画 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-modal-inner {
    grid-template-columns: 1fr;
  }

  .auth-modal-illustration {
    display: none;
  }

  .auth-modal-form {
    padding: 2rem;
  }

  .auth-modal-card {
    width: 90vw;
  }

  .login-benefits {
    flex-direction: column;
    gap: 0.5rem;
  }

  .benefit-item {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    padding: 0.5rem 1rem;
  }
}
</style>