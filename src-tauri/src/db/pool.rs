use std::collections::HashMap;
use std::sync::Arc;

use tokio::sync::RwLock;

use crate::db::traits::DbDriver;
use crate::error::AppError;

pub struct PoolManager {
    pools: RwLock<HashMap<String, Arc<dyn DbDriver>>>,
}

impl PoolManager {
    pub fn new() -> Self {
        Self {
            pools: RwLock::new(HashMap::new()),
        }
    }

    pub async fn add(&self, id: String, driver: Arc<dyn DbDriver>) {
        let mut pools = self.pools.write().await;
        pools.insert(id, driver);
    }

    pub async fn get(&self, id: &str) -> Result<Arc<dyn DbDriver>, AppError> {
        let pools = self.pools.read().await;
        pools
            .get(id)
            .cloned()
            .ok_or_else(|| AppError::ConnectionNotFound(format!("Connection '{}' not found", id)))
    }

    pub async fn remove(&self, id: &str) -> Result<(), AppError> {
        let mut pools = self.pools.write().await;
        pools
            .remove(id)
            .map(|_| ())
            .ok_or_else(|| AppError::ConnectionNotFound(format!("Connection '{}' not found", id)))
    }
}
