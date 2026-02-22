use std::collections::HashMap;
use std::sync::RwLock;
use tokio::sync::oneshot;

/// Registry that tracks in-flight queries and allows cancellation via oneshot channels.
pub struct CancellationRegistry {
    senders: RwLock<HashMap<String, oneshot::Sender<()>>>,
}

impl CancellationRegistry {
    pub fn new() -> Self {
        Self {
            senders: RwLock::new(HashMap::new()),
        }
    }

    /// Register a query and return a receiver that will fire if cancel is called.
    pub fn register(&self, query_id: String) -> oneshot::Receiver<()> {
        let (tx, rx) = oneshot::channel();
        let mut map = self.senders.write().unwrap();
        map.insert(query_id, tx);
        rx
    }

    /// Cancel a query by its ID. Returns true if the query was found and cancelled.
    pub fn cancel(&self, query_id: &str) -> bool {
        let mut map = self.senders.write().unwrap();
        if let Some(sender) = map.remove(query_id) {
            let _ = sender.send(());
            true
        } else {
            false
        }
    }

    /// Remove a query from the registry (called after query completes normally).
    pub fn remove(&self, query_id: &str) {
        let mut map = self.senders.write().unwrap();
        map.remove(query_id);
    }
}
