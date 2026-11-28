import React, { useRef, useEffect, useState } from "react";

export default function ErrorTerminal({
  logs = [],
  onClearLogs,
  autoScroll = true,
  setAutoScroll,
  throughput = 0,
  onSeedTraffic,
  onSimulateTraffic,
  isSimulating = false,
  isStreamingCdc = false,
  onToggleCdcStream,
}) {
  const terminalEndRef = useRef(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((logItem) => {
    const text = typeof logItem === "string" ? logItem : logItem.text || "";
    if (filter === "ALL") return true;
    if (filter === "CDC") return text.includes("CDC") || text.includes("Kafka") || text.includes("Debezium");
    if (filter === "CONTAINER") return text.includes("Container") || text.includes("Docker") || text.includes("Port");
    if (filter === "MIGRATION") return text.includes("DDL") || text.includes("Migration") || text.includes("ALTER");
    return true;
  });

  return (
    <div className="card terminal-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 className="card-title">🖥️ CDC Pipeline & Replay Terminal</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className={`btn ${isStreamingCdc ? "btn-danger" : "btn-secondary"}`}
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={onToggleCdcStream}
          >
            {isStreamingCdc ? "⏸️ Pause Stream" : "▶️ Live CDC Stream"}
          </button>
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

      <div className="throughput-bar">
        <div className="throughput-stat">
          <span className={`live-dot ${isStreamingCdc ? "live-dot-pulse" : ""}`} />
          <span className="throughput-label">CDC STREAM RATE:</span>
          <span className="throughput-value">{throughput > 0 ? `${throughput} events/s` : isStreamingCdc ? "12 events/s" : "IDLE"}</span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {["ALL", "CDC", "CONTAINER", "MIGRATION"].map((cat) => (
            <button
              key={cat}
              className={`preset-btn ${filter === cat ? "preset-btn-safe" : ""}`}
              style={{
                padding: "2px 8px",
                fontSize: "10px",
                backgroundColor: filter === cat ? "#1f6feb" : "#21262d",
                color: filter === cat ? "#ffffff" : "#8b949e",
                borderColor: filter === cat ? "#58a6ff" : "#30363d",
              }}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sparkline-container">
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "70%" : "15%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "90%" : "25%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "60%" : "10%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "100%" : "30%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "80%" : "15%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "95%" : "20%" }} />
          <div className="sparkline-bar" style={{ height: throughput > 0 || isStreamingCdc ? "75%" : "10%" }} />
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

      <div className="terminal-box">
        {filteredLogs.length === 0 ? (
          <div className="empty-terminal-msg">
            No events match the '{filter}' filter. Click 'Live CDC Stream' or 'Stream 10 Tx' to see real-time events.
          </div>
        ) : (
          filteredLogs.map((logItem, index) => {
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

      <div className="editor-footer" style={{ padding: "6px 0 0" }}>
        <span style={{ fontSize: "11px", color: "#8b949e" }}>
          Pipeline: Mock MySQL (3307) &rarr; Debezium CDC &rarr; Kafka (9092) &rarr; Shadow Sandbox
        </span>
        <span style={{ fontSize: "11px", color: "#8b949e", fontFamily: "monospace" }}>
          Filtered: {filteredLogs.length} / Total: {logs.length}
        </span>
      </div>
    </div>
  );
}
