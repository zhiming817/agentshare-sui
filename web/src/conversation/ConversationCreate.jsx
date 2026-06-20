import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import PageLayout from '../layout/PageLayout';
import EncryptionModeSelector from '../components/EncryptionModeSelector';
import ConversationSuccessDialog from '../components/ConversationSuccessDialog';
import { conversationService, userService } from '../services';
import { transformConversationData, validateConversationData } from '../services/conversation.transform';
import { createSubscriptionServiceTx } from '../utils/subscription';
import { suiToMist } from '../config/subscription.config';

export default function ConversationCreate() {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const connected = !!currentAccount;
  const publicKey = currentAccount?.address;
  const [activeSection, setActiveSection] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // 参考 upload-client.tsx 的数据字段
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [price, setPrice] = useState('0');
  const [tags, setTags] = useState('');
  const [encrypt, setEncrypt] = useState(false);
  const [policyObjectId, setPolicyObjectId] = useState('');
  
  // Seal 加密选项 (遗留字段，为了保持逻辑兼容)
  const [encryptionMode, setEncryptionMode] = useState('allowlist'); // 'allowlist' 或 'subscription'
  
  // Allowlist 模式所需
  const [capId, setCapId] = useState('');
  
  const [showSealOptions, setShowSealOptions] = useState(false);

  // 对话数据 (最新的数据结构，匹配 ParsedConversationV2)
  const [formData, setFormData] = useState({
    messages: [
      {
        role: 'user',
        content: '',
        timestamp: new Date().toISOString(),
      }
    ],
    summary: '',
    environment: {
      os: '',
      containerInfo: '',
      gpu: '',
      runtimeInfo: '',
    }
  });

  // Sidebar navigation
  const sections = [
    { id: 'basic', name: 'Basic Info', icon: '📝' },
    { id: 'content', name: 'Conversation', icon: '💬' },
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result.trim();
      let importedMessages = [];
      let importedSummary = '';
      let importedEnv = {};

      try {
        let json;
        // 尝试解析为单条 JSON (可能是标准格式或 JSON 数组)
        try {
          json = JSON.parse(content);
        } catch (e) {
          // 可能是 JSONL 格式 (每行一个 JSON 对象，如 AI 日志)
          const lines = content.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            json = lines.map(line => JSON.parse(line));
          } else {
            throw e;
          }
        }

        if (Array.isArray(json)) {
          // 处理 JSONL 或数组格式: {"message": {"role": "...", "content": "..."}, "timestamp": "..."}
          importedMessages = json.map(item => {
            const msgObj = item.message || item; // 兼容这种嵌套结构
            return {
              role: msgObj.role || (item.type === 'assistant' ? 'assistant' : 'user'),
              content: msgObj.content || '',
              timestamp: item.timestamp || new Date().toISOString(),
            };
          }).filter(m => m.content);
        } else {
          // 处理标准的 ParsedConversationV2 结构
          const data = json.content ? json.content : json;
          importedMessages = data.messages || [];
          importedSummary = data.summary || '';
          importedEnv = data.environment || {};

          // 同步元数据
          if (json.title) setTitle(json.title);
          if (json.description) setDescription(json.description);
          if (json.tags) setTags(Array.isArray(json.tags) ? json.tags.join(', ') : json.tags);
          if (json.sourceType) setSourceType(json.sourceType);
          if (json.price) setPrice(json.price.toString());
        }

        if (importedMessages.length > 0) {
          setFormData(prev => ({
            messages: importedMessages,
            summary: importedSummary || prev.summary,
            environment: {
              ...prev.environment,
              ...importedEnv
            }
          }));
          alert(`Success! Imported ${importedMessages.length} messages.`);
        } else {
          alert('No valid conversation messages found.');
        }
      } catch (err) {
        console.error('Failed to parse file:', err);
        alert('File format error. Please upload a valid JSON or JSONL file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    // Check wallet connection
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate form data
    const validation = validateConversationData(formData);
    if (!validation.valid) {
      alert('Please fill in required fields:\n' + validation.errors.join('\n'));
      return;
    }

    // If using Seal encryption, validate configuration
    if (encrypt) {
      if (encryptionMode === 'allowlist') {
        if (!policyObjectId || !capId) {
          alert('Please fill in Allowlist ID and Cap ID\n\nIf you don\'t have an Allowlist yet, please create one first.');
          return;
        }
      } else if (encryptionMode === 'subscription') {
        if (!price || parseFloat(price) <= 0) {
          alert('Please set a valid subscription price (greater than 0 SUI)');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const walletAddress = publicKey;
      
      // 1. Ensure user is registered
      console.log('Registering/getting user info...');
      await userService.registerOrGetUser(walletAddress);
      
      // 2. Transform form data to API format
      const apiData = transformConversationData(formData, walletAddress, {
        title,
        description,
        tags,
        sourceType,
        price,
      });
      
      console.log('Creating conversation data:', apiData);
      
      let result;
      
      if (encrypt) {
        if (encryptionMode === 'allowlist') {
          // ===== Allowlist 模式 =====
          console.log('🔐 使用 Seal + Allowlist 模式创建会话...');
          result = await conversationService.createConversationWithSeal(apiData, policyObjectId, 'allowlist');
          
          console.log('✅ Seal 加密创建成功:', result);
          
          // 自动将创建者添加到 Allowlist
          console.log('1.👤 自动添加创建者到 Allowlist...');
          try {
            await conversationService.addToConversationAllowlist(
              policyObjectId,
              capId,
              walletAddress,
              signAndExecute
            );
            console.log('✅ 创建者已添加到 Allowlist');
          } catch (addError) {
            console.warn('添加创建者到 Allowlist 失败 (可能已存在):', addError);
          }
          
          // 关联 Blob 到 Allowlist
          console.log('2.📎 关联 Blob 到 Allowlist...');
          await conversationService.publishBlobToAllowlist(
            policyObjectId,
            capId,
            result.blobId,
            signAndExecute
          );
          
          setSuccessData({
            conversationId: result.conversationId,
            blobId: result.blobId,
            encryptionId: result.encryptionId,
            mode: 'Allowlist',
            policyId: policyObjectId
          });
          setShowSuccessDialog(true);
          
        } else if (encryptionMode === 'subscription') {
          // ===== 订阅模式 =====
          console.log('💰 使用 Seal + 订阅模式创建会话...');
          
          // 1. 先创建订阅服务，获取 Service ID
          console.log('1.📦 创建订阅服务...');
          const priceInMist = suiToMist(parseFloat(price));
          
          const serviceId = await new Promise((resolve, reject) => {
            const tx = createSubscriptionServiceTx({
              fee: priceInMist,
              ttl: 0, // TTL=0 表示永久访问
              name: `conversation_${Date.now()}`, // 临时服务名称
              senderAddress: walletAddress,
            });
            
            signAndExecute(
              { transaction: tx },
              {
                onSuccess: async (txResult) => {
                  try {
                    console.log('✅ 订阅服务创建交易已提交');
                    console.log('Transaction Digest:', txResult.digest);
                    
                    // 使用重试机制查询交易详情（处理 RPC 节点索引延迟）
                    console.log('🔍 查询交易详情...');
                    
                    let txDetails = null;
                    let retryCount = 0;
                    const maxRetries = 5;
                    
                    while (retryCount < maxRetries) {
                      try {
                        txDetails = await suiClient.getTransactionBlock({
                          digest: txResult.digest,
                          options: {
                            showEffects: true,
                            showObjectChanges: true,
                          },
                        });
                        
                        console.log(`✅ 查询成功 (尝试 ${retryCount + 1}/${maxRetries})`);
                        break;
                        
                      } catch (queryError) {
                        retryCount++;
                        
                        if (queryError.message?.includes('Could not find the referenced transaction')) {
                          // 交易还未被索引，等待后重试
                          const waitTime = retryCount * 1000;
                          console.warn(`⏳ 交易尚未索引，等待 ${waitTime/1000} 秒后重试... (${retryCount}/${maxRetries})`);
                          await new Promise(resolve => setTimeout(resolve, waitTime));
                        } else {
                          // 其他错误，直接抛出
                          throw queryError;
                        }
                      }
                    }
                    
                    if (!txDetails) {
                      throw new Error('查询交易超时，请稍后在区块链浏览器中查看 Service ID');
                    }
                    
                    console.log('交易详情:', txDetails);
                    
                    // 从 objectChanges 中查找 Service 对象
                    let serviceId = null;
                    
                    if (txDetails.objectChanges) {
                      console.log('Object Changes:', txDetails.objectChanges);
                      
                      const serviceChange = txDetails.objectChanges.find(
                        change => 
                          change.type === 'created' &&
                          change.objectType &&
                          change.objectType.includes('subscription::Service')
                      );
                      
                      if (serviceChange) {
                        serviceId = serviceChange.objectId;
                        console.log('✅ 找到 Service ID:', serviceId);
                      }
                    }
                    
                    // 备用方案：从 effects 中查找
                    if (!serviceId && txDetails.effects?.created) {
                      console.log('从 effects.created 查找...');
                      const serviceEffect = txDetails.effects.created.find(
                        obj => obj.objectType && obj.objectType.includes('subscription::Service')
                      );
                      
                      if (serviceEffect) {
                        serviceId = serviceEffect.reference?.objectId || serviceEffect.objectId;
                        console.log('✅ 从 effects 找到 Service ID:', serviceId);
                      }
                    }
                    
                    if (!serviceId) {
                      console.error('无法找到 Service ID');
                      console.error('txDetails:', txDetails);
                      reject(new Error('无法获取 Service ID，请在区块链浏览器查看交易'));
                      return;
                    }
                    
                    console.log('📦 最终 Service ID:', serviceId);
                    resolve(serviceId);
                  } catch (error) {
                    console.error('查询交易详情失败:', error);
                    reject(error);
                  }
                },
                onError: (error) => {
                  console.error('❌ 创建订阅服务失败:', error);
                  reject(error);
                }
              }
            );
          });
          
          // 2. 使用 Service ID 创建加密会话
          console.log('2.🔐 创建加密会话（关联订阅服务）...');
          result = await conversationService.createConversationWithSeal(apiData, serviceId, 'subscription');
          console.log('✅ Seal 加密创建成功:', result);
          
          setSuccessData({
            conversationId: result.conversationId,
            blobId: result.blobId,
            encryptionId: result.encryptionId,
            mode: 'Subscription',
            price: price,
            serviceId: serviceId
          });
          setShowSuccessDialog(true);
        }
      } else {
        // Use simple encryption
        console.log('🔒 Using simple encryption to create conversation...');
        result = await conversationService.createConversation(apiData);
        
        console.log('conversation created successfully:', result);
        
        setSuccessData({
          conversationId: result.conversationId,
          blobId: result.blobId,
          encryptionKey: result.encryptionKey,
          mode: 'Simple'
        });
        setShowSuccessDialog(true);
      }
      
      // Save encryption key to localStorage (optional)
      if (successData?.mode === 'Simple') {
        const shouldSaveLocally = window.confirm(
          'Save encryption key to browser local storage?\n\n' +
          '✅ Advantages: Convenient for previewing and editing your own conversation\n' +
          '⚠️ Risks: Others using this device may access your conversation\n\n' +
          'Recommendation: Only save on personal devices'
        );
        
        if (shouldSaveLocally) {
          const keys = JSON.parse(localStorage.getItem('conversationEncryptionKeys') || '{}');
          keys[successData.conversationId] = successData.encryptionKey;
          localStorage.setItem('conversationEncryptionKeys', JSON.stringify(keys));
          console.log('✅ Encryption key saved locally');
        }
      }
      
    } catch (error) {
      console.error('conversation creation failed:', error);
      alert(`conversation creation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // 暂时禁用预览功能，因为组件已被删除
    alert('Preview feature is coming soon!');
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* 左侧导航 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Sections</h2>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* 基本信息 (参考 upload-client.tsx) */}
              {activeSection === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Basic Info</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. AI Product Design Discussion"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe what this conversation is about..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="typescript, rust, web3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      >
                       
                        <option value="claude-code">Claude Code</option>
                        <option value="openai">OpenAI</option>
                        <option value="manual">Manual Entry</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 对话内容 (最新的编辑区) */}
              {activeSection === 'content' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-900">Conversation Content</h3>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="json-upload"
                      />
                      <label
                        htmlFor="json-upload"
                        className="cursor-pointer px-3 py-1 bg-gray-50 text-orange-600 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        📂 Import JSON
                      </label>
                    </div>
                  </div>
                  
                  {/* 环境信息 */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">OS</label>
                      <input
                        type="text"
                        value={formData.environment.os}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          environment: { ...prev.environment, os: e.target.value }
                        }))}
                        placeholder="macOS, Linux..."
                        className="w-full bg-transparent border-b border-gray-300 focus:border-orange-500 outline-none py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">Runtime</label>
                      <input
                        type="text"
                        value={formData.environment.runtimeInfo}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          environment: { ...prev.environment, runtimeInfo: e.target.value }
                        }))}
                        placeholder="Node.js 20, Python 3.11..."
                        className="w-full bg-transparent border-b border-gray-300 focus:border-orange-500 outline-none py-1"
                      />
                    </div>
                  </div>

                  {/* 消息列表 */}
                  <div className="space-y-4">
                    {formData.messages.map((msg, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${msg.role === 'user' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${msg.role === 'user' ? 'bg-blue-200 text-blue-700' : 'bg-green-200 text-green-700'}`}>
                            {msg.role.toUpperCase()}
                          </span>
                          <button 
                            onClick={() => {
                              const newMessages = [...formData.messages];
                              newMessages.splice(index, 1);
                              setFormData(prev => ({ ...prev, messages: newMessages }));
                            }}
                            className="text-gray-400 hover:text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          value={msg.content}
                          onChange={(e) => {
                            const newMessages = [...formData.messages];
                            newMessages[index].content = e.target.value;
                            setFormData(prev => ({ ...prev, messages: newMessages }));
                          }}
                          placeholder="Enter message content..."
                          rows={3}
                          className="w-full bg-transparent outline-none resize-none text-gray-800"
                        />
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          messages: [...prev.messages, { role: 'user', content: '', timestamp: new Date().toISOString() }]
                        }))}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        + Add User Message
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          messages: [...prev.messages, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]
                        }))}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        + Add Assistant Message
                      </button>
                    </div>
                  </div>

                  {/* 摘要 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Summary</label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Executive summary of this conversation..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => navigate('/conversations')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => setShowSealOptions(!showSealOptions)}
                  className="px-6 py-2 border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  disabled={isSubmitting}
                >
                  {showSealOptions ? 'Hide Advanced Options' : 'Advanced Options'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !connected}
                >
                  {isSubmitting ? 'Creating...' : connected ? 'Complete' : 'Connect Wallet First'}
                </button>
              </div>

              {/* Seal 加密选项 */}
              {showSealOptions && (
                <EncryptionModeSelector
                  useSealEncryption={encrypt}
                  setUseSealEncryption={setEncrypt}
                  encryptionMode={encryptionMode}
                  setEncryptionMode={setEncryptionMode}
                  allowlistId={policyObjectId}
                  setAllowlistId={setPolicyObjectId}
                  capId={capId}
                  setCapId={setCapId}
                  subscriptionPrice={price}
                  setSubscriptionPrice={setPrice}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConversationSuccessDialog 
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        data={successData}
      />
    </PageLayout>
  );
}

