import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, RefreshCcw } from 'lucide-react';
import FloorMapCanvas from './FloorMapCanvas';
import { applyRecommendations } from '../engine/recommendationEngine';

export default function RecommendationsTab({ branchConfig, initialAnalysis, recommendations }) {
  const [appliedRecIds, setAppliedRecIds] = useState([]);

  const toggleRecommendation = (id) => {
    if (appliedRecIds.includes(id)) {
      setAppliedRecIds(appliedRecIds.filter(rId => rId !== id));
    } else {
      setAppliedRecIds([...appliedRecIds, id]);
    }
  };

  const applyAll = () => {
    setAppliedRecIds(recommendations.map(r => r.id));
  };

  const resetAll = () => {
    setAppliedRecIds([]);
  };

  // Compute Post-Optimization State
  const activeRecs = recommendations.filter(r => appliedRecIds.includes(r.id));
  const { updatedConfig, postAnalysis } = applyRecommendations(branchConfig, activeRecs);

  const initialDeadZonePct = initialAnalysis.deadZonePercentage;
  const postDeadZonePct = postAnalysis.deadZonePercentage;

  const areaReductionPct = initialDeadZonePct > 0 
    ? Number((((initialDeadZonePct - postDeadZonePct) / initialDeadZonePct) * 100).toFixed(1))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Metrics Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16,24,40,0.85), rgba(30,58,138,0.3))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div className="card-title">
              <Sparkles size={20} color="var(--primary)" /> Automated Wi-Fi Optimization Engine
            </div>
            <div className="card-subtitle">
              Generates AP channel re-allocations, Tx power tuning, and placement adjustments to eliminate dead zones
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={applyAll}>
              <CheckCircle2 size={14} /> Apply All Recommendations ({recommendations.length})
            </button>
            <button className="btn btn-secondary btn-sm" onClick={resetAll}>
              <RefreshCcw size={14} /> Reset to Baseline
            </button>
          </div>
        </div>

        <div className="metrics-row">
          <div className="metric-card">
            <span className="metric-label">Baseline Dead-Zone Area</span>
            <div className="metric-value" style={{ color: '#f87171' }}>
              {initialAnalysis.deadZoneAreaM2} <span className="metric-unit">m² ({initialDeadZonePct}%)</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Target Target Ceiling</span>
            <div className="metric-value" style={{ color: '#38bdf8' }}>
              &lt; 5.0 <span className="metric-unit">m² (&lt; 2.5%)</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Measured Post-Optimization Result</span>
            <div className="metric-value" style={{ color: '#34d399' }}>
              {postAnalysis.deadZoneAreaM2} <span className="metric-unit">m² ({postDeadZonePct}%)</span>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Validated Dead-Zone Reduction</span>
            <div className="metric-value" style={{ color: areaReductionPct > 50 ? '#34d399' : '#fbbf24' }}>
              {areaReductionPct > 0 ? `-${areaReductionPct}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Map Comparison or Interactive List */}
      <div className="dashboard-grid">
        {/* Recommendation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card-title" style={{ fontSize: '1rem' }}>
            Actionable Network Recommendations ({recommendations.length})
          </div>

          {recommendations.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No critical wireless dead zones or interference collisions detected for this branch!
            </div>
          ) : (
            recommendations.map((rec) => {
              const isApplied = appliedRecIds.includes(rec.id);
              return (
                <div 
                  key={rec.id} 
                  className="glass-card"
                  style={{
                    borderLeft: `4px solid ${rec.severity === 'CRITICAL' ? '#f43f5e' : (rec.severity === 'HIGH' ? '#f59e0b' : '#3b82f6')}`,
                    background: isApplied ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span className="badge" style={{
                        background: rec.severity === 'CRITICAL' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)',
                        color: rec.severity === 'CRITICAL' ? '#fecdd3' : '#fde68a',
                        marginRight: '0.5rem'
                      }}>
                        {rec.severity}
                      </span>
                      <strong style={{ fontSize: '0.95rem' }}>{rec.title}</strong>
                    </div>

                    <button 
                      className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      onClick={() => toggleRecommendation(rec.id)}
                    >
                      {isApplied ? 'Revert Action' : 'Apply Recommendation'}
                    </button>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {rec.description}
                  </p>

                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                      👉 {rec.action}
                    </span>
                    {rec.estimatedDeadZoneReductionPct && (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>
                        Est. Reduction: -{rec.estimatedDeadZoneReductionPct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Post-Optimization Heatmap Preview */}
        <div className="glass-card">
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <div className="card-title" style={{ fontSize: '1rem' }}>
              Optimized Signal Heatmap Preview
            </div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
              {activeRecs.length} Active Tuning Actions
            </span>
          </div>

          <FloorMapCanvas branchConfig={updatedConfig} telemetryDevices={[]} />
        </div>
      </div>
    </div>
  );
}
