mod controllers;
mod dao;
mod entities;
mod models;
mod routes;
mod services;
mod utils;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use std::env;
use utils::database::{DatabaseConfig, init_db};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 加载 .env 文件
    dotenv::dotenv().ok();
    
    println!("=== Agent Share Server ===");
    println!();

    // 初始化数据库连接
    println!("🔗 Initializing database connection...");
    let db_config = DatabaseConfig {
        url: env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://agentshare:agentshare@127.0.0.1:5432/agentshare".to_string()),
        max_connections: 10,
        min_connections: 1,
        connect_timeout: 30,
        idle_timeout: 600,
    };
    
    let db = init_db(db_config).await
        .expect("Failed to initialize database");
    
    let db_data = web::Data::new(db);
    println!("✅ Database connection established");
    println!();

    // 读取服务器配置
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "4021".to_string());
    let bind_addr = format!("{}:{}", host, port);
    
    println!("Starting server at http://{}", bind_addr);
    println!();
    println!("Available endpoints:");
    println!();
    println!("👤 User Endpoints:");
    println!("  POST /api/users/register             - Create or get user");
    println!("  GET  /api/users/nickname             - Update nickname");
    println!();
    println!("📄 Conversation Endpoints:");
    println!("  POST /api/conversations                    - Create conversation");
    println!("  GET  /api/conversations/summaries          - Get all conversation summaries");
    println!("  GET  /api/conversations/my/{{owner}}         - Get my conversations");
    println!("  PUT  /api/conversations/{{conversation_id}}        - Update conversation");
    println!("  DEL  /api/conversations/{{conversation_id}}/{{owner}} - Delete conversation");
    println!();

    // 启动服务器
    HttpServer::new(move || {
        // 配置 CORS：允许所有来源，动态反射 Origin
        let cors = Cors::default()
            .allowed_origin_fn(|_origin, _req_head| true) // 允许任何 Origin
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(db_data.clone())  // SeaORM 数据库连接
            .configure(routes::config_user_routes)
            .configure(routes::config_conversation_routes)
    })
    .bind(&bind_addr)?
    .run()
    .await
}
