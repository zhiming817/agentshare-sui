/**
 * 会话相关 API 服务
 */
import { httpClient } from './http.client';
import { API_ENDPOINTS } from './api.config';
import { encryptWithSeal, decryptWithSeal } from '../utils/seal';
import { uploadToWalrus, downloadFromWalrus } from '../utils/walrus';
import { 
  encryptAndUploadConversation, 
  downloadAndDecryptConversation,
  createPublishTransaction,
  createAddToAllowlistTransaction 
} from '../utils/sealClient';

/**
 * 会话 API 服务类
 */
class ConversationService {
  /**
   * 创建会话(带加密和 Walrus 上传)
   * @param {object} conversationData - 会话数据
   * @param {string} conversationData.owner - 钱包地址
   * @param {object} conversationData.personal - 个人信息
   * @param {string} conversationData.skills - 个人优势
   * @param {object} conversationData.desired_position - 期望职位
   * @param {array} conversationData.work_experience - 工作经历
   * @param {array} conversationData.project_experience - 项目经历
   * @param {array} conversationData.education - 教育经历
   * @param {array} conversationData.certificates - 资格证书
   * @returns {Promise<object>} 创建结果 { success, resumeId, encryptionKey, blobId }
   */
  async createConversation(conversationData) {
    try {
      console.log('🔐 Step 1: Encrypting conversation with Seal...');
      
      // 1. 使用 Seal 加密会话数据
      const { encryptedBlob, key, salt } = await encryptWithSeal(conversationData);
      
      console.log('✅ Encryption complete');
      console.log('🔑 Encryption Key (SAVE THIS!):', key);
      console.log('📦 Encrypted size:', encryptedBlob.size, 'bytes');

      console.log('☁️  Step 2: Uploading to Walrus...');
      
      // 2. 上传到 Walrus
      const { blobId, url, info } = await uploadToWalrus(encryptedBlob, {
        owner: conversationData.owner,
        encrypted: true,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Upload complete');
      console.log('📝 Blob ID:', blobId);
      console.log('🔗 URL:', url);

      console.log('📤 Step 3: Saving to backend...');
      
      // 3. 调用后端 API，传递 Blob ID
      const response = await httpClient.post(API_ENDPOINTS.conversations.create, {
        ...conversationData,
        blob_id: blobId,           // 使用 blob_id
        encryption_type: 'simple', // 明确标记为简单加密
        encryption_key: null,      // 密钥不存储在后端，由前端管理
        encryption_id: null,       // 简单加密不使用
        policy_object_id: null,    // 简单加密不使用
      });
      
      if (response.success) {
        console.log('✅ Conversation created successfully!');
        
        return {
          success: true,
          conversationId: response.data,
          encryptionKey: key,  // ⚠️ 返回加密密钥，用户必须保存！
          blobId: blobId,
          message: '对话创建成功',
        };
      } else {
        throw new Error(response.error || '创建对话失败');
      }
    } catch (error) {
      console.error('创建对话失败:', error);
      throw error;
    }
  }

  /**
   * 获取对话摘要列表
   * @returns {Promise<array>} 对话摘要列表
   */
  async getConversationSummaries() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.conversations.getSummaries);
      
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.error || '获取对话列表失败');
      }
    } catch (error) {
      console.error('获取对话列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取我的对话列表
   * @param {string} walletAddress - 钱包地址
   * @returns {Promise<Array>} 对话列表
   */
  async getMyConversations(walletAddress) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.conversations.getMyConversations(walletAddress));
      
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.error || '获取我的对话列表失败');
      }
    } catch (error) {
      console.error('获取我的对话列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取对话详情 (需要 owner 验证)
   * @param {string} conversationId - 对话 ID
   * @param {string} owner - 所有者钱包地址
   * @returns {Promise<Object>} 对话详情
   */
  async getConversationDetail(conversationId, owner) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.conversations.getDetail(conversationId, owner));
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || '获取对话详情失败');
      }
    } catch (error) {
      console.error('获取对话详情失败:', error);
      throw error;
    }
  }

  /**
   * 更新对话
   * @param {string} conversationId - 对话 ID
   * @param {object} conversationData - 对话数据
   * @returns {Promise<object>} 更新结果
   */
  async updateConversation(conversationId, conversationData) {
    try {
      const response = await httpClient.put(
        API_ENDPOINTS.conversations.update(conversationId),
        conversationData
      );
      
      if (response.success) {
        return {
          success: true,
          message: '对话更新成功',
        };
      } else {
        throw new Error(response.error || '更新对话失败');
      }
    } catch (error) {
      console.error('更新对话失败:', error);
      throw error;
    }
  }

  /**
   * 更新对话名称
   * @param {string} conversationId - 对话 ID
   * @param {string} owner - 所有者钱包地址
   * @param {string} name - 新的对话名称
   * @returns {Promise<object>} 更新结果
   */
  async updateConversationName(conversationId, owner, name) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.conversations.updateName, {
        conversation_id: conversationId,
        owner: owner,
        name: name,
      });
      
      if (response.success) {
        return {
          success: true,
          message: '对话名称更新成功',
        };
      } else {
        throw new Error(response.error || '更新对话名称失败');
      }
    } catch (error) {
      console.error('更新对话名称失败:', error);
      throw error;
    }
  }

  /**
   * 删除对话
   * @param {string} conversationId - 对话 ID
   * @param {string} owner - 所有者钱包地址
   * @returns {Promise<object>} 删除结果
   */
  async deleteConversation(conversationId, owner) {
    try {
      const response = await httpClient.delete(
        API_ENDPOINTS.conversations.delete(conversationId, owner)
      );
      
      if (response.success) {
        return {
          success: true,
          message: '对话删除成功',
        };
      } else {
        throw new Error(response.error || '删除对话失败');
      }
    } catch (error) {
      console.error('删除对话失败:', error);
      throw error;
    }
  }

  /**
   * 解锁对话 (需要 x402 支付)
   * @param {string} conversationId - 对话 ID
   * @param {string} buyerWallet - 买家钱包地址
   * @returns {Promise<object>} 解锁结果
   */
  async unlockConversation(conversationId, buyerWallet) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.conversations.unlock, {
        conversation_id: conversationId,
        buyer_wallet: buyerWallet,
      });
      
      if (response.success) {
        return {
          success: true,
          resume: response.data.resume,
          message: '对话解锁成功',
        };
      } else {
        throw new Error(response.error || '解锁对话失败');
      }
    } catch (error) {
      console.error('解锁对话失败:', error);
      throw error;
    }
  }

  /**
   * 设置对话价格
   * @param {string} conversationId - 对话 ID
   * @param {string} owner - 所有者钱包地址
   * @param {number} priceInSUI - 价格（SUI）
   * @returns {Promise<object>} 设置结果
   */
  async setConversationPrice(conversationId, owner, priceInSUI) {
    try {
      // 将 SUI 转换为 MIST (1 SUI = 1,000,000,000 MIST, 9 decimals)
      const priceInUnits = Math.floor(priceInSUI * 1_000_000_000);

      const response = await httpClient.put(API_ENDPOINTS.conversations.setPrice, {
        conversation_id: conversationId,
        owner: owner,
        price: priceInUnits,
      });
      
      if (response.success) {
        return {
          success: true,
          message: `Conversation price set to ${priceInSUI} SUI`,
        };
      } else {
        throw new Error(response.error || 'Failed to set conversation price');
      }
    } catch (error) {
      console.error('Failed to set conversation price:', error);
      throw error;
    }
  }

  /**
   * 从 Walrus 下载并解密对话
   * @param {string} blobId - Walrus blob ID
   * @param {string} encryptionKey - 加密密钥
   * @returns {Promise<object>} 解密后的对话数据
   */
  async downloadAndDecryptConversation(blobId, encryptionKey) {
    try {
      console.log('⬇️  Step 1: Downloading from Walrus...');
      
      // 1. 从 Walrus 下载加密的 blob
      const encryptedBlob = await downloadFromWalrus(blobId);
      
      console.log('✅ Download complete');
      console.log('📦 Encrypted size:', encryptedBlob.size, 'bytes');

      console.log('🔓 Step 2: Decrypting with Seal...');
      
      // 2. 使用 Seal 解密
      const conversationData = await decryptWithSeal(encryptedBlob, encryptionKey);
      
      console.log('✅ Decryption complete');
      
      return conversationData;
    } catch (error) {
      console.error('下载或解密对话失败:', error);
      throw error;
    }
  }

  /**
   * 使用 Seal 加密并上传对话 (带访问控制)
   * @param {object} conversationData - 对话数据
   * @param {string} policyObjectId - 策略对象 ID (allowlist ID 或 service ID)
   * @param {string} encryptionMode - 加密模式: 'allowlist' 或 'subscription'
   * @returns {Promise<object>} { success, conversationId, blobId, encryptionId }
   */
  async createConversationWithSeal(conversationData, policyObjectId, encryptionMode = 'allowlist') {
    try {
      console.log(`🔐 Creating conversation with Seal encryption (${encryptionMode} mode)...`);
      
      // 1. 使用 Seal 加密并上传到 Walrus
      const { blobId, encryptionId, url } = await encryptAndUploadConversation(conversationData, policyObjectId);
      
      console.log('📤 Saving to backend...');
      
      // 2. 调用后端 API
      const response = await httpClient.post(API_ENDPOINTS.conversations.create, {
        ...conversationData,
        blob_id: blobId,
        encryption_id: encryptionId,
        policy_id: policyObjectId,
        encryption_type: 'seal',   // 明确标记为 Seal 加密
        encryption_mode: encryptionMode, // 加密模式
        encryption_key: null,      // Seal 加密不需要存储密钥
      });
      
      if (response.success) {
        console.log('✅ Conversation created successfully with Seal!');
        
        return {
          success: true,
          conversationId: response.data,
          blobId,
          encryptionId,
          policyObjectId,
          message: '对话创建成功 (Seal 加密)',
        };
      } else {
        throw new Error(response.error || '创建对话失败');
      }
    } catch (error) {
      console.error('创建对话失败 (Seal):', error);
      throw error;
    }
  }

  /**
   * 使用 Seal 下载并解密对话 (带访问控制)
   * @param {string} blobId - Walrus blob ID
   * @param {SessionKey} sessionKey - Seal 会话密钥
   * @param {string} policyObjectId - 策略对象 ID
   * @returns {Promise<object>} 解密后的对话数据
   */
  async downloadConversationWithSeal(blobId, sessionKey, policyObjectId) {
    try {
      return await downloadAndDecryptConversation(blobId, sessionKey, policyObjectId);
    } catch (error) {
      console.error('下载对话失败 (Seal):', error);
      throw error;
    }
  }

  /**
   * 关联 Blob 到 Allowlist
   * @param {string} allowlistId - Allowlist 对象 ID
   * @param {string} capId - Cap 对象 ID  
   * @param {string} blobId - Walrus Blob ID
   * @param {Function} signAndExecute - Sui 交易签名和执行函数
   * @returns {Promise<object>} 关联结果
   */
  async publishBlobToAllowlist(allowlistId, capId, blobId, signAndExecute) {
    try {
      console.log('📎 Publishing blob to allowlist...');
      
      const tx = createPublishTransaction(allowlistId, capId, blobId);
      
      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log('✅ Blob published to allowlist');
              resolve({
                success: true,
                txDigest: result.digest,
                message: 'Blob 已关联到 Allowlist',
              });
            },
            onError: (error) => {
              console.error('❌ Failed to publish blob:', error);
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error('关联 Blob 失败:', error);
      throw error;
    }
  }

  /**
   * 添加地址到对话访问白名单
   * @param {string} allowlistId - Allowlist 对象 ID
   * @param {string} capId - Cap 对象 ID
   * @param {string} address - 要添加的地址
   * @param {Function} signAndExecute - Sui 交易签名和执行函数
   * @returns {Promise<object>} 添加结果
   */
  async addToConversationAllowlist(allowlistId, capId, address, signAndExecute) {
    try {
      console.log('➕ Adding address to allowlist...');
      
      const tx = createAddToAllowlistTransaction(allowlistId, capId, address);
      
      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log('✅ Address added to allowlist');
              resolve({
                success: true,
                txDigest: result.digest,
                message: '地址已添加到访问白名单',
              });
            },
            onError: (error) => {
              console.error('❌ Failed to add address:', error);
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error('添加地址失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const conversationService = new ConversationService();
