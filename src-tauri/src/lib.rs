mod commands;
mod db;
mod error;
mod models;

use db::pool::PoolManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(PoolManager::new())
        .invoke_handler(tauri::generate_handler![
            commands::connection::connect_db,
            commands::connection::disconnect_db,
            commands::connection::test_connection,
            commands::query::execute_query,
            commands::schema::get_schemas,
            commands::schema::get_tables,
            commands::schema::get_columns,
            commands::schema::get_indexes,
            commands::schema::get_foreign_keys,
            commands::schema::get_table_data,
            commands::schema::get_row_count,
            commands::schema::update_cell,
            commands::schema::insert_row,
            commands::schema::delete_rows,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
