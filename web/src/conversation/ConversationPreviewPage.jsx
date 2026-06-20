import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction, useSignPersonalMessage } from '@mysten/dapp-kit';
import PageLayout from '../layout/PageLayout';
import ConversationPreview from './ConversationPreview';
import { conversationService } from '../services';
import { getSealClient, downloadAndDecryptConversation } from '../utils/sealClient';
import { decryptWithSeal } from '../utils/seal';
import { downloadFromWalrus } from '../utils/walrus';

export default function ConversationPreviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const connected = !!currentAccount;
  const publicKey = currentAccount?.address;
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  // Seal 相关状态
  const [encryptionType, setEncryptionType] = useState('simple');
  const [policyObjectId, setPolicyObjectId] = useState(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/conversations');
      return;
    }

    loadConversationDetail();
  }, [id, connected, publicKey]);

  const loadConversationDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const owner = publicKey;
      const conversation = await conversationService.getConversationDetail(id, owner);
      
      console.log('加载的会话数据:', conversation);
      
      // 保存加密类型和策略对象ID
      const encType = conversation.encryption_type || 'simple';
      const policyId = conversation.policy_object_id;
      setEncryptionType(encType);
      setPolicyObjectId(policyId);
      
      // 检查是否有 IPFS CID 或 blob_id（表示加密会话）
      const ipfsCid = conversation.ipfs_cid || conversation.cid;
      const blobId = conversation.blob_id;
      
      if (!ipfsCid && !blobId) {
        // 没有 CID/blob_id，说明是旧版本未加密的会话，直接显示
        console.log('⚠️ 未加密的会话，直接显示');
        setFormData(transformConversationData(conversation));
        setIsLoading(false);
        return;
      }
      
      console.log('🔐 检测到加密会话，类型:', encType, 'ID:', blobId || ipfsCid);
      
      if (encType === 'seal') {
        // Seal 加密：需要验证 Allowlist 并使用 SessionKey
        if (!blobId || !conversation.encryption_id || !policyId) {
          throw new Error('Seal 加密会话信息不完整');
        }
        
        console.log('🔒 Seal 加密会话，开始解密流程...');
        await decryptSealConversation(blobId, conversation.encryption_id, policyId);
        
      } else {
        // 简单加密：使用本地密钥
        const storageId = blobId || ipfsCid;
        
        // 1. 尝试从 localStorage 读取密钥
        const savedKeys = JSON.parse(localStorage.getItem('conversationEncryptionKeys') || '{}');
        let key = savedKeys[id];
        
        if (!key) {
          console.log('⚠️ 本地未找到密钥，需要用户输入');
          setNeedsKey(true);
          setIsLoading(false);
          return;
        }
        
        console.log('✅ 找到本地密钥，开始解密...');
        
        // 2. 下载并解密
        await decryptAndLoadConversation(storageId, key);
      }
      
    } catch (err) {
      console.error('加载会话失败:', err);
      setError(err.message);
      
      if (err.message.includes('Unauthorized')) {
        alert('无权查看此会话');
        navigate('/conversations');
      } else if (err.message.includes('NoAccess')) {
        alert('您不在会话的访问白名单中');
        navigate('/conversations');
      }
    } finally {
      setIsLoading(false);
    }
  };

const decryptSealConversation = async (blobId, encryptionId, policyObjectId) => {
    try {
      setIsDecrypting(true);
      
      if (!currentAccount) {
        throw new Error('请先连接钱包');
      }
      
      console.log('📝 创建 SessionKey...', {
        blobId,
        encryptionId,
        policyObjectId
      });
      
      // 1. 创建 SessionKey
      const { SessionKey } = await import('@mysten/seal');
      const { getSuiClient } = await import('../utils/sealClient');
      const { SEAL_CONFIG } = await import('../config/seal.config');
      
      const suiClient = getSuiClient();
      
      const sessionKey = await SessionKey.create({
        address: currentAccount.address,
        packageId: SEAL_CONFIG.packageId,
        ttlMin: 10, // 10 分钟有效期 (Seal 限制 1-30)
        suiClient,
      });
      
      // 2. 签名 SessionKey
      console.log('✍️ 请在钱包中签名 SessionKey...');
      const personalMessage = sessionKey.getPersonalMessage();
      
      const result = await signPersonalMessage({
        message: personalMessage,
      });

      await sessionKey.setPersonalMessageSignature(result.signature);
      console.log('✅ SessionKey 创建并签名成功');

      try {
        // 3. 下载并解密
        console.log('📥 下载并解密 Seal 会话...');
        const decrypted = await downloadAndDecryptConversation(
          blobId,
          sessionKey,
          policyObjectId
        );
        
        console.log('✅ Seal 解密成功:', decrypted);
        
        // 4. 转换为表单格式
        setFormData(transformConversationData(decrypted));
        setNeedsKey(false);
      } catch (err) {
        console.error('❌ Seal 解密失败:', err);
        if (err.message.includes('NoAccess') || err.message.includes('无权访问')) {
          throw new Error('您不在会话的访问白名单中');
        } else {
          throw new Error(`Seal 解密失败: ${err.message}`);
        }
      }
      
    } catch (err) {
      console.error('Seal 解密流程失败:', err);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  };

  const decryptAndLoadConversation = async (cid, key) => {
    try {
      setIsDecrypting(true);
      
      console.log('📥 从 Walrus 下载加密数据...');
      const encryptedBlob = await downloadFromWalrus(cid);
      console.log('✅ 下载完成:', encryptedBlob.size, 'bytes');
      
      console.log('🔓 使用简单加密解密中...');
      const decryptedData = await decryptWithSeal(encryptedBlob, key);
      console.log('✅ 解密成功:', decryptedData);
      
      // 3. 转换为前端格式
      setFormData(transformConversationData(decryptedData));
      setNeedsKey(false);
      
    } catch (err) {
      console.error('解密失败:', err);
      
      // 如果解密失败，可能是密钥错误，提示用户重新输入
      if (err.message.includes('decrypt') || err.message.includes('OperationError')) {
        alert('⚠️ 解密失败，密钥可能不正确。请重新输入正确的密钥。');
        
        // 清除错误的密钥
        const savedKeys = JSON.parse(localStorage.getItem('conversationEncryptionKeys') || '{}');
        delete savedKeys[id];
        localStorage.setItem('conversationEncryptionKeys', JSON.stringify(savedKeys));
        
        setNeedsKey(true);
      } else {
        throw err;
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleKeySubmit = async () => {
    if (!encryptionKey.trim()) {
      alert('请输入加密密钥');
      return;
    }
    
    try {
      const owner = publicKey;
      const conversation = await conversationService.getConversationDetail(id, owner);
      const storageId = conversation.blob_id || conversation.ipfs_cid || conversation.cid;
      
      await decryptAndLoadConversation(storageId, encryptionKey.trim());
      
      // 解密成功后，询问是否保存密钥
      const shouldSave = window.confirm(
        '✅ 解密成功！\n\n是否将此密钥保存到本地浏览器？\n' +
        '（保存后下次可自动解密）'
      );
      
      if (shouldSave) {
        const savedKeys = JSON.parse(localStorage.getItem('conversationEncryptionKeys') || '{}');
        savedKeys[id] = encryptionKey.trim();
        localStorage.setItem('conversationEncryptionKeys', JSON.stringify(savedKeys));
        console.log('✅ 密钥已保存到本地');
      }
      
    } catch (err) {
      console.error('解密失败:', err);
      alert('❌ 解密失败: ' + err.message);
    }
  };

  const transformConversationData = (data) => {
    // If it's the decrypted object, it has a 'content' field
    const content = data.content || data;
    
    return {
      title: data.title || content.title || '',
      description: data.description || content.description || '',
      messages: content.messages || [],
      summary: content.summary || '',
      environment: content.environment || {
        os: '',
        containerInfo: '',
        gpu: '',
        runtimeInfo: ''
      },
      tags: data.tags || content.tags || ''
    };
  };

  const handleClose = () => {
    navigate('/conversations');
  };

  // 加载中状态
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">{isDecrypting ? 'Decrypting conversation...' : 'Loading conversation data...'}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 需要输入密钥（仅简单加密模式）
  if (needsKey && encryptionType !== 'seal') {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Encryption Key Required</h2>
              <p className="text-gray-600">
                This conversation is protected with simple encryption. Please enter the key to view the content.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Key
                </label>
                <textarea
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Please paste your encryption key..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/conversations')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to List
                </button>
                <button
                  onClick={handleKeySubmit}
                  disabled={isDecrypting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDecrypting ? 'Decrypting...' : 'Decrypt'}
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> If you chose to save the key locally when creating the conversation, you don't need to enter it manually.
                  If you forget the key, the conversation content cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Seal 加密自动解密中
  if (needsKey && encryptionType === 'seal') {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seal Encrypted Conversation</h2>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Verifying access permissions and decrypting...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait, this may take a few seconds</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 错误状态
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/conversations')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to List
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 预览模式:不使用弹窗,直接全屏显示
  if (!formData) {
    return null;
  }

  return (
    <ConversationPreview 
      formData={formData}
      conversationId={id}
      onClose={handleClose}
      isFullPage={true}
    />
  );
}
