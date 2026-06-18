/**
 * 订阅服务工具函数
 * 用于简历付费解锁功能
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { getSubscriptionTarget } from './config/subscription.config';

export interface CreateSubscriptionParams {
  fee: number | bigint;
  ttl: number | bigint;
  name: string;
  senderAddress: string;
}

/**
 * 创建订阅服务（简历所有者调用）
 * @param {CreateSubscriptionParams} params
 * @returns {Transaction} Sui 交易对象
 */
export function createSubscriptionServiceTx(params: CreateSubscriptionParams): Transaction {
  const { fee, ttl, name, senderAddress } = params;
  
  const tx = new Transaction();
  tx.setGasBudget(10000000);
  tx.setSender(senderAddress);
  
  // 调用 create_service_entry
  tx.moveCall({
    target: getSubscriptionTarget('create_service_entry') as any,
    arguments: [
      tx.pure.u64(fee),
      tx.pure.u64(ttl),
      tx.pure.string(name),
    ],
  });
  
  return tx;
}

export interface PurchaseSubscriptionParams {
  serviceId: string;
  fee: number | bigint;
  buyerAddress: string;
}

/**
 * 购买订阅（买家调用）
 * @param {PurchaseSubscriptionParams} params
 * @returns {Transaction} Sui 交易对象
 */
export function purchaseSubscriptionTx(params: PurchaseSubscriptionParams): Transaction {
  const { serviceId, fee, buyerAddress } = params;
  
  const tx = new Transaction();
  tx.setGasBudget(10000000);
  tx.setSender(buyerAddress);
  
  // 1. 使用 coinWithBalance 创建精确金额的 Coin（重要！）
  // 注意：fee 必须与 service.fee 完全一致，否则会 abort
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(fee)]);
  
  // 2. 调用 subscribe - 返回 Subscription 对象
  const subscriptionObj = tx.moveCall({
    target: getSubscriptionTarget('subscribe') as any,
    arguments: [
      paymentCoin,                    // 支付的 Coin
      tx.object(serviceId),           // Service ID
      tx.object(SUI_CLOCK_OBJECT_ID), // Sui Clock
    ],
  });
  
  // 2. 将 Subscription 转移给买家
  tx.moveCall({
    target: getSubscriptionTarget('transfer') as any,
    arguments: [
      subscriptionObj,
      tx.pure.address(buyerAddress),
    ],
  });
  
  return tx;
}

export interface SubscriptionApproveParams {
  blobId: string;
  subscriptionId: string;
  serviceId: string;
}

/**
 * 验证订阅权限（Seal 解密时调用）
 * @param {SubscriptionApproveParams} params
 * @returns {Function} MoveCall 构造函数
 */
export function constructSubscriptionApprove(params: SubscriptionApproveParams) {
  const { blobId, subscriptionId, serviceId } = params;
  
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: getSubscriptionTarget('seal_approve') as any,
      arguments: [
        tx.pure.vector('u8', Array.from(Buffer.from(id, 'hex'))),
        tx.object(subscriptionId),
        tx.object(serviceId),
        // 新合约移除了 Clock 参数 - 支持永久订阅
      ],
    });
  };
}

export interface Subscription {
  id: string;
  service_id: string;
  created_at: number;
}

/**
 * 查询用户的订阅列表
 * @param {SuiClient} suiClient - Sui 客户端
 * @param {string} ownerAddress - 用户地址
 * @param {string} packageId - 合约包 ID
 * @returns {Promise<Subscription[]>} 订阅列表
 */
export async function getUserSubscriptions(suiClient: SuiClient, ownerAddress: string, packageId: string): Promise<Subscription[]> {
  try {
    console.log('📡 查询订阅 - 参数:', {
      owner: ownerAddress,
      packageId: packageId,
      filter: `${packageId}::subscription::Subscription`
    });
    
    const result = await suiClient.getOwnedObjects({
      owner: ownerAddress,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        StructType: `${packageId}::subscription::Subscription`,
      },
    });
    
    console.log('📡 查询订阅 - 原始结果:', result);
    console.log('📡 查询订阅 - 数据条数:', result.data?.length || 0);
    
    const subscriptions: Subscription[] = result.data.map(obj => {
      console.log('📡 处理订阅对象:', obj);
      const fields = (obj?.data?.content as any)?.fields || {};
      console.log('📡 订阅字段:', fields);
      return {
        id: fields?.id?.id,
        service_id: fields?.service_id,
        created_at: parseInt(fields?.created_at || 0),
      };
    });
    
    console.log('📡 查询订阅 - 解析结果:', subscriptions);
    return subscriptions;
  } catch (error) {
    console.error('❌ 查询订阅列表失败:', error);
    return [];
  }
}

export interface ServiceDetails {
  id: string;
  fee: number;
  ttl: number;
  owner?: string;
  name?: string;
}

/**
 * 查询服务详情
 * @param {SuiClient} suiClient - Sui 客户端
 * @param {string} serviceId - Service Object ID
 * @returns {Promise<ServiceDetails|null>} 服务详情
 */
export async function getServiceDetails(suiClient: SuiClient, serviceId: string): Promise<ServiceDetails | null> {
  try {
    const service = await suiClient.getObject({
      id: serviceId,
      options: { showContent: true },
    });
    
    const fields = (service?.data?.content as any)?.fields || {};
    return {
      id: serviceId,
      fee: parseInt(fields?.fee || 0),
      ttl: parseInt(fields?.ttl || 0),
      owner: fields?.owner,
      name: fields?.name,
    };
  } catch (error) {
    console.error('查询服务详情失败:', error);
    return null;
  }
}

/**
 * 检查订阅是否有效
 * @param {Subscription} subscription - 订阅对象
 * @param {ServiceDetails} service - 服务对象
 * @param {number} currentTimestamp - 当前时间戳 (毫秒)
 * @returns {boolean} 是否有效
 */
export function isSubscriptionValid(subscription: Subscription, service: ServiceDetails, currentTimestamp: number): boolean {
  // 如果 TTL 为 0，表示永久有效
  if (service.ttl === 0) {
    return true;
  }
  
  // 检查是否在有效期内
  const expiresAt = subscription.created_at + service.ttl;
  return currentTimestamp <= expiresAt;
}
