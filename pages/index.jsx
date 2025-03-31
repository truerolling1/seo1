import React, { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    setLoading(true);
    setReport(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, keywords: keywords.split(",").map(k => k.trim()) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Error running audit:", err);
      setReport({ error: "Failed to run audit. Please check the URL and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>SEO Rank & Audit Tool</h1>

      <input
        placeholder="Enter your website URL (e.g. https://groundupccs.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 4 }}
      />
      <input
        placeholder="Enter keywords (comma separated)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 4 }}
      />
      <button
        onClick={handleAudit}
        style={{ backgroundColor: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: 4 }}
        disabled={loading}
      >
        {loading ? "Auditing..." : "Run SEO Audit"}
      </button>

      {report && !report.error && (
        <div style={{ marginTop: 30, padding: 20, background: "#f9f9f9", borderRadius: 8 }}>
          <h2>Audit Report for {report.url}</h2>
          <p><strong>Keywords:</strong> {report.keywords.join(", ")}</p>
          <p><strong>Overall Score:</strong> {report.score}/100</p>
          <ul>
            {report.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {report?.error && (
        <div style={{ color: "red", marginTop: 20 }}>{report.error}</div>
      )}
    </div>
  );
}
