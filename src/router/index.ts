import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import toolsRoutes from '@/router/tools.routes'

// 文档相关的路由单独配置
const documentRoutes = [
    {
        path: '/document/upload',
        name: 'UploadDocument',
        component: () => import('@/pages/document/UploadDocument.vue'),
        meta: {
            title: '上传文档',
            requiresAuth: true,
            hideNavbar: true
        }
    },
    {
        path: '/document/create',
        name: 'CreateDocument',
        component: () => import('@/pages/document/CreateDocument.vue'),
        meta: {
            title: '创建文档',
            requiresAuth: true,
            hideNavbar: true
        }
    },
    {
        path: '/document/edit/:id',
        name: 'EditDocument',
        component: () => import('@/pages/document/CreateDocument.vue'),
        meta: {
            title: '编辑文档',
            requiresAuth: true,
            hideNavbar: true
        }
    },
    {
        path: '/document/view/:id',
        name: 'ViewDocument',
        component: () => import('@/pages/document/ViewDocument.vue'),
        meta: {
            title: '查看文档',
            hideNavbar: true
        }
    },
    {
        path: '/pdf/view/:id',
        name: 'ViewPDFDocument',
        component: () => import('@/pages/document/ViewPDFDocument.vue'),
        props: true,
        meta: {
            title: 'PDF查看器'
        }
    }
]



const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'dashboard',
                component: () => import('@/pages/home/Dashboard.vue'),
                meta: {
                    title: '仪表盘'
                }
            },
            {
                path: 'documents',
                name: 'documentpage',
                component: () => import('@/pages/home//DocumentPage.vue'),
                meta: {
                    title: '文档管理'
                }
            },
            {
                path: 'bookmarks',
                name: 'bookmarkspage',
                component: () => import('@/pages/bookmarks/BookmarksPage.vue'),
                meta: {
                    title: '书签管理'
                }
            },
            {
                path: 'code-snippets',
                name: 'code-snippets',
                component: () => import('@/pages/snippet/CodeSnippetLibrary.vue'),
                meta: {
                    title: '代码片段库'
                }
            },
            {
                path: '/code-snippets/view/:id',
                name: 'view-code-snippet',
                component: () => import('@/pages/snippet/ViewCodeSnippet.vue'),
                props: true,
                meta: {
                    title: '查看代码片段',
                    transition: 'fade'
                }
            },
            {
                path: 'learning-tracks',
                name: 'learning-tracks',
                component: () => import('@/pages/learning/LearningTracksPage.vue'),
                meta: {
                    title: '学习追踪'
                }
            },
            {
                path: 'tools',
                name: 'tools',
                component: () => import('@/pages/tools/ToolsPage.vue'),
                meta: {
                    title: '工具集'
                }
            }
        ]
    },
    ...documentRoutes,
    ...toolsRoutes.filter(route => route.path !== '/tools'),

    // 错误页面
    // {
    //     path: '/404',
    //     name: 'NotFound',
    //     component: () => import('@/views/NotFound.vue'),
    //     meta: {
    //         title: '页面不存在'
    //     }
    // },
    // {
    //     path: '/:pathMatch(.*)*',
    //     redirect: '/404'
    // }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫 - 设置页面标题和验证
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 智慧知识库` : '智慧知识库'
    next()
})

export default router