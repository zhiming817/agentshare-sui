/**
 * 会话加密上传服务
 * 整合加密、IPFS 上传和后端 API 调用
 */

import {
  prepareResumeForUpload,
  downloadAndDecryptResume,
} from '../utils/crypto';
import {
  uploadEncryptedResume,
  downloadEncryptedResume,
} from '../utils/ipfs';
import { conversationService } from './conversation.service';

/**
 * 创建加密会话并上传
 * @param {Object} conversationData - 会话数据
 * @param {string} ownerWallet - 所有者钱包地址
 * @returns {Promise<{conversationId: string, encryptionKey: string, cid: string}>}
 */
export async function createEncryptedConversation(conversationData, ownerWallet) {
  try {
    console.log('🔐 Step 1: Encrypting conversation...');
    
    // 1. 加密数据
    const { key, encryptedBlob } = await prepareResumeForUpload(conversationData);
    
    console.log('✅ Encryption complete');
    console.log('🔑 Encryption Key (SAVE THIS!):', key);
    console.log('📦 Encrypted size:', encryptedBlob.size, 'bytes');

    console.log('☁️  Step 2: Uploading to IPFS...');
    
    // 2. 上传到 IPFS
    const { cid, url } = await uploadEncryptedResume(encryptedBlob, {
      owner: ownerWallet,
      encrypted: true,
      timestamp: new Date().toISOString(),
    });
    
    console.log('✅ Upload complete');
    console.log('📝 CID:', cid);
    console.log('🔗 URL:', url);

    console.log('📤 Step 3: Saving to backend...');
    
    // 3. 调用后端 API，传递 CID
    const response = await conversationService.createConversation({
      owner: ownerWallet,
      ipfs_cid: cid,  // 前端上传后的 CID
      ...conversationData,
    });

    console.log('✅ Conversation created successfully!');
    console.log('🎉 Conversation ID:', response.conversationId);

    // 返回重要信息
    return {
      conversationId: response.conversationId,
      encryptionKey: key,  // ⚠️ 用户必须保存这个密钥！
      cid: cid,
      url: url,
    };
  } catch (error) {
    console.error('❌ Create encrypted conversation failed:', error);
    throw error;
  }
}

/**
 * 解锁并解密对话
 * @param {string} cid - IPFS CID
 * @param {string} encryptionKey - Base64 编码的解密密钥
 * @returns {Promise<Object>} 解密后的对话数据
 */
export async function unlockAndDecryptConversation(cid, encryptionKey) {
  try {
    console.log('📥 Step 1: Downloading from IPFS...');
    console.log('📝 CID:', cid);
    
    // 1. 从 IPFS 下载加密数据
    const encryptedBlob = await downloadEncryptedResume(cid);
    
    console.log('✅ Download complete');
    console.log('📦 Encrypted size:', encryptedBlob.size, 'bytes');

    console.log('🔓 Step 2: Decrypting conversation...');
    
    // 2. 解密数据
    const conversationData = await downloadAndDecryptResume(encryptedBlob, encryptionKey);
    
    console.log('✅ Decryption successful!');
    
    return conversationData;
  } catch (error) {
    console.error('❌ Unlock and decrypt failed:', error);
    throw error;
  }
}


/**
 * 从后端获取 CID（需要先支付）
 * @param {string} resumeId - 会话 ID
 * @param {string} buyerWallet - 购买者钱包地址
 * @returns {Promise<string>} IPFS CID
 */
export async function getResumeCID(resumeId, buyerWallet) {
  try {
    // 调用后端解锁接口
    const response = await fetch('/api/resumes/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_id: resumeId,
        buyer_wallet: buyerWallet,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unlock resume');
    }

    const result = await response.json();
    
    if (!result.data?.ipfs_cid) {
      throw new Error('No CID returned from backend');
    }

    return result.data.ipfs_cid;
  } catch (error) {
    console.error('❌ Get resume CID failed:', error);
    throw error;
  }
}

/**
 * 完整的购买和解密流程
 * @param {string} resumeId - 会话 ID
 * @param {string} buyerWallet - 购买者钱包地址
 * @param {string} encryptionKey - 解密密钥（从卖家获得）
 * @returns {Promise<Object>} 解密后的会话数据
 */
export async function purchaseAndDecryptResume(resumeId, buyerWallet, encryptionKey) {
  try {
    console.log('💰 Step 1: Unlocking resume...');
    
    // 1. 支付并获取 CID（后端会验证支付）
    const cid = await getResumeCID(resumeId, buyerWallet);
    
    console.log('✅ Resume unlocked');
    console.log('📝 CID:', cid);

    // 2. 下载并解密
    const resumeData = await unlockAndDecryptResume(cid, encryptionKey);
    
    console.log('🎉 Purchase complete!');
    
    return resumeData;
  } catch (error) {
    console.error('❌ Purchase and decrypt failed:', error);
    throw error;
  }
}
