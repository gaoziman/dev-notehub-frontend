import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import dayjs from 'dayjs';
import zhCN from 'dayjs/locale/zh-cn';

import App from './App.vue';
import DashboardPage from './pages/DashboardPage.vue';

// 配置dayjs语言为中文
dayjs.locale(zhCN);

// 路由配置
const routes = [
    { path: '/', component: DashboardPage },
    { path: '/dashboard', component: DashboardPage },
    // 后续可以添加其他路由
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 创建Vue应用
const app = createApp(App);

// 使用插件
app.use(Antd);
app.use(router);

// 挂载应用
app.mount('#app');