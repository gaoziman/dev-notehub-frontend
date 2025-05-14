<template>
  <div class="modern-404-container">
    <!-- 背景装饰元素 -->
    <div class="background-elements">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
      <div class="geometric-shape triangle-1"></div>
      <div class="geometric-shape triangle-2"></div>
      <div class="geometric-shape circle-1"></div>
      <div class="geometric-shape circle-2"></div>
    </div>

    <div class="content-wrapper">
      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 404 视觉区域 -->
        <div class="error-visual">
          <div class="error-number-wrapper">
            <span class="error-digit">4</span>
            <div class="error-middle">
              <div class="astronaut-container">
                <div class="astronaut">
                  <div class="astronaut-head"></div>
                  <div class="astronaut-body"></div>
                  <div class="astronaut-arm-left"></div>
                  <div class="astronaut-arm-right"></div>
                </div>
                <div class="helmet-reflection"></div>
              </div>
            </div>
            <span class="error-digit">4</span>
          </div>

          <div class="stars">
            <div class="star" v-for="i in 20" :key="i" :style="getStarStyle(i)"></div>
          </div>
        </div>

        <!-- 标题和描述 -->
        <div class="text-content">
          <h1 class="error-title">哎呀！迷路了</h1>
          <h2 class="error-subtitle">页面不存在</h2>
          <p class="error-description">
            看起来您访问的页面正在宇宙中漂浮，我们的宇航员正在寻找它。
            <br>不过别担心，让我们帮您找到正确的方向。
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <div class="primary-actions">
            <n-button
                type="primary"
                size="large"
                class="modern-button primary-btn"
                @click="goBack"
                :focusable="false"
            >
              <template #icon>
                <icon-font type="icon-back" :size="18" />
              </template>
              返回上一页
            </n-button>

            <n-button
                size="large"
                class="modern-button secondary-btn"
                @click="goHome"
                :focusable="false"
            >
              <template #icon>
                <icon-font type="icon-home" :size="18" />
              </template>
              返回主页
            </n-button>
          </div>
        </div>

        <!-- 快速导航 -->
        <div class="quick-navigation">
          <p class="nav-title">探索这些精彩功能：</p>
          <div class="nav-grid">
            <div
                class="nav-card"
                v-for="link in quickLinks"
                :key="link.name"
                @click="navigateTo(link.route)"
            >
              <div class="nav-icon">
                <icon-font :type="link.icon" :size="24" />
              </div>
              <span class="nav-label">{{ link.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter()
const searchKeyword = ref('')

// 快速导航链接
const quickLinks = ref([
  { name: 'dashboard', route: 'dashboard', label: '仪表盘', icon: 'icon-dashboard' },
  { name: 'documents', route: 'documentpage', label: '文档管理', icon: 'icon-document' },
  { name: 'tools', route: 'tools', label: '工具集', icon: 'icon-tools' }
])

// 星星样式生成
const getStarStyle = (index) => {
  const size = Math.random() * 3 + 1
  const left = Math.random() * 100
  const top = Math.random() * 100
  const animationDelay = Math.random() * 3

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${animationDelay}s`
  }
}

// 路由方法
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const goHome = () => {
  router.push('/')
}

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      name: 'searchResults',
      query: { keyword: searchKeyword.value }
    })
  }
}

onMounted(() => {
  // 页面加载动画
  document.querySelector('.content-wrapper').style.opacity = '0'
  document.querySelector('.content-wrapper').style.transform = 'translateY(30px)'

  setTimeout(() => {
    document.querySelector('.content-wrapper').style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    document.querySelector('.content-wrapper').style.opacity = '1'
    document.querySelector('.content-wrapper').style.transform = 'translateY(0)'
  }, 100)
})
</script>

<style scoped>
/* 基础容器样式 */
.modern-404-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 背景装饰元素 */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.shape-4 {
  width: 30px;
  height: 30px;
  top: 30%;
  right: 30%;
  animation-delay: 3s;
}

.geometric-shape {
  position: absolute;
  opacity: 0.1;
}

.triangle-1 {
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 60px solid #fff;
  top: 15%;
  right: 10%;
  animation: rotate 20s linear infinite;
}

.triangle-2 {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 40px solid #fff;
  bottom: 20%;
  right: 40%;
  animation: rotate 15s linear infinite reverse;
}

.circle-1 {
  width: 100px;
  height: 100px;
  border: 3px solid #fff;
  border-radius: 50%;
  top: 40%;
  left: 5%;
  animation: pulse 4s ease-in-out infinite;
}

.circle-2 {
  width: 60px;
  height: 60px;
  border: 2px solid #fff;
  border-radius: 50%;
  bottom: 35%;
  right: 5%;
  animation: pulse 3s ease-in-out infinite;
}

/* 内容包装器 */
.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 800px;
  width: 100%;
}

.main-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 404 视觉设计 */
.error-visual {
  position: relative;
  margin-bottom: 40px;
}

.error-number-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 200px;
}

.error-digit {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

.error-middle {
  margin: 0 20px;
  position: relative;
}

/* 宇航员设计 */
.astronaut-container {
  position: relative;
  width: 120px;
  height: 120px;
  animation: spaceDrift 4s ease-in-out infinite;
}

.astronaut {
  position: relative;
  width: 100%;
  height: 100%;
}

.astronaut-head {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 50%;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid #667eea;
  box-shadow: inset 0 0 15px rgba(102, 126, 234, 0.3);
}

.astronaut-body {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 40px 40px 40px 40px;
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
}

.astronaut-arm-left,
.astronaut-arm-right {
  width: 30px;
  height: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 15px;
  position: absolute;
  top: 70px;
}

.astronaut-arm-left {
  left: 15px;
  transform: rotate(-20deg);
}

.astronaut-arm-right {
  right: 15px;
  transform: rotate(20deg);
}

.helmet-reflection {
  position: absolute;
  top: 15px;
  left: 35px;
  width: 25px;
  height: 25px;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.6));
  border-radius: 50%;
  opacity: 0.7;
}

/* 星星效果 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

/* 文本内容 */
.text-content {
  margin-bottom: 40px;
}

.error-title {
  font-size: 36px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.error-subtitle {
  font-size: 24px;
  font-weight: 500;
  color: #4a5568;
  margin: 0 0 20px 0;
}

.error-description {
  font-size: 16px;
  color: #718096;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

/* 操作按钮 */
.action-section {
  margin-bottom: 40px;
}

.primary-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.modern-button {
  border-radius: 12px !important;
  height: 48px !important;
  padding: 0 24px !important;
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1) !important;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border: none !important;
}

.primary-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px -5px rgba(102, 126, 234, 0.4) !important;
}

.secondary-btn {
  background: #fff !important;
  border: 2px solid #e2e8f0 !important;
  color: #4a5568 !important;
}

.secondary-btn:hover {
  transform: translateY(-2px) !important;
  border-color: #667eea !important;
  color: #667eea !important;
  box-shadow: 0 8px 25px -5px rgba(102, 126, 234, 0.2) !important;
}

/* 搜索区域 */
.search-area {
  margin-bottom: 40px;
}

.search-wrapper {
  max-width: 400px;
  margin: 0 auto;
}

.search-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
}

.search-input-wrapper .n-input-group {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
}

.modern-search-input {
  border: none !important;
  height: 48px !important;
}

.search-button {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border: none !important;
  height: 48px !important;
  padding: 0 20px !important;
}

/* 快速导航 */
.quick-navigation {
  padding-top: 30px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 20px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.nav-card {
  background: #fff;
  border: 2px solid #f7fafc;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.nav-card:hover {
  transform: translateY(-4px);
  border-color: #667eea;
  box-shadow: 0 12px 25px -5px rgba(102, 126, 234, 0.2);
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
  border-radius: 12px;
  margin-bottom: 12px;
  color: #667eea;
  transition: all 0.3s ease;
}

.nav-card:hover .nav-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  transform: scale(1.1);
}

.nav-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  transition: color 0.3s ease;
}

.nav-card:hover .nav-label {
  color: #667eea;
}

/* 动画定义 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

@keyframes glow {
  0% { text-shadow: 0 0 30px rgba(102, 126, 234, 0.5); }
  100% { text-shadow: 0 0 40px rgba(102, 126, 234, 0.7), 0 0 50px rgba(118, 75, 162, 0.5); }
}

@keyframes spaceDrift {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  50% { transform: translateY(-10px) rotate(0deg); }
  75% { transform: translateY(-20px) rotate(-2deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 40px 24px;
  }

  .error-digit {
    font-size: 80px;
  }

  .error-title {
    font-size: 28px;
  }

  .error-subtitle {
    font-size: 20px;
  }

  .primary-actions {
    flex-direction: column;
    align-items: center;
  }

  .modern-button {
    width: 100%;
    max-width: 280px;
  }

  .nav-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .nav-card {
    padding: 16px;
  }

  .background-elements .floating-shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .error-visual {
    margin-bottom: 30px;
  }

  .astronaut-container {
    width: 80px;
    height: 80px;
  }

  .error-digit {
    font-size: 60px;
  }

  .error-middle {
    margin: 0 10px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .main-content {
    background: rgba(26, 32, 44, 0.95);
    color: #e2e8f0;
  }

  .error-title {
    color: #f7fafc;
  }

  .error-subtitle {
    color: #cbd5e0;
  }

  .error-description {
    color: #a0aec0;
  }

  .nav-title {
    color: #cbd5e0;
  }

  .search-label {
    color: #a0aec0;
  }
}
</style>