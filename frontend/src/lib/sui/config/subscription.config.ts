/**
 * 订阅服务配置
 * 
 * 用于付费解锁功能
 */

// 使用与 Seal 相同的合约包 (Allowlist 和 Subscription 在同一个包中)
export const SUBSCRIPTION_PACKAGE_ID = '0xe32dbbf18ae7fa2506f420531a559608ceabd03382780b5f3f0c2f9a06c33778';

// Subscription 模块名称
export const SUBSCRIPTION_MODULE_NAME = 'subscription';

export interface SubscriptionConfig {
  defaultTTL: number;
  minTTL: number;
  defaultPrice: number;
}

// 订阅配置
export const SUBSCRIPTION_CONFIG: SubscriptionConfig = {
  // 默认订阅时长 (毫秒) - 设为 0 表示永久访问
  defaultTTL: 0, // 永久访问
  
  // 最小订阅时长 (毫秒) - 如果要限制时间，可以设置
  minTTL: 0,
  
  // 默认价格 (USDC micro-units, 6 decimals)
  // 5 USDC = 5_000_000 micro-units
  defaultPrice: 5_000_000,
};

/**
 * 获取订阅合约调用目标
 * @param {string} functionName - 函数名
 * @returns {string} 完整的合约调用目标
 */
export function getSubscriptionTarget(functionName: string): string {
  return `${SUBSCRIPTION_PACKAGE_ID}::${SUBSCRIPTION_MODULE_NAME}::${functionName}`;
}

/**
 * 将 USDC 转换为 micro-units
 * @param {number} usdc - USDC 金额
 * @returns {number} micro-units
 */
export function usdcToMicroUnits(usdc: number): number {
  return Math.floor(usdc * 1_000_000);
}

/**
 * 将 micro-units 转换为 USDC
 * @param {number} microUnits - micro-units
 * @returns {number} USDC 金额
 */
export function microUnitsToUsdc(microUnits: number): number {
  return microUnits / 1_000_000;
}
