use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "on_chain_transactions")]
#[allow(dead_code)]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    #[sea_orm(unique, column_type = "Text")]
    pub signature: String,
    #[sea_orm(column_type = "Text")]
    pub from_address: String,
    #[sea_orm(column_type = "Text")]
    pub to_address: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub mint_address: Option<String>,
    pub amount: i64,
    pub platform_fee: i64,
    #[sea_orm(column_type = "Text")]
    pub r#type: String,
    pub conversation_id: Option<i64>,
    #[sea_orm(column_type = "Text")]
    pub status: String,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
#[allow(dead_code)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
