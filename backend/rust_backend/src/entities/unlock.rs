use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "unlocks")]
#[allow(dead_code)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub user_id: i64,
    pub conversation_id: i64,
    pub amount_spent: i32,
    #[sea_orm(column_type = "Text")]
    pub payment_method: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub tx_signature: Option<String>,
    pub created_at: DateTimeWithTimeZone,

    // Legacy fields
    #[sea_orm(column_type = "Text", nullable)]
    pub old_conversation_id: Option<String>,
    #[sea_orm(nullable)]
    pub buyer_id: Option<i64>,
    #[sea_orm(column_type = "Text", nullable)]
    pub buyer_wallet: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub seller_wallet: Option<String>,
    #[sea_orm(nullable)]
    pub amount: Option<i64>,
    #[sea_orm(column_type = "Text", nullable)]
    pub transaction_signature: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
#[allow(dead_code)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Users,
    #[sea_orm(
        belongs_to = "super::conversation::Entity",
        from = "Column::ConversationId",
        to = "super::conversation::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Conversations,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Users.def()
    }
}

impl Related<super::conversation::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Conversations.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
