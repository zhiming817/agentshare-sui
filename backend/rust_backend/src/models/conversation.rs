use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::Decimal;

/// 对话消息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
    pub timestamp: String,
}

/// 环境信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub os: String,
    #[serde(rename = "containerInfo")]
    pub container_info: Option<String>,
    pub gpu: Option<String>,
    #[serde(rename = "runtimeInfo")]
    pub runtime_info: Option<String>,
}

/// 完整对话数据 (存储在 Walrus Blob 中)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationData {
    pub messages: Vec<Message>,
    pub summary: Option<String>,
    pub environment: Option<Environment>,
}

/// 对话实体 (后端模型)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub owner: String, // 钱包地址
    pub title: String,
    pub description: Option<String>,
    pub source_type: String,
    pub tags: Option<Vec<String>>,
    pub created_at: i64,
    pub updated_at: i64,
    pub blob_id: Option<String>, // Walrus Blob ID
    pub encryption_id: Option<String>, // Seal 加密 ID
    pub policy_object_id: Option<String>, // Seal Policy Object ID
    pub encryption_type: Option<String>, // "simple" 或 "seal"
    pub encryption_mode: Option<String>, // "allowlist" 或 "subscription"
}

/// 对话列表项
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationListItem {
    pub id: String,
    pub title: String,
    pub owner: String,
    pub price: Decimal,
    pub created_at: i64,
    pub source_type: Option<String>,
    pub blob_id: Option<String>,
    pub encryption_type: Option<String>,
    pub encryption_mode: Option<String>,
    pub policy_object_id: Option<String>,
    pub encryption_id: Option<String>,
}

/// 我的对话摘要
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MyConversationSummary {
    pub id: String,
    pub title: String,
    pub owner: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub price: Decimal,
    pub view_count: i32,
    pub unlock_count: i32,
    pub status: String,
    pub blob_id: Option<String>,
    pub encryption_id: Option<String>,
    pub policy_object_id: Option<String>,
    pub encryption_type: Option<String>,
    pub encryption_mode: Option<String>,
}

/// 设置价格请求
#[derive(Debug, Clone, Deserialize)]
pub struct SetPriceRequest {
    pub conversation_id: String,
    pub owner: String,
    pub price: Decimal,
}

/// 更新名称请求
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateNameRequest {
    pub conversation_id: String,
    pub owner: String,
    pub name: String,
}

/// 对话创建请求
#[derive(Debug, Clone, Deserialize)]
pub struct CreateConversationRequest {
    pub owner: String,
    pub title: String,
    pub description: Option<String>,
    pub source_type: String,
    pub tags: Option<String>, // 逗号分隔的字符串
    pub price: Option<String>,
    pub blob_id: Option<String>,
    pub encryption_id: Option<String>,
    pub policy_id: Option<String>, // 对应 policy_object_id
    pub encryption_type: Option<String>,
    pub encryption_mode: Option<String>,
    pub _encryption_key: Option<String>, // 简单加密密钥 (当前未读取)
    
    // 原始数据 (如果是手动录入)
    pub _content: Option<ConversationData>, // (当前未读取)
}
