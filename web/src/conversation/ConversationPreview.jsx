import React, { useRef, useState } from 'react';

export default function ConversationPreview({ formData, onClose }) {
  const contentRef = useRef(null);

  if (!formData) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <h3 className="text-xl font-bold text-gray-900">Conversation Preview</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 bg-gray-50 min-h-full">
          <div ref={contentRef} className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto border border-gray-100">
            {/* Metadata Header */}
            <div className="mb-8 pb-6 border-b-2 border-orange-500">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formData.title || 'Untitled Conversation'}
              </h1>
              {formData.description && (
                <p className="text-gray-600 italic mb-4">"{formData.description}"</p>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.tags && formData.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            {formData.summary && (
              <div className="mb-10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-gray-200"></span> Summary
                </h4>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-900 text-lg leading-relaxed">{formData.summary}</p>
                </div>
              </div>
            )}

            {/* Environment Section */}
            {formData.environment && (formData.environment.os || formData.environment.runtimeInfo) && (
              <div className="mb-10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-gray-200"></span> Runtime Environment
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500">OS</span>
                    <span className="font-semibold text-gray-800">{formData.environment.os || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Runtime</span>
                    <span className="font-semibold text-gray-800">{formData.environment.runtimeInfo || 'N/A'}</span>
                  </div>
                  {formData.environment.gpu && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-gray-500">GPU</span>
                      <span className="font-semibold text-gray-800">{formData.environment.gpu}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Section */}
            <div className="mb-10">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span> Conversation History
              </h4>
              <div className="space-y-6">
                {formData.messages && formData.messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-gray-400 uppercase">
                        {msg.role === 'user' ? 'User' : 'Assistant'}
                      </span>
                    </div>
                    <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-orange-600 text-white rounded-tr-none border-orange-700' 
                        : 'bg-white text-gray-800 rounded-tl-none border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.timestamp && (
                      <span className="text-[10px] text-gray-400 mt-1 px-2">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2 opacity-50 grayscale">
                <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
                <span className="font-bold tracking-tighter text-gray-900">AgentShare</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Encrypted Data Shared via Walrus & Sui Blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

