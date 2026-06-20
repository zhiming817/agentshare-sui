use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::Decimal;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "conversations")]
pub struct Model {
    #[sea_orm(primary_key, column_type = "Text")]
    pub id: String,
    #[sea_orm(column_type = "Text")]
    pub user_id: String,
    #[sea_orm(column_type = "Text")]
    pub title: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    #[sea_orm(column_type = "Text")]
    pub raw_content: String,
    #[sea_orm(column_type = "Text")]
    pub source_type: String,
    pub is_public: bool,
    pub price: Decimal,
    pub view_count: i32,
    pub like_count: i32,
    pub dislike_count: i32,
    pub bookmark_count: i32,
    pub comment_count: i32,
    pub message_count: i32,
    pub tags: Option<Vec<String>>,
    #[sea_orm(column_type = "Text")]
    pub blob_id: Option<String>,
    #[sea_orm(column_type = "Text")]
    pub encryption_id: Option<String>,
    #[sea_orm(column_type = "Text")]
    pub policy_object_id: Option<String>,
    #[sea_orm(column_type = "Text")]
    pub encryption_type: Option<String>,
    #[sea_orm(column_type = "Text")]
    pub encryption_mode: Option<String>,
    pub created_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "Restrict"
    )]
    Users,
    #[sea_orm(has_many = "super::message::Entity")]
    Messages,
    #[sea_orm(has_one = "super::environment::Entity")]
    Environments,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Users.def()
    }
}

impl Related<super::message::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Messages.def()
    }
}

impl Related<super::environment::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Environments.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
