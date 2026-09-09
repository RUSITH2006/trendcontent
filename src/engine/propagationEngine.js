/**
 * Wi-Fi Propagation & Physical Radio Interference Engine
 * Implements Log-Distance Path Loss (LDPL), Obstacle Attenuation, 
 * Multi-frequency (2.4GHz, 5GHz, 6GHz) channel interference, and empirical IDW interpolation.
 */

export const FREQUENCY_BANDS = {
  '2.4GHz': { freqMHz: 2437, defaultPathLossExp: 2.7, txPowerDbm: 20 },
  '5GHz': { freqMHz: 5200, defaultPathLossExp: 3.2, txPowerDbm: 23 },
  '6GHz': { freqMHz: 6100, defaultPathLossExp: 3.6, txPowerDbm: 24 }
};

// Physical obstacles attenuation parameters (in dB)
export const OBSTACLE_TYPES = {
  VAULT_WALL: { name: 'Vault Steel Wall', attenuationDb: 18, color: '#ef4444' },
  CONCRETE_PILLAR: { name: 'Concrete Pillar', attenuationDb: 10, color: '#f59e0b' },
  GLASS_PARTITION: { name: 'Glass Window/Door', attenuationDb: 3, color: '#38bdf8' },
  ATM_ENCLOSURE: { name: 'Metal ATM Enclosure', attenuationDb: 14, color: '#a855f7' },
  TELLER_COUNTER: { name: 'Wood/Composite Counter', attenuationDb: 4, color: '#10b981' }
};

/**
 * Calculates free-space path loss at d0 = 1 meter
 */
export function calculateReferencePathLoss(freqMHz) {
  // Free-Space Path Loss (FSPL) formula: 20*log10(d) + 20*log10(f) - 27.55
  return 20 * Math.log10(1) + 20 * Math.log10(freqMHz) - 27.55;
}

/**
 * Computes line-of-sight obstacle attenuation between two points (x1, y1) and (x2, y2)
 */
export function calculateObstacleAttenuation(x1, y1, x2, y2, obstacles = []) {
  let totalAttenuation = 0;

  for (const obs of obstacles) {
    if (lineIntersectsSegment(x1, y1, x2, y2, obs.x1, obs.y1, obs.x2, obs.y2)) {
      const obstacleInfo = OBSTACLE_TYPES[obs.type] || { attenuationDb: 5 };
      totalAttenuation += obstacleInfo.attenuationDb;
    }
  }

  return totalAttenuation;
}

/**
 * Geometry helper: checks line segment intersection
 */
function lineIntersectsSegment(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator === 0) return false; // Parallel

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * Calculates RSSI at point (x, y) from an Access Point
 */
export function calculatePointRSSI(x, y, ap, obstacles = []) {
  const distMeters = Math.max(0.5, Math.hypot(ap.x - x, ap.y - y));
  const band = FREQUENCY_BANDS[ap.band] || FREQUENCY_BANDS['5GHz'];
  const txPower = ap.txPowerDbm ?? band.txPowerDbm;
  const pathLossExp = band.defaultPathLossExp;

  const referenceLoss = calculateReferencePathLoss(band.freqMHz);
  const distanceLoss = 10 * pathLossExp * Math.log10(distMeters);
  const obstacleLoss = calculateObstacleAttenuation(ap.x, ap.y, x, y, obstacles);

  const totalLoss = referenceLoss + distanceLoss + obstacleLoss;
  return txPower - totalLoss; // RSSI in dBm
}

/**
 * Computes Co-Channel and Adjacent-Channel Interference for a target AP & point
 */
export function calculateInterferenceAndSNR(x, y, primaryAp, allAps = [], obstacles = []) {
  const signalRSSI = calculatePointRSSI(x, y, primaryAp, obstacles);
  const thermalNoiseDbm = -95; // Standard thermal noise floor

  let interferencePowerMw = 0;

  for (const otherAp of allAps) {
    if (otherAp.id === primaryAp.id) continue;
    if (otherAp.band !== primaryAp.band) continue; // Different band

    const otherRSSI = calculatePointRSSI(x, y, otherAp, obstacles);
    const channelDiff = Math.abs(otherAp.channel - primaryAp.channel);

    let attenuationFactor = 0;
    if (channelDiff === 0) {
      // Co-Channel Interference (CCI) - 100% overlap
      attenuationFactor = 1.0;
    } else if (channelDiff === 1) {
      // Adjacent-Channel Interference (ACI)
      attenuationFactor = 0.5;
    } else if (channelDiff === 2) {
      attenuationFactor = 0.2;
    }

    if (attenuationFactor > 0) {
      // Convert dBm to mW
      const otherPowerMw = Math.pow(10, otherRSSI / 10);
      interferencePowerMw += otherPowerMw * attenuationFactor;
    }
  }

  const noisePowerMw = Math.pow(10, thermalNoiseDbm / 10);
  const totalNoisePlusInterferenceMw = noisePowerMw + interferencePowerMw;
  const noisePlusInterferenceDbm = 10 * Math.log10(totalNoisePlusInterferenceMw);

  const snr = signalRSSI - noisePlusInterferenceDbm;

  return {
    rssiDbm: signalRSSI,
    noiseFloorDbm: noisePlusInterferenceDbm,
    snrDb: snr,
    cciCount: allAps.filter(a => a.id !== primaryAp.id && a.band === primaryAp.band && a.channel === primaryAp.channel).length
  };
}

/**
 * IDW (Inverse Distance Weighting) empirical blending with crowdsourced measurements
 */
export function blendWithCrowdsourcedData(x, y, modelRSSI, telemetrySamples = [], maxRadius = 15) {
  if (!telemetrySamples || telemetrySamples.length === 0) return modelRSSI;

  let weightSum = 0;
  let weightedRSSI = 0;

  for (const sample of telemetrySamples) {
    const dist = Math.hypot(sample.x - x, sample.y - y);
    if (dist <= maxRadius) {
      const weight = 1 / Math.pow(dist + 0.5, 2);
      weightSum += weight;
      weightedRSSI += sample.rssiDbm * weight;
    }
  }

  if (weightSum === 0) return modelRSSI;

  const empiricalRSSI = weightedRSSI / weightSum;
  // Blend 60% physics model + 40% empirical telemetry
  return 0.6 * modelRSSI + 0.4 * empiricalRSSI;
}

/**
 * Evaluates whether a grid point is in a Dead Zone
 * Criteria: RSSI < -75 dBm OR SNR < 12 dB
 */
export function isDeadZone(rssiDbm, snrDb) {
  return rssiDbm < -75 || snrDb < 12;
}
