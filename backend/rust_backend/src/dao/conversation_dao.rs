use crate::entities::conversation;
use crate::models::Conversation;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set,
};
use sea_orm::entity::prelude::Decimal;
use chrono::Utc;
use uuid::Uuid;

pub struct ConversationDao;

impl ConversationDao {
    /// 创建对话记录
    pub async fn create_conversation(
        db: &DatabaseConnection,
        conv_data: Conversation,
        price: Decimal,
    ) -> Result<String, String> {
        let now = Utc::now().naive_utc();
        let new_id = Uuid::new_v4().to_string();
        
        let active_model = conversation::ActiveModel {
            id: Set(new_id.clone()),
            user_id: Set(conv_data.owner),
            title: Set(conv_data.title),
            description: Set(conv_data.description),
            raw_content: Set("".to_string()),
            source_type: Set(conv_data.source_type),
            is_public: Set(true),
            price: Set(price),
            created_at: Set(now),
            view_count: Set(0),
            like_count: Set(0),
            dislike_count: Set(0),
            bookmark_count: Set(0),
            comment_count: Set(0),
            message_count: Set(0),
            tags: Set(conv_data.tags),
            blob_id: Set(conv_data.blob_id),
            encryption_id: Set(conv_data.encryption_id),
            policy_object_id: Set(conv_data.policy_object_id),
            encryption_type: Set(conv_data.encryption_type),
            encryption_mode: Set(conv_data.encryption_mode),
            ..Default::default()
        };

        let result = active_model.insert(db).await
            .map_err(|e| format!("Failed to insert conversation: {}", e))?;
            
        Ok(result.id)
    }

    /// 获取所有公开/活跃的对话
    pub async fn get_all_active_conversations(
        db: &DatabaseConnection,
    ) -> Result<Vec<conversation::Model>, String> {
        conversation::Entity::find()
            .filter(conversation::Column::IsPublic.eq(true))
            .all(db)
            .await
            .map_err(|e| format!("Failed to fetch conversations: {}", e))
    }

    /// 根据所有者获取对话
    pub async fn get_conversations_by_owner(
        db: &DatabaseConnection,
        owner: &str,
    ) -> Result<Vec<conversation::Model>, String> {
        conversation::Entity::find()
            .filter(conversation::Column::UserId.eq(owner))
            .all(db)
            .await
            .map_err(|e| format!("Failed to fetch owner conversations: {}", e))
    }

    /// 根据 ID 和所有者获取对话详情
    pub async fn get_conversation_by_id_and_owner(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
    ) -> Result<Option<conversation::Model>, String> {
        conversation::Entity::find()
            .filter(conversation::Column::Id.eq(id))
            .filter(conversation::Column::UserId.eq(owner))
            .one(db)
            .await
            .map_err(|e| format!("Failed to fetch conversation detail: {}", e))
    }

    /// 更新价格
    pub async fn update_price(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
        price: Decimal,
    ) -> Result<(), String> {
        let item = Self::get_conversation_by_id_and_owner(db, id, owner).await?;
        
        if let Some(model) = item {
            let mut active_model: conversation::ActiveModel = model.into();
            active_model.price = Set(price);
            active_model.update(db).await
                .map_err(|e| format!("Failed to update price: {}", e))?;
            Ok(())
        } else {
            Err("Conversation not found".to_string())
        }
    }

    /// 更新基本信息
    pub async fn update_conversation_info(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
        title: Option<String>,
        description: Option<String>,
        tags: Option<String>,
    ) -> Result<(), String> {
        let item = Self::get_conversation_by_id_and_owner(db, id, owner).await?;
        
        if let Some(model) = item {
            let mut active_model: conversation::ActiveModel = model.into();
            if let Some(t) = title {
                active_model.title = Set(t);
            }
            if let Some(d) = description {
                active_model.description = Set(Some(d));
            }
            if let Some(tg) = tags {
                let tags_vec: Vec<String> = tg.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
                active_model.tags = Set(Some(tags_vec));
            }
            active_model.update(db).await
                .map_err(|e| format!("Failed to update conversation info: {}", e))?;
            Ok(())
        } else {
            Err("Conversation not found".to_string())
        }
    }

    /// 删除记录
    pub async fn delete_conversation(
        db: &DatabaseConnection,
        id: &str,
        owner: &str,
    ) -> Result<(), String> {
        let result = conversation::Entity::delete_many()
            .filter(conversation::Column::Id.eq(id))
            .filter(conversation::Column::UserId.eq(owner))
            .exec(db)
            .await
            .map_err(|e| format!("Failed to delete conversation: {}", e))?;
            
        if result.rows_affected == 0 {
            Err("No records deleted".to_string())
        } else {
            Ok(())
        }
    }
}
