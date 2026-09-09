import React, { useState } from 'react';
import { ShieldCheck, Lock, Hash, MapPin, CheckCircle2 } from 'lucide-react';
import { hashDeviceId, quantizeLocation } from '../engine/privacyEngine';

export default function PrivacyDocsTab() {
  const [testMac, setTestMac] = useState('00:1A:2C:3F:4E:56');
  const [testSalt, setTestSalt] = useState('FN-BR-7849-2026-PRIVACY-SALT-0909');
  const [rawX, setRawX] = useState(14.832);
  const [rawY, setRawY] = useState(8.219);

  const hashedDevice = hashDeviceId(testMac, testSalt);
  const quantized = quantizeLocation(rawX, rawY, 2.0, true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Privacy Overview Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16,24,40,0.85), rgba(16,185,129,0.15))' }}>
        <div className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={24} color="#34d399" /> Privacy Assumptions & Anonymization Engine
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          To comply with financial sector privacy standards (GDPR, CCPA, PCI-DSS), the telemetry engine strictly enforces 
          zero PII ingestion. MAC addresses are irreversibly hashed using salted HMAC-SHA256, and spatial location coordinates 
          are grid-binned with Laplace differential privacy noise.
        </p>
      </div>

      {/* Interactive Anonymization Sandbox */}
      <div className="dashboard-grid">
        {/* Device MAC Hashing */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Hash size={18} color="var(--primary)" /> Salted Device MAC Anonymizer
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                RAW DEVICE MAC ADDRESS (Client/Employee Device):
              </label>
              <input 
                type="text"
                value={testMac}
                onChange={(e) => setTestMac(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                BRANCH ROTATING SALT KEY:
              </label>
              <input 
                type="text"
                value={testSalt}
                onChange={(e) => setTestSalt(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div style={{ background: '#020617', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                ANONYMIZED HASHED TOKEN (STORED IN TELEMETRY DATABASE):
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontSize: '1rem', fontWeight: 600, wordBreak: 'break-all' }}>
                {hashedDevice}
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Location Differential Privacy */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} color="var(--accent-cyan)" /> Spatial Grid Binning & Differential Privacy
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Raw Exact X (meters):
                </label>
                <input 
                  type="number" step="0.1"
                  value={rawX}
                  onChange={(e) => setRawX(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Raw Exact Y (meters):
                </label>
                <input 
                  type="number" step="0.1"
                  value={rawY}
                  onChange={(e) => setRawY(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ background: '#020617', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Grid Cell Identifier:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{quantized.gridCellId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Quantized Location (2m Resolution):</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>({quantized.quantizedX}m, {quantized.quantizedY}m)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Architecture Report */}
      <div className="glass-card">
        <div className="card-title" style={{ marginBottom: '1rem' }}>
          Financial Privacy Governance Summary
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600, marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} /> Zero PII Storage
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No usernames, financial account numbers, phone numbers, or unhashed MAC addresses are persisted in any telemetry table.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600, marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} /> Daily Salt Key Rotation
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Branch salt keys are generated daily via HSM (Hardware Security Module) to prevent cross-day tracking of device movement.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600, marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} /> Location Differential Noise
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Spatial grid binning adds randomized Laplace noise offset, preventing triangulation of precise physical employee desktop positions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
