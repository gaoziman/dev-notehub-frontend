<template>
  <div class="welcome-container" :style="animationStyle">
    <!-- 简化的动画背景，从8个形状减少到4个 -->
    <div class="animated-background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="light-rays"></div>
    </div>

    <!-- 减少粒子数量 -->
    <div class="particles-container">
      <div v-for="n in 10" :key="`particle-${n}`"
           class="particle"
           :class="`particle-${n % 4}`"
           :style="{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${15 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 3}s`
           }">
      </div>
    </div>

    <!-- 主要内容包装器 -->
    <div class="content-wrapper">
      <!-- 首屏区域 -->
      <div class="hero-section">
        <div class="hero-content" v-animate="{ type: 'fade-in-right', duration: 800, delay: 200 }">
          <div class="title-container" v-animate="{ type: 'fade-in-up', duration: 800, delay: 300 }">
            <div class="logo-icon-wrapper">
              <icon-font type="icon-zhishiku1" :size="50" class="logo-icon" />
            </div>
            <h1 class="hero-title">智慧<span class="text-gradient">知识库</span></h1>
          </div>
          <h2 class="hero-subtitle" v-animate="{ type: 'fade-in-up', duration: 800, delay: 400 }">
            整合、管理和发现您的知识资产
          </h2>
          <p class="hero-description" v-animate="{ type: 'fade-in-up', duration: 800, delay: 500 }">
            欢迎使用智慧知识库，您的一站式知识管理平台。无论是文档、代码片段、学习资料还是网络书签，
            我们都能帮助您高效组织和利用这些宝贵资源，打造个人专属知识体系。
          </p>

          <!-- 简化统计卡片 -->
          <div class="hero-stats" v-animate="{ type: 'fade-in', duration: 800, delay: 600 }">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <icon-font type="icon-user" :size="24" class="stat-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  <span class="counter">10</span><span class="stat-unit">K</span><span class="stat-plus">+</span>
                </div>
                <div class="stat-label">活跃用户</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <icon-font type="icon-wenzhang" :size="24" class="stat-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  <span class="counter">50</span><span class="stat-unit">M</span><span class="stat-plus">+</span>
                </div>
                <div class="stat-label">存储知识</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <icon-font type="icon-cloud" :size="24" class="stat-icon" />
              </div>
              <div class="stat-content">
                <div class="stat-number">
                  <span class="counter">99</span><span class="stat-decimal">.9</span><span class="stat-percent">%</span>
                </div>
                <div class="stat-label">服务可靠性</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 简化的插图部分 -->
        <div class="hero-image" v-animate="{ type: 'fade-in-left', duration: 800, delay: 300 }">
          <div class="image-container">
            <div class="purple-blob"></div>
            <div class="icon-circle">
              <icon-font type="icon-zhishiku1" :size="120" class="main-icon" />
            </div>
            <div class="floating-icon icon-1">
              <icon-font type="icon-wendang" :size="32" />
            </div>
            <div class="floating-icon icon-2">
              <icon-font type="icon-shuqian" :size="32" />
            </div>
            <div class="floating-icon icon-3">
              <icon-font type="icon-daima" :size="32" />
            </div>
            <div class="floating-icon icon-4">
              <icon-font type="icon-xuexi" :size="32" />
            </div>
          </div>
        </div>
      </div>

      <!-- 登录/注册按钮 -->
      <div class="auth-buttons-container" v-animate="{ type: 'fade-in-up', duration: 800, delay: 700 }">
        <div class="auth-buttons-wrapper">
          <div class="auth-buttons">
            <n-button type="primary" size="large" class="auth-button login-button" @click="$emit('show-login')">
              <template #icon>
                <icon-font type="icon-login" :size="24" />
              </template>
              <span class="button-text">登录系统</span>
            </n-button>
            <div class="divider-container">
              <div class="divider-line"></div>
              <div class="divider-text">或者</div>
              <div class="divider-line"></div>
            </div>
            <n-button ghost size="large" class="auth-button register-button" @click="$emit('show-register')">
              <template #icon>
                <icon-font type="icon-register" :size="24" />
              </template>
              <span class="button-text">注册账号</span>
            </n-button>
          </div>
        </div>
        <div class="scroll-indicator">
          <div class="scroll-text">向下滚动了解更多</div>
          <div class="scroll-arrow"></div>
        </div>
      </div>

      <!-- 工作流程部分 -->
      <div class="workflow-section" ref="workflowSection">
        <div class="section-heading" v-animate="{ type: 'fade-in', duration: 800 }">
          <p class="section-tag">简单易用</p>
          <h2 class="section-title">简单三步，开启知识管理</h2>
          <div class="title-underline"></div>
        </div>

        <div class="workflow-steps">
          <div class="workflow-step"
               v-animate="{ type: 'fade-in-up', duration: 800, delay: 200 }"
               @mouseover="activateStep(0)"
               @mouseleave="deactivateStep"
               :class="{'active-step': activeStep === 0}">
            <div class="step-number">1</div>
            <div class="step-icon">
              <icon-font type="icon-collect" :size="40" />
            </div>
            <h3 class="step-title">收集</h3>
            <p class="step-description">便捷收集各类资源，一键保存网页、文档和代码</p>
          </div>

          <div class="step-connector">
            <div class="connector-line"></div>
          </div>

          <div class="workflow-step"
               v-animate="{ type: 'fade-in-up', duration: 800, delay: 400 }"
               @mouseover="activateStep(1)"
               @mouseleave="deactivateStep"
               :class="{'active-step': activeStep === 1}">
            <div class="step-number">2</div>
            <div class="step-icon">
              <icon-font type="icon-category" :size="40" />
            </div>
            <h3 class="step-title">整理</h3>
            <p class="step-description">智能分类，标签管理，建立您的知识结构</p>
          </div>

          <div class="step-connector">
            <div class="connector-line"></div>
          </div>

          <div class="workflow-step"
               v-animate="{ type: 'fade-in-up', duration: 800, delay: 600 }"
               @mouseover="activateStep(2)"
               @mouseleave="deactivateStep"
               :class="{'active-step': activeStep === 2}">
            <div class="step-number">3</div>
            <div class="step-icon">
              <icon-font type="icon-search" :size="40" />
            </div>
            <h3 class="step-title">应用</h3>
            <p class="step-description">快速检索，随时随地访问，让知识创造价值</p>
          </div>
        </div>
      </div>

      <!-- 功能部分 -->
      <div class="features-section" ref="featuresSection">
        <div class="section-heading" v-animate="{ type: 'fade-in', duration: 800 }">
          <p class="section-tag">核心功能</p>
          <h2 class="section-title">强大功能，助您知识管理更轻松</h2>
          <div class="title-underline"></div>
        </div>

        <div class="features-grid">
          <div class="feature-card"
               v-for="(feature, index) in features"
               :key="`feature-${index}`"
               v-animate="{ type: 'fade-in-up', duration: 800, delay: 200 + index * 200 }"
               @mouseover="hoverFeature(index)"
               @mouseleave="unhoverFeature">
            <div class="feature-top">
              <div class="feature-icon-bg" :class="{'icon-animated': hoveredFeature === index}">
                <icon-font :type="feature.icon" :size="36" class="feature-icon" />
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
            </div>
            <p class="feature-description">{{ feature.description }}</p>
            <ul class="feature-list">
              <li v-for="(item, i) in feature.items" :key="`feature-item-${index}-${i}`">{{ item }}</li>
            </ul>
            <div class="feature-footer">
              <n-button text class="feature-link">了解更多 →</n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术部分 -->
      <div class="technology-section" ref="technologySection">
        <div class="section-heading" v-animate="{ type: 'fade-in', duration: 800 }">
          <p class="section-tag">创新科技</p>
          <h2 class="section-title">智能技术，改变知识管理方式</h2>
          <div class="title-underline"></div>
        </div>

        <div class="technology-content">
          <div class="technology-visual" v-animate="{ type: 'fade-in-right', duration: 800, delay: 200 }">
            <div class="tech-animation">
              <div class="tech-circle"></div>
              <div class="tech-icon">
                <icon-font type="icon-brain" :size="60" />
              </div>
            </div>
          </div>

          <div class="technology-info" v-animate="{ type: 'fade-in-left', duration: 800, delay: 300 }">
            <div class="tech-feature"
                 v-for="(feature, index) in techFeatures"
                 :key="`tech-feature-${index}`"
                 @mouseover="hoverTechFeature(index)"
                 @mouseleave="unhoverTechFeature"
                 :class="{'tech-feature-active': hoveredTechFeature === index}">
              <div class="tech-feature-icon">
                <icon-font :type="feature.icon" :size="28" />
              </div>
              <div class="tech-feature-content">
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户反馈部分 -->
      <div class="testimonials-section" ref="testimonialsSection">
        <div class="section-heading" v-animate="{ type: 'fade-in', duration: 800 }">
          <p class="section-tag">用户心声</p>
          <h2 class="section-title">用户反馈</h2>
          <div class="title-underline"></div>
        </div>

        <div class="testimonials-container">
          <div class="testimonial-card"
               v-for="(testimonial, index) in testimonials"
               :key="`testimonial-${index}`"
               v-animate="{ type: 'fade-in-up', duration: 800, delay: 300 + index * 200 }"
               @mouseover="hoverTestimonial(index)"
               @mouseleave="unhoverTestimonial"
               :class="{'testimonial-active': hoveredTestimonial === index}">
            <div class="quote-icon">
              <icon-font type="icon-quote" :size="24" />
            </div>
            <p class="testimonial-text">{{ testimonial.text }}</p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <icon-font type="icon-user" :size="24" />
              </div>
              <div class="author-info">
                <h4>{{ testimonial.name }}</h4>
                <p>{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最终号召性按钮部分 -->
      <div class="final-cta-section" v-animate="{ type: 'fade-in', duration: 800 }" ref="ctaSection">
        <div class="cta-background">
          <div class="cta-gradient-overlay"></div>
        </div>

        <div class="cta-content">
          <h2 class="cta-title" v-animate="{ type: 'fade-in-up', duration: 800, delay: 300 }">立即加入智慧知识库</h2>
          <p class="cta-description" v-animate="{ type: 'fade-in-up', duration: 800, delay: 500 }">
            开始您的知识管理之旅，提升工作与学习效率
          </p>

          <div class="cta-actions" v-animate="{ type: 'fade-in-up', duration: 800, delay: 700 }">
            <div class="cta-buttons-container">
              <n-button type="primary" size="large" class="cta-button login-cta" @click="$emit('show-login')">
                <template #icon>
                  <icon-font type="icon-login" :size="20" />
                </template>
                <span>登录系统</span>
              </n-button>

              <n-button ghost size="large" class="cta-button register-cta" @click="$emit('show-register')">
                <template #icon>
                  <icon-font type="icon-register" :size="20" />
                </template>
                <span>注册账号</span>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted, computed } from 'vue';
import { animationStyle } from '@/utils/animation';
import { useIntersectionObserver } from '@vueuse/core';
import { throttle } from 'lodash'; // 添加节流函数

// 定义组件事件
const emit = defineEmits(['show-login', 'show-register']);

// 特性数据
const features = reactive([
  {
    icon: 'icon-wendang',
    title: '文档管理',
    description: '集中存储、组织和搜索您的所有重要文档',
    items: [
      '支持PDF、Word、Excel等多种格式',
      'OCR识别文档内容',
      '全文检索快速定位'
    ]
  },
  {
    icon: 'icon-shuqian',
    title: '书签管理',
    description: '保存和分类您的网络资源，随时快速访问',
    items: [
      '一键保存网页内容',
      '智能标签推荐',
      '离线阅读支持'
    ]
  },
  {
    icon: 'icon-xuexi',
    title: '学习追踪',
    description: '记录学习进度，建立个人知识体系',
    items: [
      '学习目标管理',
      '学习进度可视化',
      '复习提醒系统'
    ]
  }
]);

// 技术特性数据
const techFeatures = reactive([
  {
    icon: 'icon-ai',
    title: '智能分类推荐',
    description: 'AI自动分析文档内容，智能推荐分类和标签，帮助您快速构建知识结构'
  },
  {
    icon: 'icon-search',
    title: '语义搜索引擎',
    description: '基于深度学习的语义搜索，理解您的查询意图，找到最相关的知识内容'
  },
  {
    icon: 'icon-graph',
    title: '知识图谱可视化',
    description: '直观展示知识间的关联关系，发现隐藏的知识连接，激发创新思考'
  }
]);

// 用户反馈数据
const testimonials = reactive([
  {
    text: '智慧知识库帮助我将零散的知识整合成体系，极大提高了我的工作效率和学习成果。现在我可以随时随地访问我的知识资产，这真是太棒了！',
    name: '张先生',
    role: '资深软件工程师'
  },
  {
    text: '作为一名研究生，我需要整理大量的论文和研究资料。智慧知识库让我的文献管理变得如此简单，强大的搜索功能让我能够迅速找到需要的信息。',
    name: '李女士',
    role: '博士研究生'
  },
  {
    text: '智慧知识库的协作功能改变了我们团队的工作方式，知识共享变得简单高效。团队成员可以轻松访问和贡献知识，大大减少了重复劳动。',
    name: '王先生',
    role: '项目经理'
  }
]);

// 互动状态管理
const activeStep = ref(-1);
const hoveredFeature = ref(-1);
const hoveredTechFeature = ref(-1);
const hoveredTestimonial = ref(-1);

// 步骤激活状态
const activateStep = (index: number) => {
  activeStep.value = index;
};

const deactivateStep = () => {
  activeStep.value = -1;
};

// 特性卡片互动
const hoverFeature = (index: number) => {
  hoveredFeature.value = index;
};

const unhoverFeature = () => {
  hoveredFeature.value = -1;
};

// 技术特性互动
const hoverTechFeature = (index: number) => {
  hoveredTechFeature.value = index;
};

const unhoverTechFeature = () => {
  hoveredTechFeature.value = -1;
};

// 用户反馈互动
const hoverTestimonial = (index: number) => {
  hoveredTestimonial.value = index;
};

const unhoverTestimonial = () => {
  hoveredTestimonial.value = -1;
};

// 滚动进入视图动画
const workflowSection = ref<HTMLElement | null>(null);
const featuresSection = ref<HTMLElement | null>(null);
const technologySection = ref<HTMLElement | null>(null);
const testimonialsSection = ref<HTMLElement | null>(null);
const ctaSection = ref<HTMLElement | null>(null);

// 视差滚动效果
let scrollListener: any = null;
const parallaxElements = computed(() => [
  { element: workflowSection.value, factor: 0.05 },
  { element: featuresSection.value, factor: 0.07 },
  { element: technologySection.value, factor: 0.09 },
  { element: testimonialsSection.value, factor: 0.06 },
  { element: ctaSection.value, factor: 0.08 }
]);

// 添加数字滚动动画效果
onMounted(() => {
  // 数字滚动动画
  const animateCounter = (element: HTMLElement, target: number, duration: number = 2000) => {
    let startTime: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(startValue + easedProgress * (target - startValue));

      element.textContent = currentValue.toString();

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = target.toString();
      }
    };

    window.requestAnimationFrame(step);
  };

  const easeOutQuart = (x: number): number => {
    return 1 - Math.pow(1 - x, 4);
  };

  // 获取所有counter元素并应用动画
  const counterElements = document.querySelectorAll('.counter');

  // 使用IntersectionObserver检测元素何时进入视口
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const target = parseInt(element.textContent || '0', 10);
        animateCounter(element, target);
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.1 });

  counterElements.forEach(element => {
    observer.observe(element);
  });

  // 设置视差滚动效果，添加节流控制
  scrollListener = throttle(() => {
    parallaxElements.value.forEach(item => {
      if (item.element) {
        const scrollY = window.scrollY;
        const elementRect = item.element.getBoundingClientRect();
        const elementTop = elementRect.top + scrollY;
        const distance = scrollY - elementTop;
        const translateY = distance * item.factor;

        if (Math.abs(translateY) < 100) { // 限制最大位移
          item.element.style.transform = `translateY(${translateY}px)`;
        }
      }
    });
  }, 16); // 约60fps的节流控制

  window.addEventListener('scroll', scrollListener);

  // 初始化元素交叉观察
  const sections = [workflowSection, featuresSection, technologySection, testimonialsSection, ctaSection];

  sections.forEach(section => {
    if (section.value) {
      useIntersectionObserver(
          section,
          ([{ isIntersecting }]) => {
            if (isIntersecting) {
              section.value?.classList.add('section-visible');
            }
          },
          { threshold: 0.2 }
      );
    }
  });
});

onUnmounted(() => {
  // 清理滚动监听器
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener);
  }
});
</script>

<style scoped>
/* 基础样式 */
.welcome-container {
  min-height: 100vh;
  background: #fdfdff;
  color: #333;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* 简化的动画背景 */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.08;
  z-index: -1;
  transition: all 3s ease-in-out;
}

.shape-1 {
  background: linear-gradient(135deg, #9c27b0, #7e57c2);
  width: 600px;
  height: 600px;
  top: 5%;
  left: -200px;
  animation: float-shape 20s ease-in-out infinite alternate;
}

.shape-2 {
  background: linear-gradient(135deg, #673ab7, #5e35b1);
  width: 500px;
  height: 500px;
  top: 30%;
  right: -150px;
  animation: float-shape 18s ease-in-out infinite alternate-reverse;
}

.shape-3 {
  background: linear-gradient(135deg, #ba68c8, #9575cd);
  width: 400px;
  height: 400px;
  bottom: 10%;
  left: 10%;
  animation: float-shape 16s ease-in-out infinite alternate;
}

.shape-4 {
  background: linear-gradient(135deg, #7e57c2, #5e35b1);
  width: 300px;
  height: 300px;
  top: 60%;
  right: 15%;
  animation: float-shape 14s ease-in-out infinite alternate-reverse;
}

.light-rays {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(126, 87, 194, 0.07) 0%, rgba(126, 87, 194, 0) 70%),
  radial-gradient(ellipse at 80% 40%, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0) 70%);
}

@keyframes float-shape {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(30px, 20px);
  }
}

/* 简化的粒子效果 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  opacity: 0.3;
  transform-origin: center center;
  animation: float-particle linear infinite;
}

.particle-0 {
  background: #9c27b0;
}

.particle-1 {
  background: #673ab7;
}

.particle-2 {
  background: #7e57c2;
}

.particle-3 {
  background: #9575cd;
}

@keyframes float-particle {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-800px) translateX(100px);
    opacity: 0;
  }
}

/* 内容包装器 */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* 首屏区域样式 */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 3rem;
  min-height: 70vh;
  padding: 5rem 0 2rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.logo-icon-wrapper {
  width: 85px;
  height: 85px;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  border-radius: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 10px 20px rgba(126, 87, 194, 0.2);
  z-index: 1;
}

.logo-icon {
  color: #7e57c2;
}

.hero-title {
  font-size: 3.8rem;
  font-weight: 800;
  color: #333;
  margin: 0;
  line-height: 1.1;
  position: relative;
}

.text-gradient {
  background: linear-gradient(90deg, #7e57c2, #b39ddb);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-text 5s ease infinite;
}

@keyframes gradient-text {
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}

.hero-subtitle {
  font-size: 1.6rem;
  font-weight: 500;
  color: #666;
  margin: 0.5rem 0 0;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #555;
  margin: 0.5rem 0 1.5rem;
}

/* 简化的统计卡片 */
.hero-stats {
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.2rem 1.8rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 140px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(126, 87, 194, 0.15);
  border-left: 3px solid #7e57c2;
}

.stat-icon-wrapper {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #7e57c2;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #7e57c2;
  display: flex;
  align-items: baseline;
  line-height: 1.2;
}

.stat-unit {
  font-size: 1.2rem;
  margin-left: 2px;
}

.stat-plus, .stat-percent {
  font-size: 1.1rem;
  margin-left: 1px;
}

.stat-decimal {
  font-size: 1.2rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.2rem;
}

/* 简化的插图部分 */
.hero-image {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-container {
  position: relative;
  width: 500px;
  height: 500px;
}

.purple-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f5f0ff 0%, #ede7ff 70%, #e8e0ff 100%);
  border-radius: 56% 44% 70% 30% / 30% 54% 46% 70%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: blob-animation 15s linear infinite alternate;
  box-shadow: inset 0 0 40px rgba(126, 87, 194, 0.1);
}

@keyframes blob-animation {
  0% {
    border-radius: 56% 44% 70% 30% / 30% 54% 46% 70%;
  }
  100% {
    border-radius: 40% 60% 70% 30% / 47% 62% 38% 53%;
  }
}

.icon-circle {
  position: absolute;
  width: 180px;
  height: 180px;
  background: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 15px 40px rgba(126, 87, 194, 0.25);
  z-index: 3;
}

.main-icon {
  color: #7e57c2;
  filter: drop-shadow(0 5px 15px rgba(126, 87, 194, 0.3));
  animation: pulse-icon 4s ease-in-out infinite alternate;
}

@keyframes pulse-icon {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.floating-icon {
  position: absolute;
  width: 65px;
  height: 65px;
  background: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  color: #7e57c2;
  z-index: 3;
}

.icon-1 {
  top: 15%;
  left: 15%;
  animation: float 7s ease-in-out infinite;
}

.icon-2 {
  top: 20%;
  right: 10%;
  animation: float 8s ease-in-out infinite 1s;
}

.icon-3 {
  bottom: 20%;
  left: 10%;
  animation: float 9s ease-in-out infinite 0.5s;
}

.icon-4 {
  bottom: 15%;
  right: 15%;
  animation: float 6s ease-in-out infinite 1.5s;
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

/* 登录/注册按钮样式 */
.auth-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem 0 5rem;
  position: relative;
}

.auth-buttons-wrapper {
  position: relative;
  z-index: 2;
}

.auth-buttons {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(126, 87, 194, 0.15);
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.auth-button {
  min-width: 180px;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.button-text {
  position: relative;
  z-index: 2;
}

.login-button {
  background: linear-gradient(45deg, #7e57c2, #9575cd);
  border: none;
  color: white;
  box-shadow: 0 10px 20px rgba(126, 87, 194, 0.2);
}

.login-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(126, 87, 194, 0.3);
}

.register-button {
  border: 2px solid rgba(126, 87, 194, 0.3);
  color: #7e57c2;
  background: rgba(255, 255, 255, 0.9);
}

.register-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  border-color: #7e57c2;
}

.divider-container {
  display: flex;
  align-items: center;
  margin: 0 1.5rem;
  min-width: 100px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(126, 87, 194, 0.2);
}

.divider-text {
  color: #888;
  font-weight: 500;
  margin: 0 1rem;
  white-space: nowrap;
}

.scroll-indicator {
  margin-top: 4rem;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  animation: fade-pulse 2s infinite;
}

.scroll-arrow {
  width: 20px;
  height: 20px;
  border-right: 2px solid #7e57c2;
  border-bottom: 2px solid #7e57c2;
  transform: rotate(45deg);
  margin: 1rem auto;
  animation: scroll-arrow 2s infinite;
}

@keyframes fade-pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes scroll-arrow {
  0% {
    transform: rotate(45deg) translate(0, 0);
    opacity: 0.4;
  }
  50% {
    transform: rotate(45deg) translate(8px, 8px);
    opacity: 0.8;
  }
  100% {
    transform: rotate(45deg) translate(0, 0);
    opacity: 0.4;
  }
}

/* 部分标题复用样式 */
.section-heading {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
}

.section-tag {
  display: inline-block;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  color: #7e57c2;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 100px;
  margin-bottom: 1rem;
  box-shadow: 0 5px 15px rgba(126, 87, 194, 0.1);
}

.section-title {
  font-size: 2.4rem;
  color: #333;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #7e57c2, #b39ddb);
  border-radius: 2px;
  margin: 1rem auto;
}

/* 设置滚动动画的过渡 */
.workflow-section, .features-section, .technology-section, .testimonials-section, .final-cta-section {
  opacity: 0.7;
  transform: translateY(20px);
  transition: all 0.8s ease-out;
}

.section-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 工作流程部分样式 */
.workflow-section {
  padding: 7rem 0;
  position: relative;
}

.workflow-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4rem;
}

.workflow-step {
  background: white;
  border-radius: 24px;
  padding: 3rem 2rem;
  width: 300px;
  text-align: center;
  position: relative;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
  z-index: 1;
  overflow: hidden;
  transition: all 0.4s ease;
  border-bottom: 4px solid transparent;
}

.workflow-step:hover, .active-step {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(126, 87, 194, 0.15);
  border-bottom: 4px solid #7e57c2;
}

.step-number {
  background: linear-gradient(45deg, #7e57c2, #9575cd);
  color: white;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  position: absolute;
  top: -27px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 10px 25px rgba(126, 87, 194, 0.3);
  z-index: 2;
}

.step-icon {
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem auto 1.5rem;
  color: #7e57c2;
  transition: all 0.4s ease;
}

.workflow-step:hover .step-icon, .active-step .step-icon {
  transform: scale(1.1);
  box-shadow: 0 15px 35px rgba(126, 87, 194, 0.15);
}

.step-title {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  color: #333;
  transition: all 0.3s ease;
}

.workflow-step:hover .step-title, .active-step .step-title {
  color: #7e57c2;
}

.step-description {
  color: #666;
  line-height: 1.7;
  margin: 0;
  font-size: 1.05rem;
}

.step-connector {
  width: 120px;
  height: 3px;
  position: relative;
  margin: 0 -10px;
}

.connector-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #e0d6f2, #b39ddb);
  transform: translateY(-50%);
}

/* 功能部分样式 */
.features-section {
  padding: 7rem 0;
  background: linear-gradient(180deg, #ffffff 0%, #f9f6ff 100%);
  position: relative;
  overflow: hidden;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  position: relative;
}

.feature-card {
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  transition: all 0.4s ease;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(126, 87, 194, 0.12);
  border-color: #e6e0f3;
}

.feature-top {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.feature-icon-bg {
  min-width: 75px;
  height: 75px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #7e57c2;
  transition: all 0.4s ease;
}

.feature-card:hover .feature-icon-bg {
  transform: scale(1.08);
  box-shadow: 0 15px 35px rgba(126, 87, 194, 0.15);
}

.icon-animated {
  animation: icon-float 3s ease infinite alternate;
}

@keyframes icon-float {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}

.feature-title {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-title {
  color: #7e57c2;
}

.feature-description {
  font-size: 1.05rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.feature-list {
  padding-left: 1.2rem;
  margin-bottom: 1.5rem;
  list-style-type: none;
}

.feature-list li {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.8rem;
  color: #555;
  transition: all 0.3s ease;
}

.feature-list li::before {
  content: '•';
  position: absolute;
  left: -0.8rem;
  color: #7e57c2;
  font-weight: bold;
}

.feature-footer {
  margin-top: auto;
}

.feature-link {
  color: #7e57c2;
  font-weight: 500;
  padding: 0;
  transition: all 0.3s ease;
}

.feature-link:hover {
  transform: translateX(8px);
}

/* 技术部分样式 */
.technology-section {
  padding: 7rem 0;
  position: relative;
  overflow: hidden;
}

.technology-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.technology-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tech-animation {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tech-circle {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 20px 50px rgba(126, 87, 194, 0.15);
}

.tech-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #7e57c2;
  z-index: 2;
  animation: pulse-tech-icon 3s infinite alternate;
}

@keyframes pulse-tech-icon {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.technology-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tech-feature {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  background: white;
  padding: 1.8rem;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  border-left: 0px solid #7e57c2;
}

.tech-feature:hover, .tech-feature-active {
  transform: translateY(-8px) translateX(8px);
  box-shadow: 0 20px 50px rgba(126, 87, 194, 0.1);
  border-left: 4px solid #7e57c2;
}

.tech-feature-icon {
  min-width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #7e57c2;
  transition: all 0.3s ease;
}

.tech-feature:hover .tech-feature-icon, .tech-feature-active .tech-feature-icon {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(126, 87, 194, 0.15);
}

.tech-feature-content h3 {
  margin: 0 0 0.8rem;
  font-size: 1.3rem;
  color: #333;
  transition: all 0.3s ease;
}

.tech-feature:hover .tech-feature-content h3, .tech-feature-active .tech-feature-content h3 {
  color: #7e57c2;
}

.tech-feature-content p {
  margin: 0;
  color: #666;
  line-height: 1.7;
  font-size: 1.05rem;
}

/* 用户反馈部分样式 */
.testimonials-section {
  padding: 7rem 0;
  background: linear-gradient(180deg, #f9f6ff 0%, #ffffff 100%);
  position: relative;
}

.testimonials-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: white;
  border-radius: 24px;
  padding: 2.8rem;
  text-align: left;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
  position: relative;
  border-top: 4px solid transparent;
  transition: all 0.4s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.testimonial-card:hover, .testimonial-active {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(126, 87, 194, 0.12);
  border-top: 4px solid #9575cd;
}

.quote-icon {
  color: #d1c4e9;
  font-size: 2rem;
  position: absolute;
  top: 1.8rem;
  right: 1.8rem;
  z-index: 1;
  transition: all 0.3s ease;
}

.testimonial-card:hover .quote-icon, .testimonial-active .quote-icon {
  transform: scale(1.2) rotate(10deg);
  color: #b39ddb;
}

.testimonial-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #555;
  margin: 1rem 0 2rem;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  position: relative;
  z-index: 1;
  margin-top: auto;
}

.author-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f0ff, #ede7ff);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #7e57c2;
  box-shadow: 0 10px 25px rgba(126, 87, 194, 0.15);
}

.author-info h4 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  transition: all 0.3s ease;
}

.testimonial-card:hover .author-info h4, .testimonial-active .author-info h4 {
  color: #7e57c2;
}

.author-info p {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
  color: #666;
}

/* 最终号召性按钮部分样式 */
.final-cta-section {
  margin: 7rem 0 8rem;
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  min-height: 400px;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  background: linear-gradient(135deg, #673ab7, #7e57c2, #9575cd);
}

.cta-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%);
  z-index: 1;
}

.cta-content {
  position: relative;
  z-index: 4;
  padding: 5rem 3rem;
  text-align: center;
  color: white;
}

.cta-title {
  font-size: 2.8rem;
  margin: 0 0 1rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
}

.cta-description {
  font-size: 1.3rem;
  margin: 0 0 3rem;
  opacity: 0.9;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.cta-buttons-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.cta-button {
  min-width: 200px;
  height: 58px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.4s ease;
}

.login-cta {
  background: white;
  color: #7e57c2;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.login-cta:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.register-cta {
  border: 2px solid rgba(255, 255, 255, 0.8);
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.register-cta:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式样式 */
@media (max-width: 1200px) {
  .hero-section, .technology-content {
    grid-template-columns: 1fr;
    gap: 4rem;
  }

  .hero-content, .technology-info {
    order: 2;
  }

  .hero-image, .technology-visual {
    order: 1;
  }

  .hero-stats {
    justify-content: center;
  }
}

@media (max-width: 992px) {
  .auth-buttons {
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
  }

  .workflow-steps {
    flex-direction: column;
    gap: 4rem;
  }

  .step-connector {
    width: 3px;
    height: 60px;
  }

  .connector-line {
    top: 0;
    bottom: 0;
    left: 50%;
    right: auto;
    width: 2px;
    height: auto;
    transform: translateX(-50%);
    background: linear-gradient(180deg, #e0d6f2, #b39ddb);
  }

  .cta-buttons-container {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 320px;
  }

  .cta-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 1.5rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .section-title {
    font-size: 2.2rem;
  }

  .hero-stats {
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 1rem;
  }

  .stat-card {
    min-width: 160px;
    width: 100%;
    margin-bottom: 1rem;
  }

  .tech-animation {
    width: 300px;
    height: 300px;
  }

  .cta-content {
    padding: 4rem 2rem;
  }

  .cta-title {
    font-size: 2.4rem;
  }

  .cta-description {
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .auth-buttons-wrapper {
    width: 100%;
  }

  .auth-buttons {
    flex-direction: column;
    padding: 1.5rem;
    width: 100%;
    gap: 1.5rem;
  }

  .auth-button {
    width: 100%;
  }

  .divider-container {
    width: 100%;
    margin: 0.5rem 0;
  }

  .workflow-step {
    width: 100%;
    padding: 3rem 1.5rem;
  }

  .feature-top {
    flex-direction: column;
    text-align: center;
  }

  .feature-icon-bg {
    margin: 0 auto 1rem;
  }

  .tech-animation {
    width: 280px;
    height: 280px;
  }

  .tech-circle {
    width: 180px;
    height: 180px;
  }

  .tech-feature {
    padding: 1.5rem;
  }

  .testimonial-card {
    padding: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-content {
    padding: 3rem 1.5rem;
  }
}
</style>