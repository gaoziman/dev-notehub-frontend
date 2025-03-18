import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    // 定义您的路由
    // {
    //     path: '/',
    //     name: 'Home',
    //     component: () => import('@/views/Home.vue') // 确保这个组件存在
    // }
    // 添加更多路由...
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router