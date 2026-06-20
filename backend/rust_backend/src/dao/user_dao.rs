use crate::entities::user;
use sea_orm::*;
use chrono::Utc;

pub struct UserDao;

impl UserDao {
    pub async fn find_by_wallet(db: &DatabaseConnection, wallet: &str) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find()
            .filter(user::Column::WalletAddress.eq(wallet))
            .one(db)
            .await
    }

    pub async fn find_by_id(db: &DatabaseConnection, id: i64) -> Result<Option<user::Model>, DbErr> {
        user::Entity::find_by_id(id).one(db).await
    }

    pub async fn create_or_get(db: &DatabaseConnection, wallet: String) -> Result<i64, DbErr> {
        let existing = Self::find_by_wallet(db, &wallet).await?;
        if let Some(user) = existing {
            return Ok(user.id);
        }

        let now = Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap());
        let new_user = user::ActiveModel {
            wallet_address: Set(Some(wallet.clone())),
            nickname: Set(format!("User_{}", &wallet[..6])),
            email: Set("placeholder@example.com".to_string()),
            password_hash: Set("placeholder".to_string()),
            api_key: Set(uuid::Uuid::new_v4().to_string()),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };

        let result = user::Entity::insert(new_user).exec(db).await?;
        Ok(result.last_insert_id)
    }

    pub async fn update_nickname_by_id(db: &DatabaseConnection, id: i64, new_nickname: String) -> Result<user::Model, DbErr> {
        let user = user::Entity::find_by_id(id).one(db).await?;
        if let Some(user) = user {
            let mut active_user: user::ActiveModel = user.into();
            active_user.nickname = Set(new_nickname);
            active_user.updated_at = Set(Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap()));
            active_user.update(db).await
        } else {
            Err(DbErr::Custom("User not found".to_string()))
        }
    }
}
