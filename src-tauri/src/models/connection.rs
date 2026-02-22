use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseType {
    PostgreSQL,
    MySQL,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionConfig {
    pub id: String,
    pub name: String,
    pub db_type: DatabaseType,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub database: String,
    pub use_ssl: bool,
}

impl ConnectionConfig {
    pub fn to_connection_url(&self) -> String {
        match self.db_type {
            DatabaseType::PostgreSQL => {
                let ssl_mode = if self.use_ssl { "require" } else { "disable" };
                format!(
                    "postgres://{}:{}@{}:{}/{}?sslmode={}",
                    self.username, self.password, self.host, self.port, self.database, ssl_mode
                )
            }
            DatabaseType::MySQL => {
                let ssl_mode = if self.use_ssl {
                    "?ssl-mode=REQUIRED"
                } else {
                    ""
                };
                format!(
                    "mysql://{}:{}@{}:{}/{}{}",
                    self.username, self.password, self.host, self.port, self.database, ssl_mode
                )
            }
        }
    }
}
