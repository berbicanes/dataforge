use tauri::State;

use crate::db::pool::PoolManager;
use crate::error::AppError;
use crate::models::query::QueryResponse;
use crate::models::schema::{ColumnInfo, ForeignKeyInfo, IndexInfo, SchemaInfo, TableInfo};

#[tauri::command]
pub async fn get_schemas(
    connection_id: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<SchemaInfo>, AppError> {
    let driver = pool_manager.get(&connection_id).await?;
    driver.get_schemas().await
}

#[tauri::command]
pub async fn get_tables(
    connection_id: String,
    schema: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<TableInfo>, AppError> {
    let driver = pool_manager.get(&connection_id).await?;
    driver.get_tables(&schema).await
}

#[tauri::command]
pub async fn get_columns(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<ColumnInfo>, AppError> {
    let driver = pool_manager.get(&connection_id).await?;
    driver.get_columns(&schema, &table).await
}

#[tauri::command]
pub async fn get_indexes(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<IndexInfo>, AppError> {
    let driver = pool_manager.get(&connection_id).await?;
    driver.get_indexes(&schema, &table).await
}

#[tauri::command]
pub async fn get_foreign_keys(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<Vec<ForeignKeyInfo>, AppError> {
    let driver = pool_manager.get(&connection_id).await?;
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
    let driver = pool_manager.get(&connection_id).await?;
    driver.get_table_data(&schema, &table, limit, offset).await
}

#[tauri::command]
pub async fn get_row_count(
    connection_id: String,
    schema: String,
    table: String,
    pool_manager: State<'_, PoolManager>,
) -> Result<i64, AppError> {
    let driver = pool_manager.get(&connection_id).await?;
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
    let driver = pool_manager.get(&connection_id).await?;
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
    let driver = pool_manager.get(&connection_id).await?;
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
    let driver = pool_manager.get(&connection_id).await?;
    driver
        .delete_rows(&schema, &table, pk_columns, pk_values_list)
        .await
}
