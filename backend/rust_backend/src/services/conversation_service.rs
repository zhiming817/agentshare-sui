use crate::dao::ConversationDao;
use crate::models::{
    CreateConversationRequest, Conversation, ConversationListItem, MyConversationSummary,
};
use sea_orm::DatabaseConnection;

/// 对话服务层
pub struct ConversationService;

impl ConversationService {
    /// 创建对话
    pub async fn create_conversation(
        db: &DatabaseConnection,
        request: CreateConversationRequest,
        blob_id: String,
    ) -> Result<String, String> {
        let price = request.price
            .as_ref()
            .and_then(|p| p.parse::<u64>().ok())
            .unwrap_or(0);

        let tags: Option<Vec<String>> = request.tags
            .as_ref()
            .map(|t| t.split(',').map(|s| s.trim().to_string()).collect());

        let conversation = Conversation {
            id: "".to_string(), // 由数据库/DAO 生成
            owner: request.owner,
            title: request.title,
            description: request.description,
            source_type: request.source_type,
            tags,
            created_at: 0, // 由 DAO 处理
            updated_at: 0,
            blob_id: Some(blob_id),
            encryption_id: request.encryption_id,
            policy_object_id: request.policy_id, // 映射 policy_id -> policy_object_id
            encryption_type: request.encryption_type,
            encryption_mode: request.encryption_mode,
            ipfs_cid: request.ipfs_cid,
        };

        ConversationDao::create_conversation(db, conversation, price).await
    }

    /// 获取所有公开对话摘要
    pub async fn get_conversation_summaries(
        db: &DatabaseConnection,
        _page: u64,
        _page_size: u64,
    ) -> Result<Vec<ConversationListItem>, String> {
        let items = ConversationDao::get_all_active_conversations(db).await?;
        
        Ok(items.into_iter().map(|item| {
            ConversationListItem {
                id: item.id.clone(),
                title: item.title,
                owner: item.user_id,
                price: item.price as i64,
                source_type: Some(item.source_type),
                blob_id: item.blob_id,
                encryption_type: item.encryption_type,
                encryption_mode: item.encryption_mode,
                policy_object_id: item.policy_object_id,
                encryption_id: item.encryption_id,
            }
        }).collect())
    }

    /// 获取我的对话列表
    pub async fn get_my_conversations(
        db: &DatabaseConnection,
        owner: &str,
    ) -> Result<Vec<MyConversationSummary>, String> {
        let items = ConversationDao::get_conversations_by_owner(db, owner).await?;
        
        Ok(items.into_iter().map(|item| {
            MyConversationSummary {
                id: item.id.clone(),
                title: item.title,
                owner: item.user_id,
                created_at: item.created_at.and_utc().timestamp(),
                updated_at: item.created_at.and_utc().timestamp(),
                price: item.price as i64,
                view_count: item.view_count,
                unlock_count: 0,
                status: "active".to_string(),
                blob_id: item.blob_id,
                encryption_id: item.encryption_id,
                policy_object_id: item.policy_object_id,
                encryption_type: item.encryption_type,
                encryption_mode: item.encryption_mode,
            }
        }).collect())
    }

    /// 获取对话详情
    pub async fn get_conversation_detail(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
    ) -> Result<Conversation, String> {
        let item = ConversationDao::get_conversation_by_id_and_owner(db, id, owner)
            .await?
            .ok_or_else(|| "Conversation not found".to_string())?;
            
        Ok(Conversation {
            id: item.id.clone(),
            owner: item.user_id,
            title: item.title,
            description: item.description,
            source_type: item.source_type,
            tags: item.tags,
            created_at: item.created_at.and_utc().timestamp(),
            updated_at: item.created_at.and_utc().timestamp(),
            blob_id: item.blob_id,
            encryption_id: item.encryption_id,
            policy_object_id: item.policy_object_id,
            encryption_type: item.encryption_type,
            encryption_mode: item.encryption_mode,
            ipfs_cid: None,
        })
    }

    /// 更新对话
    pub async fn update_conversation(
        db: &DatabaseConnection,
        id: &str,
        request: CreateConversationRequest,
    ) -> Result<(), String> {
        let tags = request.tags.as_ref().map(|t| t.to_string());
        
        ConversationDao::update_conversation_info(
            db,
            id,
            &request.owner,
            Some(request.title),
            request.description,
            tags,
        ).await
    }

    /// 删除对话
    pub async fn delete_conversation(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
    ) -> Result<(), String> {
        ConversationDao::delete_conversation(db, id, owner).await
    }

    /// 设置价格
    pub async fn set_conversation_price(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
        price: u64,
    ) -> Result<(), String> {
        ConversationDao::update_price(db, id, owner, price as i64).await
    }

    /// 更新名称/标题
    pub async fn update_conversation_name(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
        name: String,
    ) -> Result<(), String> {
        ConversationDao::update_conversation_info(db, id, owner, Some(name), None, None).await
    }
}
