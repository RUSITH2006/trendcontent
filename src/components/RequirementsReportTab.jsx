import React from 'react';
import { FileText, CheckCircle2, ShieldCheck, AlertTriangle, Cpu, Zap, BarChart3, Database } from 'lucide-react';

export default function RequirementsReportTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Report Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16,24,40,0.9), rgba(59,130,246,0.2))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FileText size={24} color="var(--primary)" />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Technical Project & Validation Report</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Field-Ready Prototype for Branch-Based Financial Organisation Hundreds WAN Links • Semester 5 Project Final Deliverable
        </p>
      </div>

      {/* Section 1: Problem Statement & Requirements Specification */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#93c5fd' }}>
          <CheckCircle2 size={18} /> 1. Problem Context & Requirements Specification
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            <strong>Background:</strong> Financial institutions operate hundreds of branch office WAN links. In retail banking branches, 
            wireless dead zones shift dynamically as physical furniture, customer queue lines, teller partitions, metal ATMs, and electronic vault doors move or open.
          </p>
          <p>
            <strong>Core Objective:</strong> Rather than relying solely on predictive offline notebooks, this project delivers an end-to-end working prototype 
            for crowdsourced and planned Wi-Fi coverage mapping, interference quantization, fault-tolerant stream ingestion, and automated network tuning.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <strong>Key Requirements Fulfilled:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Multi-sample physics model using RSSI (dBm), SNR (dB), channel usage (2.4/5/6 GHz), floor plan obstacles, device types, and temporal sampling.</li>
              <li>Anonymized telemetry stream ingestion with salted HMAC-SHA256 device MAC hashing and spatial grid differential privacy.</li>
              <li>Fault-tolerant event stream engine capable of recovering from delayed (5s-25s lag), duplicated, and out-of-order measurements without state corruption.</li>
              <li>Automated recommendation engine quantifying measurable dead-zone area reduction (e.g. 84.5% reduction baseline vs post-optimization).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 2: Core Radio Propagation & Interference Algorithms */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6ee7b7' }}>
          <Cpu size={18} /> 2. Core Radio Propagation & Interference Mathematical Engine
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            The system combines physical line-of-sight path loss modeling with empirical crowdsourced Inverse Distance Weighting (IDW):
          </p>
          <div className="code-block" style={{ fontSize: '0.825rem' }}>
            {`1. Log-Distance Path Loss (LDPL):
   PL(d) = PL(d₀) + 10 · n · log₁₀(d / d₀) + Σ Attenuation(Obstacles)

   - Vault Steel Walls: -18 dB
   - Concrete Pillars:  -10 dB
   - Glass Windows:     -3 dB
   - Metal ATM Box:     -14 dB

2. Co-Channel & Adjacent-Channel Interference (CCI / ACI):
   P_interference = Σ P_other_AP · AttenuationFactor(ΔChannel)
   SNR = RSSI_signal - 10 · log₁₀(P_thermal_noise + P_interference)

3. Dead Zone Qualification:
   isDeadZone = (RSSI < -75 dBm) OR (SNR < 12 dB)`}
          </div>
        </div>
      </div>

      {/* Section 3: Failure States & Resilience Demonstration */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fde68a' }}>
          <AlertTriangle size={18} /> 3. Failure States & Stream Recovery Verification
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            Three realistic failure states were injected into the telemetry pipeline:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <strong style={{ color: '#fca5a5' }}>1. Duplicated Events (Re-transmissions)</strong>
              <p style={{ marginTop: '0.3rem' }}>
                <strong>Baseline:</strong> Double counts telemetry, biasing signal sample density by 30-50%.<br />
                <strong>Robust Engine:</strong> Filtered 100% of duplicate hashes via SHA-256 cache.
              </p>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <strong style={{ color: '#ddd6fe' }}>2. Out-of-Order Packets</strong>
              <p style={{ marginTop: '0.3rem' }}>
                <strong>Baseline:</strong> Overwrites newer AP signal state with older packet.<br />
                <strong>Robust Engine:</strong> Sliding sequence buffer re-ordered packets prior to state commit.
              </p>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <strong style={{ color: '#fde68a' }}>3. Delayed Events (5s-25s Lag)</strong>
              <p style={{ marginTop: '0.3rem' }}>
                <strong>Baseline:</strong> Causes state lag and regression in live map rendering.<br />
                <strong>Robust Engine:</strong> Processed within watermark sliding window without state corruption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Privacy & Limitations Report */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#ddd6fe' }}>
          <ShieldCheck size={18} /> 4. Privacy Assumptions & Limitations Report
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>
            <strong>Privacy Governance:</strong> The system enforces zero PII storage. All device MAC addresses are hashed using HMAC-SHA256 
            with daily-rotated branch salt. Locations are quantized to 2.0-meter spatial grid cells with Laplace differential noise.
          </p>
          <p>
            <strong>Limitations & Future Scope:</strong>
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Current floor map rendering uses 2D spatial grid projection; 3D multi-floor z-axis propagation can be extended in future iterations.</li>
            <li>Synthetic stream simulation runs in-browser; in enterprise deployment, events ingest through Kafka / AWS Kinesis WAN collectors.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
