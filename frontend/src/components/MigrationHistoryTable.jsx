import React from "react";

/**
 * MigrationHistoryTable Component (Aligned with docs/design.md Section 4.D)
 * 
 * Displays historical sandbox migration runs, execution times, and status badges.
 */
export default function MigrationHistoryTable({ history = [] }) {
  return (
    <div className="card history-card">
      <div className="history-header">
        <h3 className="card-title">📜 Recent Sandbox Migration Runs</h3>
        <span className="badge badge-editor">Audit Log</span>
      </div>

      <div className="table-responsive">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Run ID</th>
              <th style={{ width: "140px" }}>Timestamp</th>
              <th>Executed SQL Statement</th>
              <th style={{ width: "120px" }}>Latency</th>
              <th style={{ width: "120px" }}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table-cell">
                  No migrations executed in this session yet. Draft a script above and click "Apply Migration".
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id}>
                  <td className="cell-id">#{item.id}</td>
                  <td className="cell-time">{item.timestamp}</td>
                  <td className="cell-sql">
                    <code>{item.sql}</code>
                  </td>
                  <td className="cell-latency">{item.executionTimeMs} ms</td>
                  <td>
                    <span
                      className={`status-pill ${
                        item.status === "APPLIED"
                          ? "status-online"
                          : "status-offline"
                      }`}
                      style={{ padding: "3px 10px", fontSize: "11px" }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

