import { ref, reactive } from 'vue'

// 创建一个简单的客户端存储，模拟后端数据存储
const documentStore = reactive(new Map())

// 模拟用户数据
const currentUser = {
    id: 'user123',
    name: '技术专家',
    avatarUrl: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
    bio: '12年Java开发经验，Spring框架贡献者，《深入理解Spring》作者'
}

// 生成唯一ID
const generateId = () => {
    return 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

// 保存文档
export const saveDocument = (document, isDraft = true) => {
    // 生成新ID或使用现有ID
    const id = document.id || generateId()

    // 创建时间戳
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    const formattedTime = now.toTimeString().split(' ')[0].substring(0, 5)
    const timestamp = `${formattedDate} ${formattedTime}`

    // 存储文档
    documentStore.set(id, {
        id,
        ...document,
        author: document.author || currentUser.name,
        authorBio: document.authorBio || currentUser.bio,
        avatarUrl: document.avatarUrl || currentUser.avatarUrl,
        createTime: document.createTime || timestamp,
        updateTime: timestamp,
        status: isDraft ? 'draft' : 'published',
        views: document.views || 0,
        likes: document.likes || 0,
        favorites: document.favorites || 0,
        comments: document.comments || []
    })

    return id
}

// 获取文档
export const getDocument = (id) => {
    if (!documentStore.has(id)) {
        return null
    }

    // 如果是查看操作，增加阅读量
    const doc = documentStore.get(id)
    doc.views = (doc.views || 0) + 1
    documentStore.set(id, doc)

    return doc
}

// 获取分类下的文档列表
export const getDocumentsByCategory = (category) => {
    const documents = []

    documentStore.forEach((doc) => {
        if (doc.category === category || doc.category?.[0] === category) {
            documents.push(doc)
        }
    })

    // 按更新时间排序
    return documents.sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
}

// 获取所有文档
export const getAllDocuments = () => {
    const documents = []

    documentStore.forEach((doc) => {
        documents.push(doc)
    })

    // 按更新时间排序
    return documents.sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
}

// 获取指定类型的文档
export const getDocumentsByType = (docType) => {
    const documents = []

    documentStore.forEach((doc) => {
        if (doc.docType === docType) {
            documents.push(doc)
        }
    })

    // 按更新时间排序
    return documents.sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
}

// 删除文档
export const deleteDocument = (id) => {
    if (documentStore.has(id)) {
        documentStore.delete(id)
        return true
    }
    return false
}

// 更新文档
export const updateDocument = (id, updates) => {
    if (!documentStore.has(id)) {
        return false
    }

    const doc = documentStore.get(id)
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    const formattedTime = now.toTimeString().split(' ')[0].substring(0, 5)
    const timestamp = `${formattedDate} ${formattedTime}`

    documentStore.set(id, {
        ...doc,
        ...updates,
        updateTime: timestamp
    })

    return true
}

// 获取PDF URL（模拟API调用）
export const getPdfUrl = (fileId) => {
    // 模拟后端返回的PDF URL
    return `http://leocoder.cn:9000/coder-devnotehub/documents/20250502/${fileId}.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250501%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250501T162151Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
}

// 刷新PDF URL（模拟API调用）
export const refreshPdfUrl = async (fileId) => {
    // 模拟后端刷新URL的API调用
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getPdfUrl(fileId));
        }, 500); // 模拟网络延迟
    });
}

// 添加示例文档
export const initializeExampleDocs = () => {
    if (documentStore.size === 0) {
        const exampleDoc = {
            id: 'doc001',
            title: 'Spring框架核心原理与实践指南',
            content: `# Spring框架核心原理与实践指南

## 1. Spring框架概述

Spring是一个开源的Java SE/EE应用程序框架，最早由Rod Johnson创建。Spring框架是一个轻量级的控制反转(IoC)和面向切面(AOP)的容器框架。

Spring框架具有以下特点：

- **轻量级**：与EJB等重量级框架相比，Spring是轻量级的
- **控制反转**：通过控制反转实现了松散耦合
- **面向切面编程**：通过面向切面编程提供了声明式事务管理
- **容器**：Spring管理对象的创建和配置
- **框架集成**：无缝整合各种优秀框架

## 2. Spring IoC容器

### 2.1 控制反转(IoC)与依赖注入(DI)

控制反转(Inversion of Control, IoC)是Spring框架的核心，它将传统Java应用中对象的创建与协作的控制权，从开发者手中转移到Spring容器中。依赖注入(Dependency Injection, DI)是IoC的具体实现方式。

在传统的编程中，当一个对象需要使用另一个对象时，通常会直接在代码中创建被依赖对象的实例：

\`\`\`java
public class UserService {
    private UserDao userDao = new UserDaoImpl(); // 直接创建依赖对象
    
    public User getUserById(Long id) {
        return userDao.findById(id);
    }
}
\`\`\`

使用Spring的依赖注入后：

\`\`\`java
public class UserService {
    private UserDao userDao; // 不再直接创建
    
    // 通过构造函数注入
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
    
    // 或通过setter方法注入
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
    
    public User getUserById(Long id) {
        return userDao.findById(id);
    }
}
\`\`\``,
            docType: 'markdown',
            category: ['spring', 'spring-framework'],
            tags: ['Spring', '框架', '依赖注入', '核心原理', 'AOP'],
            description: '本文深入剖析了Spring框架的核心原理，包括IoC容器、AOP实现机制、事务管理等关键特性，并结合实际案例展示了Spring在企业级应用中的最佳实践方案。',
            coverImage: 'https://example.com/images/spring.jpg'
        }

        const exampleDoc2 = {
            id: 'doc002',
            title: 'Spring Boot自动配置详解',
            content: `# Spring Boot自动配置详解

## 1. 自动配置原理

Spring Boot的自动配置是基于条件化配置实现的，它通过@Conditional注解及其变体来判断是否需要创建某个Bean。

\`\`\`java
@Configuration
@EnableConfigurationProperties(ServerProperties.class)
@ConditionalOnClass(EmbeddedServletContainerFactory.class)
@ConditionalOnWebApplication
public class EmbeddedServletContainerAutoConfiguration {
    
    @Bean
    @ConditionalOnClass({ Servlet.class, Tomcat.class })
    @ConditionalOnMissingBean(value = EmbeddedServletContainerFactory.class, 
                            search = SearchStrategy.CURRENT)
    public TomcatEmbeddedServletContainerFactory tomcatEmbeddedServletContainerFactory() {
        return new TomcatEmbeddedServletContainerFactory();
    }
}
\`\`\``,
            docType: 'markdown',
            category: ['spring', 'springboot'],
            tags: ['SpringBoot', '自动配置', '源码分析', '启动原理'],
            description: '深入解析Spring Boot自动配置机制的工作原理，包括条件注解、配置类加载过程以及自定义自动配置的实现方法。',
            coverImage: 'https://example.com/images/springboot.jpg'
        }

        const exampleDoc3 = {
            id: 'doc003',
            title: 'Spring AOP源码剖析',
            content: `# Spring AOP源码剖析

## 1. AOP核心概念

面向切面编程(AOP)是一种编程范式，旨在增强代码的模块性，减少横切关注点导致的代码重复。

\`\`\`java
@Aspect
@Component
public class LoggingAspect {
    
    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        // 记录方法调用前的日志
    }
    
    @After("execution(* com.example.service.*.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        // 记录方法调用后的日志
    }
}
\`\`\``,
            docType: 'markdown',
            category: ['spring', 'spring-framework'],
            tags: ['Spring', 'AOP', '源码分析', '代理模式'],
            description: '本文深入分析Spring AOP的实现原理，包括代理创建过程、通知调用链构建、切点表达式解析等核心机制，帮助开发者理解AOP的内部工作流程。',
            coverImage: 'https://example.com/images/aop.jpg'
        }

        // 添加PDF文档示例
        const pdfDoc1 = {
            id: 'pdf001',
            title: 'Java虚拟机规范（第八版）',
            docType: 'pdf',
            category: ['resources', 'pdf-docs'],
            tags: ['Java', 'JVM', '虚拟机', '规范文档'],
            description: 'Java虚拟机规范第八版官方文档，详细描述了Java虚拟机的架构、类文件格式、字节码指令集、类加载机制等核心内容。',
            pdfId: '4843df2c04ff452f80c86093ae7b3aa4',
            pdfUrl: 'http://leocoder.cn:9000/coder-devnotehub/documents/20250502/4843df2c04ff452f80c86093ae7b3aa4.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250501%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250501T162151Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=99221589f4a7b8d342051fab2a75554e61d2c9beee1c2edd49ff0534218291c9',
            coverImage: 'https://example.com/images/jvm.jpg'
        }

        const pdfDoc2 = {
            id: 'pdf002',
            title: 'Effective Java编程指南',
            docType: 'pdf',
            category: ['resources', 'pdf-docs'],
            tags: ['Java', '最佳实践', '编程指南'],
            description: 'Effective Java第三版中文版，涵盖Java编程的78条最佳实践，是每位Java开发者必读的经典著作。',
            pdfId: '7a21cf9b82e345d68bc6f7d9a32e1c0f',
            pdfUrl: 'http://leocoder.cn:9000/coder-devnotehub/documents/20250502/4843df2c04ff452f80c86093ae7b3aa4.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250501%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250501T162151Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=99221589f4a7b8d342051fab2a75554e61d2c9beee1c2edd49ff0534218291c9',
            coverImage: 'https://example.com/images/effective-java.jpg'
        }

        // 保存示例文档
        saveDocument(exampleDoc, false)
        saveDocument(exampleDoc2, false)
        saveDocument(exampleDoc3, false)
        saveDocument(pdfDoc1, false)
        saveDocument(pdfDoc2, false)
    }
}

// 初始化示例文档
initializeExampleDocs()

export default {
    saveDocument,
    getDocument,
    getDocumentsByCategory,
    getDocumentsByType,
    getAllDocuments,
    deleteDocument,
    updateDocument,
    getPdfUrl,
    refreshPdfUrl
}