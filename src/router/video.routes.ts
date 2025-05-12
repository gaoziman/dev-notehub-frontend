// src/router/video.routes.ts
import MainLayout from '@/components/layout/MainLayout.vue'

const videoRoutes = [
    {
        path: '/video',
        component: MainLayout,
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: '',
                name: 'video-home',
                component: () => import('@/pages/video/VideoHomePage.vue'),
                meta: {
                    title: '视频学习',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'categories',
                name: 'video-categories',
                component: () => import('@/pages/video/VideoCategoryManagePage.vue'),
                meta: {
                    title: '视频分类管理',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'upload',
                name: 'video-upload',
                component: () => import('@/pages/video/VideoUploadPage.vue'),
                meta: {
                    title: '上传视频',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'category/:categoryId',
                name: 'video-category',
                component: () => import('@/pages/video/VideoCategoryPage.vue'),
                props: true,
                meta: {
                    title: '分类视频',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'course/:courseId',
                name: 'video-course',
                component: () => import('@/pages/video/VideoCourseDetailPage.vue'),
                props: true,
                meta: {
                    title: '课程详情',
                    requiresAuth: true,
                    transition: 'fade'
                }
            },
            {
                path: 'watch/:videoId',
                name: 'video-player',
                component: () => import('@/pages/video/VideoPlayerPage.vue'),
                props: true,
                meta: {
                    title: '视频播放',
                    requiresAuth: true,
                    hideNavbar: true
                }
            },
            {
                path: 'manage',
                name: 'video-manage',
                component: () => import('@/pages/video/VideoManagePage.vue'),
                meta: {
                    title: '视频管理',
                    requiresAuth: true,
                    transition: 'fade'
                }
            }
        ]
    }
]

export default videoRoutes