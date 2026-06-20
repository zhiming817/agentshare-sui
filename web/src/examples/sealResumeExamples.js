/**
 * Seal 会话加密使用示例
 * 展示如何使用 Seal 进行会话加密、上传、访问控制和解密
 */

import { conversationService } from '../services';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { getSealClient } from '../utils/sealClient';

// ============================================
// 示例 1: 创建加密会话 (带访问控制)
// ============================================

async function example1_createEncryptedResume() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;

  // Step 1: 准备会话数据
  const resumeData = {
    owner: walletAddress,
    personal: {
      name: '张三',
      gender: 'male',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      // ...
    },
    skills: '精通 React、Vue、Node.js...',
    desiredPosition: {
      jobType: 'fulltime',
      position: '前端工程师',
      // ...
    },
    // ...
  };

  // Step 2: 创建或使用已有的 Allowlist
  // 注意: 实际使用时需要先创建 Allowlist 和 Cap
  const allowlistId = '0x...'; // 您的 Allowlist ID
  const capId = '0x...';       // 对应的 Cap ID

  try {
    // Step 3: 使用 Seal 加密并创建会话
    console.log('🔐 创建加密会话...');
    const result = await conversationService.createResumeWithSeal(
      resumeData,
      allowlistId
    );

    console.log('✅ 会话创建成功!');
    console.log('Resume ID:', result.resumeId);
    console.log('Blob ID:', result.blobId);
    console.log('Encryption ID:', result.encryptionId);

    // Step 4: 关联 Blob 到 Allowlist (需要链上签名)
    console.log('📎 关联 Blob 到访问控制...');
    await conversationService.publishBlobToAllowlist(
      allowlistId,
      capId,
      result.blobId,
      signAndExecute
    );

    console.log('✅ 完成! 会话已加密并上链');
    
    return result;
  } catch (error) {
    console.error('❌ 创建失败:', error);
    throw error;
  }
}

// ============================================
// 示例 2: 解锁会话 (HR 购买后)
// ============================================

async function example2_unlockResumeForHR() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  // HR 的钱包地址
  const hrAddress = '0x...';
  
  // Allowlist 信息
  const allowlistId = '0x...';
  const capId = '0x...';

  try {
    console.log('➕ 添加 HR 到访问白名单...');
    
    const result = await conversationService.addToResumeAllowlist(
      allowlistId,
      capId,
      hrAddress,
      signAndExecute
    );

    console.log('✅ HR 已获得访问权限!');
    console.log('交易哈希:', result.txDigest);
    
    return result;
  } catch (error) {
    console.error('❌ 添加失败:', error);
    throw error;
  }
}

// ============================================
// 示例 3: 查看加密会话 (需要访问权限)
// ============================================

async function example3_viewEncryptedResume() {
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  
  // 会话信息
  const resumeId = '123';
  const owner = '0x...';

  try {
    // Step 1: 获取会话元数据
    console.log('📄 获取会话信息...');
    const resume = await conversationService.getResumeDetail(resumeId, owner);
    
    const { 
      ipfs_cid: blobId, 
      policy_object_id: allowlistId 
    } = resume;

    // Step 2: 创建会话密钥 (通过 Sui 钱包签名)
    console.log('🔑 创建会话密钥...');
    const sealClient = getSealClient();
    const sessionKey = await sealClient.createSessionKey({
      // 注意: 实际使用时需要传入正确的 signer
      // signer: suiSigner,
    });

    // Step 3: 下载并解密 (自动验证访问权限)
    console.log('📥 下载并解密会话...');
    const resumeData = await conversationService.downloadResumeWithSeal(
      blobId,
      sessionKey,
      allowlistId
    );

    console.log('✅ 会话内容:', resumeData);
    
    return resumeData;
  } catch (error) {
    if (error.message.includes('无权访问')) {
      console.error('❌ 您不在此会话的访问白名单中');
    } else {
      console.error('❌ 查看失败:', error);
    }
    throw error;
  }
}

// ============================================
// 示例 4: 批量查看会话 (优化性能)
// ============================================

async function example4_viewMultipleResumes() {
  const { downloadAndDecryptBatch } = await import('../utils/sealClient');
  const sealClient = getSealClient();
  
  // 多个会话的 blobIds
  const blobIds = [
    '0x...blob1',
    '0x...blob2',
    '0x...blob3',
  ];
  
  const allowlistId = '0x...';

  try {
    console.log(`📦 批量下载 ${blobIds.length} 份会话...`);
    
    // 创建会话密钥
    const sessionKey = await sealClient.createSessionKey({
      // signer: suiSigner,
    });

    // 批量下载和解密
    const results = await downloadAndDecryptBatch(
      blobIds,
      sessionKey,
      allowlistId
    );

    console.log(`✅ 成功解密 ${results.length} 份会话`);
    
    results.forEach(({ blobId, data }) => {
      console.log(`- ${blobId}:`, data.personal.name);
    });
    
    return results;
  } catch (error) {
    console.error('❌ 批量查看失败:', error);
    throw error;
  }
}

// ============================================
// 示例 5: 完整的 React 组件示例
// ============================================

function ResumeCreateWithSeal() {
  const [formData, setFormData] = useState({
    personal: { name: '', email: '', phone: '' },
    skills: '',
  });
  const [allowlistId, setAllowlistId] = useState('');
  const [capId, setCapId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. 创建加密会话
      const result = await conversationService.createResumeWithSeal(
        {
          ...formData,
          owner: currentAccount?.address,
        },
        allowlistId
      );

      // 2. 关联到 Allowlist
      await conversationService.publishBlobToAllowlist(
        allowlistId,
        capId,
        result.blobId,
        signAndExecute
      );

      alert('会话创建成功!');
      
      // 跳转到会话列表
      navigate('/resumes');
    } catch (error) {
      console.error('创建失败:', error);
      alert(`创建失败: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <input
        type="text"
        placeholder="Allowlist ID"
        value={allowlistId}
        onChange={(e) => setAllowlistId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Cap ID"
        value={capId}
        onChange={(e) => setCapId(e.target.value)}
        required
      />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '创建中...' : '创建加密会话'}
      </button>
    </form>
  );
}

// ============================================
// 示例 6: 创建 Allowlist (一次性操作)
// ============================================

async function example6_createAllowlist() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { Transaction } = await import('@mysten/sui/transactions');
  const { TESTNET_PACKAGE_ID, ALLOWLIST_MODULE_NAME } = await import('../config/seal.config');

  try {
    console.log('🆕 创建 Allowlist...');
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${TESTNET_PACKAGE_ID}::${ALLOWLIST_MODULE_NAME}::create_allowlist_entry`,
      arguments: [tx.pure.string('My Resume Access Control')],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('✅ Allowlist 创建成功!');
            console.log('交易哈希:', result.digest);
            
            // 从交易结果中提取 allowlistId 和 capId
            // 注意: 需要解析 events 或 objects
            const events = result.events || [];
            console.log('Events:', events);
            
            // 实际使用时需要从 events 中提取 ID
            // const allowlistId = ...
            // const capId = ...
            
            resolve(result);
          },
          onError: (error) => {
            console.error('❌ 创建失败:', error);
            reject(error);
          },
        }
      );
    });
  } catch (error) {
    console.error('❌ 创建失败:', error);
    throw error;
  }
}

// ============================================
// 使用说明
// ============================================

/*
快速开始:

1. 安装依赖:
   npm install @mysten/seal @mysten/sui @mysten/dapp-kit

2. 配置环境变量:
   VITE_SUI_NETWORK=testnet

3. 创建 Allowlist (一次性):
   await example6_createAllowlist()

4. 创建加密会话:
   await example1_createEncryptedResume()

5. HR 购买后解锁:
   await example2_unlockResumeForHR()

6. 查看会话:
   await example3_viewEncryptedResume()

注意事项:
- 所有链上操作都需要 Sui 钱包签名
- Allowlist 和 Cap 需要妥善保管
- 合约已部署在测试网: 0x55202f19ccbb6d2d518cf11bc1e6751d0762275427665bdd76d1e917aad82b17
*/

export {
  example1_createEncryptedResume,
  example2_unlockResumeForHR,
  example3_viewEncryptedResume,
  example4_viewMultipleResumes,
  example6_createAllowlist,
  ResumeCreateWithSeal,
};
