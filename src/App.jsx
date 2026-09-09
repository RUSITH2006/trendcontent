import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import FloorMapCanvas from './components/FloorMapCanvas';
import FaultInjectorPanel from './components/FaultInjectorPanel';
import RecommendationsTab from './components/RecommendationsTab';
import MetricsDashboard from './components/MetricsDashboard';
import PrivacyDocsTab from './components/PrivacyDocsTab';
import ApiDocsTab from './components/ApiDocsTab';
import RequirementsReportTab from './components/RequirementsReportTab';

import { BRANCH_PRESETS } from './data/branchPresets';
import { BaselineStreamEngine, RobustStreamEngine, generateSyntheticTelemetryBatch } from './engine/streamEngine';
import { analyzeBranchCoverage, generateRecommendations } from './engine/recommendationEngine';

export default function App() {
  const [selectedBranchId, setSelectedBranchId] = useState('branch_a_downtown');
  const [activeTab, setActiveTab] = useState('canvas');

  // Active Branch Config
  const currentBranch = BRANCH_PRESETS.find(b => b.id === selectedBranchId) || BRANCH_PRESETS[0];

  // Stream Fault Injection Configuration
  const [faultConfig, setFaultConfig] = useState({
    delayRatio: 0.1,
    duplicateRatio: 0.2,
    outOfOrderRatio: 0.15
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLogs, setStreamLogs] = useState([]);
  const [telemetryDevices, setTelemetryDevices] = useState([]);

  // Stream Processing Engines (Ref persistent)
  const baselineEngineRef = useRef(new BaselineStreamEngine());
  const robustEngineRef = useRef(new RobustStreamEngine(5000));

  const [baselineMetrics, setBaselineMetrics] = useState({ totalEventsReceived: 0, corruptedStateCount: 0 });
  const [robustMetrics, setRobustMetrics] = useState({
    totalEventsReceived: 0,
    duplicatesRejected: 0,
    outOfOrderResequenced: 0,
    delayedProcessed: 0,
    corruptedStateCount: 0
  });

  // Analyze Branch Coverage & Recommendations
  const initialAnalysis = analyzeBranchCoverage(currentBranch);
  const recommendations = generateRecommendations(currentBranch, initialAnalysis);

  // Real-Time Telemetry Stream Interval Loop
  useEffect(() => {
    let timer = null;

    if (isStreaming) {
      timer = setInterval(() => {
        const batch = generateSyntheticTelemetryBatch(currentBranch, 3, faultConfig);

        batch.forEach(rawEvt => {
          // Ingest into Baseline
          baselineEngineRef.current.ingest(rawEvt);

          // Ingest into Robust Engine
          const res = robustEngineRef.current.ingest(rawEvt);

          // Log entry
          const logItem = {
            ...res.event,
            faultType: rawEvt.faultType
          };

          setStreamLogs(prev => [...prev.slice(-40), logItem]);
        });

        // Update UI states
        setBaselineMetrics({
          totalEventsReceived: baselineEngineRef.current.totalEventsReceived,
          corruptedStateCount: baselineEngineRef.current.corruptedStateCount
        });

        setRobustMetrics({ ...robustEngineRef.current.metrics });

        // Update canvas device points
        const latestDevices = Array.from(robustEngineRef.current.deviceStates.values());
        setTelemetryDevices(latestDevices);

      }, 1200);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStreaming, currentBranch, faultConfig]);

  const handleResetStream = () => {
    baselineEngineRef.current.reset();
    robustEngineRef.current.reset();
    setStreamLogs([]);
    setTelemetryDevices([]);
    setBaselineMetrics({ totalEventsReceived: 0, corruptedStateCount: 0 });
    setRobustMetrics({
      totalEventsReceived: 0,
      duplicatesRejected: 0,
      outOfOrderResequenced: 0,
      delayedProcessed: 0,
      corruptedStateCount: 0
    });
  };

  return (
    <div className="app-container">
      <Header 
        selectedBranchId={selectedBranchId}
        onSelectBranch={(id) => { setSelectedBranchId(id); handleResetStream(); }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'canvas' && (
          <div className="dashboard-grid">
            <div className="glass-card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    Branch Floor Signal & Interference Visualizer
                  </div>
                  <div className="card-subtitle">
                    {currentBranch.name} ({currentBranch.width}m x {currentBranch.height}m) • {currentBranch.aps.length} Access Points Active
                  </div>
                </div>

                <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                  {initialAnalysis.deadZonePercentage}% Dead-Zones Detected
                </span>
              </div>

              <FloorMapCanvas 
                branchConfig={currentBranch} 
                telemetryDevices={telemetryDevices}
              />
            </div>

            <FaultInjectorPanel 
              isStreaming={isStreaming}
              onToggleStream={() => setIsStreaming(!isStreaming)}
              faultConfig={faultConfig}
              onUpdateFaultConfig={setFaultConfig}
              baselineMetrics={baselineMetrics}
              robustMetrics={robustMetrics}
              streamLogs={streamLogs}
              onResetStream={handleResetStream}
              currentBranch={currentBranch}
              telemetryEvents={streamLogs}
              recommendations={recommendations}
            />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsTab 
            branchConfig={currentBranch}
            initialAnalysis={initialAnalysis}
            recommendations={recommendations}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsDashboard 
            branchConfig={currentBranch}
            initialAnalysis={initialAnalysis}
            recommendations={recommendations}
            robustMetrics={robustMetrics}
            baselineMetrics={baselineMetrics}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyDocsTab />
        )}

        {activeTab === 'api' && (
          <ApiDocsTab />
        )}

        {activeTab === 'report' && (
          <RequirementsReportTab />
        )}
      </main>

      <footer style={{
        padding: '1rem 0',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '1rem'
      }}>
        Wi-Fi Coverage & Interference Mapper Prototype • Financial Organisation WAN Intelligence • Sem 5 IE28 Project
      </footer>
    </div>
  );
}
