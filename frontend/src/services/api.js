/**
 * api.js - Centralized API Client for ShadowBase
 * 
 * Why this file exists:
 * In professional software development, API endpoints should not be hardcoded
 * across multiple React components. Instead, all HTTP communication with the 
 * Spring Boot backend is organized cleanly in a single service layer.
 */

const API_BASE_URL = "http://localhost:8080/api/v1";

/**
 * Pings the backend health endpoint.
 * @returns {Promise<Object>} HealthResponse
 */
export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Starts an ephemeral MySQL container via Testcontainers.
 * @param {string} sessionName
 * @returns {Promise<Object>} SandboxResponse
 */
export async function startSandbox(sessionName = "Migration-Session-1") {
  const response = await fetch(`${API_BASE_URL}/sandbox/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionName }),
  });
  if (!response.ok) {
    throw new Error(`Failed to start sandbox: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Stops and destroys the running sandbox container.
 * @returns {Promise<Object>} SandboxResponse
 */
export async function stopSandbox() {
  const response = await fetch(`${API_BASE_URL}/sandbox/stop`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to stop sandbox: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches the current live status and mapped port of the sandbox container.
 * @returns {Promise<Object>} SandboxResponse
 */
export async function getSandboxStatus() {
  const response = await fetch(`${API_BASE_URL}/sandbox/status`);
  if (!response.ok) {
    throw new Error(`Failed to get status: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches live query replay and error metrics for a specific session.
 * @param {number|string} sessionId
 * @returns {Promise<Object>} MetricResponse
 */
export async function getSessionMetrics(sessionId) {
  const response = await fetch(`${API_BASE_URL}/metrics/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics for session ${sessionId}: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches the latest session metrics.
 * @returns {Promise<Object>} MetricResponse
 */
export async function getLatestMetrics() {
  const response = await fetch(`${API_BASE_URL}/metrics/latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest metrics: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Registers the Debezium MySQL connector via Spring Boot backend.
 * @returns {Promise<Object>} Registration response
 */
export async function registerCdcConnector() {
  const response = await fetch(`${API_BASE_URL}/cdc/connector/register`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to register connector: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Checks the status of the registered Debezium connector.
 * @returns {Promise<Object>} Connector status
 */
export async function getCdcConnectorStatus() {
  const response = await fetch(`${API_BASE_URL}/cdc/connector/status`);
  if (!response.ok) {
    throw new Error(`Failed to get connector status: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Applies a SQL DDL migration statement onto the running shadow container.
 * @param {number|string} sessionId
 * @param {string} sql
 * @returns {Promise<Object>} MigrationApplyResponse
 */
export async function applyMigration(sessionId, sql) {
  const response = await fetch(`${API_BASE_URL}/migrations/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, sql }),
  });
  if (!response.ok) {
    throw new Error(`Migration failed: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches migration execution audit history for a session.
 * @param {number|string} sessionId
 * @returns {Promise<Array>} List of MigrationRecords
 */
export async function getMigrationHistory(sessionId) {
  const response = await fetch(`${API_BASE_URL}/migrations/history/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Seeds initial bulk transactions into Mock Production MySQL.
 * @returns {Promise<Object>}
 */
export async function seedMockTraffic() {
  const response = await fetch(`${API_BASE_URL}/traffic/seed`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to seed mock traffic: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Generates on-demand simulated customer transactions.
 * @param {number} count
 * @returns {Promise<Object>}
 */
export async function simulateTraffic(count = 10) {
  const response = await fetch(`${API_BASE_URL}/traffic/simulate?count=${count}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to simulate traffic: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches Mock MySQL row counts.
 * @returns {Promise<Object>}
 */
export async function getMockTrafficStatus() {
  const response = await fetch(`${API_BASE_URL}/traffic/status`);
  if (!response.ok) {
    throw new Error(`Failed to get traffic status: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches sample Debezium CDC change events for live console streaming.
 * @returns {Promise<Array>}
 */
export async function fetchSampleCdcEvents() {
  const response = await fetch(`${API_BASE_URL}/cdc/events/sample`);
  if (!response.ok) {
    throw new Error(`Failed to fetch CDC events: HTTP ${response.status}`);
  }
  return response.json();
}






