/**
 * API 配置
 */

// 从环境变量或配置文件读取 API 基础 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4021';

// API 端点
export const API_ENDPOINTS = {
  // 用户相关
  users: {
    register: '/api/users/register',
    getByWallet: (wallet) => `/api/users/wallet/${wallet}`,
    getById: (id) => `/api/users/id/${id}`,
    updateNickname: (id) => '/api/users/nickname',
  },
  
  // 对话相关 (原会话)
  conversations: {
    create: '/api/conversations',
    getSummaries: '/api/conversations/summaries',
    getMyConversations: (owner) => `/api/conversations/my/${owner}`,
    update: (id) => `/api/conversations/${id}`,
    delete: (id, owner) => `/api/conversations/${id}/${owner}`,
    getDetail: (id, owner) => `/api/conversations/detail/${id}/${owner}`,
    setPrice: '/api/conversations/price',
    updateName: '/api/conversations/name',
  },
};

// HTTP 请求配置
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
};

// 请求超时时间 (毫秒)
export const REQUEST_TIMEOUT = 30000;
