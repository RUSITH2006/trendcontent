/**
 * Automated Wi-Fi Recommendation & Optimization Engine
 * Scans branch signal maps for dead zones and channel interference collisions, 
 * then generates actionable network tuning steps and quantifies dead-zone reduction.
 */

import { calculatePointRSSI, calculateInterferenceAndSNR, isDeadZone } from './propagationEngine.js';

export function analyzeBranchCoverage(branchConfig) {
  const { width, height, aps, obstacles } = branchConfig;
  const step = 1.0; // 1-meter grid resolution

  let totalGridPoints = 0;
  let deadZonePoints = 0;
  let lowSnrPoints = 0;

  const deadZoneCells = [];
  const cciCollisions = [];

  // Check Co-channel interference collisions between APs
  for (let i = 0; i < aps.length; i++) {
    for (let j = i + 1; j < aps.length; j++) {
      if (aps[i].band === aps[j].band && aps[i].channel === aps[j].channel) {
        cciCollisions.push({ ap1: aps[i], ap2: aps[j], band: aps[i].band, channel: aps[i].channel });
      }
    }
  }

  // Grid scan
  for (let x = 1; x < width; x += step) {
    for (let y = 1; y < height; y += step) {
      totalGridPoints++;

      // Find strongest AP at this coordinate
      let maxRSSI = -120;
      let bestAp = aps[0];

      for (const ap of aps) {
        const rssi = calculatePointRSSI(x, y, ap, obstacles);
        if (rssi > maxRSSI) {
          maxRSSI = rssi;
          bestAp = ap;
        }
      }

      const metrics = calculateInterferenceAndSNR(x, y, bestAp, aps, obstacles);
      
      if (isDeadZone(metrics.rssiDbm, metrics.snrDb)) {
        deadZonePoints++;
        deadZoneCells.push({ x, y, rssi: metrics.rssiDbm, snr: metrics.snrDb });
      }

      if (metrics.snrDb < 12) {
        lowSnrPoints++;
      }
    }
  }

  const deadZonePercentage = (deadZonePoints / totalGridPoints) * 100;
  const deadZoneAreaM2 = deadZonePoints * (step * step);

  return {
    totalGridPoints,
    deadZonePoints,
    deadZoneAreaM2,
    deadZonePercentage: Number(deadZonePercentage.toFixed(1)),
    lowSnrPoints,
    cciCollisions,
    deadZoneCells
  };
}

export function generateRecommendations(branchConfig, analysisResult) {
  const recommendations = [];
  const { aps } = branchConfig;
  const { cciCollisions, deadZonePercentage, deadZoneAreaM2 } = analysisResult;

  // 1. Resolve Co-Channel Interference (CCI)
  if (cciCollisions.length > 0) {
    cciCollisions.forEach((col, idx) => {
      const suggestedChannel = col.band === '2.4GHz' ? 11 : (col.channel === 36 ? 44 : 149);
      recommendations.push({
        id: `rec_cci_${idx}`,
        type: 'CHANNEL_REASSIGNMENT',
        severity: 'HIGH',
        title: `Reassign AP Channel (${col.ap2.name})`,
        description: `Co-Channel Collision detected between ${col.ap1.name} and ${col.ap2.name} on ${col.band} Channel ${col.channel}.`,
        action: `Shift ${col.ap2.name} to non-overlapping Channel ${suggestedChannel}.`,
        targetApId: col.ap2.id,
        newChannel: suggestedChannel,
        estimatedSnrGainDb: 6.5
      });
    });
  }

  // 2. Power Level Tuning for Dead Zones near existing APs
  if (deadZonePercentage > 5) {
    const lowPowerAp = aps.find(a => (a.txPowerDbm ?? 20) < 23);
    if (lowPowerAp) {
      recommendations.push({
        id: `rec_power_${lowPowerAp.id}`,
        type: 'TX_POWER_BOOST',
        severity: 'MEDIUM',
        title: `Increase Transmit Power (${lowPowerAp.name})`,
        description: `Sub-optimal RSSI detected in coverage perimeter around ${lowPowerAp.name}.`,
        action: `Boost ${lowPowerAp.name} Tx Power from ${lowPowerAp.txPowerDbm || 20} dBm to 23 dBm.`,
        targetApId: lowPowerAp.id,
        newTxPowerDbm: 23,
        estimatedRssiGainDbm: 3.0
      });
    }
  }

  // 3. Physical Relocation or Addition of Micro-Mesh Node
  if (deadZonePercentage > 12) {
    recommendations.push({
      id: 'rec_add_ap',
      type: 'ADD_MICRO_AP',
      severity: 'CRITICAL',
      title: 'Deploy Micro-Mesh AP near Vault & Teller Corridor',
      description: `High wall attenuation around vault/teller area creates a ${deadZoneAreaM2} m² (${deadZonePercentage}%) dead zone.`,
      action: 'Install additional 5GHz Micro-AP (AP-04) operating on Channel 157.',
      newAp: {
        id: 'ap_micro_04',
        name: 'AP-04 (Vault Micro)',
        x: Math.floor(branchConfig.width * 0.75),
        y: Math.floor(branchConfig.height * 0.7),
        band: '5GHz',
        channel: 157,
        txPowerDbm: 20
      },
      estimatedDeadZoneReductionPct: 82.0
    });
  }

  return recommendations;
}

export function applyRecommendations(branchConfig, activeRecommendations = []) {
  const updatedAps = JSON.parse(JSON.stringify(branchConfig.aps));

  for (const rec of activeRecommendations) {
    if (rec.type === 'CHANNEL_REASSIGNMENT') {
      const target = updatedAps.find(a => a.id === rec.targetApId);
      if (target) target.channel = rec.newChannel;
    } else if (rec.type === 'TX_POWER_BOOST') {
      const target = updatedAps.find(a => a.id === rec.targetApId);
      if (target) target.txPowerDbm = rec.newTxPowerDbm;
    } else if (rec.type === 'ADD_MICRO_AP') {
      if (!updatedAps.some(a => a.id === rec.newAp.id)) {
        updatedAps.push(rec.newAp);
      }
    }
  }

  const updatedConfig = {
    ...branchConfig,
    aps: updatedAps
  };

  const postAnalysis = analyzeBranchCoverage(updatedConfig);

  return {
    updatedConfig,
    postAnalysis
  };
}
