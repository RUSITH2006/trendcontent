import React, { useRef, useEffect, useState } from 'react';
import { Layers, Eye, Radio, ShieldAlert, Cpu, ZoomIn } from 'lucide-react';
import { calculatePointRSSI, calculateInterferenceAndSNR, isDeadZone, OBSTACLE_TYPES } from '../engine/propagationEngine';

export default function FloorMapCanvas({ branchConfig, telemetryDevices = [] }) {
  const canvasRef = useRef(null);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showInterference, setShowInterference] = useState(false);
  const [showDeadZones, setShowDeadZones] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);
  const [showAPs, setShowAPs] = useState(true);
  const [showDevices, setShowDevices] = useState(true);

  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const widthPx = canvas.width;
    const heightPx = canvas.height;

    const scaleX = widthPx / branchConfig.width;
    const scaleY = heightPx / branchConfig.height;

    ctx.clearRect(0, 0, widthPx, heightPx);

    // 1. Render Signal Heatmap or Interference Map
    if (showHeatmap || showInterference) {
      const stepMeters = 0.5; // Grid resolution
      const cols = Math.floor(branchConfig.width / stepMeters);
      const rows = Math.floor(branchConfig.height / stepMeters);

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = (c + 0.5) * stepMeters;
          const y = (r + 0.5) * stepMeters;

          // Strongest AP calculation
          let maxRSSI = -120;
          let primaryAp = branchConfig.aps[0];

          for (const ap of branchConfig.aps) {
            const rssi = calculatePointRSSI(x, y, ap, branchConfig.obstacles);
            if (rssi > maxRSSI) {
              maxRSSI = rssi;
              primaryAp = ap;
            }
          }

          const metrics = calculateInterferenceAndSNR(x, y, primaryAp, branchConfig.aps, branchConfig.obstacles);
          const isDead = isDeadZone(metrics.rssiDbm, metrics.snrDb);

          const pxX = c * stepMeters * scaleX;
          const pxY = r * stepMeters * scaleY;
          const cellW = stepMeters * scaleX + 0.5;
          const cellH = stepMeters * scaleY + 0.5;

          if (showInterference) {
            // Render Interference / SNR Map
            const snr = metrics.snrDb;
            if (snr >= 25) {
              ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // High SNR green
            } else if (snr >= 15) {
              ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // Good blue
            } else if (snr >= 10) {
              ctx.fillStyle = 'rgba(245, 158, 11, 0.5)'; // Moderate amber
            } else {
              ctx.fillStyle = 'rgba(244, 63, 94, 0.6)'; // Heavy interference red
            }
          } else if (showHeatmap) {
            // Render RSSI Heatmap
            // RSSI range: -30 (strong) to -90 (weak)
            const norm = Math.min(1, Math.max(0, (maxRSSI + 90) / 60));
            const hue = norm * 120; // 0 = red (-90), 120 = green (-30)
            ctx.fillStyle = `hsla(${hue}, 85%, 45%, 0.45)`;
          }

          ctx.fillRect(pxX, pxY, cellW, cellH);

          // Overlay Dead-Zone Hatching
          if (showDeadZones && isDead) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
            ctx.fillRect(pxX, pxY, cellW, cellH);

            // Red border dot
            ctx.fillStyle = '#f87171';
            ctx.fillRect(pxX + cellW / 2 - 1, pxY + cellH / 2 - 1, 2, 2);
          }
        }
      }
    }

    // 2. Render Grid Guidelines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= branchConfig.width; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x * scaleX, 0);
      ctx.lineTo(x * scaleX, heightPx);
      ctx.stroke();
    }
    for (let y = 0; y <= branchConfig.height; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y * scaleY);
      ctx.lineTo(widthPx, y * scaleY);
      ctx.stroke();
    }

    // 3. Render Architectural Obstacles (Vaults, Pillars, Glass, ATMs)
    if (showObstacles && branchConfig.obstacles) {
      for (const obs of branchConfig.obstacles) {
        const obsInfo = OBSTACLE_TYPES[obs.type] || { name: obs.type, color: '#94a3b8' };
        ctx.strokeStyle = obsInfo.color;
        ctx.lineWidth = obs.type === 'VAULT_WALL' ? 8 : (obs.type === 'ATM_ENCLOSURE' ? 6 : 4);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(obs.x1 * scaleX, obs.y1 * scaleY);
        ctx.lineTo(obs.x2 * scaleX, obs.y2 * scaleY);
        ctx.stroke();

        // Label obstacle type
        const midX = ((obs.x1 + obs.x2) / 2) * scaleX;
        const midY = ((obs.y1 + obs.y2) / 2) * scaleY;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(obsInfo.name, midX + 6, midY - 6);
      }
    }

    // 4. Render Crowdsourced Telemetry Device Points
    if (showDevices && telemetryDevices) {
      for (const dev of telemetryDevices) {
        const pxX = dev.x * scaleX;
        const pxY = dev.y * scaleY;

        ctx.beginPath();
        ctx.arc(pxX, pxY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = dev.deviceType === 'ATM_Kiosk' ? '#c084fc' : (dev.deviceType === 'Teller_POS' ? '#34d399' : '#38bdf8');
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    }

    // 5. Render Access Points (APs)
    if (showAPs && branchConfig.aps) {
      for (const ap of branchConfig.aps) {
        const pxX = ap.x * scaleX;
        const pxY = ap.y * scaleY;

        // Signal Ripple Pulse
        ctx.beginPath();
        ctx.arc(pxX, pxY, 18, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // AP Icon Dot
        ctx.beginPath();
        ctx.arc(pxX, pxY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label AP Name & Channel
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(ap.name, pxX + 12, pxY - 4);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${ap.band} • CH ${ap.channel} (${ap.txPowerDbm ?? 20}dBm)`, pxX + 12, pxY + 10);
      }
    }

  }, [branchConfig, telemetryDevices, showHeatmap, showInterference, showDeadZones, showObstacles, showAPs, showDevices]);

  // Handle Mouse Move for Signal Hover Inspection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = canvas.width / branchConfig.width;
    const scaleY = canvas.height / branchConfig.height;

    const meterX = Number((clickX / scaleX).toFixed(1));
    const meterY = Number((clickY / scaleY).toFixed(1));

    if (meterX >= 0 && meterX <= branchConfig.width && meterY >= 0 && meterY <= branchConfig.height) {
      let maxRSSI = -120;
      let primaryAp = branchConfig.aps[0];

      for (const ap of branchConfig.aps) {
        const rssi = calculatePointRSSI(meterX, meterY, ap, branchConfig.obstacles);
        if (rssi > maxRSSI) {
          maxRSSI = rssi;
          primaryAp = ap;
        }
      }

      const metrics = calculateInterferenceAndSNR(meterX, meterY, primaryAp, branchConfig.aps, branchConfig.obstacles);
      const isDead = isDeadZone(metrics.rssiDbm, metrics.snrDb);

      setHoverInfo({
        x: meterX,
        y: meterY,
        rssiDbm: Math.round(metrics.rssiDbm),
        snrDb: Math.round(metrics.snrDb),
        primaryAp: primaryAp.name,
        channel: primaryAp.channel,
        band: primaryAp.band,
        isDeadZone: isDead
      });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="canvas-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: 'auto' }}>
          <Layers size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Floor Map Layers & Filters:</span>
        </div>

        <button 
          className={`toggle-btn ${showHeatmap ? 'active' : ''}`}
          onClick={() => { setShowHeatmap(!showHeatmap); if (!showHeatmap) setShowInterference(false); }}
        >
          <Eye size={14} /> RSSI Signal Heatmap
        </button>

        <button 
          className={`toggle-btn ${showInterference ? 'active' : ''}`}
          onClick={() => { setShowInterference(!showInterference); if (!showInterference) setShowHeatmap(false); }}
        >
          <Radio size={14} /> Interference / SNR Map
        </button>

        <button 
          className={`toggle-btn ${showDeadZones ? 'active' : ''}`}
          onClick={() => setShowDeadZones(!showDeadZones)}
        >
          <ShieldAlert size={14} /> Dead-Zones (&lt; -75dBm)
        </button>

        <button 
          className={`toggle-btn ${showObstacles ? 'active' : ''}`}
          onClick={() => setShowObstacles(!showObstacles)}
        >
          <Cpu size={14} /> Obstacles & Vault Walls
        </button>

        <button 
          className={`toggle-btn ${showDevices ? 'active' : ''}`}
          onClick={() => setShowDevices(!showDevices)}
        >
          <ZoomIn size={14} /> Telemetry Devices ({telemetryDevices.length})
        </button>
      </div>

      <div className="canvas-wrapper" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverInfo(null)}>
        <canvas ref={canvasRef} width={960} height={540} />

        {hoverInfo && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(9, 13, 22, 0.9)',
            border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1rem',
            fontSize: '0.8rem',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Location: </span>
              <strong>X: {hoverInfo.x}m, Y: {hoverInfo.y}m</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>RSSI: </span>
              <strong style={{ color: hoverInfo.rssiDbm > -70 ? '#34d399' : (hoverInfo.rssiDbm > -75 ? '#fbbf24' : '#f87171') }}>
                {hoverInfo.rssiDbm} dBm
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>SNR: </span>
              <strong>{hoverInfo.snrDb} dB</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Primary AP: </span>
              <span>{hoverInfo.primaryAp} (CH {hoverInfo.channel})</span>
            </div>
            {hoverInfo.isDeadZone && (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                DEAD ZONE
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div>💡 Move mouse across map to inspect localized radio signal physics.</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ color: '#ef4444' }}>■ Vault Wall (-18dB)</span>
          <span style={{ color: '#f59e0b' }}>■ Concrete Pillar (-10dB)</span>
          <span style={{ color: '#38bdf8' }}>■ Glass Partition (-3dB)</span>
          <span style={{ color: '#a855f7' }}>■ ATM Enclosure (-14dB)</span>
        </div>
      </div>
    </div>
  );
}
