use actix_web::web;
use crate::controllers::{weather_handler, premium_content_handler, ConversationController};
use crate::controllers::user_controller;

/// 配置示例路由
#[allow(dead_code)]
pub fn config_example_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/weather", web::get().to(weather_handler))
            .route("/premium/content", web::get().to(premium_content_handler)),
    );
}

/// 配置用户路由
pub fn config_user_routes(cfg: &mut web::ServiceConfig) {
    user_controller::config(cfg);
}

/// 配置对话路由(包含所有对话相关路由)
pub fn config_conversation_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/conversations")
            // 公开路由(无需支付)
            .route("", web::post().to(ConversationController::create))
            .route("/summaries", web::get().to(ConversationController::get_summaries))
            .route("/my/{owner}", web::get().to(ConversationController::get_my_conversations))
            .route("/detail/{conversation_id}/{owner}", web::get().to(ConversationController::get_conversation_detail))
            
            // 管理路由
            .route("/price", web::put().to(ConversationController::set_price))
            .route("/name", web::put().to(ConversationController::update_name))
            .route("/{conversation_id}", web::put().to(ConversationController::update))
            .route("/{conversation_id}/{owner}", web::delete().to(ConversationController::delete)),
    );
}
