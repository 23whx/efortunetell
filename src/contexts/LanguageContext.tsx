'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译数据
const translations = {
  zh: {
    // 通用
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.confirm': '确认',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.save': '保存',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.submit': '提交',
    'common.refresh': '刷新',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.all': '全部',
    'common.page': '第',
    'common.total': '共',
    'common.username': '用户名',
    'common.email': '邮箱',
    'common.password': '密码',
    'common.login': '登录',
    'common.logout': '退出登录',
    'common.register': '注册',
    'common.price': '价格',
    'common.status': '状态',
    'common.date': '日期',
    'common.time': '时间',
    'common.service': '服务',
    'common.contact': '联系',
    'common.about': '关于',
    'common.home': '首页',
    'common.blog': '博客',
    'common.fortune': '算命',
    'common.profile': '个人中心',
    'common.admin': '管理员',
    'common.dashboard': '仪表板',
    'common.appointments': '预约管理',
    'common.articles': '文章管理',
    'common.comments': '评论管理',
    'common.settings': '设置',
    'common.siteTitle': 'Rolley的玄学命理小站',

    // 导航
    'nav.home': '首页',
    'nav.blog': '博客',
    'nav.fortune': '算命服务',
    'nav.baziTest': '八字性格画像',
    'nav.contact': '联系我们',
    'nav.login': '登录',
    'nav.profile': '个人中心',
    'nav.admin': '管理后台',

    // 首页
    'home.title': 'Rolley的玄学命理小站',
    'home.subtitle': '探索命理奥秘，指引人生方向',
    'home.welcome': '欢迎来到玄学世界',
    'home.description': '我们提供专业的命理咨询服务，包括八字、奇门遁甲、大六壬等传统术数。',

    // 算命服务
    'fortune.title': '算命服务',
    'fortune.bazi.title': '八字',
    'fortune.bazi.description': '通过出生年月日时分析命理',
    'fortune.qimen.title': '阴盘奇门',
    'fortune.qimen.description': '奇门遁甲预测分析',
    'fortune.liuren.title': '大六壬',
    'fortune.liuren.description': '六壬神课占卜预测',
    'fortune.naming.title': '中国姓名',
    'fortune.naming.description': '姓名学分析与起名',
    'fortune.getInTouch': '立即联系',
    'fortune.bookingSuccess': '预约请求已提交',
    'fortune.bookingError': '预约失败，请重试',
    'fortune.loginRequired': '请先登录',

    // 服务详细描述
    'service.bazi.description': '可以预测人类的一生运程',
    'service.qimen.description': '阴盘奇门为事业、财运、爱情和健康问题提供答案',
    'service.liuren.description': '揭示吉凶结果的最快方法',
    'service.naming.description': '具有真正文化内涵的个性化吉祥中文姓名',

    // 博客
    'blog.title': '博客文章',
    'blog.readMore': '阅读更多',
    'blog.noArticles': '暂无文章',
    'blog.loading': '加载文章中...',
    'blog.error': '加载文章失败',
    'blog.like': '点赞',
    'blog.liked': '已点赞',
    'blog.bookmark': '收藏',
    'blog.bookmarked': '已收藏',
    'blog.share': '分享',
    'blog.comment': '评论',
    'blog.comments': '评论',
    'blog.reply': '回复',
    'blog.cancel': '取消',
    'blog.publish': '发布',
    'blog.likeSuccess': '点赞成功！',
    'blog.unlikeSuccess': '取消点赞',
    'blog.bookmarkSuccess': '收藏成功！',
    'blog.unbookmarkSuccess': '取消收藏',
    'blog.shareSuccess': '链接已复制到剪贴板',
    'blog.commentSuccess': '评论发布成功！',
    'blog.replySuccess': '回复发布成功！',
    'blog.loginRequired': '请先登录才能点赞',
    'blog.loginRequiredBookmark': '请先登录才能收藏',
    'blog.loginRequiredComment': '请登录后发表评论',
    'blog.commentEmpty': '评论内容不能为空',
    'blog.replyEmpty': '回复内容不能为空',
    'blog.operationFailed': '操作失败',
    'blog.networkError': '网络错误，请稍后重试',

    // 用户相关
    'user.login.title': '用户登录',
    'user.login.username': '用户名',
    'user.login.password': '密码',
    'user.login.submit': '登录',
    'user.login.noAccount': '没有账户？',
    'user.login.register': '立即注册',
    'user.login.success': '登录成功',
    'user.login.error': '登录失败',

    'user.register.title': '用户注册',
    'user.register.username': '用户名',
    'user.register.email': '邮箱',
    'user.register.password': '密码',
    'user.register.confirmPassword': '确认密码',
    'user.register.submit': '注册',
    'user.register.hasAccount': '已有账户？',
    'user.register.login': '立即登录',
    'user.register.success': '注册成功',
    'user.register.error': '注册失败',

    'user.profile.title': '个人中心',
    'user.profile.welcome': '欢迎回来！',
    'user.profile.bookingHistory': '我的预约历史',
    'user.profile.bookmarks': '收藏夹',
    'user.profile.newBooking': '新建预约',
    'user.profile.noBookings': '您还没有任何预约记录',
    'user.profile.noBookmarks': '还没有收藏任何文章',
    'user.profile.bookNow': '立即预约',
    'user.profile.goBrowse': '去看看文章',

    // 预约状态
    'booking.status.contact_requested': '联系请求',
    'booking.status.pending': '待确认',
    'booking.status.confirmed': '已确认',
    'booking.status.completed': '已完成',
    'booking.status.cancelled': '已取消',

    // 服务类型
    'service.bazi': '八字',
    'service.qimen': '阴盘奇门',
    'service.liuren': '大六壬',
    'service.naming': '中国吉祥姓名',
    
    // 博客分类
    'category.plumFortune': '梅花易数',
    'category.discussion': '杂谈',
    'category.other': '其他',
    
    // 排序选项
    'sort.byDate': '按时间排序',
    'sort.byLikes': '按点赞排序',
    'sort.byBookmarks': '按收藏排序',

    // 管理员
    'admin.login.title': '管理员登录',
    'admin.dashboard.title': '管理后台',
    'admin.sidebar.articles': '文章管理',
    'admin.sidebar.comments': '评论管理',
    'admin.sidebar.appointments': '预约管理',
    'admin.sidebar.images': '图片管理',
    'admin.sidebar.back': '返回',
    'admin.sidebar.expand': '展开侧边栏',
    
    // 评论管理
    'admin.comments.title': '评论与回复管理',
    'admin.comments.search': '搜索文章标题、评论内容或用户名',
    'admin.comments.searchButton': '搜索',
    'admin.comments.articlesWithComments': '有评论的文章',
    'admin.comments.totalComments': '总评论和回复数',
    'admin.comments.totalPages': '总页数',
    'admin.comments.firstArticle': '第一篇文章',
    'admin.comments.viewArticle': '查看文章',
    'admin.comments.locate': '定位',
    'admin.comments.delete': '删除',
    'admin.comments.confirmDeleteComment': '确定要删除这条评论吗？这将同时删除所有回复。',
    'admin.comments.confirmDeleteReply': '确定要删除这条回复吗？',
    'admin.comments.deleteSuccess': '删除成功',
    'admin.comments.deleteFailed': '删除失败',
    'admin.comments.networkError': '网络错误，请稍后重试',
    'admin.comments.loadFailed': '获取评论数据失败',
    'admin.comments.repliesCount': '条回复',
    'admin.comments.nestedReply': '嵌套回复',
    'admin.comments.noComments': '暂无评论数据',
    'common.searchNoResults': '未找到匹配的结果',
    
    'admin.appointments.title': '预约管理',
    'admin.appointments.unprocessed': '未处理用户预约',
    'admin.appointments.processed': '已处理用户预约',
    'admin.appointments.noUnprocessed': '暂无未处理的预约',
    'admin.appointments.noProcessed': '暂无已处理的预约',
    'admin.appointments.confirmDelete': '确定要删除这条预约记录吗？此操作不可撤销。',
    'admin.appointments.confirmComplete': '确定要将此预约标记为已完成吗？',
    'admin.appointments.processing': '处理中...',
    'admin.appointments.deleting': '删除中...',
    'admin.appointments.completed': '预约已标记为完成',
    'admin.appointments.deleted': '预约记录已删除',
    'admin.appointments.operationFailed': '操作失败',
    'admin.appointments.deleteFailed': '删除失败，请稍后重试',
    'admin.appointments.bookingTime': '预约时间',
    'admin.appointments.notes': '备注',

    // 联系页面
    'contact.title': '联系我们',
    'contact.subtitle': '联系Rollkey获取算命服务',
    'contact.description': '专业算命师及中国古代占卜专家',
    'contact.specialization': '精通八字、奇门遁甲、大六壬等经典中国玄学',
    'contact.thankYou': '感谢您的关注！我会尽快回复您。',
    'contact.name': 'Rollkey',
    'contact.email': '邮箱',
    'contact.website': '主页',
    'contact.twitter': 'X账号',
    'contact.youtube': 'YouTube',
    'contact.telegram': 'Telegram',
    'contact.wechat': '微信',
    'contact.wechatSecret': '暂时保密',
    'contact.primaryContact': '常用联系方式',
    'contact.copied': '已复制到剪贴板',
    'contact.copyFailed': '复制失败',

    // 错误信息
    'error.networkError': '网络错误，请检查网络连接',
    'error.serverError': '服务器错误，请稍后重试',
    'error.unauthorized': '未授权，请重新登录',
    'error.forbidden': '权限不足',
    'error.notFound': '页面未找到',
    'error.validationError': '数据验证失败',
    'error.unknownError': '未知错误',

    // 八字性格画像
    'bazi.title': '八字性格画像生成器',
    'bazi.subtitle': '基于传统命理学与现代人格心理学，生成个性化性格画像',
    'bazi.form.title': '输入您的出生信息',
    'bazi.form.year': '出生年份',
    'bazi.form.month': '出生月份',
    'bazi.form.day': '出生日期',
    'bazi.form.hour': '出生时辰',
    'bazi.form.timezone': '时区',
    'bazi.form.gender': '性别',
    'bazi.form.male': '男',
    'bazi.form.female': '女',
    'bazi.form.name': '昵称（可选，用于生成分享图）',
    'bazi.form.selectMonth': '选择月份',
    'bazi.form.selectDay': '选择日期',
    'bazi.form.selectHour': '选择时辰',
    'bazi.form.monthSuffix': '月',
    'bazi.form.daySuffix': '日',
    'bazi.form.namePlaceholder': '请输入您的昵称',
    'bazi.form.submit': '生成性格画像',
    'bazi.form.submitting': '正在生成画像...',
    'bazi.form.submittingDetail': '正在分析您的八字信息，请耐心等待...',
    'bazi.form.notice': '本工具结合传统命理学与现代心理学，仅供娱乐参考，不构成专业建议',
    'bazi.form.error.incomplete': '请填写完整的出生日期和时间信息',
    'bazi.form.error.year': '出生年份必须在1900-2024年之间',
    'bazi.form.error.month': '出生月份必须在1-12月之间',
    'bazi.form.error.day': '出生日期必须在1-31日之间',
    'bazi.form.error.network': '网络错误，请检查网络连接后重试',
    'bazi.form.error.generate': '生成失败，请重试',

    // 八字时辰
    'bazi.hour.zi': '子（23:00-1:00）',
    'bazi.hour.chou': '丑（1:00-3:00）',
    'bazi.hour.yin': '寅（3:00-5:00）',
    'bazi.hour.mao': '卯（5:00-7:00）',
    'bazi.hour.chen': '辰（7:00-9:00）',
    'bazi.hour.si': '巳（9:00-11:00）',
    'bazi.hour.wu': '午（11:00-13:00）',
    'bazi.hour.wei': '未（13:00-15:00）',
    'bazi.hour.shen': '申（15:00-17:00）',
    'bazi.hour.you': '酉（17:00-19:00）',
    'bazi.hour.xu': '戌（19:00-21:00）',
    'bazi.hour.hai': '亥（21:00-23:00）',

    // 八字结果页面
    'bazi.result.loading': '正在加载性格画像...',
    'bazi.result.error.title': '获取失败',
    'bazi.result.error.expired': '数据不存在或已过期，请重新生成',
    'bazi.result.back': '返回首页',
    'bazi.result.share': '分享',
    'bazi.result.title': '{name}的八字性格画像',
    'bazi.result.personalityPortrait': '的八字性格画像',
    'bazi.result.gender': '性别：',
    'bazi.result.age': '年龄：',
    'bazi.result.ageSuffix': '岁',
    'bazi.result.views': '浏览：',
    'bazi.result.viewsSuffix': '次',
    'bazi.result.personality': '性格画像（郑重声明：本内容仅供娱乐参考，具体结论请以专业命理师的判断为准。）',
    'bazi.result.personalityDimensions': '性格画像',
    'bazi.result.destinyStructure': '命理结构',
    'bazi.result.destinySummary': '命理结构',
    'bazi.result.personalityRadar': '人格雷达图',
    'bazi.result.recommendations': '建议与总结',
    'bazi.result.suggestions': '建议与总结',
    'bazi.result.summary': '总结',
    'bazi.result.generateShare': '生成分享图',
    'bazi.result.generateShareImage': '生成分享图',
    'bazi.result.reanalyze': '重新分析',
    'bazi.result.conclusion': '总体而言，您是一个具有深度思考能力和稳定性格的人，通过平衡理性与自觉，谨慎与开放，您能够在保持核心优势的同时，不断拓展自己的潜能和视野。',
    'bazi.result.overallSummary': '总体而言，您是一个具有深度思考能力和稳定性格的人，通过平衡理性与自觉，谨慎与开放，您能够在保持核心优势的同时，不断拓展自己的潜能和视野。',

    // 性格维度标题
    'bazi.result.behaviorTendency': '行为倾向',
    'bazi.result.thinkingStyle': '思维方式',
    'bazi.result.communicationStyle': '沟通风格',
    'bazi.result.emotionalManagement': '情绪管理',
    'bazi.result.decisionMaking': '决策模式',
    'bazi.result.intimateRelationship': '亲密关系',
    'bazi.result.environmentPreference': '环境偏好',
    'bazi.result.growthDirection': '成长方向',
    'bazi.result.energySource': '能量来源',

    // 四柱标题
    'bazi.result.year': '年',
    'bazi.result.month': '月',
    'bazi.result.day': '日',
    'bazi.result.hour': '时',

    // 五行和命盘
    'bazi.result.fiveElements': '元素分布',
    'bazi.result.wood': '木',
    'bazi.result.fire': '火',
    'bazi.result.earth': '土',
    'bazi.result.metal': '金',
    'bazi.result.water': '水',
    'bazi.result.destinyFeatures': '命盘特征',
    'bazi.result.dominantElement': '主导元素：',
    'bazi.result.dayMasterStrength': '强弱：',
    'bazi.result.mainTenGods': '主要特征：',
    'bazi.result.deities': '神煞：',

    // 人格雷达
    'bazi.result.rationalThinking': '理性思考',
    'bazi.result.emotionalExpression': '情绪表达',
    'bazi.result.actionSpeed': '行动速度',
    'bazi.result.extroversion': '外向程度',
    'bazi.result.empathy': '共情能力',
    'bazi.result.orderSense': '秩序感',
    'bazi.result.adaptability': '适应变化',
    'bazi.result.radarPlaceholder': '雷达图可视化',

    // 建议部分
    'bazi.result.matchingType': '匹配类型',
    'bazi.result.suitableEnvironment': '适合环境',
    'bazi.result.careerDirections': '推荐职业方向',

    // 分享相关
    'bazi.share.text': '我是"{title}"！来看看我的八字性格画像分析。',
    'bazi.share.title': '八字性格画像 - {title}',
    'bazi.share.copied': '分享链接已复制到剪贴板！',
    'bazi.share.failed': '分享失败',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.refresh': 'Refresh',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.page': 'Page',
    'common.total': 'Total',
    'common.username': 'Username',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.login': 'Login',
    'common.logout': 'Logout',
    'common.register': 'Register',
    'common.price': 'Price',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.service': 'Service',
    'common.contact': 'Contact',
    'common.about': 'About',
    'common.home': 'Home',
    'common.blog': 'Blog',
    'common.fortune': 'Fortune',
    'common.profile': 'Profile',
    'common.admin': 'Admin',
    'common.dashboard': 'Dashboard',
    'common.appointments': 'Appointments',
    'common.articles': 'Articles',
    'common.comments': 'Comments',
    'common.settings': 'Settings',
    'common.siteTitle': "Rolley's Metaphysical Destiny Station",

    // Navigation
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.fortune': 'Fortune Services',
    'nav.baziTest': 'Bazi Personality Portrait Generator',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',

    // Home
    'home.title': "Rolley's Metaphysical Destiny Station",
    'home.subtitle': 'Explore the mysteries of destiny and guide your life',
    'home.welcome': 'Welcome to the World of Metaphysics',
    'home.description': 'We provide professional fortune-telling consultation services, including BaZi, Qimen Dunjia, Da Liuren and other traditional divination methods.',

    // Fortune Services
    'fortune.title': 'Fortune Services',
    'fortune.bazi.title': 'BaZi Fortune Telling',
    'fortune.bazi.description': 'Analyze destiny through birth date and time',
    'fortune.qimen.title': 'Qimen Dunjia',
    'fortune.qimen.description': 'Qimen Dunjia prediction analysis',
    'fortune.liuren.title': 'Da Liuren',
    'fortune.liuren.description': 'Liuren divination and prediction',
    'fortune.naming.title': 'Chinese Naming',
    'fortune.naming.description': 'Name analysis and naming services',
    'fortune.getInTouch': 'Get in Touch Now',
    'fortune.bookingSuccess': 'Booking request submitted',
    'fortune.bookingError': 'Booking failed, please try again',
    'fortune.loginRequired': 'Please login first',

    // Service Detailed Description
    'service.bazi.description': 'Bazi can be used to predict a person\'s life path and fortune.',
    'service.qimen.description': 'Qimen Dunjia provides answers for career, finance, love, and health issues.',
    'service.liuren.description': 'The quickest way to reveal the results of divination.',
    'service.naming.description': 'Personalized Lucky Chinese Names with Real Cultural Meaning.',

    // Blog
    'blog.title': 'Blog Articles',
    'blog.readMore': 'Read More',
    'blog.noArticles': 'No articles available',
    'blog.loading': 'Loading articles...',
    'blog.error': 'Failed to load articles',
    'blog.like': 'Like',
    'blog.liked': 'Liked',
    'blog.bookmark': 'Bookmark',
    'blog.bookmarked': 'Bookmarked',
    'blog.share': 'Share',
    'blog.comment': 'Comment',
    'blog.comments': 'Comments',
    'blog.reply': 'Reply',
    'blog.cancel': 'Cancel',
    'blog.publish': 'Publish',
    'blog.likeSuccess': 'Liked successfully!',
    'blog.unlikeSuccess': 'Unliked',
    'blog.bookmarkSuccess': 'Bookmarked successfully!',
    'blog.unbookmarkSuccess': 'Bookmark removed',
    'blog.shareSuccess': 'Link copied to clipboard',
    'blog.commentSuccess': 'Comment published successfully!',
    'blog.replySuccess': 'Reply published successfully!',
    'blog.loginRequired': 'Please login to like',
    'blog.loginRequiredBookmark': 'Please login to bookmark',
    'blog.loginRequiredComment': 'Please login to comment',
    'blog.commentEmpty': 'Comment cannot be empty',
    'blog.replyEmpty': 'Reply cannot be empty',
    'blog.operationFailed': 'Operation failed',
    'blog.networkError': 'Network error, please try again later',

    // User
    'user.login.title': 'User Login',
    'user.login.username': 'Username',
    'user.login.password': 'Password',
    'user.login.submit': 'Login',
    'user.login.noAccount': "Don't have an account?",
    'user.login.register': 'Register Now',
    'user.login.success': 'Login successful',
    'user.login.error': 'Login failed',

    'user.register.title': 'User Registration',
    'user.register.username': 'Username',
    'user.register.email': 'Email',
    'user.register.password': 'Password',
    'user.register.confirmPassword': 'Confirm Password',
    'user.register.submit': 'Register',
    'user.register.hasAccount': 'Already have an account?',
    'user.register.login': 'Login Now',
    'user.register.success': 'Registration successful',
    'user.register.error': 'Registration failed',

    'user.profile.title': 'User Profile',
    'user.profile.welcome': 'Welcome back!',
    'user.profile.bookingHistory': 'My Booking History',
    'user.profile.newBooking': 'New Booking',
    'user.profile.noBookings': 'You have no booking records yet',
    'user.profile.bookNow': 'Book Now',

    // Booking Status
    'booking.status.contact_requested': 'Contact Requested',
    'booking.status.pending': 'Pending',
    'booking.status.confirmed': 'Confirmed',
    'booking.status.completed': 'Completed',
    'booking.status.cancelled': 'Cancelled',

    // Service Types
    'service.bazi': 'BaZi Fortune Telling',
    'service.qimen': 'Qimen Dunjia',
    'service.liuren': 'Da Liuren',
    'service.naming': 'Chinese Naming',
    
    // Blog Categories
    'category.plumFortune': 'Plum Blossom Numerology',
    'category.discussion': 'Discussion',
    'category.other': 'Other',
    
    // Sorting Options
    'sort.byDate': 'Sort by Date',
    'sort.byLikes': 'Sort by Likes',
    'sort.byBookmarks': 'Sort by Bookmarks',

    // Admin
    'admin.login.title': 'Admin Login',
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.sidebar.articles': 'Articles',
    'admin.sidebar.comments': 'Comments',
    'admin.sidebar.appointments': 'Appointments',
    'admin.sidebar.images': 'Images',
    'admin.sidebar.back': 'Back',
    'admin.sidebar.expand': 'Expand Sidebar',
    
    // Comment Management
    'admin.comments.title': 'Comment & Reply Management',
    'admin.comments.search': 'Search article title, comment content or username',
    'admin.comments.searchButton': 'Search',
    'admin.comments.articlesWithComments': 'Articles with Comments',
    'admin.comments.totalComments': 'Total Comments & Replies',
    'admin.comments.totalPages': 'Total Pages',
    'admin.comments.firstArticle': 'First Article',
    'admin.comments.viewArticle': 'View Article',
    'admin.comments.locate': 'Locate',
    'admin.comments.delete': 'Delete',
    'admin.comments.confirmDeleteComment': 'Are you sure you want to delete this comment? This will also delete all replies.',
    'admin.comments.confirmDeleteReply': 'Are you sure you want to delete this reply?',
    'admin.comments.deleteSuccess': 'Deleted successfully',
    'admin.comments.deleteFailed': 'Delete failed',
    'admin.comments.networkError': 'Network error, please try again later',
    'admin.comments.loadFailed': 'Failed to load comment data',
    'admin.comments.repliesCount': 'replies',
    'admin.comments.nestedReply': 'Nested Reply',
    'admin.comments.noComments': 'No comment data',
    'common.searchNoResults': 'No matching results found',
    
    'admin.appointments.title': 'Appointment Management',
    'admin.appointments.unprocessed': 'Unprocessed Appointments',
    'admin.appointments.processed': 'Processed Appointments',
    'admin.appointments.noUnprocessed': 'No unprocessed appointments',
    'admin.appointments.noProcessed': 'No processed appointments',
    'admin.appointments.confirmDelete': 'Are you sure you want to delete this appointment record? This action cannot be undone.',
    'admin.appointments.confirmComplete': 'Are you sure you want to mark this appointment as completed?',
    'admin.appointments.processing': 'Processing...',
    'admin.appointments.deleting': 'Deleting...',
    'admin.appointments.completed': 'Appointment marked as completed',
    'admin.appointments.deleted': 'Appointment record deleted',
    'admin.appointments.operationFailed': 'Operation failed',
    'admin.appointments.deleteFailed': 'Delete failed, please try again later',
    'admin.appointments.bookingTime': 'Booking Time',
    'admin.appointments.notes': 'Notes',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Connect with Rollkey for Fortune Telling Services',
    'contact.description': 'Professional Fortune Teller & Ancient Chinese Divination Expert',
    'contact.specialization': 'Specializing in Bazi, Qimen Dunjia, Da Liu Ren, and classical Chinese metaphysics.',
    'contact.thankYou': 'Thank you for your interest! I\'ll get back to you as soon as possible.',
    'contact.name': 'Rollkey',
    'contact.email': 'Email',
    'contact.website': 'Website',
    'contact.twitter': 'X Account',
    'contact.youtube': 'YouTube',
    'contact.telegram': 'Telegram',
    'contact.wechat': 'WeChat',
    'contact.wechatSecret': 'Temporarily Confidential',
    'contact.primaryContact': 'Primary Contact Methods',
    'contact.copied': 'Copied to clipboard',
    'contact.copyFailed': 'Copy failed',

    // Error Messages
    'error.networkError': 'Network error, please check your connection',
    'error.serverError': 'Server error, please try again later',
    'error.unauthorized': 'Unauthorized, please login again',
    'error.forbidden': 'Insufficient permissions',
    'error.notFound': 'Page not found',
    'error.validationError': 'Data validation failed',
    'error.unknownError': 'Unknown error',

    // Bazi Personality Portrait Generator
    'bazi.title': 'Bazi Personality Portrait Generator',
    'bazi.subtitle': 'Based on traditional metaphysics and modern psychology, generate a personalized personality portrait.',
    'bazi.form.title': 'Enter your birth information',
    'bazi.form.year': 'Year of birth',
    'bazi.form.month': 'Month of birth',
    'bazi.form.day': 'Day of birth',
    'bazi.form.hour': 'Hour of birth',
    'bazi.form.timezone': 'Timezone',
    'bazi.form.gender': 'Gender',
    'bazi.form.male': 'Male',
    'bazi.form.female': 'Female',
    'bazi.form.name': 'Nickname (optional, for sharing image)',
    'bazi.form.selectMonth': 'Select month',
    'bazi.form.selectDay': 'Select day',
    'bazi.form.selectHour': 'Select hour',
    'bazi.form.monthSuffix': 'Month',
    'bazi.form.daySuffix': 'Day',
    'bazi.form.namePlaceholder': 'Please enter your nickname',
    'bazi.form.submit': 'Generate Personality Portrait',
    'bazi.form.submitting': 'Generating portrait...',
    'bazi.form.submittingDetail': 'Analyzing your BaZi information, please be patient...',
    'bazi.form.notice': 'This tool combines traditional metaphysics with modern psychology for entertainment purposes only, and does not constitute professional advice.',
    'bazi.form.error.incomplete': 'Please fill in complete birth date and time information.',
    'bazi.form.error.year': 'Year of birth must be between 1900 and 2024.',
    'bazi.form.error.month': 'Month of birth must be between 1 and 12.',
    'bazi.form.error.day': 'Day of birth must be between 1 and 31.',
    'bazi.form.error.network': 'Network error, please check your connection and try again.',
    'bazi.form.error.generate': 'Generation failed, please try again.',

    // Bazi Hours
    'bazi.hour.zi': 'Zi (23:00-1:00)',
    'bazi.hour.chou': 'Chou (1:00-3:00)',
    'bazi.hour.yin': 'Yin (3:00-5:00)',
    'bazi.hour.mao': 'Mao (5:00-7:00)',
    'bazi.hour.chen': 'Chen (7:00-9:00)',
    'bazi.hour.si': 'Si (9:00-11:00)',
    'bazi.hour.wu': 'Wu (11:00-13:00)',
    'bazi.hour.wei': 'Wei (13:00-15:00)',
    'bazi.hour.shen': 'Shen (15:00-17:00)',
    'bazi.hour.you': 'You (17:00-19:00)',
    'bazi.hour.xu': 'Xu (19:00-21:00)',
    'bazi.hour.hai': 'Hai (21:00-23:00)',

    // Bazi Result Page
    'bazi.result.loading': 'Loading personality portrait...',
    'bazi.result.error.title': 'Failed to get',
    'bazi.result.error.expired': 'Data does not exist or has expired, please regenerate',
    'bazi.result.back': 'Back to Home',
    'bazi.result.share': 'Share',
    'bazi.result.title': '{name}\'s Personality Portrait',
    'bazi.result.personalityPortrait': '\'s Personality Portrait',
    'bazi.result.gender': 'Gender: ',
    'bazi.result.age': 'Age: ',
    'bazi.result.ageSuffix': 'years',
    'bazi.result.views': 'Views: ',
    'bazi.result.viewsSuffix': 'times',
    'bazi.result.personality': 'Personality Portrait (Disclaimer: This content is for entertainment purposes only. Please consult professional fortune tellers for specific conclusions.)',
    'bazi.result.personalityDimensions': 'Personality Portrait',
    'bazi.result.destinyStructure': 'Destiny Structure',
    'bazi.result.destinySummary': 'Destiny Structure',
    'bazi.result.personalityRadar': 'Personality Radar Chart',
    'bazi.result.recommendations': 'Recommendations & Summary',
    'bazi.result.suggestions': 'Recommendations & Summary',
    'bazi.result.summary': 'Summary',
    'bazi.result.generateShare': 'Generate Share Image',
    'bazi.result.generateShareImage': 'Generate Share Image',
    'bazi.result.reanalyze': 'Re-analyze',
    'bazi.result.conclusion': 'Overall, you are a person with deep thinking ability and stable personality, who can balance rationality with self-awareness, prudence with openness, and continuously expand your potential and vision while maintaining your core strengths.',
    'bazi.result.overallSummary': 'Overall, you are a person with deep thinking ability and stable personality, who can balance rationality with self-awareness, prudence with openness, and continuously expand your potential and vision while maintaining your core strengths.',

    // Personality Dimensions
    'bazi.result.behaviorTendency': 'Behavior Tendency',
    'bazi.result.thinkingStyle': 'Thinking Style',
    'bazi.result.communicationStyle': 'Communication Style',
    'bazi.result.emotionalManagement': 'Emotional Management',
    'bazi.result.decisionMaking': 'Decision Making',
    'bazi.result.intimateRelationship': 'Intimate Relationship',
    'bazi.result.environmentPreference': 'Environment Preference',
    'bazi.result.growthDirection': 'Growth Direction',
    'bazi.result.energySource': 'Energy Source',

    // Four Pillars
    'bazi.result.year': 'Year',
    'bazi.result.month': 'Month',
    'bazi.result.day': 'Day',
    'bazi.result.hour': 'Hour',

    // Five Elements and Chart
    'bazi.result.fiveElements': 'Element Distribution',
    'bazi.result.wood': 'Wood',
    'bazi.result.fire': 'Fire',
    'bazi.result.earth': 'Earth',
    'bazi.result.metal': 'Metal',
    'bazi.result.water': 'Water',
    'bazi.result.destinyFeatures': 'Chart Features',
    'bazi.result.dominantElement': 'Dominant Element: ',
    'bazi.result.dayMasterStrength': 'Strength: ',
    'bazi.result.mainTenGods': 'Main Features: ',
    'bazi.result.deities': 'Deities: ',

    // Personality Radar
    'bazi.result.rationalThinking': 'Rational Thinking',
    'bazi.result.emotionalExpression': 'Emotional Expression',
    'bazi.result.actionSpeed': 'Action Speed',
    'bazi.result.extroversion': 'Extroversion',
    'bazi.result.empathy': 'Empathy',
    'bazi.result.orderSense': 'Order Sense',
    'bazi.result.adaptability': 'Adaptability',
    'bazi.result.radarPlaceholder': 'Radar Chart Visualization',

    // Recommendation Section
    'bazi.result.matchingType': 'Matching Type',
    'bazi.result.suitableEnvironment': 'Suitable Environment',
    'bazi.result.careerDirections': 'Recommended Career Directions',

    // Personality Dimensions (deprecated)
    'bazi.dimension.behaviorTendency': 'Behavior Tendency',
    'bazi.dimension.thinkingStyle': 'Thinking Style',
    'bazi.dimension.communicationStyle': 'Communication Style',
    'bazi.dimension.emotionalManagement': 'Emotional Management',
    'bazi.dimension.decisionMaking': 'Decision Making',
    'bazi.dimension.intimateRelationship': 'Intimate Relationship',
    'bazi.dimension.environmentPreference': 'Environment Preference',
    'bazi.dimension.growthDirection': 'Growth Direction',
    'bazi.dimension.energySource': 'Energy Source',

    // Four Pillars (deprecated)
    'bazi.pillar.year': 'Year Pillar',
    'bazi.pillar.month': 'Month Pillar',
    'bazi.pillar.day': 'Day Pillar',
    'bazi.pillar.hour': 'Hour Pillar',

    // Five Elements (deprecated)
    'bazi.element.wood': 'Wood',
    'bazi.element.fire': 'Fire',
    'bazi.element.earth': 'Earth',
    'bazi.element.metal': 'Metal',
    'bazi.element.water': 'Water',
    'bazi.element.distribution': 'Five Elements Distribution',

    // Chart Features (deprecated)
    'bazi.chart.features': 'Chart Features',
    'bazi.chart.dominantElement': 'Dominant Element: ',
    'bazi.chart.dayMasterStrength': 'Day Master Strength: ',
    'bazi.chart.mainTenGods': 'Main Ten Gods: ',
    'bazi.chart.deities': 'Deities: ',

    // Personality Radar (deprecated)
    'bazi.radar.rationalThinking': 'Rational Thinking',
    'bazi.radar.emotionalExpression': 'Emotional Expression',
    'bazi.radar.actionSpeed': 'Action Speed',
    'bazi.radar.extroversion': 'Extroversion',
    'bazi.radar.empathy': 'Empathy',
    'bazi.radar.orderSense': 'Order Sense',
    'bazi.radar.adaptability': 'Adaptability',
    'bazi.radar.visualization': 'Radar Chart Visualization',

    // Recommendation Section (deprecated)
    'bazi.recommendation.matchingType': 'Matching Type',
    'bazi.recommendation.suitableEnvironment': 'Suitable Environment',
    'bazi.recommendation.careerDirections': 'Recommended Career Directions',

    // Share Related
    'bazi.share.text': 'I am "{title}"! Check out my BaZi personality portrait analysis.',
    'bazi.share.title': 'Bazi Personality Portrait - {title}',
    'bazi.share.copied': 'Share link copied to clipboard!',
    'bazi.share.failed': 'Share failed',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    // 从 localStorage 读取语言设置
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 