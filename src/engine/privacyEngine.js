/**
 * Privacy & Anonymization Engine
 * Implements salted device ID hashing (HMAC-SHA256 simulation) and 
 * spatial grid binning for Location Differential Privacy.
 */

// Simulated branch salt (rotates daily in production)
const BRANCH_SALT = 'FN-BR-7849-2026-PRIVACY-SALT-0909';

/**
 * Fast synchronous string hash simulating HMAC-SHA256 for browser runtime
 */
export function hashDeviceId(macAddress, salt = BRANCH_SALT) {
  if (!macAddress) return 'anon_device_000';
  const str = `${salt}:${macAddress.toLowerCase().trim()}`;
  let hash1 = 0x811c9dc5;
  let hash2 = 0x1000193;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hash1 ^= charCode;
    hash1 = Math.imul(hash1, 16777619);
    hash2 ^= charCode;
    hash2 = Math.imul(hash2, 314159265);
  }

  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `anon_${hex1}${hex2}`;
}

/**
 * Location Differential Privacy: Quantizes raw (x,y) coordinates to discrete spatial grid bins
 * plus optional random Laplace noise offset
 */
export function quantizeLocation(x, y, gridResolutionMeters = 2.0, injectLaplaceNoise = false) {
  let binX = Math.round(x / gridResolutionMeters) * gridResolutionMeters;
  let binY = Math.round(y / gridResolutionMeters) * gridResolutionMeters;

  if (injectLaplaceNoise) {
    // Generate Laplace random noise: b = 0.5 meters scale factor
    const u = Math.random() - 0.5;
    const b = 0.5;
    const noiseX = -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    const noiseY = -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    binX += noiseX;
    binY += noiseY;
  }

  return {
    quantizedX: Number(binX.toFixed(2)),
    quantizedY: Number(binY.toFixed(2)),
    gridCellId: `cell_${Math.floor(binX)}_${Math.floor(binY)}`
  };
}

/**
 * Privacy Compliance Schema Validator
 */
export function sanitizeTelemetryPayload(rawPayload) {
  const anonymizedId = hashDeviceId(rawPayload.deviceMac || rawPayload.deviceId);
  const location = quantizeLocation(rawPayload.x, rawPayload.y, 2.0, true);

  return {
    eventId: rawPayload.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sequenceNumber: rawPayload.sequenceNumber,
    timestamp: rawPayload.timestamp || Date.now(),
    anonymizedDeviceId: anonymizedId,
    deviceType: rawPayload.deviceType || 'Mobile',
    x: location.quantizedX,
    y: location.quantizedY,
    gridCellId: location.gridCellId,
    rssiDbm: rawPayload.rssiDbm,
    snrDb: rawPayload.snrDb,
    band: rawPayload.band || '5GHz',
    channel: rawPayload.channel || 36,
    timeOfDaySample: rawPayload.timeOfDaySample || 'PEAK_HOURS'
  };
}
