use log::{debug, error, info};
use tauri::State;

use crate::db::pool::PoolManager;
use crate::error::AppError;

#[tauri::command]
pub async fn begin_transaction(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<(), AppError> {
    debug!("Beginning transaction on '{}'", connection_id);
    let handle = pool_manager.get(&connection_id).await?;
    let result = handle.begin_transaction().await;
    match &result {
        Ok(()) => info!("Transaction started on '{}'", connection_id),
        Err(e) => error!("Failed to begin transaction on '{}': {}", connection_id, e),
    }
    result
}

#[tauri::command]
pub async fn commit_transaction(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<(), AppError> {
    debug!("Committing transaction on '{}'", connection_id);
    let handle = pool_manager.get(&connection_id).await?;
    let result = handle.commit_transaction().await;
    match &result {
        Ok(()) => info!("Transaction committed on '{}'", connection_id),
        Err(e) => error!("Failed to commit transaction on '{}': {}", connection_id, e),
    }
    result
}

#[tauri::command]
pub async fn rollback_transaction(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<(), AppError> {
    debug!("Rolling back transaction on '{}'", connection_id);
    let handle = pool_manager.get(&connection_id).await?;
    let result = handle.rollback_transaction().await;
    match &result {
        Ok(()) => info!("Transaction rolled back on '{}'", connection_id),
        Err(e) => error!("Failed to rollback transaction on '{}': {}", connection_id, e),
    }
    result
}
