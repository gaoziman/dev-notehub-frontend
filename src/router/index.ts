import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import toolsRoutes from '@/router/tools.routes'
import { useUserStore } from '@/stores/user'
import videoRoutes from "@/router/video.routes";
import PersonalPage from "@/pages/personal/PersonalPage.vue";

// 欢迎页路由
const welcomeRoute = {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home/HomeContainer.vue'),
    meta: {
        title: '欢迎使用智慧知识库',
        hideNavbar: true,
        allowAnonymous: true
    }
}

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
            requiresAuth: true,
            hideNavbar: true
        }
    },
    {
        path: '/pdf/view/:id',
        name: 'ViewPDFDocument',
        component: () => import('@/pages/document/ViewPDFDocument.vue'),
        props: true,
        meta: {
            title: 'PDF查看器',
            requiresAuth: true
        }
    }
]


const routes = [
    // 添加欢迎页为默认路由
    welcomeRoute,

    {
        path: '/dashboard',
        component: MainLayout,
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: '',
                name: 'dashboard',
                component: () => import('@/pages/home/Dashboard.vue'),
                meta: {
                    title: '仪表盘',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'documents',
                name: 'documentpage',
                component: () => import('@/pages/document/DocumentPage.vue'),
                meta: {
                    title: '文档管理',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'bookmarks',
                name: 'bookmarkspage',
                component: () => import('@/pages/bookmarks/BookmarksPage.vue'),
                meta: {
                    title: '书签管理',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'code-snippets',
                name: 'code-snippets',
                component: () => import('@/pages/snippet/CodeSnippetLibrary.vue'),
                meta: {
                    title: '代码片段库',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: '/code-snippets/view/:id',
                name: 'view-code-snippet',
                component: () => import('@/pages/snippet/ViewCodeSnippet.vue'),
                props: true,
                meta: {
                    title: '查看代码片段',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'tools',
                name: 'tools',
                component: () => import('@/pages/tools/ToolsPage.vue'),
                meta: {
                    title: '工具集',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'icon',
                name: 'iconfont',
                component: () => import('@/pages/icon/IconFontPage.vue'),
                meta: {
                    title: '图标库',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: '/search',
                name: 'searchResults',
                component: () => import('@/pages/search/SearchResultsPage.vue'),
                meta: {
                    title: '搜索结果',
                    requiresAuth: true,
                    transition: 'fade'
                }
            }
        ]
    },
    ...documentRoutes,
    ...videoRoutes,
    ...toolsRoutes.filter(route => route.path !== '/tools'),

    // 错误页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/404/NotFound.vue'),
        meta: {
            title: '页面不存在',
            allowAnonymous: true
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫 - 设置页面标题和验证
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 智慧知识库` : '智慧知识库'

    const userStore = useUserStore()

    // 如果用户已登录且尝试访问欢迎页，则重定向到仪表盘
    if (userStore.isLoggedIn && to.path === '/') {
        next('/dashboard')
        return
    }

    // 检查页面是否需要身份验证
    // 默认所有页面都需要身份验证，除非明确标记了 allowAnonymous
    if (!to.meta.allowAnonymous) {
        if (!userStore.isLoggedIn) {
            next('/')
            return
        }
    }

    next()
})

export default router