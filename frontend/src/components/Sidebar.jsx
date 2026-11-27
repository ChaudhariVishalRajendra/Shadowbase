import React from "react";

/**
 * Sidebar Component (Week 1 Milestone Aligned)
 * 
 * Focuses on:
 * 1. Docker Container Engine Operations (Testcontainers Java API)
 * 2. Real-time environment connection details (Port, DB, Container ID)
 * 3. Week 1 Navigation views
 * 4. Clear indicator that CDC traffic pipeline arrives in Week 2
 */
export default function Sidebar({
  sandboxStatus,
  mappedPort,
  containerId,
  isBusy,
  onStartSandbox,
  onStopSandbox,
  activeTab,
  setActiveTab,
}) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <span className="sidebar-logo">🛡️</span>
        <div>
          <h1 className="sidebar-title">ShadowBase</h1>
          <p className="sidebar-subtitle">Week 1: Container Engine</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-group-title">WORKSPACE</div>
        <button
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="nav-icon">📊</span>
          Overview Dashboard
        </button>
        <button
          className={`nav-item ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => setActiveTab("editor")}
        >
          <span className="nav-icon">📝</span>
          SQL Migration Editor
        </button>
        <button
          className={`nav-item ${activeTab === "terminal" ? "active" : ""}`}
          onClick={() => setActiveTab("terminal")}
        >
          <span className="nav-icon">🖥️</span>
          Container Logs Console
        </button>
        <button
          className={`nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="nav-icon">📜</span>
          Audit History
        </button>
      </nav>

      {/* Operation Panel: Docker Sandbox Operations (Week 1 Core) */}
      <div className="sidebar-section">
        <div className="section-header">
          <span className="section-title">CONTAINER ENGINE</span>
          <span
            className={`status-pill ${
              sandboxStatus === "RUNNING"
                ? "status-online"
                : sandboxStatus === "STARTING"
                ? "status-idle"
                : "status-offline"
            }`}
            style={{ padding: "2px 8px", fontSize: "11px" }}
          >
            {sandboxStatus}
          </span>
        </div>

        <div className="sidebar-info-box">
          <div className="info-row">
            <span className="info-label">Target DB:</span>
            <span className="info-value">sample_shop</span>
          </div>
          <div className="info-row">
            <span className="info-label">MySQL Engine:</span>
            <span className="info-value">8.0 (Docker)</span>
          </div>
          <div className="info-row">
            <span className="info-label">Dynamic Port:</span>
            <span className="info-value">
              {mappedPort ? mappedPort : "Not Bound"}
            </span>
          </div>
          {containerId && (
            <div className="info-row">
              <span className="info-label">Container ID:</span>
              <span className="info-value" style={{ fontSize: "11px" }}>
                {containerId.substring(0, 10)}...
              </span>
            </div>
          )}
        </div>

        <div className="sidebar-actions">
          {sandboxStatus !== "RUNNING" ? (
            <button
              className="btn btn-success btn-block"
              onClick={onStartSandbox}
              disabled={isBusy}
            >
              {sandboxStatus === "STARTING" ? "Spinning Up Docker..." : "🚀 Launch Sandbox"}
            </button>
          ) : (
            <button
              className="btn btn-danger btn-block"
              onClick={onStopSandbox}
              disabled={isBusy}
            >
              {sandboxStatus === "STOPPING" ? "Stopping Container..." : "🛑 Terminate Sandbox"}
            </button>
          )}
        </div>
      </div>

      {/* Roadmap Info: Week 2 CDC Preview */}
      <div className="sidebar-section" style={{ backgroundColor: "#14171d" }}>
        <div className="section-header">
          <span className="section-title" style={{ color: "#6e7681" }}>
            WEEK 2 PIPELINE
          </span>
          <span className="badge" style={{ backgroundColor: "#21262d", color: "#8b949e", fontSize: "10px" }}>
            Next Sprint
          </span>
        </div>
        <p style={{ fontSize: "11.5px", color: "#8b949e", lineHeight: "1.4" }}>
          Debezium CDC + Kafka topic streaming will connect to this sandbox in Week 2.
        </p>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <p className="footer-version">ShadowBase • Week 1 Milestone</p>
        <p className="footer-sub">Infotact Internship Project</p>
      </div>
    </aside>
  );
}
