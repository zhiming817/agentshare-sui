import { httpClient } from './http.client';
import { API_ENDPOINTS } from './api.config';

/**
 * 解锁记录服务
 */
class UnlockRecordService {
  /**
   * 创建解锁记录（支付成功后调用）
   * @param {Object} data - 解锁记录数据
   * @param {number} data.resume_id - 会话 ID
   * @param {number} data.buyer_id - 购买者用户 ID
   * @param {string} data.buyer_wallet - 购买者钱包地址
   * @param {string} data.seller_wallet - 卖家钱包地址
   * @param {number} data.amount - 支付金额
   * @param {string} data.transaction_signature - 交易签名（Sui transaction digest）
   * @param {number} [data.block_time] - 区块时间戳（可选）
   * @returns {Promise<Object>} 创建的解锁记录
   */
  async createUnlockRecord(data) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.unlockRecords.create, data);
      return response.data;
    } catch (error) {
      console.error('创建解锁记录失败:', error);
      throw error;
    }
  }

  /**
   * 检查用户是否已解锁某会话
   * @param {number} resumeId - 会话 ID
   * @param {number} buyerId - 购买者用户 ID
   * @returns {Promise<boolean>} 是否已解锁
   */
  async checkUnlockStatus(resumeId, buyerId) {
    try {
      const response = await httpClient.get(
        API_ENDPOINTS.unlockRecords.checkUnlock(resumeId, buyerId)
      );
      return response.data?.unlocked || false;
    } catch (error) {
      console.error('检查解锁状态失败:', error);
      return false;
    }
  }

  /**
   * 获取用户已解锁的所有会话
   * @param {string} buyerWallet - 购买者钱包地址
   * @returns {Promise<Array>} 解锁记录列表
   */
  async getUnlockedResumes(buyerWallet) {
    try {
      const response = await httpClient.get(
        API_ENDPOINTS.unlockRecords.getUnlockedByBuyer(buyerWallet)
      );
      return response.data || [];
    } catch (error) {
      console.error('获取已解锁会话失败:', error);
      return [];
    }
  }

  /**
   * 获取会话的所有解锁记录（会话所有者查看）
   * @param {number} resumeId - 会话 ID
   * @returns {Promise<Array>} 解锁记录列表
   */
  async getResumeUnlockRecords(resumeId) {
    try {
      const response = await httpClient.get(
        API_ENDPOINTS.unlockRecords.getByResume(resumeId)
      );
      return response.data || [];
    } catch (error) {
      console.error('获取会话解锁记录失败:', error);
      return [];
    }
  }
}

export default new UnlockRecordService();
