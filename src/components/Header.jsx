import React from 'react';
import { Wifi, Activity, ShieldCheck, Cpu, BarChart3, Code2, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BRANCH_PRESETS } from '../data/branchPresets';

export default function Header({ selectedBranchId, onSelectBranch, activeTab, onSelectTab }) {
  const currentBranch = BRANCH_PRESETS.find(b => b.id === selectedBranchId) || BRANCH_PRESETS[0];

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <Wifi size={24} />
        </div>
        <div>
          <div className="brand-title">Wi-Fi Coverage & WAN Intelligence Mapper</div>
          <div className="brand-subtitle">Branch Financial Organisation • Real-Time Dead-Zone & Interference Engine</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="branch-select-wrap">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BRANCH:</span>
          <select 
            className="branch-select" 
            value={selectedBranchId} 
            onChange={(e) => onSelectBranch(e.target.value)}
          >
            {BRANCH_PRESETS.map(b => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className={`status-pill ${currentBranch.wanLinkStatus === 'ONLINE' ? 'online' : 'degraded'}`}>
          <span className="status-dot"></span>
          <span>WAN LINK: {currentBranch.wanLinkStatus} ({currentBranch.bandwidthMbps} Mbps)</span>
        </div>
      </div>

      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
          onClick={() => onSelectTab('canvas')}
        >
          <Cpu size={16} /> Heatmap & Stream
        </button>

        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => onSelectTab('recommendations')}
        >
          <Activity size={16} /> Recommendations
        </button>

        <button 
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => onSelectTab('metrics')}
        >
          <BarChart3 size={16} /> Metrics & Error Analysis
        </button>

        <button 
          className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => onSelectTab('privacy')}
        >
          <ShieldCheck size={16} /> Privacy & Anonymization
        </button>

        <button 
          className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => onSelectTab('api')}
        >
          <Code2 size={16} /> API Integration Stubs
        </button>

        <button 
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => onSelectTab('report')}
        >
          <FileText size={16} /> Project Documentation
        </button>
      </nav>
    </header>
  );
}
