import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8000";

const AGENTS = [
  {
    key: "searcher",
    icon: "⌕",
    title: "Searcher",
    desc: "Scanning the web",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.18)",
  },
  {
    key: "summarizer",
    icon: "◈",
    title: "Summarizer",
    desc: "Extracting facts",
    color: "#34d399",
    glow: "rgba(52,211,153,0.18)",
  },
  {
    key: "writer",
    icon: "✦",
    title: "Writer",
    desc: "Drafting report",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.18)",
  },
];

const SAMPLE_TOPICS = [
  "Quantum computing breakthroughs in 2024",
  "Future of large language models",
  "Advancements in RAG pipelines",
  "State of AI agents in production",
];

function AgentCard({ agent, status, log }) {
  const isActive = status === "active";
  const isDone = status === "done";

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "18px 16px",
        borderRadius: 16,
        border: `1px solid ${
          isActive
            ? agent.color + "55"
            : isDone
            ? agent.color + "33"
            : "#ffffff0f"
        }`,
        background: isActive
          ? agent.glow
          : isDone
          ? agent.glow.replace("0.18", "0.08")
          : "#ffffff05",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 0%, ${agent.glow} 0%, transparent 70%)`,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: isActive || isDone ? agent.color : "#ffffff30",
              transition: "color 0.3s",
              fontFamily: "serif",
            }}
          >
            {agent.icon}
          </span>
          {isActive && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: agent.color,
                animation: "blink 1s ease-in-out infinite",
                boxShadow: `0 0 8px ${agent.color}`,
              }}
            />
          )}
          {isDone && (
            <span style={{ color: agent.color, fontSize: 13, fontWeight: 500 }}>
              ✓
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isActive || isDone ? "#f1f5f9" : "#64748b",
            marginBottom: 3,
            letterSpacing: "0.02em",
          }}
        >
          {agent.title}
        </div>
        <div style={{ fontSize: 11, color: "#475569" }}>{agent.desc}</div>

        {log && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: agent.color + "cc",
              borderTop: `1px solid ${agent.color}22`,
              paddingTop: 8,
              lineHeight: 1.5,
            }}
          >
            {log}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportView({ report }) {
  const lines = report.split("\n");
  return (
    <div
      style={{
        fontFamily:
          "'Georgia', 'Times New Roman', serif",
        lineHeight: 1.8,
        color: "#e2e8f0",
      }}
    >
      {lines.map((line, i) => {
        if (line.startsWith("# "))
          return (
            <h1
              key={i}
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 12,
                marginTop: i > 0 ? 32 : 0,
                color: "#f8fafc",
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.01em",
              }}
            >
              {line.slice(2)}
            </h1>
          );
        if (line.startsWith("## "))
          return (
            <h2
              key={i}
              style={{
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 8,
                marginTop: 28,
                color: "#a78bfa",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: 11,
              }}
            >
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith("### "))
          return (
            <h3
              key={i}
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                marginTop: 20,
                color: "#cbd5e1",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {line.slice(4)}
            </h3>
          );
        if (line.match(/^\d+\./))
          return (
            <p
              key={i}
              style={{
                margin: "6px 0",
                paddingLeft: 0,
                fontSize: 14,
                color: "#cbd5e1",
                lineHeight: 1.75,
              }}
            >
              {line}
            </p>
          );
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <p
              key={i}
              style={{
                margin: "5px 0",
                paddingLeft: 16,
                fontSize: 14,
                color: "#94a3b8",
                lineHeight: 1.75,
                borderLeft: "2px solid #334155",
              }}
            >
              {line.slice(2)}
            </p>
          );
        if (line.startsWith("**Source"))
          return (
            <p
              key={i}
              style={{
                margin: "8px 0",
                fontSize: 12,
                color: "#a78bfa",
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {line.replace(/\*\*/g, "")}
            </p>
          );
        if (line.trim() === "")
          return <div key={i} style={{ height: 10 }} />;
        return (
          <p
            key={i}
            style={{
              margin: "5px 0",
              fontSize: 14,
              color: "#94a3b8",
              lineHeight: 1.8,
            }}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState("idle");
  const [agentStatus, setAgentStatus] = useState({
    searcher: "idle",
    summarizer: "idle",
    writer: "idle",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const reportRef = useRef(null);
  const textareaRef = useRef(null);

  const simulateAgentProgress = async () => {
    setAgentStatus({ searcher: "active", summarizer: "idle", writer: "idle" });
    await new Promise((r) => setTimeout(r, 2000));
    setAgentStatus({ searcher: "done", summarizer: "active", writer: "idle" });
    await new Promise((r) => setTimeout(r, 2500));
    setAgentStatus({ searcher: "done", summarizer: "done", writer: "active" });
  };

  const handleRun = async () => {
    if (!topic.trim()) return;
    setPhase("running");
    setResult(null);
    setError("");
    simulateAgentProgress();

    try {
      const res = await fetch(`${API_BASE}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setAgentStatus({ searcher: "done", summarizer: "done", writer: "done" });
      setResult(data);
      setPhase("done");
    } catch (e) {
      setError(
        e.message.includes("fetch")
          ? "Cannot connect to API server. Make sure uvicorn is running on port 8000."
          : e.message
      );
      setPhase("error");
      setAgentStatus({ searcher: "idle", summarizer: "idle", writer: "idle" });
    }
  };

  const handleCopy = () => {
    if (result?.final_report) {
      navigator.clipboard.writeText(result.final_report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setTopic("");
    setResult(null);
    setError("");
    setAgentStatus({ searcher: "idle", summarizer: "idle", writer: "idle" });
  };

  useEffect(() => {
    if (phase === "done" && reportRef.current) {
      setTimeout(
        () => reportRef.current.scrollIntoView({ behavior: "smooth" }),
        200
      );
    }
  }, [phase]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e2e8f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        ::selection { background: #a78bfa33; }
        textarea { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 52, animation: "fadeUp 0.6s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                boxShadow: "0 0 20px rgba(167,139,250,0.4)",
              }}
            >
              ✦
            </div>
            <span style={{ fontSize: 12, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
              Multi-Agent Research
            </span>
          </div>

          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              margin: "0 0 12px",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.15,
            }}
          >
            Research, distilled.
          </h1>
          <p style={{ fontSize: 15, color: "#475569", margin: 0, lineHeight: 1.6 }}>
            Three specialized AI agents collaborate in real-time to transform any topic into a structured, cited research report.
          </p>
        </div>

        {/* ── Agent Pipeline ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 36,
            animation: "fadeUp 0.6s 0.1s ease both",
          }}
        >
          {AGENTS.map((agent, i) => (
            <div
              key={agent.key}
              style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}
            >
              <AgentCard
                agent={agent}
                status={agentStatus[agent.key]}
                log={result?.logs?.[i]}
              />
              {i < AGENTS.length - 1 && (
                <div style={{ color: "#1e293b", fontSize: 18, flexShrink: 0, userSelect: "none" }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Input Card ── */}
        <div
          style={{
            background: "#0f1117",
            borderRadius: 20,
            border: "1px solid #1e293b",
            padding: "24px",
            marginBottom: 16,
            animation: "fadeUp 0.6s 0.2s ease both",
          }}
        >
          {/* Sample topics */}
          {phase === "idle" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {SAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTopic(t);
                    textareaRef.current?.focus();
                  }}
                  style={{
                    padding: "5px 12px",
                    fontSize: 12,
                    borderRadius: 20,
                    border: "1px solid #1e293b",
                    background: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#334155";
                    e.target.style.color = "#94a3b8";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#1e293b";
                    e.target.style.color = "#475569";
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && phase !== "running") {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder="Enter any research topic…"
            disabled={phase === "running"}
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0",
              fontSize: 16,
              fontFamily: "inherit",
              lineHeight: 1.6,
              border: "none",
              background: "transparent",
              color: "#f1f5f9",
              resize: "none",
              outline: "none",
              caretColor: "#a78bfa",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #1e293b",
            }}
          >
            <span style={{ fontSize: 12, color: "#334155" }}>
              {topic.length > 0 ? `${topic.length} chars · Enter to run` : "Shift+Enter for new line"}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              {phase !== "idle" && (
                <button
                  onClick={handleReset}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    borderRadius: 10,
                    border: "1px solid #1e293b",
                    background: "transparent",
                    color: "#475569",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  Reset
                </button>
              )}

              <button
                onClick={handleRun}
                disabled={phase === "running" || !topic.trim()}
                style={{
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  border: "1px solid transparent",
                  background:
                    phase === "running" || !topic.trim()
                      ? "#1e293b"
                      : "linear-gradient(135deg, #a78bfa, #818cf8)",
                  color:
                    phase === "running" || !topic.trim() ? "#334155" : "#fff",
                  cursor:
                    phase === "running" || !topic.trim()
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow:
                    phase !== "running" && topic.trim()
                      ? "0 0 20px rgba(167,139,250,0.3)"
                      : "none",
                }}
              >
                {phase === "running" ? (
                  <>
                    <div
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        border: "2px solid #ffffff40",
                        borderTopColor: "#fff",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Researching…
                  </>
                ) : (
                  "Run research ↗"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {phase === "error" && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid #7f1d1d55",
              background: "#7f1d1d18",
              color: "#fca5a5",
              fontSize: 13,
              marginBottom: 24,
              animation: "fadeUp 0.3s ease both",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* ── Result ── */}
        {phase === "done" && result && (
          <div
            ref={reportRef}
            style={{ animation: "fadeUp 0.5s ease both" }}
          >
            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                { label: "Sources", value: result.sources_count, color: "#a78bfa" },
                { label: "Agents", value: 3, color: "#34d399" },
                { label: "Status", value: "Complete", color: "#fb923c" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "#0f1117",
                    borderRadius: 14,
                    border: "1px solid #1e293b",
                    padding: "16px 18px",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Report card */}
            <div
              style={{
                background: "#0a0d14",
                borderRadius: 20,
                border: "1px solid #1e293b",
                overflow: "hidden",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid #1e293b",
                  background: "#0f1117",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#34d399",
                      boxShadow: "0 0 8px #34d399",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    Research report
                  </span>
                </div>

                <button
                  onClick={handleCopy}
                  style={{
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #1e293b",
                    background: copied ? "#14532d22" : "transparent",
                    color: copied ? "#34d399" : "#475569",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "✓ Copied" : "Copy markdown"}
                </button>
              </div>

              {/* Report body */}
              <div style={{ padding: "28px 32px" }}>
                <ReportView report={result.final_report} />
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 24px",
                  fontSize: 13,
                  borderRadius: 10,
                  border: "1px solid #1e293b",
                  background: "transparent",
                  color: "#475569",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#334155";
                  e.target.style.color = "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "#1e293b";
                  e.target.style.color = "#475569";
                }}
              >
                ← Research another topic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}