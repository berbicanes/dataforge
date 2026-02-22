use sqlx::mysql::MySqlRow;
use sqlx::postgres::PgRow;
use sqlx::{Column, Row, TypeInfo, ValueRef};

use crate::models::query::{CellValue, ColumnDef};

pub fn pg_columns_to_defs(row: &PgRow) -> Vec<ColumnDef> {
    row.columns()
        .iter()
        .map(|col| ColumnDef {
            name: col.name().to_string(),
            data_type: col.type_info().name().to_string(),
        })
        .collect()
}

pub fn pg_row_to_cells(row: &PgRow) -> Vec<CellValue> {
    let columns = row.columns().len();
    let mut cells = Vec::with_capacity(columns);

    for i in 0..columns {
        let type_name = row.columns()[i].type_info().name().to_uppercase();

        // Check for null first
        let raw = row.try_get_raw(i);
        let is_null = match &raw {
            Ok(val) => val.is_null(),
            Err(_) => true,
        };

        if is_null {
            cells.push(CellValue::Null);
            continue;
        }

        let cell = match type_name.as_str() {
            "BOOL" => match row.try_get::<bool, _>(i) {
                Ok(v) => CellValue::Bool(v),
                Err(_) => CellValue::Null,
            },
            "INT2" | "SMALLINT" | "SMALLSERIAL" => match row.try_get::<i16, _>(i) {
                Ok(v) => CellValue::Int(v as i64),
                Err(_) => CellValue::Null,
            },
            "INT4" | "INT" | "INTEGER" | "SERIAL" => match row.try_get::<i32, _>(i) {
                Ok(v) => CellValue::Int(v as i64),
                Err(_) => CellValue::Null,
            },
            "INT8" | "BIGINT" | "BIGSERIAL" => match row.try_get::<i64, _>(i) {
                Ok(v) => CellValue::Int(v),
                Err(_) => CellValue::Null,
            },
            "FLOAT4" | "REAL" => match row.try_get::<f32, _>(i) {
                Ok(v) => CellValue::Float(v as f64),
                Err(_) => CellValue::Null,
            },
            "FLOAT8" | "DOUBLE PRECISION" => match row.try_get::<f64, _>(i) {
                Ok(v) => CellValue::Float(v),
                Err(_) => CellValue::Null,
            },
            "TEXT" | "VARCHAR" | "CHAR" | "NAME" | "BPCHAR" | "CHAR(N)" | "CHARACTER VARYING"
            | "CHARACTER" | "CITEXT" | "UUID" | "OID" => {
                match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Text(v),
                    Err(_) => CellValue::Null,
                }
            }
            "TIMESTAMP" | "TIMESTAMP WITHOUT TIME ZONE" => {
                match row.try_get::<chrono::NaiveDateTime, _>(i) {
                    Ok(v) => CellValue::Timestamp(v.format("%Y-%m-%d %H:%M:%S").to_string()),
                    Err(_) => match row.try_get::<String, _>(i) {
                        Ok(v) => CellValue::Timestamp(v),
                        Err(_) => CellValue::Null,
                    },
                }
            }
            "TIMESTAMPTZ" | "TIMESTAMP WITH TIME ZONE" => {
                match row.try_get::<chrono::DateTime<chrono::Utc>, _>(i) {
                    Ok(v) => {
                        CellValue::Timestamp(v.format("%Y-%m-%d %H:%M:%S %Z").to_string())
                    }
                    Err(_) => match row.try_get::<chrono::NaiveDateTime, _>(i) {
                        Ok(v) => {
                            CellValue::Timestamp(v.format("%Y-%m-%d %H:%M:%S").to_string())
                        }
                        Err(_) => match row.try_get::<String, _>(i) {
                            Ok(v) => CellValue::Timestamp(v),
                            Err(_) => CellValue::Null,
                        },
                    },
                }
            }
            "DATE" => match row.try_get::<chrono::NaiveDate, _>(i) {
                Ok(v) => CellValue::Timestamp(v.format("%Y-%m-%d").to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Timestamp(v),
                    Err(_) => CellValue::Null,
                },
            },
            "TIME" | "TIME WITHOUT TIME ZONE" => {
                match row.try_get::<chrono::NaiveTime, _>(i) {
                    Ok(v) => CellValue::Timestamp(v.format("%H:%M:%S").to_string()),
                    Err(_) => match row.try_get::<String, _>(i) {
                        Ok(v) => CellValue::Timestamp(v),
                        Err(_) => CellValue::Null,
                    },
                }
            }
            "JSON" | "JSONB" => match row.try_get::<serde_json::Value, _>(i) {
                Ok(v) => CellValue::Json(v.to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Json(v),
                    Err(_) => CellValue::Null,
                },
            },
            "BYTEA" => match row.try_get::<Vec<u8>, _>(i) {
                Ok(v) => CellValue::Binary(v),
                Err(_) => CellValue::Null,
            },
            "NUMERIC" | "DECIMAL" | "MONEY" => match row.try_get::<String, _>(i) {
                Ok(v) => CellValue::Text(v),
                Err(_) => match row.try_get::<f64, _>(i) {
                    Ok(v) => CellValue::Float(v),
                    Err(_) => CellValue::Null,
                },
            },
            _ => {
                // Fallback: try to get as string
                match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Text(v),
                    Err(_) => match row.try_get::<i64, _>(i) {
                        Ok(v) => CellValue::Int(v),
                        Err(_) => match row.try_get::<f64, _>(i) {
                            Ok(v) => CellValue::Float(v),
                            Err(_) => match row.try_get::<bool, _>(i) {
                                Ok(v) => CellValue::Bool(v),
                                Err(_) => CellValue::Null,
                            },
                        },
                    },
                }
            }
        };

        cells.push(cell);
    }

    cells
}

pub fn mysql_columns_to_defs(row: &MySqlRow) -> Vec<ColumnDef> {
    row.columns()
        .iter()
        .map(|col| ColumnDef {
            name: col.name().to_string(),
            data_type: col.type_info().name().to_string(),
        })
        .collect()
}

pub fn mysql_row_to_cells(row: &MySqlRow) -> Vec<CellValue> {
    let columns = row.columns().len();
    let mut cells = Vec::with_capacity(columns);

    for i in 0..columns {
        let type_name = row.columns()[i].type_info().name().to_uppercase();

        // Check for null first
        let raw = row.try_get_raw(i);
        let is_null = match &raw {
            Ok(val) => val.is_null(),
            Err(_) => true,
        };

        if is_null {
            cells.push(CellValue::Null);
            continue;
        }

        let cell = match type_name.as_str() {
            "BOOLEAN" | "TINYINT(1)" | "BOOL" => match row.try_get::<bool, _>(i) {
                Ok(v) => CellValue::Bool(v),
                Err(_) => match row.try_get::<i8, _>(i) {
                    Ok(v) => CellValue::Bool(v != 0),
                    Err(_) => CellValue::Null,
                },
            },
            "TINYINT" | "TINYINT UNSIGNED" => match row.try_get::<i8, _>(i) {
                Ok(v) => CellValue::Int(v as i64),
                Err(_) => match row.try_get::<u8, _>(i) {
                    Ok(v) => CellValue::Int(v as i64),
                    Err(_) => CellValue::Null,
                },
            },
            "SMALLINT" | "SMALLINT UNSIGNED" => match row.try_get::<i16, _>(i) {
                Ok(v) => CellValue::Int(v as i64),
                Err(_) => match row.try_get::<u16, _>(i) {
                    Ok(v) => CellValue::Int(v as i64),
                    Err(_) => CellValue::Null,
                },
            },
            "INT" | "INTEGER" | "INT UNSIGNED" | "MEDIUMINT" | "MEDIUMINT UNSIGNED" => {
                match row.try_get::<i32, _>(i) {
                    Ok(v) => CellValue::Int(v as i64),
                    Err(_) => match row.try_get::<u32, _>(i) {
                        Ok(v) => CellValue::Int(v as i64),
                        Err(_) => CellValue::Null,
                    },
                }
            }
            "BIGINT" | "BIGINT UNSIGNED" => match row.try_get::<i64, _>(i) {
                Ok(v) => CellValue::Int(v),
                Err(_) => match row.try_get::<u64, _>(i) {
                    Ok(v) => CellValue::Int(v as i64),
                    Err(_) => CellValue::Null,
                },
            },
            "FLOAT" => match row.try_get::<f32, _>(i) {
                Ok(v) => CellValue::Float(v as f64),
                Err(_) => CellValue::Null,
            },
            "DOUBLE" | "DOUBLE PRECISION" => match row.try_get::<f64, _>(i) {
                Ok(v) => CellValue::Float(v),
                Err(_) => CellValue::Null,
            },
            "DECIMAL" | "NUMERIC" | "DEC" | "FIXED" => match row.try_get::<String, _>(i) {
                Ok(v) => CellValue::Text(v),
                Err(_) => match row.try_get::<f64, _>(i) {
                    Ok(v) => CellValue::Float(v),
                    Err(_) => CellValue::Null,
                },
            },
            "VARCHAR" | "TEXT" | "CHAR" | "TINYTEXT" | "MEDIUMTEXT" | "LONGTEXT" | "ENUM"
            | "SET" => match row.try_get::<String, _>(i) {
                Ok(v) => CellValue::Text(v),
                Err(_) => CellValue::Null,
            },
            "DATETIME" => match row.try_get::<chrono::NaiveDateTime, _>(i) {
                Ok(v) => CellValue::Timestamp(v.format("%Y-%m-%d %H:%M:%S").to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Timestamp(v),
                    Err(_) => CellValue::Null,
                },
            },
            "TIMESTAMP" => match row.try_get::<chrono::NaiveDateTime, _>(i) {
                Ok(v) => CellValue::Timestamp(v.format("%Y-%m-%d %H:%M:%S").to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Timestamp(v),
                    Err(_) => CellValue::Null,
                },
            },
            "DATE" => match row.try_get::<chrono::NaiveDate, _>(i) {
                Ok(v) => CellValue::Timestamp(v.format("%Y-%m-%d").to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Timestamp(v),
                    Err(_) => CellValue::Null,
                },
            },
            "TIME" => match row.try_get::<chrono::NaiveTime, _>(i) {
                Ok(v) => CellValue::Timestamp(v.format("%H:%M:%S").to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Timestamp(v),
                    Err(_) => CellValue::Null,
                },
            },
            "BLOB" | "TINYBLOB" | "MEDIUMBLOB" | "LONGBLOB" | "BINARY" | "VARBINARY" => {
                match row.try_get::<Vec<u8>, _>(i) {
                    Ok(v) => CellValue::Binary(v),
                    Err(_) => CellValue::Null,
                }
            }
            "JSON" => match row.try_get::<serde_json::Value, _>(i) {
                Ok(v) => CellValue::Json(v.to_string()),
                Err(_) => match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Json(v),
                    Err(_) => CellValue::Null,
                },
            },
            _ => {
                // Fallback: try to get as string
                match row.try_get::<String, _>(i) {
                    Ok(v) => CellValue::Text(v),
                    Err(_) => match row.try_get::<i64, _>(i) {
                        Ok(v) => CellValue::Int(v),
                        Err(_) => match row.try_get::<f64, _>(i) {
                            Ok(v) => CellValue::Float(v),
                            Err(_) => match row.try_get::<bool, _>(i) {
                                Ok(v) => CellValue::Bool(v),
                                Err(_) => CellValue::Null,
                            },
                        },
                    },
                }
            }
        };

        cells.push(cell);
    }

    cells
}
