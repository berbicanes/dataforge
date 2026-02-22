use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportResult {
    pub rows_imported: u64,
    pub rows_failed: u64,
    pub errors: Vec<String>,
}
