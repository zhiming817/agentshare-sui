/**
 * 表单数据转换工具
 * 将前端表单数据转换为后端 API 所需格式
 */

/**
 * 转换表单数据为 API 请求格式
 * @param {object} formData - 前端表单数据
 * @param {string} walletAddress - 钱包地址
 * @param {object} meta - 元数据 (title, description, price, tags, sourceType)
 * @returns {object} API 请求数据
 */
export function transformConversationData(formData, walletAddress, meta = {}) {
  return {
    owner: walletAddress,
    title: meta.title || 'Conversation',
    description: meta.description || '',
    source_type: meta.sourceType || 'conversation',
    price: meta.price || '0',
    tags: meta.tags || '',
    
    // 会话原始内容，直接存储以匹配 upload-client.tsx 的逻辑
    content: formData,
  };
}

/**
 * 转换在职状态
 */
function transformJobStatus(status) {
  const statusMap = {
    employed: 'Employed - Open to offers',
    离职: 'Unemployed - Available immediately',
    考虑: 'Employed - Not looking',
    求职: 'Employed - Actively looking',
  };
  return statusMap[status] || status;
}

/**
 * 转换工作类型
 */
function transformJobType(type) {
  const typeMap = {
    fulltime: 'Full-time',
    parttime: 'Part-time',
    intern: 'Internship',
  };
  return typeMap[type] || type;
}

/**
 * 验证表单数据
 * @param {object} formData - 表单数据
 * @returns {object} { valid: boolean, errors: array }
 */
export function validateConversationData(formData) {
  const errors = [];
  
  // 验证对话信息
  if (!formData.messages || formData.messages.length === 0) {
    errors.push('请至少添加一条对话内容');
  } else if (formData.messages.some(msg => !msg.content.trim())) {
    errors.push('请填写所有对话的消息内容');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
