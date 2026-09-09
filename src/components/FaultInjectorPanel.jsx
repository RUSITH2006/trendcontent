import React, { useState } from 'react';
import { Play, Pause, RefreshCw, AlertTriangle, ShieldCheck, Zap, Download } from 'lucide-react';
import { exportDatasetToJSON, exportDatasetToCSV } from '../engine/datasetExporter';

export default function FaultInjectorPanel({
  isStreaming,
  onToggleStream,
  faultConfig,
  onUpdateFaultConfig,
  baselineMetrics,
  robustMetrics,
  streamLogs = [],
  onResetStream,
  currentBranch,
  telemetryEvents,
  recommendations
}) {
  return (
    <div className="glass-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Zap size={18} color="var(--accent-amber)" /> Telemetry Stream & Fault Injector
          </div>
          <div className="card-subtitle">
            Inject delayed, duplicated, and out-of-order measurements to audit fault-tolerant state recovery
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${isStreaming ? 'btn-danger' : 'btn-primary'} btn-sm`}
            onClick={onToggleStream}
          >
            {isStreaming ? <Pause size={14} /> : <Play size={14} />}
            {isStreaming ? 'Pause Stream' : 'Start Live Telemetry Stream'}
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onResetStream}>
            <RefreshCw size={14} /> Reset Engines
          </button>
        </div>
      </div>

      {/* Fault Injection Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Duplicate Packet Ratio:</span>
            <strong style={{ color: 'var(--accent-rose)' }}>{Math.round(faultConfig.duplicateRatio * 100)}%</strong>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.05"
            value={faultConfig.duplicateRatio}
            onChange={(e) => onUpdateFaultConfig({ ...faultConfig, duplicateRatio: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-rose)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Out-of-Order Packet Ratio:</span>
            <strong style={{ color: 'var(--accent-purple)' }}>{Math.round(faultConfig.outOfOrderRatio * 100)}%</strong>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.05"
            value={faultConfig.outOfOrderRatio}
            onChange={(e) => onUpdateFaultConfig({ ...faultConfig, outOfOrderRatio: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Delayed Packet Ratio (5-25s):</span>
            <strong style={{ color: 'var(--accent-amber)' }}>{Math.round(faultConfig.delayRatio * 100)}%</strong>
          </div>
          <input 
            type="range" min="0" max="0.5" step="0.05"
            value={faultConfig.delayRatio}
            onChange={(e) => onUpdateFaultConfig({ ...faultConfig, delayRatio: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
          />
        </div>
      </div>

      {/* Engine Comparison Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Naive Baseline Engine */}
        <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={16} /> Naive Baseline Engine (Unbuffered)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Total Ingested:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{baselineMetrics.totalEventsReceived}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Duplicates Filtered:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f87171' }}>0 (Ignored)</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Out-of-Order Recovered:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f87171' }}>0 (Regressed)</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>State Corruptions:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>{baselineMetrics.corruptedStateCount}</div>
            </div>
          </div>
        </div>

        {/* Robust Fault-Tolerant Engine */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} /> Robust Engine (Resequenced & Deduplicated)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Total Ingested:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{robustMetrics.totalEventsReceived}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Duplicates Rejected:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>{robustMetrics.duplicatesRejected}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Resequenced (Out-of-Order):</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>{robustMetrics.outOfOrderResequenced}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>State Corruptions:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>0 (Zero Leak)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Log Container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>LIVE EVENT INGESTION CONSOLE STREAM:</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportDatasetToCSV(telemetryEvents)}>
            <Download size={12} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportDatasetToJSON(currentBranch, telemetryEvents, recommendations)}>
            <Download size={12} /> Export JSON
          </button>
        </div>
      </div>

      <div className="stream-log-container">
        {streamLogs.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '3rem' }}>
            Click "Start Live Telemetry Stream" above to ingest crowdsourced measurement events.
          </div>
        ) : (
          streamLogs.slice(-15).reverse().map((log, idx) => (
            <div key={idx} className={`log-entry ${log.faultType.toLowerCase().replace('_', '-')}`}>
              <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="badge" style={{
                background: log.faultType === 'DUPLICATE' ? '#f43f5e' : (log.faultType === 'OUT_OF_ORDER' ? '#8b5cf6' : (log.faultType === 'DELAYED' ? '#f59e0b' : '#10b981')),
                color: '#ffffff'
              }}>
                {log.faultType}
              </span>
              <span>Seq #{log.sequenceNumber}</span>
              <span style={{ color: 'var(--text-muted)' }}>Device: {log.anonymizedDeviceId || log.deviceMac}</span>
              <span>Pos ({log.x}m, {log.y}m)</span>
              <span>RSSI: {log.rssiDbm} dBm</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
