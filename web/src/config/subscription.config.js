/**
 * 订阅服务配置
 * 基于 examples/move/sources/subscription.move 实现
 * 用于会话付费解锁功能
 */

// 使用与 Seal 相同的合约包 (Allowlist 和 Subscription 在同一个包中)
export const SUBSCRIPTION_PACKAGE_ID = '0x62b4422e6a76cda57489f31a90e5e73878f9e9af7f97471f4e257d8006df58af';

// Subscription 模块名称
export const SUBSCRIPTION_MODULE_NAME = 'subscription';

// 订阅配置
export const SUBSCRIPTION_CONFIG = {
  // 默认订阅时长 (毫秒) - 设为 0 表示永久访问
  defaultTTL: 0, // 永久访问
  
  // 最小订阅时长 (毫秒) - 如果要限制时间，可以设置
  minTTL: 0,
  
  // 默认价格 (SUI MIST, 9 decimals)
  // 5 SUI = 5_000_000_000 MIST
  defaultPrice: 5_000_000_000,
};

/**
 * 获取订阅合约调用目标
 * @param {string} functionName - 函数名
 * @returns {string} 完整的合约调用目标
 */
export function getSubscriptionTarget(functionName) {
  return `${SUBSCRIPTION_PACKAGE_ID}::${SUBSCRIPTION_MODULE_NAME}::${functionName}`;
}

/**
 * 将 SUI 转换为 MIST
 * @param {number} sui - SUI 金额
 * @returns {number} MIST
 */
export function suiToMist(sui) {
  return Math.floor(sui * 1_000_000_000);
}

/**
 * 将 MIST 转换为 SUI
 * @param {number} mist - MIST
 * @returns {number} SUI 金额
 */
export function mistToSui(mist) {
  return mist / 1_000_000_000;
}
