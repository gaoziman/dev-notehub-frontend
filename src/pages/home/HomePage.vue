<template>
  <div class="home-page">
    <!-- 主要内容区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title animate__animated animate__fadeInUp">
          构建您的知识体系，<br />提升学习效率
        </h1>
        <p class="hero-description animate__animated animate__fadeInUp animate__delay-1s">
          DevNoteHub 帮助开发者整理笔记、追踪学习进度、构建知识框架，<br />让您的学习更有条理、更有效率
        </p>
        <div class="hero-actions animate__animated animate__fadeInUp animate__delay-2s">
          <a-button type="primary" size="large" class="primary-btn" @click="showLoginModal('register')">
            免费注册
          </a-button>
          <a-button size="large" class="secondary-btn" @click="showLoginModal('login')">
            立即登录
          </a-button>
        </div>
        <div class="hero-stats animate__animated animate__fadeIn animate__delay-3s">
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
      </div>
      <div class="hero-image animate__animated animate__fadeInRight">
        <div class="dashboard-mockup">
          <div class="mockup-header">
            <div class="mockup-logo"></div>
            <div class="mockup-nav"></div>
            <div class="mockup-user"></div>
          </div>
          <div class="mockup-content">
            <div class="mockup-sidebar"></div>
            <div class="mockup-main">
              <div class="mockup-chart"></div>
              <div class="mockup-cards">
                <div class="mockup-card"></div>
                <div class="mockup-card"></div>
                <div class="mockup-card"></div>
              </div>
              <div class="mockup-table"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="features-section">
      <h2 class="section-title">为何选择 DevNoteHub？</h2>
      <div class="features-grid">
        <div class="feature-card card-hover" v-for="(feature, index) in features" :key="index"
             v-motion
             :initial="{ opacity: 0, y: 50 }"
             :visibleOnce="{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }">
          <div class="feature-icon">
            <component :is="feature.icon" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- 使用流程 -->
    <section class="workflow-section">
      <h2 class="section-title">简单三步，开启学习之旅</h2>
      <div class="workflow-steps">
        <div class="workflow-step"
             v-motion
             :initial="{ opacity: 0, scale: 0.8 }"
             :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: 0.1 } }">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3 class="step-title">上传笔记</h3>
            <p class="step-description">将本地的Markdown、PDF等笔记上传至DevNoteHub</p>
          </div>
        </div>
        <div class="workflow-separator">
          <div class="arrow-animation">
            <RightOutlined />
          </div>
        </div>
        <div class="workflow-step"
             v-motion
             :initial="{ opacity: 0, scale: 0.8 }"
             :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: 0.3 } }">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3 class="step-title">整理分类</h3>
            <p class="step-description">使用标签和分类功能，系统化地整理您的笔记</p>
          </div>
        </div>
        <div class="workflow-separator">
          <div class="arrow-animation">
            <RightOutlined />
          </div>
        </div>
        <div class="workflow-step"
             v-motion
             :initial="{ opacity: 0, scale: 0.8 }"
             :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: 0.5 } }">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3 class="step-title">追踪进度</h3>
            <p class="step-description">通过仪表盘直观地查看学习进度和知识掌握情况</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 平台优势展示 -->
    <section class="advantages-section">
      <div class="advantage-container">
        <div class="advantage-content"
             v-motion
             :initial="{ opacity: 0, x: -50 }"
             :visibleOnce="{ opacity: 1, x: 0 }">
          <h2 class="advantage-title">告别混乱的学习笔记</h2>
          <p class="advantage-description">不再为散落各处的笔记而烦恼。DevNoteHub提供集中式存储，智能分类，让您的知识体系一目了然。</p>
          <ul class="advantage-list">
            <li><CheckOutlined /> 多格式支持：Markdown、PDF、代码片段</li>
            <li><CheckOutlined /> 智能标签系统</li>
            <li><CheckOutlined /> 全文搜索功能</li>
            <li><CheckOutlined /> 版本控制和历史记录</li>
          </ul>
        </div>
        <div class="advantage-image"
             v-motion
             :initial="{ opacity: 0, x: 50 }"
             :visibleOnce="{ opacity: 1, x: 0 }">
          <div class="notes-mockup">
            <div class="note-card main-note">
              <div class="note-header">
                <div class="note-title"></div>
                <div class="note-date"></div>
              </div>
              <div class="note-content">
                <div class="note-text"></div>
                <div class="note-text"></div>
                <div class="note-text"></div>
              </div>
              <div class="note-tags">
                <div class="note-tag"></div>
                <div class="note-tag"></div>
              </div>
            </div>
            <div class="note-card side-note-1">
              <div class="note-header">
                <div class="note-title"></div>
              </div>
              <div class="note-content">
                <div class="note-text"></div>
                <div class="note-text"></div>
              </div>
            </div>
            <div class="note-card side-note-2">
              <div class="note-header">
                <div class="note-title"></div>
              </div>
              <div class="note-content">
                <div class="note-text"></div>
                <div class="note-text"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="advantage-container reverse">
        <div class="advantage-content"
             v-motion
             :initial="{ opacity: 0, x: 50 }"
             :visibleOnce="{ opacity: 1, x: 0 }">
          <h2 class="advantage-title">数据驱动的学习进度</h2>
          <p class="advantage-description">可视化您的学习旅程，了解知识掌握程度，科学规划学习路径。</p>
          <ul class="advantage-list">
            <li><CheckOutlined /> 学习时间追踪</li>
            <li><CheckOutlined /> 知识点覆盖率分析</li>
            <li><CheckOutlined /> 定制学习目标</li>
            <li><CheckOutlined /> 进度报告和分析</li>
          </ul>
        </div>
        <div class="advantage-image"
             v-motion
             :initial="{ opacity: 0, x: -50 }"
             :visibleOnce="{ opacity: 1, x: 0 }">
          <div class="progress-mockup">
            <div class="chart-container">
              <div class="chart-header">
                <div class="chart-title"></div>
                <div class="chart-controls"></div>
              </div>
              <div class="chart-body">
                <div class="chart-bars">
                  <div class="chart-bar" style="height: 60%"></div>
                  <div class="chart-bar" style="height: 80%"></div>
                  <div class="chart-bar" style="height: 40%"></div>
                  <div class="chart-bar" style="height: 90%"></div>
                  <div class="chart-bar" style="height: 70%"></div>
                  <div class="chart-bar" style="height: 50%"></div>
                </div>
                <div class="chart-labels"></div>
              </div>
            </div>
            <div class="stats-cards">
              <div class="stat-card"></div>
              <div class="stat-card"></div>
              <div class="stat-card"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术栈展示 -->
    <section class="tech-section">
      <h2 class="section-title">适用于各种技术栈的学习</h2>
      <div class="tech-tags-container">
        <div class="tech-tags">
          <a-tag v-for="(tech, index) in techTags" :key="index" :color="tech.color"
                 :style="{ animationDelay: index * 0.1 + 's' }"
                 class="tech-tag animate__animated animate__fadeIn">
            {{ tech.name }}
          </a-tag>
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="testimonials-section">
      <h2 class="section-title">用户心声</h2>
      <a-carousel autoplay :dots="true" class="testimonial-carousel" effect="fade">
        <div class="testimonial-slide" v-for="(testimonial, index) in testimonials" :key="index">
          <div class="testimonial-card">
            <div class="testimonial-quote">"</div>
            <p class="testimonial-content">{{ testimonial.content }}</p>
            <div class="testimonial-author">
              <a-avatar :style="{ backgroundColor: testimonial.avatarColor }">{{ testimonial.avatarText }}</a-avatar>
              <div class="author-info">
                <h4 class="author-name">{{ testimonial.name }}</h4>
                <p class="author-title">{{ testimonial.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </a-carousel>
    </section>

    <!-- 常见问题 -->
    <section class="faq-section">
      <h2 class="section-title">常见问题</h2>
      <div class="faq-container">
        <a-collapse v-model:activeKey="activeKeys" :bordered="false">
          <a-collapse-panel v-for="(faq, index) in faqs" :key="index" :header="faq.question">
            <p>{{ faq.answer }}</p>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </section>

    <!-- 注册引导 -->
    <section class="cta-section">
      <div class="cta-particles" id="cta-particles"></div>
      <div class="cta-content">
        <h2 class="cta-title animate__animated animate__fadeIn">开始构建您的知识体系</h2>
        <p class="cta-description animate__animated animate__fadeIn animate__delay-1s">加入DevNoteHub，让您的学习更有条理、更有效率</p>
        <a-button type="primary" size="large" class="cta-button animate__animated animate__pulse animate__infinite" @click="showLoginModal('register')">
          立即注册
        </a-button>
      </div>
    </section>

    <!-- 登录/注册弹窗 -->
    <auth-modal ref="authModalRef" @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  FileTextOutlined,
  LineChartOutlined,
  ClusterOutlined,
  CloudOutlined,
  RightOutlined,
  CheckOutlined,
  TeamOutlined,
  RocketOutlined,
  SecurityScanOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue';
import AuthModal from '@/components/auth/AuthModal.vue';
import { useUserStore } from '@/stores/user';
// 导入动画库
import 'animate.css';
// 导入视差库
import { useMotion } from '@vueuse/motion';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const authModalRef = ref();

// FAQ面板激活的key
const activeKeys = ref(['0']);

// 特性数据
const features = [
  {
    icon: FileTextOutlined,
    title: '笔记整理',
    description: '轻松导入本地Markdown、PDF文件，自动分类整理，一站式管理您的所有学习资料'
  },
  {
    icon: LineChartOutlined,
    title: '学习进度追踪',
    description: '直观展示学习进度，自动分析学习时长，让您清晰了解自己的学习状态'
  },
  {
    icon: ClusterOutlined,
    title: '知识体系构建',
    description: '智能关联笔记内容，构建个人知识图谱，发现知识点之间的联系'
  },
  {
    icon: CloudOutlined,
    title: '云端同步',
    description: '多设备实时同步，随时随地访问您的笔记和学习记录'
  },
  {
    icon: TeamOutlined,
    title: '协作学习',
    description: '与同事和朋友共享笔记，相互点评与讨论，共同提高学习效率'
  },
  {
    icon: SecurityScanOutlined,
    title: '数据安全',
    description: '端到端加密保护，确保您的学习内容安全可靠，不被未授权访问'
  }
];

// 技术标签数据
const techTags = [
  { name: 'Java', color: 'blue' },
  { name: 'Spring', color: 'green' },
  { name: 'MySQL', color: 'orange' },
  { name: 'Redis', color: 'red' },
  { name: '消息队列', color: 'purple' },
  { name: '微服务', color: 'cyan' },
  { name: '前端开发', color: 'blue' },
  { name: 'DevOps', color: 'green' },
  { name: '人工智能', color: 'orange' },
  { name: '大数据', color: 'magenta' },
  { name: '云计算', color: 'lime' },
  { name: '区块链', color: 'gold' },
  { name: '网络安全', color: 'volcano' },
  { name: '容器化', color: 'geekblue' },
  { name: '算法', color: 'purple' }
];

// 用户评价数据
const testimonials = [
  {
    content: 'DevNoteHub彻底改变了我的学习方式，帮助我系统化地整理Java和Spring的学习资料，让我的学习效率提高了30%。',
    name: '张工',
    title: '后端开发工程师',
    avatarText: '张',
    avatarColor: '#1890ff'
  },
  {
    content: '作为一名前端开发者，我需要不断学习新技术。DevNoteHub帮助我追踪学习进度，构建知识体系，让我在技术更新换代中始终保持领先。',
    name: '李明',
    title: '前端开发专家',
    avatarText: '李',
    avatarColor: '#52c41a'
  },
  {
    content: '从一名初级开发者成长为高级工程师的过程中，DevNoteHub一直是我的得力助手，帮助我构建完整的知识体系和技术栈。',
    name: '王晓',
    title: '全栈开发工程师',
    avatarText: '王',
    avatarColor: '#722ed1'
  },
  {
    content: '数据可视化功能让我清晰了解每个技术领域的学习深度，帮助我更有针对性地补充知识盲点，面试时更有信心。',
    name: '赵悦',
    title: '资深Java工程师',
    avatarText: '赵',
    avatarColor: '#eb2f96'
  },
  {
    content: '知识图谱功能是我见过的最实用的学习工具，它将零散的知识点连接起来，让我对整个技术体系有了更清晰的认识。',
    name: '陈峰',
    title: '架构师',
    avatarText: '陈',
    avatarColor: '#fa8c16'
  }
];

// FAQ数据
const faqs = [
  {
    question: 'DevNoteHub支持哪些文件格式？',
    answer: 'DevNoteHub支持多种文件格式，包括Markdown、PDF、代码片段、文本文件等。您可以轻松导入这些文件，系统会自动分析内容并进行分类整理。'
  },
  {
    question: '我的数据安全吗？',
    answer: '您的数据安全是我们的首要任务。DevNoteHub采用端到端加密技术，确保您的笔记内容只有您自己可以访问。我们不会与任何第三方共享您的个人数据。'
  },
  {
    question: '如何追踪学习进度？',
    answer: 'DevNoteHub提供详细的学习统计功能，记录您的学习时长、笔记数量和知识点覆盖率。通过直观的图表展示，您可以清晰了解自己的学习状态，并据此调整学习计划。'
  },
  {
    question: '是否支持多设备同步？',
    answer: '是的，DevNoteHub支持多设备实时同步。无论您使用电脑、平板还是手机，都可以随时访问您的笔记和学习记录，保持学习的连续性。'
  },
  {
    question: '如何构建知识体系？',
    answer: 'DevNoteHub的知识图谱功能会自动分析您的笔记内容，识别知识点之间的关联，并构建个性化的知识体系。您还可以手动调整关联关系，打造符合自己思维方式的知识网络。'
  }
];

// 显示登录/注册弹窗
const showLoginModal = (tab: 'login' | 'register' = 'login') => {
  authModalRef.value.openModal(tab);
};

// 登录成功处理
const handleLoginSuccess = () => {
  // 如果有重定向参数，则跳转到对应页面
  const redirectPath = route.query.redirect as string;
  if (redirectPath) {
    router.push(redirectPath);
  } else {
    // 否则跳转到仪表盘
    router.push('/dashboard');
  }
};

// 粒子效果
let particlesInstance: any = null;

// 初始化粒子效果
const initParticles = async () => {
  try {
    const particles = await import('particles.js');
    particlesInstance = window.particlesJS('cta-particles', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#ffffff'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          }
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1
            }
          },
          push: {
            particles_nb: 4
          }
        }
      },
      retina_detect: true
    });
  } catch (error) {
    console.error('Failed to initialize particles:', error);
  }
};

// 在组件挂载时执行初始化
onMounted(() => {
  // 如果用户已登录，则直接跳转到仪表盘
  if (userStore.isLoggedIn()) {
    router.push('/dashboard');
    return;
  }

  // 检查URL参数
  if (route.query.showLogin === 'true') {
    showLoginModal(route.query.loginTab as 'login' | 'register' || 'login');
  }

  // 初始化粒子效果
  initParticles();

  // 添加滚动动画
  document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('card-lift');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('card-lift');
    });
  });
});

onUnmounted(() => {
  // 清理粒子实例
  if (particlesInstance) {
    particlesInstance.destroy();
  }
});
</script>

<style scoped>
.home-page {
  /* 移除顶部padding，改用margin-top来避免空白 */
  margin-top: 56px; /* 为固定的header留出空间 */
  overflow: hidden; /* 防止动画溢出 */
}

/* 英雄区域样式 */
.hero-section {
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  min-height: 600px;
  display: flex;
  align-items: center;
  padding: 64px 32px;
  position: relative;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  margin-right: 32px;
  z-index: 2;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 24px;
  line-height: 1.2;
}

.hero-description {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

/* 修改主要按钮文字颜色 */
.primary-btn {
  color: #ffffff !important; /* 纯白色 */
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 添加文字阴影增强可读性 */
}

/* 对Ant Design组件内部应用样式 */
.primary-btn :deep(span) {
  color: #ffffff !important;
}

/* 次要按钮样式确保足够的对比度 */
.secondary-btn {
  color: #1C4ED8 !important; /* 使用鲜明的蓝色 */
  font-weight: 600;
}

/* 对Ant Design组件内部应用样式 */
.secondary-btn :deep(span) {
  color: #1C4ED8 !important;
}


/* 确保Ant Design组件内部的文字颜色 */
.secondary-btn :deep(.ant-btn-text) {
  color: var(--primary-color) !important;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #0F38A9 0%, #1C4ED8 100%);
  box-shadow: 0 6px 16px rgba(28, 78, 216, 0.3);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  color: var(--primary-color-hover) !important;
  border-color: var(--primary-color-hover);
  background-color: #f0f5ff;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* 新增：统计数据样式 */
.hero-stats {
  display: flex;
  gap: 36px;
  margin-top: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1C4ED8;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 新增：英雄区域右侧UI模拟图 */
.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.dashboard-mockup {
  width: 100%;
  max-width: 500px;
  height: 360px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mockup-header {
  height: 50px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.mockup-logo {
  width: 100px;
  height: 24px;
  background: linear-gradient(90deg, #1C4ED8 0%, #3662D9 100%);
  border-radius: 4px;
}

.mockup-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mockup-user {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1C4ED8;
}

.mockup-content {
  flex: 1;
  display: flex;
}

.mockup-sidebar {
  width: 60px;
  background-color: #f9fafb;
  border-right: 1px solid #f0f0f0;
}

.mockup-main {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mockup-chart {
  height: 120px;
  background-color: #f0f5ff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.mockup-chart::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(90deg,
  rgba(28, 78, 216, 0.2) 0%,
  rgba(54, 98, 217, 0.4) 50%,
  rgba(28, 78, 216, 0.2) 100%);
  clip-path: polygon(0 100%, 5% 65%, 10% 80%, 15% 60%, 20% 65%, 25% 50%,
  30% 60%, 35% 45%, 40% 55%, 45% 40%, 50% 50%,
  55% 30%, 60% 40%, 65% 20%, 70% 30%, 75% 15%,
  80% 25%, 85% 10%, 90% 20%, 95% 5%, 100% 25%, 100% 100%);
  animation: chartWave 10s infinite ease-in-out;
}

@keyframes chartWave {
  0% { clip-path: polygon(0 100%, 5% 65%, 10% 80%, 15% 60%, 20% 65%, 25% 50%,
  30% 60%, 35% 45%, 40% 55%, 45% 40%, 50% 50%,
  55% 30%, 60% 40%, 65% 20%, 70% 30%, 75% 15%,
  80% 25%, 85% 10%, 90% 20%, 95% 5%, 100% 25%, 100% 100%); }
  50% { clip-path: polygon(0 100%, 5% 75%, 10% 60%, 15% 70%, 20% 55%, 25% 60%,
  30% 45%, 35% 55%, 40% 40%, 45% 50%, 50% 35%,
  55% 45%, 60% 30%, 65% 40%, 70% 20%, 75% 30%,
  80% 15%, 85% 25%, 90% 10%, 95% 20%, 100% 5%, 100% 100%); }
  100% { clip-path: polygon(0 100%, 5% 65%, 10% 80%, 15% 60%, 20% 65%, 25% 50%,
  30% 60%, 35% 45%, 40% 55%, 45% 40%, 50% 50%,
  55% 30%, 60% 40%, 65% 20%, 70% 30%, 75% 15%,
  80% 25%, 85% 10%, 90% 20%, 95% 5%, 100% 25%, 100% 100%); }
}

.mockup-cards {
  display: flex;
  gap: 8px;
}

.mockup-card {
  flex: 1;
  height: 60px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.mockup-table {
  flex: 1;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  display: grid;
  grid-template-rows: 30px repeat(3, 1fr);
  padding: 8px;
  gap: 4px;
}

.mockup-table::before {
  content: '';
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg, #e0e7ff 0%, #f0f0f0 50%, #e0e7ff 100%);
  border-radius: 4px;
}

/* 特性区域样式 */
.features-section {
  padding: 80px 32px;
  background-color: white;
  position: relative;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 48px;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #1C4ED8 0%, #3662D9 100%);
  margin: 16px auto 0;
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: #f9fafb;
  border-radius: 16px;
  padding: 32px;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.feature-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.card-lift {
  transform: translateY(-10px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  font-size: 24px;
  color: #4f46e5;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  color: white;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 工作流程区域样式 */
.workflow-section {
  padding: 80px 32px;
  background-color: #f0f5ff;
  position: relative;
}

.workflow-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.workflow-step {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  color: white;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  box-shadow: 0 4px 8px rgba(28, 78, 216, 0.2);
  transition: all 0.3s ease;
}

.workflow-step:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(28, 78, 216, 0.3);
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.step-description {
  color: var(--text-secondary);
  line-height: 1.5;
}

.workflow-separator {
  font-size: 24px;
  color: #94a3b8;
  margin: 0 16px;
  position: relative;
  z-index: 0;
}

.arrow-animation {
  animation: pulse 2s infinite;
  color: #1C4ED8;
}

@keyframes pulse {
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.5; transform: scale(1); }
}

/* 新增：平台优势部分 */
.advantages-section {
  padding: 80px 0;
  background-color: white;
}

.advantage-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  align-items: center;
  gap: 48px;
  margin-bottom: 80px;
}

.advantage-container.reverse {
  flex-direction: row-reverse;
}

.advantage-content {
  flex: 1;
}

.advantage-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.advantage-description {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.advantage-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.advantage-list li {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.advantage-list li :deep(svg) {
  color: #52c41a;
  margin-right: 8px;
  font-size: 16px;
}

.advantage-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 笔记模拟图 */
.notes-mockup {
  position: relative;
  width: 100%;
  height: 300px;
}

.note-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: absolute;
}

.main-note {
  width: 280px;
  height: 260px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  background: white;
  display: flex;
  flex-direction: column;
}

.side-note-1 {
  width: 220px;
  height: 180px;
  top: 40px;
  left: 20px;
  z-index: 2;
  background: #f9fafb;
  transform: rotate(-8deg);
}

.side-note-2 {
  width: 220px;
  height: 180px;
  top: 60px;
  right: 20px;
  z-index: 1;
  background: #f0f5ff;
  transform: rotate(5deg);
}

.note-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.note-title {
  height: 16px;
  width: 60%;
  background: #e0e7ff;
  border-radius: 4px;
}

.note-date {
  height: 12px;
  width: 20%;
  background: #f0f0f0;
  border-radius: 4px;
}

.note-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-text {
  height: 12px;
  background: #f0f0f0;
  border-radius: 4px;
}

.note-tags {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.note-tag {
  height: 16px;
  width: 40px;
  background: #e0e7ff;
  border-radius: 4px;
}

/* 进度模拟图 */
.progress-mockup {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  height: 16px;
  width: 30%;
  background: #e0e7ff;
  border-radius: 4px;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-controls::before, .chart-controls::after {
  content: '';
  display: block;
  width: 16px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 4px;
}

.chart-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding-bottom: 12px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #1C4ED8 0%, #3662D9 100%);
  border-radius: 4px 4px 0 0;
  transition: height 1s ease;
}

.chart-labels {
  height: 16px;
  background: #f9fafb;
  border-radius: 4px;
}

.stats-cards {
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  height: 80px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 技术栈区域样式 */
.tech-section {
  padding: 64px 32px;
  background-color: white;
  position: relative;
}

.tech-tags-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.tech-tag {
  font-size: 16px !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  margin: 0 !important;
  animation-duration: 1s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.tech-tag:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 用户评价区域样式 */
.testimonials-section {
  padding: 80px 32px;
  background-color: #f0f5ff;
  position: relative;
}

.testimonial-carousel {
  max-width: 800px;
  margin: 0 auto;
}

.testimonial-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  padding: 0 16px;
}

.testimonial-card {
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.testimonial-quote {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 60px;
  line-height: 1;
  color: #e0e7ff;
  font-family: 'Georgia', serif;
}

.testimonial-content {
  font-size: 18px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  font-style: italic;
  padding-left: 20px;
}

.testimonial-author {
  display: flex;
  align-items: center;
}

.testimonial-author :deep(.ant-avatar) {
  font-size: 16px;
  margin-right: 16px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.author-title {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 常见问题区域 */
.faq-section {
  padding: 80px 32px;
  background-color: white;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-container :deep(.ant-collapse) {
  background: transparent;
}

.faq-container :deep(.ant-collapse-item) {
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.faq-container :deep(.ant-collapse-header) {
  font-weight: 600;
  font-size: 16px;
  padding: 16px 24px !important;
}

.faq-container :deep(.ant-collapse-content-box) {
  padding: 16px 24px 24px !important;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 注册引导区域样式 */
.cta-section {
  padding: 80px 32px;
  background: linear-gradient(135deg, #1C4ED8 0%, #3662D9 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
}

.cta-button {
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  background-color: white;
  color: var(--primary-color);
  border: none;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  background-color: #f9fafb;
  color: var(--primary-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
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

.animate__delay-3s {
  animation-delay: 0.6s;
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.animate__fadeInUp {
  animation-name: fadeInUp;
}

.animate__fadeInRight {
  animation-name: fadeInRight;
}

.animate__pulse {
  animation-name: pulse;
}

.animate__infinite {
  animation-iteration-count: infinite;
  animation-duration: 3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translate3d(40px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    padding: 48px 24px;
  }

  .hero-content {
    max-width: 100%;
    margin-right: 0;
    margin-bottom: 48px;
    text-align: center;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: 16px;
  }

  .section-title {
    font-size: 28px;
  }

  .advantage-container {
    flex-direction: column;
    padding: 0 24px;
    gap: 32px;
  }

  .advantage-container.reverse {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .workflow-steps {
    flex-direction: column;
  }

  .workflow-separator {
    transform: rotate(90deg);
    margin: 16px 0;
  }

  .workflow-step {
    width: 100%;
  }

  .testimonial-content {
    font-size: 16px;
  }

  .cta-title {
    font-size: 30px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>