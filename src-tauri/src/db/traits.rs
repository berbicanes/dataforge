use async_trait::async_trait;

use crate::error::AppError;
use crate::models::query::QueryResponse;
use crate::models::schema::{ColumnInfo, ForeignKeyInfo, IndexInfo, SchemaInfo, TableInfo};

#[async_trait]
pub trait DbDriver: Send + Sync {
    async fn execute_query(&self, sql: &str) -> Result<QueryResponse, AppError>;

    async fn get_schemas(&self) -> Result<Vec<SchemaInfo>, AppError>;

    async fn get_tables(&self, schema: &str) -> Result<Vec<TableInfo>, AppError>;

    async fn get_columns(&self, schema: &str, table: &str) -> Result<Vec<ColumnInfo>, AppError>;

    async fn get_indexes(&self, schema: &str, table: &str) -> Result<Vec<IndexInfo>, AppError>;

    async fn get_foreign_keys(
        &self,
        schema: &str,
        table: &str,
    ) -> Result<Vec<ForeignKeyInfo>, AppError>;

    async fn get_table_data(
        &self,
        schema: &str,
        table: &str,
        limit: i64,
        offset: i64,
    ) -> Result<QueryResponse, AppError>;

    async fn get_row_count(&self, schema: &str, table: &str) -> Result<i64, AppError>;

    async fn update_cell(
        &self,
        schema: &str,
        table: &str,
        column: &str,
        value: &str,
        pk_columns: Vec<String>,
        pk_values: Vec<String>,
    ) -> Result<(), AppError>;

    async fn insert_row(
        &self,
        schema: &str,
        table: &str,
        columns: Vec<String>,
        values: Vec<String>,
    ) -> Result<(), AppError>;

    async fn delete_rows(
        &self,
        schema: &str,
        table: &str,
        pk_columns: Vec<String>,
        pk_values_list: Vec<Vec<String>>,
    ) -> Result<u64, AppError>;
}
