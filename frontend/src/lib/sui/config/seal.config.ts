/**
 * Seal 加密和访问控制配置
 * 
 * 
 */

// Seal 合约配置 (已部署在测试网)
export const TESTNET_PACKAGE_ID = '0xe32dbbf18ae7fa2506f420531a559608ceabd03382780b5f3f0c2f9a06c33778';

export interface SealServerConfig {
  objectId: string;
  weight: number;
}

// Seal 密钥服务器配置
export const SEAL_SERVER_CONFIGS: SealServerConfig[] = [
  {
    objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
    weight: 1,
  },
  {
    objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
    weight: 1,
  },
];

export interface SealConfig {
  threshold: number;
  verifyKeyServers: boolean;
  packageId: string;
}

// Seal 配置选项
export const SEAL_CONFIG: SealConfig = {
  // 加密阈值 (需要多少个密钥服务器才能解密)
  threshold: 2,
  // 是否验证密钥服务器
  verifyKeyServers: false,
  // 合约包 ID
  packageId: TESTNET_PACKAGE_ID,
};

// Allowlist 模块名称 (用于访问控制)
export const ALLOWLIST_MODULE_NAME = 'allowlist';

// Sui 网络配置
// @ts-ignore
export const SUI_NETWORK: string = import.meta.env.VITE_SUI_NETWORK || 'testnet';

// Sui 浏览器 URL
export const SUI_EXPLORER_URL = 'https://suiscan.xyz/testnet';

/**
 * 获取合约调用目标
 * @param {string} functionName - 函数名
 * @returns {string} 完整的合约调用目标
 */
export function getSealTarget(functionName: string): string {
  return `${TESTNET_PACKAGE_ID}::${ALLOWLIST_MODULE_NAME}::${functionName}`;
}
