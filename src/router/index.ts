import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/components//layout/MainLayout.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'dashboard',
                component: () => import('@/pages/home/Dashboard.vue')
            },
            // {
            //     path: '/documents',
            //     name: 'documents',
            //     component: () => import('@/pages/Documents.vue')
            // },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router