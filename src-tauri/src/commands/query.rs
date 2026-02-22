use std::time::Duration;

use log::{debug, error, info, warn};
use tauri::State;
use tokio::time::timeout;

use crate::db::cancel::CancellationRegistry;
use crate::db::pool::PoolManager;
use crate::error::AppError;
use crate::models::query::QueryResponse;

const DEFAULT_QUERY_TIMEOUT: Duration = Duration::from_secs(30);

#[tauri::command]
pub async fn execute_query(
    connection_id: String,
    sql: String,
    timeout_secs: Option<u64>,
    query_id: Option<String>,
    pool_manager: State<'_, PoolManager>,
    cancel_registry: State<'_, CancellationRegistry>,
) -> Result<QueryResponse, AppError> {
    let handle = pool_manager.get(&connection_id).await?;
    let duration = timeout_secs
        .map(Duration::from_secs)
        .unwrap_or(DEFAULT_QUERY_TIMEOUT);

    let truncated = if sql.len() > 200 {
        format!("{}...", &sql[..200])
    } else {
        sql.clone()
    };
    debug!("Executing query on '{}': {}", connection_id, truncated);

    let query_future = timeout(duration, handle.base().execute_raw(&sql));

    let result = if let Some(ref qid) = query_id {
        let cancel_rx = cancel_registry.register(qid.clone());

        let outcome = tokio::select! {
            res = query_future => {
                cancel_registry.remove(qid);
                res.map_err(|_| {
                    error!("Query timed out after {}s on '{}'", duration.as_secs(), connection_id);
                    AppError::QueryTimeout(duration.as_secs())
                })?
            }
            _ = cancel_rx => {
                warn!("Query '{}' cancelled on '{}'", qid, connection_id);
                return Err(AppError::QueryCancelled);
            }
        };
        outcome
    } else {
        query_future
            .await
            .map_err(|_| {
                error!("Query timed out after {}s on '{}'", duration.as_secs(), connection_id);
                AppError::QueryTimeout(duration.as_secs())
            })?
    };

    match &result {
        Ok(response) => {
            info!(
                "Query on '{}' completed in {}ms ({} rows)",
                connection_id, response.execution_time_ms, response.row_count
            );
        }
        Err(e) => {
            error!("Query failed on '{}': {}", connection_id, e);
        }
    }

    result
}

#[tauri::command]
pub async fn cancel_query(
    query_id: String,
    cancel_registry: State<'_, CancellationRegistry>,
) -> Result<bool, AppError> {
    info!("Cancelling query '{}'", query_id);
    Ok(cancel_registry.cancel(&query_id))
}
