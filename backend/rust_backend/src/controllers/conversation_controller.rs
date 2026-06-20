use actix_web::{web, HttpResponse, Responder};
use crate::models::{
    ApiResponse, CreateConversationRequest, SetPriceRequest, UpdateNameRequest,
};
use crate::services::ConversationService;
use sea_orm::DatabaseConnection;

/// 对话控制器
pub struct ConversationController;

impl ConversationController {
    /// 创建对话
    pub async fn create(
        req: web::Json<CreateConversationRequest>,
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Create conversation endpoint ===");

        let request = req.into_inner();
        
        // 检查是否提供了 blob_id（Walrus 存储）
        let blob_id = match request.blob_id.as_ref() {
            Some(id) if !id.is_empty() => id.clone(),
            _ => {
                // 向后兼容：检查旧的 ipfs_cid 字段
                match request.ipfs_cid.as_ref() {
                    Some(cid) if !cid.is_empty() => cid.clone(),
                    _ => {
                        let response = ApiResponse::<()>::error(
                            "Blob ID is required. Please encrypt and upload the conversation to Walrus first.".to_string()
                        );
                        return HttpResponse::BadRequest().json(response);
                    }
                }
            }
        };

        println!("Creating conversation with title: {}, blob_id: {}", 
                 request.title, blob_id);

        match ConversationService::create_conversation(&db, request, blob_id).await {
            Ok(conversation_id) => {
                let response = ApiResponse::success_with_message(
                    conversation_id,
                    "Conversation created successfully".to_string(),
                );
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::BadRequest().json(response)
            }
        }
    }

    /// 获取对话摘要列表（公开，无需支付）
    pub async fn get_summaries(
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Get conversation summaries endpoint ===");

        match ConversationService::get_conversation_summaries(&db, 1, 20).await {
            Ok(summaries) => {
                let response = ApiResponse::success(summaries);
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::InternalServerError().json(response)
            }
        }
    }

    /// 获取我的对话列表
    pub async fn get_my_resumes(
        owner: web::Path<String>,
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Get my conversations endpoint ===");

        match ConversationService::get_my_conversations(&db, &owner).await {
            Ok(conversations) => {
                let response = ApiResponse::success(conversations);
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::InternalServerError().json(response)
            }
        }
    }

    /// 根据 owner 和对话 ID 获取详情
    pub async fn get_resume_detail(
        path: web::Path<(String, String)>, // (conversation_id, owner)
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Get conversation detail endpoint ===");

        let (conversation_id, owner) = path.into_inner();

        match ConversationService::get_conversation_detail(&db, &conversation_id, &owner).await {
            Ok(conversation) => {
                let response = ApiResponse::success(conversation);
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::InternalServerError().json(response)
            }
        }
    }

    /// 更新对话
    pub async fn update(
        conversation_id: web::Path<String>,
        request: web::Json<CreateConversationRequest>,
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Update conversation endpoint ===");

        match ConversationService::update_conversation(&db, &conversation_id, request.into_inner()).await {
            Ok(_) => {
                let response = ApiResponse::<()>::success_with_message(
                    (),
                    "Conversation updated successfully".to_string(),
                );
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::BadRequest().json(response)
            }
        }
    }

    /// 删除对话
    pub async fn delete(
        path: web::Path<(String, String)>, // (conversation_id, owner)
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Delete conversation endpoint ===");

        let (conversation_id, owner) = path.into_inner();

        match ConversationService::delete_conversation(&db, &conversation_id, &owner).await {
            Ok(_) => {
                let response = ApiResponse::<()>::success_with_message(
                    (),
                    "Conversation deleted successfully".to_string(),
                );
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::BadRequest().json(response)
            }
        }
    }

    /// 设置价格
    pub async fn set_price(
        request: web::Json<SetPriceRequest>,
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Set conversation price endpoint ===");
        println!("ID: {}", request.conversation_id);
        println!("Owner: {}", request.owner);
        println!("Price: {}", request.price);

        match ConversationService::set_conversation_price(
            &db,
            &request.conversation_id,
            &request.owner,
            request.price,
        ).await {
            Ok(_) => {
                let response = ApiResponse::<()>::success_with_message(
                    (),
                    format!("Price set to {} successfully", request.price),
                );
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::BadRequest().json(response)
            }
        }
    }

    /// 更新名称
    pub async fn update_name(
        request: web::Json<UpdateNameRequest>,
        db: web::Data<DatabaseConnection>,
    ) -> impl Responder {
        println!("=== Update conversation name endpoint ===");
        println!("ID: {}", request.conversation_id);
        println!("Owner: {}", request.owner);
        println!("Name: {}", request.name);

        match ConversationService::update_conversation_name(
            &db,
            &request.conversation_id,
            &request.owner,
            request.name.clone(),
        ).await {
            Ok(_) => {
                let response = ApiResponse::<()>::success_with_message(
                    (),
                    format!("Name updated to '{}' successfully", request.name),
                );
                HttpResponse::Ok().json(response)
            }
            Err(e) => {
                let response = ApiResponse::<()>::error(e);
                HttpResponse::BadRequest().json(response)
            }
        }
    }
}
