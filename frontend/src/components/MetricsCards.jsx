import React from "react";

/**
 * MetricsCards Component (Week 2 Day 9 Deliverable)
 * 
 * Displays live telemetry from Spring Boot GET /api/v1/metrics/{sessionId}:
 * 1. Total Replayed Traffic Volume (Queries)
 * 2. Real-time Replay Error Rate (%)
 * 3. Target Sandbox Database
 * 4. Active Session State
 */
export default function MetricsCards({
  metrics = {
    sessionId: null,
    totalQueriesReplayed: 0,
    totalErrors: 0,
    errorRatePercentage: 0.0,
    status: "IDLE",
  },
  targetDatabase = "sample_shop",
}) {
  const isErrorFree = (metrics.totalErrors || 0) === 0;
  const isActive = metrics.status === "RUNNING" || metrics.status === "ACTIVE";

  return (
    <section className="metrics-grid">
      {/* Metric 1: Replayed Traffic Volume */}
      <div className="metric-card">
        <div className="metric-title">Captured Traffic Volume</div>
        <div className="metric-value" style={{ color: "#58a6ff" }}>
          {(metrics.totalQueriesReplayed || 0).toLocaleString()}
          <span style={{ fontSize: "14px", fontWeight: "normal", color: "#8b949e", marginLeft: "6px" }}>
            queries
          </span>
        </div>
        <div className="metric-subtext">
          {isActive ? "Streaming from Mock MySQL binlog" : "Awaiting traffic replay engine"}
        </div>
      </div>

      {/* Metric 2: Replay Error Rate */}
      <div className="metric-card">
        <div className="metric-title">Replay Error Rate</div>
        <div
          className="metric-value"
          style={{ color: isErrorFree ? "#3fb950" : "#f85149" }}
        >
          {Number(metrics.errorRatePercentage || 0).toFixed(2)}%
        </div>
        <div className="metric-subtext">
          {metrics.totalErrors || 0} breaking SQL exceptions captured
        </div>
      </div>

      {/* Metric 3: Target Database */}
      <div className="metric-card">
        <div className="metric-title">Target Database</div>
        <div className="metric-value" style={{ fontSize: "20px" }}>
          {targetDatabase}
        </div>
        <div className="metric-subtext">
          MySQL 8.0 • Isolated Sandbox Clone
        </div>
      </div>

      {/* Metric 4: Session Status */}
      <div className="metric-card">
        <div className="metric-title">Session State</div>
        <div
          className="metric-value"
          style={{
            fontSize: "20px",
            color: isActive ? "#3fb950" : "#8b949e",
          }}
        >
          {metrics.status || "IDLE"}
        </div>
        <div className="metric-subtext">
          Session #{metrics.sessionId ? metrics.sessionId : "None"}
        </div>
      </div>
    </section>
  );
}
