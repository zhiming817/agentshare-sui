/**
 * Seal 客户端工具类
 * 
 * 提供完整的加密、解密和访问控制功能
 */

import { SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, toHex } from '@mysten/sui/utils';
import { SEAL_CONFIG, SEAL_SERVER_CONFIGS, getSealTarget, SUI_NETWORK } from './config/seal.config';
import { uploadToWalrus, downloadFromWalrus } from './walrus';

// 创建 Sui 客户端
let suiClient: SuiClient | null = null;
let sealClient: SealClient | null = null;

/**
 * 初始化 Sui 和 Seal 客户端
 */
function initClients() {
  if (suiClient && sealClient) {
    return { suiClient, sealClient };
  }

  suiClient = new SuiClient({
    url: getFullnodeUrl(SUI_NETWORK as any),
  });

  sealClient = new SealClient({
    suiClient,
    serverConfigs: SEAL_SERVER_CONFIGS,
    verifyKeyServers: SEAL_CONFIG.verifyKeyServers,
  });

  return { suiClient, sealClient };
}

/**
 * 获取 Sui 客户端
 * @returns {SuiClient}
 */
export function getSuiClient(): SuiClient {
  const { suiClient: client } = initClients();
  return client;
}

/**
 * 获取 Seal 客户端
 * @returns {SealClient}
 */
export function getSealClient(): SealClient {
  const { sealClient: client } = initClients();
  return client;
}

/**
 * 使用 Seal 加密文件数据并上传到 Walrus
 * 基于 examples/frontend/src/EncryptAndUpload.tsx 实现
 * @param {object} resumeData - 文件数据
 * @param {string} policyObjectId - 策略对象 ID (allowlist ID)
 * @returns {Promise<object>} { blobId, encryptionId, url }
 */
export async function encryptAndUploadResume(resumeData: any, policyObjectId: string) {
  try {
    console.log('🔐 Step 1: Encrypting resume with Seal...');
    
    const { sealClient } = initClients();
    
    // 将简历数据转换为 Uint8Array
    const jsonString = JSON.stringify(resumeData);
    const dataBytes = new TextEncoder().encode(jsonString);
    
    // 生成随机 nonce (5 字节)
    const nonce = crypto.getRandomValues(new Uint8Array(5));
    
    // 生成加密 ID: [policy_object_id][nonce]
    const policyObjectBytes = fromHex(policyObjectId);
    const encryptionId = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
    
    console.log('🔑 Encryption ID:', encryptionId);
    
    // 使用 Seal 加密
    const { encryptedObject: encryptedBytes } = await (sealClient as SealClient).encrypt({
      threshold: SEAL_CONFIG.threshold,
      packageId: SEAL_CONFIG.packageId,
      id: encryptionId,
      data: dataBytes,
    });
    
    console.log('✅ Encryption complete');
    console.log('📦 Encrypted size:', encryptedBytes.length, 'bytes');

    console.log('☁️  Step 2: Uploading to Walrus...');
    
    // 上传到 Walrus
    const encryptedBlob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
    const { blobId, url } = await uploadToWalrus(encryptedBlob, {
      encrypted: true,
      encryptionId,
      policyObjectId,
      timestamp: new Date().toISOString(),
    });
    
    console.log('✅ Upload complete');
    console.log('🆔 Blob ID:', blobId);
    
    return {
      blobId,
      encryptionId,
      url,
    };
  } catch (error) {
    console.error('❌ Encrypt and upload failed:', error);
    throw new Error(`Seal encrypt and upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 从 Walrus 下载并使用 Seal 解密文件数据
 * 基于 examples/frontend/src/utils.ts 的 downloadAndDecrypt 实现
 * @param {string} blobId - Walrus Blob ID
 * @param {SessionKey} sessionKey - Seal 会话密钥
 * @param {string} policyObjectId - 策略对象 ID (allowlist ID)
 * @param {Function} moveCallConstructor - MoveCall 构造函数
 * @returns {Promise<object>} 解密后的文件数据
 */
export async function downloadAndDecryptResume(
  blobId: string, 
  sessionKey: SessionKey, 
  policyObjectId: string, 
  moveCallConstructor?: (tx: Transaction, id: string) => void
) {
  try {
    console.log('📥 Step 1: Downloading from Walrus...');
    
    // 从 Walrus 下载加密数据
    const encryptedBlob = await downloadFromWalrus(blobId);
    
    console.log('✅ Download complete');
    console.log('📦 Encrypted size:', encryptedBlob.size, 'bytes');

    console.log('🔓 Step 2: Decrypting with Seal...');
    
    const { suiClient, sealClient } = initClients();
    
    // 将 Blob 转换为 Uint8Array
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const encryptedData = new Uint8Array(arrayBuffer);
    
    // 解析加密对象获取 ID
    const encryptedObject = EncryptedObject.parse(encryptedData);
    const fullId = encryptedObject.id;
    
    console.log('🔑 Encryption ID:', fullId);
    
    // 使用传入的 moveCallConstructor 构建访问控制交易
    const tx = new Transaction();
    
    if (moveCallConstructor) {
      // 订阅模式：使用 subscription::seal_approve
      console.log('🔐 使用订阅模式验证访问权限...');
      moveCallConstructor(tx, fullId);
    } else {
      // 白名单模式：使用 allowlist::seal_approve
      console.log('🔐 使用白名单模式验证访问权限...');
      tx.moveCall({
        target: getSealTarget('seal_approve') as any,
        arguments: [
          tx.pure.vector('u8', Array.from(fromHex(fullId))),
          tx.object(policyObjectId),
        ],
      });
    }
    
    const txBytes = await tx.build({ client: suiClient as SuiClient, onlyTransactionKind: true });
    
    try {
      // 从密钥服务器获取解密密钥
      await (sealClient as SealClient).fetchKeys({
        ids: [fullId],
        txBytes,
        sessionKey,
        threshold: SEAL_CONFIG.threshold,
      });
      
      // 解密数据
      const decryptedData = await (sealClient as SealClient).decrypt({
        data: encryptedData,
        sessionKey,
        txBytes,
      });
      
      // 转换回 JSON
      const jsonString = new TextDecoder().decode(decryptedData);
      const resumeData = JSON.parse(jsonString);
      
      console.log('✅ Decryption complete');
      
      return resumeData;
    } catch (err: any) {
      if (err instanceof NoAccessError) {
        throw new Error('无权访问：您不在此简历的访问白名单中');
      }
      throw new Error(`解密失败: ${err.message}`);
    }
  } catch (error) {
     console.error('❌ Download and decrypt failed:', error);
     throw error;
  }
}
