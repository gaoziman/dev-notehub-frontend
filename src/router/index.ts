import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from "@/stores/user";
import { message } from "ant-design-vue";

// 页面组件
import HomePage from "@/pages/home/HomePage.vue";
import DashboardPage from "@/pages/home/DashboardPage.vue";
import NotFoundPage from "@/pages/404/NotFoundPage.vue";
import NotesManagementPage from "@/pages/note/NotesManagementPage.vue";

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        meta: {
            title: 'DevNoteHub - 您的知识体系构建工具',
            requiresAuth: false
        }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: {
            title: '仪表盘 - DevNoteHub',
            requiresAuth: true
        }
    },
    {
        path: '/notes',
        name: 'NotesManagementPage',
        component: NotesManagementPage,
        meta: {
            title: '我的笔记',
            requiresAuth: true
        }
    },
    // 404 页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundPage,
        meta: {
            title: '页面未找到 - DevNoteHub',
            requiresAuth: false
        }
    }
];

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
    // 更新页面标题
    document.title = to.meta.title as string || 'DevNoteHub';

    const userStore = useUserStore();

    // 检查是否需要登录
    if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
        message.warning('请先登录');

        // 将用户重定向到首页
        next({
            path: '/',
            query: { redirect: to.fullPath, showLogin: 'true' }
        });
    } else {
        next();
    }
});

export default router;