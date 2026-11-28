import React, { useMemo } from "react";

export default function MigrationEditor({
  sqlScript = "-- DDL Migration Script\nALTER TABLE customers ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';",
  setSqlScript,
  sandboxStatus = "IDLE",
  mappedPort = null,
  onExecuteMigration,
  isExecuting = false,
  executionResult = null,
}) {
  const isRunning = sandboxStatus === "RUNNING";

  const presets = [
    {
      label: "Safe: Add Column",
      risk: "LOW",
      sql: "-- Safe Additive Migration\nALTER TABLE customers ADD COLUMN phone_number VARCHAR(20) NULL;",
    },
    {
      label: "Dangerous: Drop Column",
      risk: "HIGH",
      sql: "-- BREAKING CHANGE (Simulate Failure)\nALTER TABLE customers DROP COLUMN last_name;",
    },
    {
      label: "Performance: Create Index",
      risk: "LOW",
      sql: "-- Performance Optimization Index\nCREATE INDEX idx_customers_email ON customers(email);",
    },
    {
      label: "Dangerous: Rename Column",
      risk: "HIGH",
      sql: "-- RISKY CHANGE (Column Rename)\nALTER TABLE customers RENAME COLUMN email TO customer_email;",
    },
  ];

  const astWarning = useMemo(() => {
    if (!sqlScript) return null;
    const lower = sqlScript.toLowerCase();

    if (lower.includes("drop column")) {
      return {
        level: "CRITICAL",
        title: "High-Risk Operation: DROP COLUMN",
        message:
          "Dropping a column will immediately cause inflight SELECT/INSERT queries relying on this field to fail with 'Unknown column' error.",
      };
    }
    if (lower.includes("drop table")) {
      return {
        level: "CRITICAL",
        title: "Dangerous Operation: DROP TABLE",
        message:
          "Dropping a table breaks all queries referencing this relation and invalidates foreign key constraints.",
      };
    }
    if (lower.includes("rename column")) {
      return {
        level: "WARNING",
        title: "Breaking Schema Change: RENAME COLUMN",
        message:
          "Renaming a column without a dual-writing phase breaks backward compatibility with active application traffic.",
      };
    }
    return null;
  }, [sqlScript]);

  const lineNumbers = useMemo(() => {
    const count = (sqlScript || "").split("\n").length;
    return Array.from({ length: Math.max(count, 6) }, (_, i) => i + 1);
  }, [sqlScript]);

  const handleExportScript = () => {
    const blob = new Blob([sqlScript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shadowbase_migration_${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card editor-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 className="card-title">📝 Monaco SQL Migration Editor</h2>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={() => setSqlScript("-- Enter your migration SQL\n")}
          >
            Clear
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 10px", fontSize: "12px" }}
            onClick={handleExportScript}
          >
            💾 Export .sql
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: "4px 14px", fontSize: "12px", backgroundColor: "#238636" }}
            onClick={onExecuteMigration}
            disabled={!isRunning || isExecuting}
          >
            {isExecuting ? "Executing DDL..." : "⚡ Execute on Sandbox"}
          </button>
        </div>
      </div>

      <div className="presets-bar">
        <span className="presets-label">Quick Templates:</span>
        <div className="presets-group">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              className={`preset-btn ${preset.risk === "HIGH" ? "preset-btn-danger" : "preset-btn-safe"}`}
              onClick={() => setSqlScript(preset.sql)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {astWarning && (
        <div className={`ast-banner ${astWarning.level === "CRITICAL" ? "ast-danger" : "ast-warning"}`}>
          <div className="ast-icon">⚠️</div>
          <div>
            <strong>{astWarning.title}</strong>
            <p style={{ margin: "2px 0 0", fontSize: "12px", opacity: 0.9 }}>
              {astWarning.message}
            </p>
          </div>
        </div>
      )}

      <div className="monaco-container">
        <div className="monaco-gutter">
          {lineNumbers.map((num) => (
            <div key={num} className="monaco-line-num">
              {num}
            </div>
          ))}
        </div>

        <textarea
          className="monaco-textarea"
          value={sqlScript}
          onChange={(e) => setSqlScript(e.target.value)}
          placeholder="-- Write your SQL DDL migration statements here..."
          spellCheck="false"
        />
      </div>

      {executionResult && (
        <div
          className={`ast-banner ${executionResult.status === "APPLIED" ? "ast-applied" : "ast-danger"}`}
          style={{
            backgroundColor:
              executionResult.status === "APPLIED" ? "rgba(46, 160, 67, 0.15)" : "rgba(248, 81, 73, 0.15)",
            borderColor:
              executionResult.status === "APPLIED" ? "rgba(46, 160, 67, 0.4)" : "rgba(248, 81, 73, 0.4)",
          }}
        >
          <div className="ast-icon">
            {executionResult.status === "APPLIED" ? "✅" : "❌"}
          </div>
          <div>
            <strong>
              {executionResult.status === "APPLIED"
                ? `Migration Applied Successfully (${executionResult.executionTimeMs} ms)`
                : "Migration Execution Failed"}
            </strong>
            <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
              {executionResult.errorMessage || "DDL committed to shadow MySQL container. Schema state updated."}
            </p>
          </div>
        </div>
      )}

      <div className="editor-footer">
        <span style={{ fontSize: "12px", color: isRunning ? "#3fb950" : "#8b949e" }}>
          🎯 Target: {isRunning ? `Ephemeral MySQL (Port ${mappedPort})` : "Awaiting Sandbox Launch"}
        </span>
        <span style={{ fontSize: "11px", color: "#8b949e" }}>
          Syntax: MySQL 8.0 DDL • Safety Parser Active
        </span>
      </div>
    </div>
  );
}
