use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    #[sea_orm(unique, column_type = "Text")]
    pub email: String,
    #[sea_orm(column_type = "Text")]
    pub password_hash: String,
    #[sea_orm(unique, column_type = "Text")]
    pub api_key: String,
    #[sea_orm(column_type = "Text")]
    pub nickname: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub avatar: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub bio: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub wallet_address: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub user_type: Option<String>, // Legacy field
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::conversation::Entity")]
    Conversations,
    #[sea_orm(has_many = "super::skill::Entity")]
    Skills,
}

impl Related<super::conversation::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Conversations.def()
    }
}

impl Related<super::skill::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Skills.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
