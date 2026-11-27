import React from "react";

/**
 * Top Navbar Component (Streamlined for Sidebar Layout)
 * 
 * Displays:
 * 1. Breadcrumb navigation with active tab name
 * 2. Active environment status indicator
 * 3. Quick session info
 */
export default function Navbar({
  sandboxStatus,
  mappedPort,
  sessionName,
  activeTab = "dashboard",
}) {
  const tabTitles = {
    dashboard: "Overview Dashboard",
    editor: "Migration SQL Editor",
    terminal: "Live Error Console",
    history: "Audit History",
  };

  return (
    <header className="navbar">
      {/* Breadcrumb Info */}
      <div className="breadcrumb-area">
        <span className="breadcrumb-root">ShadowBase</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {tabTitles[activeTab] || "Overview Dashboard"}
        </span>
        <span className="badge badge-editor" style={{ marginLeft: "10px" }}>
          Session: {sessionName || "Active"}
        </span>
      </div>

      {/* Right-Side Status Info */}
      <div className="navbar-actions">
        {sandboxStatus === "RUNNING" ? (
          <span className="status-pill status-online">
            <span className="status-dot"></span>
            Container: Active on Port {mappedPort}
          </span>
        ) : sandboxStatus === "STARTING" ? (
          <span className="status-pill status-idle">
            <span className="status-dot"></span>
            Initializing Testcontainers...
          </span>
        ) : (
          <span className="status-pill status-idle">
            <span className="status-dot"></span>
            Container: Idle
          </span>
        )}
      </div>
    </header>
  );
}
