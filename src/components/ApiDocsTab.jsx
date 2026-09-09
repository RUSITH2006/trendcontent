import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, Copy } from 'lucide-react';
import { BRANCH_PRESETS } from '../data/branchPresets';

export default function ApiDocsTab() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('ingest');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    {
      id: 'ingest',
      method: 'POST',
      path: '/api/v1/telemetry/ingest',
      description: 'Ingest crowdsourced Wi-Fi measurements with automated HMAC device hashing and sliding window watermarking.',
      defaultBody: JSON.stringify({
        branchId: 'FN-BR-0104',
        deviceMac: '00:1B:44:11:A3:05',
        deviceType: 'Teller_POS',
        x: 12.5,
        y: 8.0,
        rssiDbm: -62,
        snrDb: 28,
        band: '5GHz',
        channel: 36
      }, null, 2)
    },
    {
      id: 'heatmap',
      method: 'GET',
      path: '/api/v1/branch/FN-BR-0104/heatmap',
      description: 'Fetch computed signal RSSI grid, interference parameters, and dead-zone boundaries for target branch WAN link.',
      defaultBody: null
    },
    {
      id: 'faults',
      method: 'POST',
      path: '/api/v1/fault-injection/trigger',
      description: 'Inject synthetic network faults (delayed, duplicated, out-of-order events) into stream ingestion pipeline.',
      defaultBody: JSON.stringify({
        duplicateRatio: 0.2,
        outOfOrderRatio: 0.15,
        delayRatio: 0.1
      }, null, 2)
    },
    {
      id: 'optimize',
      method: 'POST',
      path: '/api/v1/branch/FN-BR-0104/optimize',
      description: 'Trigger recommendation engine to reallocate AP channels and adjust power levels to minimize dead zones.',
      defaultBody: JSON.stringify({
        targetDeadZoneAreaPct: 2.5
      }, null, 2)
    }
  ];

  const current = endpoints.find(e => e.id === selectedEndpoint);

  const handleTestRun = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (selectedEndpoint === 'ingest') {
        setApiResponse({
          status: 200,
          statusText: 'OK',
          timestamp: new Date().toISOString(),
          data: {
            eventId: `evt_${Date.now()}`,
            anonymizedDeviceId: 'anon_e8f23c91a0b5',
            status: 'PROCESSED_SUCCESS',
            watermarkStatus: 'WATERMARK_IN_WINDOW',
            deduplicationCheck: 'PASSED'
          }
        });
      } else if (selectedEndpoint === 'heatmap') {
        setApiResponse({
          status: 200,
          statusText: 'OK',
          timestamp: new Date().toISOString(),
          data: {
            branchCode: 'FN-BR-0104',
            totalGridPoints: 600,
            deadZoneAreaM2: 24.5,
            deadZonePercentage: 12.25,
            accessPointsCount: 3,
            coChannelCollisions: 1
          }
        });
      } else if (selectedEndpoint === 'faults') {
        setApiResponse({
          status: 200,
          statusText: 'OK',
          timestamp: new Date().toISOString(),
          data: {
            faultInjectionActive: true,
            streamBufferWindowMs: 5000,
            simulatedFaultRatios: {
              duplicate: 0.2,
              outOfOrder: 0.15,
              delayed: 0.1
            }
          }
        });
      } else if (selectedEndpoint === 'optimize') {
        setApiResponse({
          status: 200,
          statusText: 'OK',
          timestamp: new Date().toISOString(),
          data: {
            recommendationsGenerated: 3,
            actionsProposed: [
              'Reassign AP-02 to 5GHz Channel 44',
              'Boost AP-01 Tx Power to 23 dBm',
              'Deploy Micro-Mesh AP near Vault Corridor'
            ],
            estimatedDeadZoneReductionPct: 84.5
          }
        });
      }
    }, 400);
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Code2 size={20} color="var(--primary)" /> API & Integration Stubs Explorer
          </div>
          <div className="card-subtitle">
            RESTful endpoints for financial WAN orchestration, telemetry ingestion, and automated network optimization
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Endpoint Selector List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {endpoints.map(ep => (
            <div 
              key={ep.id}
              onClick={() => { setSelectedEndpoint(ep.id); setApiResponse(null); }}
              style={{
                background: selectedEndpoint === ep.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${selectedEndpoint === ep.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <span className="badge" style={{
                  background: ep.method === 'POST' ? '#3b82f6' : '#10b981',
                  color: 'white'
                }}>
                  {ep.method}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {ep.path}
                </span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {ep.description}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Runner & Response Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>REQUEST TEST RUNNER</span>
            <button className="btn btn-primary btn-sm" onClick={handleTestRun} disabled={isLoading}>
              <Play size={12} /> {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

          {current.defaultBody && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                REQUEST PAYLOAD (JSON):
              </span>
              <pre className="code-block">{current.defaultBody}</pre>
            </div>
          )}

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              RESPONSE OUTPUT:
            </span>
            <pre className="code-block" style={{ minHeight: '160px', color: apiResponse ? '#34d399' : '#64748b' }}>
              {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click "Send Request" to test integration stub response...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
