// src/stores/video.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VideoCategory, VideoCourse, VideoItem, VideoTag } from '@/types/video'
import { useMessage } from 'naive-ui'

export const useVideoStore = defineStore('video', () => {
    // 状态
    const categories = ref<VideoCategory[]>([])
    const courses = ref<VideoCourse[]>([])
    const videos = ref<VideoItem[]>([])
    const tags = ref<VideoTag[]>([])
    const isLoading = ref(false)

    // 计算属性
    const categoriesWithCourses = computed(() => {
        return categories.value.map(category => {
            const categoryCourses = courses.value.filter(course => course.categoryId === category.id)
            return {
                ...category,
                courses: categoryCourses
            }
        })
    })

    const getCourseById = computed(() => {
        return (courseId: string) => courses.value.find(course => course.id === courseId)
    })

    const getVideosByCourseId = computed(() => {
        return (courseId: string) => videos.value.filter(video => video.courseId === courseId)
    })

    // 动作
    async function fetchCategories() {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时用模拟数据
            const response = await mockFetchCategories()
            categories.value = response
        } catch (error) {
            console.error('Failed to fetch categories', error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchCourses() {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时用模拟数据
            const response = await mockFetchCourses()
            courses.value = response
        } catch (error) {
            console.error('Failed to fetch courses', error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchVideos() {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时用模拟数据
            const response = await mockFetchVideos()
            videos.value = response
        } catch (error) {
            console.error('Failed to fetch videos', error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchTags() {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时用模拟数据
            const response = await mockFetchTags()
            tags.value = response
        } catch (error) {
            console.error('Failed to fetch tags', error)
        } finally {
            isLoading.value = false
        }
    }

    async function uploadVideo(videoData: any) {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时返回模拟结果
            const response = await mockUploadVideo(videoData)
            videos.value.push(response)
            return response
        } catch (error) {
            console.error('Failed to upload video', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function addCategory(category: Omit<VideoCategory, 'id'>) {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时返回模拟结果
            const response = await mockAddCategory(category)
            categories.value.push(response)
            return response
        } catch (error) {
            console.error('Failed to add category', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function addCourse(course: Omit<VideoCourse, 'id'>) {
        isLoading.value = true
        try {
            // 这里应该是API调用，暂时返回模拟结果
            const response = await mockAddCourse(course)
            courses.value.push(response)
            return response
        } catch (error) {
            console.error('Failed to add course', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // 模拟API调用
    // 这些函数在实际项目中应该替换为真实的API调用
    function mockFetchCategories(): Promise<VideoCategory[]> {
        return Promise.resolve([
            { id: '1', name: 'Java', icon: 'icon-java', description: 'Java编程语言相关课程' },
            { id: '2', name: 'Python', icon: 'icon-python', description: 'Python编程语言相关课程' },
            { id: '3', name: 'Web前端', icon: 'icon-html', description: 'HTML、CSS、JavaScript等前端技术' },
            { id: '4', name: '数据库', icon: 'icon-database', description: 'MySQL、MongoDB等数据库课程' },
            { id: '5', name: '人工智能', icon: 'icon-ai', description: '机器学习、深度学习等AI技术' }
        ])
    }

    function mockFetchCourses(): Promise<VideoCourse[]> {
        return Promise.resolve([
            {
                id: '1',
                name: 'Java基础入门',
                categoryId: '1',
                coverImage: 'https://picsum.photos/400/225',
                description: 'Java编程基础入门课程，适合零基础学习',
                chapterCount: 12,
                videoCount: 48,
                totalDuration: '24小时',
                createdAt: '2023-10-15'
            },
            {
                id: '2',
                name: 'Java高级编程',
                categoryId: '1',
                coverImage: 'https://picsum.photos/400/225',
                description: 'Java高级特性与设计模式',
                chapterCount: 15,
                videoCount: 60,
                totalDuration: '30小时',
                createdAt: '2023-11-20'
            },
            {
                id: '3',
                name: 'Python入门到精通',
                categoryId: '2',
                coverImage: 'https://picsum.photos/400/225',
                description: 'Python基础语法及应用',
                chapterCount: 10,
                videoCount: 40,
                totalDuration: '20小时',
                createdAt: '2024-01-10'
            },
            {
                id: '4',
                name: 'Vue3实战教程',
                categoryId: '3',
                coverImage: 'https://picsum.photos/400/225',
                description: 'Vue3框架入门与实战项目开发',
                chapterCount: 8,
                videoCount: 32,
                totalDuration: '16小时',
                createdAt: '2024-02-05'
            }
        ])
    }

    function mockFetchVideos(): Promise<VideoItem[]> {
        return Promise.resolve([
            {
                id: '1',
                title: 'Java环境搭建',
                courseId: '1',
                chapterId: '1',
                chapterName: '第一章：Java入门基础',
                videoUrl: 'https://player.bilibili.com/player.html?isOutside=true&aid=114391202661659&bvid=BV1CVLqzAEcp&cid=29582033420&p=1',
                coverImage: 'https://picsum.photos/400/225',
                duration: '45:30',
                type: 'bilibili', // 改为bilibili类型
                tags: ['Java', '环境搭建'],
                description: 'Java JDK安装与开发环境配置',
                createdAt: '2023-10-16',
                viewCount: 1245
            },
            {
                id: '2',
                title: 'Java基本语法',
                courseId: '1',
                chapterId: '1',
                chapterName: '第一章：Java入门基础',
                // 使用YouTube嵌入链接
                videoUrl: 'https://www.youtube.com/embed/lO8svHJqzAc',
                coverImage: 'https://picsum.photos/400/225',
                duration: '50:15',
                type: 'youtube',
                tags: ['Java', '语法'],
                description: 'Java基本语法与代码结构',
                createdAt: '2023-10-17',
                viewCount: 1050
            },
            {
                id: '3',
                title: 'Java变量与数据类型',
                courseId: '1',
                chapterId: '2',
                chapterName: '第二章：Java核心概念',
                // 使用B站视频嵌入链接
                videoUrl: 'https://player.bilibili.com/player.html?aid=584533159&bvid=BV1hz4y1s7rC&cid=488361232&p=1',
                coverImage: 'https://picsum.photos/400/225',
                duration: '55:20',
                type: 'bilibili',
                tags: ['Java', '数据类型', '变量'],
                description: 'Java变量声明与基本数据类型介绍',
                createdAt: '2023-10-18',
                viewCount: 980
            },
            {
                id: '4',
                title: 'Python基础入门',
                courseId: '3',
                chapterId: '1',
                chapterName: '第一章：Python基础',
                videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
                coverImage: 'https://picsum.photos/400/225',
                duration: '1:25:30',
                type: 'youtube',
                tags: ['Python', '基础教程'],
                description: 'Python编程基础入门课程',
                createdAt: '2024-01-11',
                viewCount: 2560
            },
            {
                id: '5',
                title: 'Vue3组合式API详解',
                courseId: '4',
                chapterId: '1',
                chapterName: '第一章：Vue3基础',
                videoUrl: 'https://player.bilibili.com/player.html?aid=813313051&bvid=BV1i34y1r7xm',
                coverImage: 'https://picsum.photos/400/225',
                duration: '40:15',
                type: 'bilibili',
                tags: ['Vue3', '组合式API'],
                description: 'Vue3组合式API的使用方法与实践',
                createdAt: '2024-02-06',
                viewCount: 1890
            }
        ])
    }

    function mockFetchTags(): Promise<VideoTag[]> {
        return Promise.resolve([
            { id: '1', name: 'Java', count: 15 },
            { id: '2', name: 'Python', count: 10 },
            { id: '3', name: 'Vue3', count: 8 },
            { id: '4', name: '数据库', count: 6 },
            { id: '5', name: '环境搭建', count: 3 },
            { id: '6', name: '基础教程', count: 18 },
            { id: '7', name: '高级编程', count: 7 },
            { id: '8', name: '设计模式', count: 5 },
            { id: '9', name: '前端', count: 12 },
            { id: '10', name: '后端', count: 14 }
        ])
    }

    function mockUploadVideo(videoData: any): Promise<VideoItem> {
        // 模拟生成一个新的视频ID
        const newVideoId = (videos.value.length + 1).toString()

        return Promise.resolve({
            id: newVideoId,
            title: videoData.title,
            courseId: videoData.courseId,
            chapterId: videoData.chapterId,
            chapterName: videoData.chapterName || '未分类章节',
            videoUrl: videoData.type === 'upload'
                ? 'https://example.com/videos/uploaded-' + newVideoId + '.mp4'
                : videoData.videoUrl,
            coverImage: videoData.coverImage || 'https://picsum.photos/400/225',
            duration: videoData.duration || '00:00',
            type: videoData.type,
            tags: videoData.tags || [],
            description: videoData.description || '',
            createdAt: new Date().toISOString().split('T')[0],
            viewCount: 0
        })
    }

    function mockAddCategory(category: Omit<VideoCategory, 'id'>): Promise<VideoCategory> {
        // 模拟生成一个新的分类ID
        const newCategoryId = (categories.value.length + 1).toString()

        return Promise.resolve({
            id: newCategoryId,
            name: category.name,
            icon: category.icon || 'icon-folder',
            description: category.description || ''
        })
    }

    function mockAddCourse(course: Omit<VideoCourse, 'id'>): Promise<VideoCourse> {
        // 模拟生成一个新的课程ID
        const newCourseId = (courses.value + 1).toString()

        return Promise.resolve({
            id: newCourseId,
            name: course.name,
            categoryId: course.categoryId,
            coverImage: course.coverImage || 'https://picsum.photos/400/225',
            description: course.description || '',
            chapterCount: 0,
            videoCount: 0,
            totalDuration: '0小时',
            createdAt: new Date().toISOString().split('T')[0]
        })
    }

    return {
        categories,
        courses,
        videos,
        tags,
        isLoading,
        categoriesWithCourses,
        getCourseById,
        getVideosByCourseId,
        fetchCategories,
        fetchCourses,
        fetchVideos,
        fetchTags,
        uploadVideo,
        addCategory,
        addCourse
    }
})