use std::sync::Arc;

use tauri::State;

use crate::db::mysql::MySqlDriver;
use crate::db::pool::PoolManager;
use crate::db::postgres::PostgresDriver;
use crate::error::AppError;
use crate::models::connection::{ConnectionConfig, DatabaseType};

#[tauri::command]
pub async fn connect_db(
    config: ConnectionConfig,
    pool_manager: State<'_, PoolManager>,
) -> Result<String, AppError> {
    let id = config.id.clone();

    match config.db_type {
        DatabaseType::PostgreSQL => {
            let driver = PostgresDriver::connect(&config).await?;
            pool_manager.add(id.clone(), Arc::new(driver)).await;
        }
        DatabaseType::MySQL => {
            let driver = MySqlDriver::connect(&config).await?;
            pool_manager.add(id.clone(), Arc::new(driver)).await;
        }
    }

    Ok(id)
}

#[tauri::command]
pub async fn disconnect_db(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<(), AppError> {
    pool_manager.remove(&connection_id).await
}

#[tauri::command]
pub async fn test_connection(config: ConnectionConfig) -> Result<bool, AppError> {
    match config.db_type {
        DatabaseType::PostgreSQL => {
            let url = config.to_connection_url();
            let pool = sqlx::postgres::PgPoolOptions::new()
                .max_connections(1)
                .acquire_timeout(std::time::Duration::from_secs(10))
                .connect(&url)
                .await;

            match pool {
                Ok(pool) => {
                    let result = sqlx::query("SELECT 1").fetch_one(&pool).await;
                    pool.close().await;
                    Ok(result.is_ok())
                }
                Err(_) => Ok(false),
            }
        }
        DatabaseType::MySQL => {
            let url = config.to_connection_url();
            let pool = sqlx::mysql::MySqlPoolOptions::new()
                .max_connections(1)
                .acquire_timeout(std::time::Duration::from_secs(10))
                .connect(&url)
                .await;

            match pool {
                Ok(pool) => {
                    let result = sqlx::query("SELECT 1").fetch_one(&pool).await;
                    pool.close().await;
                    Ok(result.is_ok())
                }
                Err(_) => Ok(false),
            }
        }
    }
}
