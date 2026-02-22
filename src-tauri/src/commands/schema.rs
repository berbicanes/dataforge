use std::time::Duration;

use log::{debug, error, info};
use tauri::State;
use tokio::time::timeout;

use crate::db::pool::PoolManager;
use crate::error::AppError;
use crate::models::connection::DatabaseCategory;
use crate::models::query::QueryResponse;
use crate::models::schema::{
    ColumnInfo, ContainerInfo, FieldInfo, ForeignKeyInfo, IndexInfo, ItemInfo, SchemaInfo, TableInfo,
};

const DEFAULT_DATA_TIMEOUT: Duration = Duration::from_secs(30);

// === Generic commands (all database types) ===

#[tauri::command]
pub async fn get_database_category(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<DatabaseCategory, AppError> {
    let handle = pool_manager.get(&connection_id).await?;
    Ok(handle.base().category())
}

#[tauri::command]
pub async fn get_containers(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<ContainerInfo>, AppError> {
    debug!("Loading containers for '{}'", connection_id);
    let handle = pool_manager.get(&connection_id).await?;
    handle.base().get_containers().await
}

#[tauri::command]
pub async fn get_items(
    connection_id: String,
    container: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<ItemInfo>, AppError> {
    debug!("Loading items for '{}'.'{}'", connection_id, container);
    let handle = pool_manager.get(&connection_id).await?;
    handle.base().get_items(&container).await
}

#[tauri::command]
pub async fn get_item_fields(
    connection_id: String,
    container: String,
    item: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<FieldInfo>, AppError> {
    debug!("Loading fields for '{}'.'{}'.'{}'", connection_id, container, item);
    let handle = pool_manager.get(&connection_id).await?;
    handle.base().get_item_fields(&container, &item).await
}

#[tauri::command]
pub async fn get_item_data(
    connection_id: String,
    container: String,
    item: String,
    limit: i64,
    offset: i64,
    pool_manager: State<'_, PoolManager>,
) -> Result<QueryResponse, AppError> {
    debug!("Loading item data for '{}'.'{}'.'{}'", connection_id, container, item);
    let handle = pool_manager.get(&connection_id).await?;

    timeout(
        DEFAULT_DATA_TIMEOUT,
        handle.base().get_item_data(&container, &item, limit, offset),
    )
    .await
    .map_err(|_| {
        error!("get_item_data timed out for '{}'.'{}'.'{}'", connection_id, container, item);
        AppError::QueryTimeout(DEFAULT_DATA_TIMEOUT.as_secs())
    })?
}

#[tauri::command]
pub async fn get_item_count(
    connection_id: String,
    container: String,
    item: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<i64, AppError> {
    let handle = pool_manager.get(&connection_id).await?;
    handle.base().get_item_count(&container, &item).await
}

// === SQL-specific commands (gated on SqlDriver) ===

#[tauri::command]
pub async fn get_schemas(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<SchemaInfo>, AppError> {
    debug!("Loading schemas for '{}'", connection_id);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.get_schemas().await
}

#[tauri::command]
pub async fn get_tables(
    connection_id: String,
    schema: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<TableInfo>, AppError> {
    debug!("Loading tables for '{}'.'{}'", connection_id, schema);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.get_tables(&schema).await
}

#[tauri::command]
pub async fn get_columns(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<ColumnInfo>, AppError> {
    debug!("Loading columns for '{}'.'{}'.'{}'", connection_id, schema, table);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.get_columns(&schema, &table).await
}

#[tauri::command]
pub async fn get_indexes(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<IndexInfo>, AppError> {
    debug!("Loading indexes for '{}'.'{}'.'{}'", connection_id, schema, table);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.get_indexes(&schema, &table).await
}

#[tauri::command]
pub async fn get_foreign_keys(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<ForeignKeyInfo>, AppError> {
    debug!("Loading foreign keys for '{}'.'{}'.'{}'", connection_id, schema, table);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.get_foreign_keys(&schema, &table).await
}

#[tauri::command]
pub async fn get_table_data(
    connection_id: String,
    schema: String,
    table: String,
    limit: i64,
    offset: i64,
    pool_manager: State<'_, PoolManager>,
) -> Result<QueryResponse, AppError> {
    debug!("Loading table data for '{}'.'{}'.'{}'", connection_id, schema, table);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;

    timeout(
        DEFAULT_DATA_TIMEOUT,
        driver.get_table_data(&schema, &table, limit, offset),
    )
    .await
    .map_err(|_| {
        error!("get_table_data timed out for '{}'.'{}'.'{}'", connection_id, schema, table);
        AppError::QueryTimeout(DEFAULT_DATA_TIMEOUT.as_secs())
    })?
}

#[tauri::command]
pub async fn get_row_count(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<i64, AppError> {
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.get_row_count(&schema, &table).await
}

#[tauri::command]
pub async fn update_cell(
    connection_id: String,
    schema: String,
    table: String,
    column: String,
    value: String,
    pk_columns: Vec<String>,
    pk_values: Vec<String>,
    pool_manager: State<'_, PoolManager>,
) -> Result<(), AppError> {
    info!("Updating cell in '{}'.'{}'.'{}'.'{}'", connection_id, schema, table, column);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver
        .update_cell(&schema, &table, &column, &value, pk_columns, pk_values)
        .await
}

#[tauri::command]
pub async fn insert_row(
    connection_id: String,
    schema: String,
    table: String,
    columns: Vec<String>,
    values: Vec<String>,
    pool_manager: State<'_, PoolManager>,
) -> Result<(), AppError> {
    info!("Inserting row into '{}'.'{}'.'{}'", connection_id, schema, table);
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver.insert_row(&schema, &table, columns, values).await
}

#[tauri::command]
pub async fn delete_rows(
    connection_id: String,
    schema: String,
    table: String,
    pk_columns: Vec<String>,
    pk_values_list: Vec<Vec<String>>,
    pool_manager: State<'_, PoolManager>,
) -> Result<u64, AppError> {
    info!(
        "Deleting {} row(s) from '{}'.'{}'.'{}'",
        pk_values_list.len(), connection_id, schema, table
    );
    let handle = pool_manager.get(&connection_id).await?;
    let driver = handle.as_sql()?;
    driver
        .delete_rows(&schema, &table, pk_columns, pk_values_list)
        .await
}
