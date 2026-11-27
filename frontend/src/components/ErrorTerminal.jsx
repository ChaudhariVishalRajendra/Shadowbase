import React, { useRef, useEffect } from "react";

/**
 * ErrorTerminal Component (Week 2 Day 12 Deliverable)
 * 
 * Streams real-time container, CDC binlog events, and live throughput graph.
 */
export default function ErrorTerminal({
  logs = [],
  onClearLogs,
  autoScroll = true,
  setAutoScroll,
  throughput = 0,
  onSeedTraffic,
  onSimulateTraffic,
  isSimulating = false,
}) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <div className="card terminal-card">
      {/* Terminal Header */}
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 className="card-title">🖥️ CDC Pipeline & Replay Terminal</h2>
          <span className="step-tag" style={{ backgroundColor: "#238636", color: "#ffffff" }}>
            Day 12 Live Throughput
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={onSeedTraffic}
            disabled={isSimulating}
          >
            🌱 Seed Mock DB
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: "4px 10px", fontSize: "12px", backgroundColor: "#1f6feb" }}
            onClick={onSimulateTraffic}
            disabled={isSimulating}
          >
            {isSimulating ? "Streaming..." : "⚡ Stream 10 Tx"}
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={onClearLogs}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Day 12 Deliverable: Live Throughput Graphing Indicator */}
      <div className="throughput-bar">
        <div className="throughput-stat">
          <span className="live-dot" />
          <span className="throughput-label">CDC STREAM RATE:</span>
          <span className="throughput-value">{throughput > 0 ? `${throughput} events/s` : "IDLE"}</span>
        </div>

        {/* Visual Sparkline Graph */}
        <div className="sparkline-container">
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "70%" : "15%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "90%" : "25%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "60%" : "10%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "100%" : "30%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "80%" : "15%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "95%" : "20%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 ? "75%" : "10%" }} />
        </div>

        <label className="toggle-label" style={{ fontSize: "11px", color: "#8b949e" }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll && setAutoScroll(e.target.checked)}
            style={{ marginRight: "4px" }}
          />
          Auto-scroll
        </label>
      </div>

      {/* Terminal Log Console */}
      <div className="terminal-box">
        {logs.length === 0 ? (
          <div className="empty-terminal-msg">
            Terminal ready. Click 'Stream 10 Tx' to generate mock traffic through Debezium CDC into Kafka.
          </div>
        ) : (
          logs.map((logItem, index) => {
            const isText = typeof logItem === "string";
            const text = isText ? logItem : logItem.text || "";
            const isError = text.includes("ERROR") || text.includes("FAILED");
            const isSuccess = text.includes("SUCCESS") || text.includes("APPLIED");
            const isCdc = text.includes("CDC") || text.includes("Kafka") || text.includes("Debezium");

            let textColor = "#c9d1d9";
            if (isError) textColor = "#ff7b72";
            else if (isSuccess) textColor = "#3fb950";
            else if (isCdc) textColor = "#58a6ff";

            return (
              <div key={index} className="log-line" style={{ color: textColor }}>
                {text}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer */}
      <div className="editor-footer" style={{ padding: "6px 0 0" }}>
        <span style={{ fontSize: "11px", color: "#8b949e" }}>
          Pipeline: Mock MySQL (3307) &rarr; Debezium CDC &rarr; Kafka (9092) &rarr; Shadow Sandbox
        </span>
        <span style={{ fontSize: "11px", color: "#8b949e", fontFamily: "monospace" }}>
          Total Events: {logs.length}
        </span>
      </div>
    </div>
  );
}
