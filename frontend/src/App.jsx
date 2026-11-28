import { useState, useEffect } from "react";
import MetricsCards from "./components/MetricsCards";
import MigrationEditor from "./components/MigrationEditor";
import ErrorTerminal from "./components/ErrorTerminal";
import {
  getLatestMetrics,
  registerCdcConnector,
  getCdcConnectorStatus,
  applyMigration,
  seedMockTraffic,
  simulateTraffic,
  fetchSampleCdcEvents,
} from "./services/api";
import "./index.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("CHECKING");
  const [backendMessage, setBackendMessage] = useState("");

  const [sandboxStatus, setSandboxStatus] = useState("IDLE");
  const [containerDetails, setContainerDetails] = useState({
    sessionId: null,
    sessionName: "Sandbox-Session",
    containerId: null,
    mappedPort: null,
    message: "Container is currently idle. Click 'Launch Sandbox' to start.",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [cdcStatus, setCdcStatus] = useState("CONFIGURED");
  const [cdcDetails] = useState({
    mockDbPort: "3307",
    kafkaPort: "9092",
    zookeeperPort: "2181",
    debeziumPort: "8083",
    cdcTopic: "mockserver.sample_shop.customers",
  });

  const checkCdcCluster = async () => {
    setCdcStatus("CHECKING");
    addLog("Probing Debezium Connect cluster at http://localhost:8083/ ...");
    try {
      const res = await fetch("http://localhost:8083/");
      if (res.ok) {
        const data = await res.json();
        setCdcStatus("ONLINE");
        addLog(`SUCCESS: Debezium Connect is running! Version: ${data.version || "Active"}`);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      setCdcStatus("OFFLINE");
      addLog(`CDC cluster offline on localhost:8083. (Start with: docker compose up -d)`);
    }
  };

  const [metrics, setMetrics] = useState({
    sessionId: null,
    totalQueriesReplayed: 0,
    totalErrors: 0,
    errorRatePercentage: 0.0,
    status: "IDLE",
  });

  const refreshMetrics = async () => {
    try {
      const data = await getLatestMetrics();
      if (data) {
        setMetrics(data);
      }
    } catch (err) {
      // Backend not running or idle
    }
  };

  const [sqlScript, setSqlScript] = useState(
    "-- Safe Additive Migration\nALTER TABLE customers ADD COLUMN phone_number VARCHAR(20) NULL;"
  );
  const [isExecutingMigration, setIsExecutingMigration] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  const handleExecuteMigration = async () => {
    if (sandboxStatus !== "RUNNING") {
      addLog("WARNING: Cannot apply migration. Please launch the sandbox container first.");
      return;
    }

    setIsExecutingMigration(true);
    addLog(`Executing DDL migration on sandbox (Session #${containerDetails.sessionId || 1})...`);

    try {
      const res = await applyMigration(containerDetails.sessionId || 1, sqlScript);
      setMigrationResult(res);

      if (res.status === "APPLIED") {
        addLog(`SUCCESS: DDL applied in ${res.executionTimeMs} ms! (Migration ID: ${res.migrationId})`);
        if (res.warnings && res.warnings.length > 0) {
          res.warnings.forEach((w) => addLog(`RISK WARNING: ${w}`));
        }
      } else {
        addLog(`FAILED: Migration error: ${res.errorMessage}`);
      }

      refreshMetrics();
    } catch (err) {
      setMigrationResult({
        status: "FAILED",
        errorMessage: err.message,
      });
      addLog(`ERROR executing migration: ${err.message}`);
    } finally {
      setIsExecutingMigration(false);
    }
  };

  const handleRegisterConnector = async () => {
    addLog("Sending registration request for Debezium MySQL connector...");
    try {
      const res = await registerCdcConnector();
      if (res.success) {
        addLog("SUCCESS: Debezium connector 'mock-mysql-connector' registered with cluster!");
        setCdcStatus("ONLINE");
      } else {
        addLog(`NOTE: ${res.message}`);
      }
    } catch (err) {
      addLog(`ERROR: Failed to register connector (${err.message})`);
    }
  };

  const [throughput, setThroughput] = useState(0);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false);
  const [isStreamingCdc, setIsStreamingCdc] = useState(false);

  const handleToggleCdcStream = () => {
    setIsStreamingCdc((prev) => !prev);
    addLog(`CDC Live Event Stream toggled: ${!isStreamingCdc ? "ACTIVE (Polling Kafka Topics)" : "PAUSED"}`);
  };

  useEffect(() => {
    let interval = null;
    if (isStreamingCdc) {
      interval = setInterval(async () => {
        try {
          const events = await fetchSampleCdcEvents();
          if (events && events.length > 0) {
            events.forEach((ev) => {
              addLog(`[CDC-EVENT] Topic: ${ev.topic} | OP: ${ev.op} | TABLE: ${ev.table} | AFTER: ${JSON.stringify(ev.after)}`);
            });
          }
        } catch (err) {
          // Silent catch
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreamingCdc]);

  const handleSeedTraffic = async () => {
    addLog("Seeding Mock Production MySQL (Port 3307) with realistic customer transactions...");
    try {
      const res = await seedMockTraffic();
      if (res.success) {
        addLog(`SUCCESS: ${res.message}`);
        setThroughput(25);
        setTimeout(() => setThroughput(0), 4000);
      } else {
        addLog(`NOTE: ${res.message}`);
      }
      refreshMetrics();
    } catch (err) {
      addLog(`ERROR: Failed to seed mock data (${err.message})`);
    }
  };

  const handleSimulateTraffic = async () => {
    setIsSimulatingTraffic(true);
    setThroughput(48);
    addLog("Simulating 10 customer & order transactions into Mock MySQL...");

    try {
      const res = await simulateTraffic(10);
      if (res.success) {
        addLog(`SUCCESS: ${res.message}`);
        addLog("CDC: Debezium captured row events from binlog and published to Kafka!");
      } else {
        addLog(`NOTE: ${res.message}`);
      }
      refreshMetrics();
    } catch (err) {
      addLog(`ERROR: Simulated traffic failed (${err.message})`);
    } finally {
      setIsSimulatingTraffic(false);
      setTimeout(() => setThroughput(0), 5000);
    }
  };

  const [logs, setLogs] = useState([
    `[${new Date().toLocaleTimeString()}] System dashboard initialized. Ready for operations.`,
  ]);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const checkHealth = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBackendStatus("ONLINE");
      setBackendMessage(data.message);
      addLog(`Backend responded: ${data.service} is UP.`);
    } catch (err) {
      setBackendStatus("OFFLINE");
      setBackendMessage("Could not connect to Spring Boot at http://localhost:8080");
      addLog(`Backend connection failed. Make sure Spring Boot is running.`);
    }
  };

  const handleStartContainer = async () => {
    setIsLoading(true);
    setSandboxStatus("STARTING");
    addLog("Requesting backend to spin up MySQL 8.0 container on Docker Desktop...");

    try {
      const res = await fetch("http://localhost:8080/api/v1/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionName: "Production-Clone-Session" }),
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();

      setSandboxStatus("RUNNING");
      setContainerDetails({
        sessionId: data.sessionId,
        sessionName: data.sessionName,
        containerId: data.containerId,
        mappedPort: data.mappedPort,
        message: data.message,
      });

      addLog(`SUCCESS: Container launched! ID: ${data.containerId.substring(0, 12)}, Mapped Port: ${data.mappedPort}`);
      addLog(`SCHEMA: Baseline tables ('customers', 'orders') seeded into 'sample_shop'.`);
      refreshMetrics();
    } catch (err) {
      setSandboxStatus("FAILED");
      addLog(`ERROR: Failed to start container (${err.message}). Is Docker Desktop running?`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopContainer = async () => {
    setIsLoading(true);
    setSandboxStatus("STOPPING");
    addLog("Requesting backend to stop and terminate container...");

    try {
      const res = await fetch("http://localhost:8080/api/v1/sandbox/stop", {
        method: "POST",
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();

      setSandboxStatus("STOPPED");
      setContainerDetails({
        sessionId: null,
        sessionName: "None",
        containerId: null,
        mappedPort: null,
        message: data.message,
      });

      addLog(`SUCCESS: Container terminated and memory cleaned up.`);
      refreshMetrics();
    } catch (err) {
      addLog(`ERROR: Failed to stop container (${err.message})`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    refreshMetrics();

    fetch("http://localhost:8080/api/v1/sandbox/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.status === "RUNNING") {
          setSandboxStatus("RUNNING");
          setContainerDetails({
            sessionId: data.sessionId,
            sessionName: data.sessionName,
            containerId: data.containerId,
            mappedPort: data.mappedPort,
            message: data.message,
          });
          addLog(`Found existing container already running on port ${data.mappedPort}`);
          refreshMetrics();
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="container">
      <header className="navbar">
        <div className="logo-group">
          <span className="logo">🛡️</span>
          <div>
            <h1 className="title">ShadowBase</h1>
            <p className="subtitle">Zero-Downtime Schema Migration Sandbox</p>
          </div>
        </div>

        <div className="status-badge-group">
          <span className={`pill ${backendStatus === "ONLINE" ? "pill-green" : "pill-red"}`}>
            Backend: {backendStatus}
          </span>
          <span className={`pill ${sandboxStatus === "RUNNING" ? "pill-green" : "pill-gray"}`}>
            Sandbox: {sandboxStatus}
          </span>
          <span className={`pill ${cdcStatus === "ONLINE" ? "pill-blue" : "pill-gray"}`}>
            CDC Pipeline: {cdcStatus}
          </span>
        </div>
      </header>

      <main className="content">
        <MetricsCards metrics={metrics} targetDatabase="sample_shop" />

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📦 Ephemeral MySQL Sandbox (Testcontainers)</h2>
          </div>

          <p className="card-desc">
            Spins up an isolated MySQL 8.0 Docker container on demand, 
            binds it to a dynamic free port, and seeds the <code>sample_shop</code> baseline schema.
          </p>

          <div className="info-grid">
            <div className="info-box">
              <span className="info-label">SANDBOX STATUS</span>
              <span className={`info-val ${sandboxStatus === "RUNNING" ? "text-green" : "text-gray"}`}>
                {sandboxStatus}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">DYNAMIC PORT</span>
              <span className="info-val font-mono">
                {containerDetails.mappedPort ? containerDetails.mappedPort : "Not Bound"}
              </span>
            </div>

            <div className="info-box">
              <span className="info-label">TARGET DATABASE</span>
              <span className="info-val font-mono">sample_shop</span>
            </div>

            <div className="info-box">
              <span className="info-label">CONTAINER ID</span>
              <span className="info-val font-mono" style={{ fontSize: "12px" }}>
                {containerDetails.containerId ? containerDetails.containerId.substring(0, 16) + "..." : "None"}
              </span>
            </div>
          </div>

          <div className="actions">
            {sandboxStatus !== "RUNNING" ? (
              <button
                className="btn btn-primary"
                onClick={handleStartContainer}
                disabled={isLoading || backendStatus !== "ONLINE"}
              >
                {sandboxStatus === "STARTING" ? "Spinning Up Docker..." : "🚀 Launch Sandbox Container"}
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={handleStopContainer}
                disabled={isLoading}
              >
                {sandboxStatus === "STOPPING" ? "Stopping..." : "🛑 Terminate Sandbox Container"}
              </button>
            )}

            <button className="btn btn-secondary" onClick={checkHealth} disabled={isLoading}>
              🔄 Ping Backend
            </button>
          </div>

          {containerDetails.message && (
            <div className="status-note">
              <strong>Status:</strong> {containerDetails.message}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📡 Mock CDC Pipeline (Kafka & Debezium)</h2>
          </div>

          <p className="card-desc">
            Orchestrates Mock Production MySQL (Port 3307 with ROW binlog), Zookeeper (2181), 
            Apache Kafka (9092), and Debezium Connect (8083).
          </p>

          <div className="info-grid">
            <div className="info-box">
              <span className="info-label">MOCK PROD MYSQL</span>
              <span className="info-val font-mono">Port {cdcDetails.mockDbPort} (ROW Binlog)</span>
            </div>

            <div className="info-box">
              <span className="info-label">KAFKA BROKER</span>
              <span className="info-val font-mono">localhost:{cdcDetails.kafkaPort}</span>
            </div>

            <div className="info-box">
              <span className="info-label">DEBEZIUM CONNECT</span>
              <span className="info-val font-mono">localhost:{cdcDetails.debeziumPort}</span>
            </div>

            <div className="info-box">
              <span className="info-label">STREAMING CDC TOPIC</span>
              <span className="info-val font-mono" style={{ fontSize: "11px" }}>
                {cdcDetails.cdcTopic}
              </span>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={checkCdcCluster}
              disabled={isLoading}
            >
              🔍 Ping Debezium Connect (:8083)
            </button>

            <button
              className="btn btn-primary"
              onClick={handleRegisterConnector}
              disabled={isLoading}
            >
              🚀 Register Debezium Connector
            </button>
          </div>
        </div>

        <MigrationEditor
          sqlScript={sqlScript}
          setSqlScript={setSqlScript}
          sandboxStatus={sandboxStatus}
          mappedPort={containerDetails.mappedPort}
          onExecuteMigration={handleExecuteMigration}
          isExecuting={isExecutingMigration}
          executionResult={migrationResult}
        />

        <ErrorTerminal
          logs={logs}
          onClearLogs={() => setLogs([])}
          throughput={throughput}
          onSeedTraffic={handleSeedTraffic}
          onSimulateTraffic={handleSimulateTraffic}
          isSimulating={isSimulatingTraffic}
          isStreamingCdc={isStreamingCdc}
          onToggleCdcStream={handleToggleCdcStream}
        />
      </main>

      <footer className="footer">
        ShadowBase • Zero-Downtime Schema Migration Sandbox • Clean Architecture
      </footer>
    </div>
  );
}

export default App;
