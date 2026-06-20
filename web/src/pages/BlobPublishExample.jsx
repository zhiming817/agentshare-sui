/**
 * Blob 关联管理示例页面
 * 展示如何将 Walrus Blob 关联到 Allowlist
 */
import React, { useState } from 'react';
import PublishBlobToAllowlist from '../components/PublishBlobToAllowlist';

export default function BlobPublishExample() {
  const [allowlistId, setAllowlistId] = useState('');
  const [capId, setCapId] = useState('');
  const [publishHistory, setPublishHistory] = useState([]);

  const handlePublished = (data) => {
    const newRecord = {
      blobId: data.blobId,
      allowlistId,
      txHash: data.result.digest,
      timestamp: new Date().toISOString(),
    };
    setPublishHistory([newRecord, ...publishHistory]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔗 Blob 关联管理
        </h1>
        <p className="text-gray-600 mb-8">
          将加密的 Walrus Blob 关联到 Allowlist，实现访问控制
        </p>

        {/* 配置区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            1. 配置 Allowlist 信息
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowlist ID *
              </label>
              <input
                type="text"
                value={allowlistId}
                onChange={(e) => setAllowlistId(e.target.value)}
                placeholder="输入 Allowlist ID (0x...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cap ID *
              </label>
              <input
                type="text"
                value={capId}
                onChange={(e) => setCapId(e.target.value)}
                placeholder="输入 Cap ID (0x...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 关联 Blob 区域 */}
        {allowlistId && capId ? (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              2. 关联 Blob
            </h2>
            <PublishBlobToAllowlist
              allowlistId={allowlistId}
              capId={capId}
              onPublished={handlePublished}
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ 请先填写 Allowlist ID 和 Cap ID
            </p>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📚 使用说明
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>步骤 1:</strong> 创建 Allowlist 获取 Allowlist ID 和 Cap ID
            </div>
            <div>
              <strong>步骤 2:</strong> 使用 Seal 加密上传会话到 Walrus，获取 Blob ID
            </div>
            <div>
              <strong>步骤 3:</strong> 使用此工具将 Blob ID 关联到 Allowlist
            </div>
            <div>
              <strong>步骤 4:</strong> 添加授权用户到 Allowlist 白名单
            </div>
            <div>
              <strong>步骤 5:</strong> 授权用户可以通过 Seal 解密查看会话
            </div>
          </div>
        </div>

        {/* 关联历史 */}
        {publishHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 关联历史
            </h3>
            <div className="space-y-3">
              {publishHistory.map((record, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      关联 #{publishHistory.length - index}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Blob ID:</span>
                      <code className="ml-2 text-xs bg-white px-2 py-1 rounded border">
                        {record.blobId}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-600">交易哈希:</span>
                      <code className="ml-2 text-xs bg-white px-2 py-1 rounded border">
                        {record.txHash}
                      </code>
                    </div>
                  </div>

                  <button
                    onClick={() => window.open(`https://suiscan.xyz/testnet/tx/${record.txHash}`, '_blank')}
                    className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    查看交易
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 技术说明 */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🔧 技术说明
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">智能合约函数:</strong>
              <code className="ml-2 text-xs bg-white px-2 py-1 rounded border">
                walrus::allowlist::publish(allowlist, cap, blob_id)
              </code>
            </div>
            <div>
              <strong className="text-gray-900">功能:</strong> 
              将 Blob ID 作为动态字段添加到 Allowlist 对象中
            </div>
            <div>
              <strong className="text-gray-900">权限控制:</strong> 
              必须持有对应的 Cap 才能执行关联操作
            </div>
            <div>
              <strong className="text-gray-900">事件发出:</strong> 
              BlobPublished 事件，包含 allowlist_id、blob_id 和 publisher
            </div>
            <div>
              <strong className="text-gray-900">应用场景:</strong> 
              创建 Seal 加密会话后，将其关联到访问控制列表
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
