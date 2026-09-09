/**
 * Fault-Tolerant Telemetry Stream Engine
 * Simulates crowdsourced & planned measurement streams.
 * Compares Naive Baseline Engine vs Robust Fault-Tolerant Engine under 
 * Delayed, Duplicated, and Out-of-Order network stream failure states.
 */

import { sanitizeTelemetryPayload } from './privacyEngine.js';

export class BaselineStreamEngine {
  constructor() {
    this.rawEvents = [];
    this.deviceStates = new Map(); // Direct overwrite map
    this.totalEventsReceived = 0;
    this.corruptedStateCount = 0;
  }

  ingest(event) {
    this.totalEventsReceived++;
    this.rawEvents.push(event);

    // Baseline vulnerability 1: No deduplication - duplicate events distort sample weight
    // Baseline vulnerability 2: Out-of-order - overwrites newer state with stale older packet
    const existing = this.deviceStates.get(event.anonymizedDeviceId);
    if (existing && existing.timestamp > event.timestamp) {
      // Out of order regression detected! Stale event overwrote fresh state.
      this.corruptedStateCount++;
    }

    this.deviceStates.set(event.anonymizedDeviceId, event);
  }

  reset() {
    this.rawEvents = [];
    this.deviceStates.clear();
    this.totalEventsReceived = 0;
    this.corruptedStateCount = 0;
  }
}

export class RobustStreamEngine {
  constructor(watermarkWindowMs = 5000) {
    this.watermarkWindowMs = watermarkWindowMs;
    this.seenEventIds = new Set(); // Deduplication cache
    this.reorderBuffer = []; // Sliding reorder buffer
    this.deviceStates = new Map(); // Clean state map
    
    this.metrics = {
      totalEventsReceived: 0,
      duplicatesRejected: 0,
      outOfOrderResequenced: 0,
      delayedProcessed: 0,
      corruptedStateCount: 0
    };
  }

  ingest(rawEvent) {
    const event = sanitizeTelemetryPayload(rawEvent);
    this.metrics.totalEventsReceived++;

    // 1. Deduplication Check (Idempotency)
    const dedupKey = `${event.anonymizedDeviceId}_seq_${event.sequenceNumber}`;
    if (this.seenEventIds.has(event.eventId) || this.seenEventIds.has(dedupKey)) {
      this.metrics.duplicatesRejected++;
      return { status: 'REJECTED_DUPLICATE', event };
    }

    this.seenEventIds.add(event.eventId);
    this.seenEventIds.add(dedupKey);

    // Cap cache size to prevent memory leak
    if (this.seenEventIds.size > 10000) {
      const firstItems = Array.from(this.seenEventIds).slice(0, 2000);
      firstItems.forEach(k => this.seenEventIds.delete(k));
    }

    // 2. Resequencing & Watermarking
    const isDelayed = (Date.now() - event.timestamp) > 2000;
    if (isDelayed) {
      this.metrics.delayedProcessed++;
    }

    // Insert into reorder buffer sorted by timestamp / sequenceNumber
    this.reorderBuffer.push(event);
    this.reorderBuffer.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    // Check if packet came out of order relative to buffer
    const lastBufferItem = this.reorderBuffer[this.reorderBuffer.length - 1];
    if (lastBufferItem.sequenceNumber < event.sequenceNumber) {
      this.metrics.outOfOrderResequenced++;
    }

    // 3. Process buffer up to watermark boundary
    const currentTime = Date.now();
    const watermark = currentTime - this.watermarkWindowMs;

    const readyEvents = [];
    const remainingBuffer = [];

    for (const bufEvent of this.reorderBuffer) {
      if (bufEvent.timestamp <= watermark || isDelayed || this.reorderBuffer.length > 20) {
        readyEvents.push(bufEvent);
      } else {
        remainingBuffer.push(bufEvent);
      }
    }

    this.reorderBuffer = remainingBuffer;

    // Apply state updates chronologically
    for (const readyEvt of readyEvents) {
      const current = this.deviceStates.get(readyEvt.anonymizedDeviceId);
      if (!current || readyEvt.sequenceNumber >= current.sequenceNumber) {
        this.deviceStates.set(readyEvt.anonymizedDeviceId, readyEvt);
      }
    }

    return { status: 'PROCESSED_SUCCESS', event };
  }

  reset() {
    this.seenEventIds.clear();
    this.reorderBuffer = [];
    this.deviceStates.clear();
    this.metrics = {
      totalEventsReceived: 0,
      duplicatesRejected: 0,
      outOfOrderResequenced: 0,
      delayedProcessed: 0,
      corruptedStateCount: 0
    };
  }
}

/**
 * Synthetic Telemetry Stream Generator with Fault Injection Capabilities
 */
export function generateSyntheticTelemetryBatch(branchConfig, count = 10, faultConfig = {}) {
  const { delayRatio = 0, duplicateRatio = 0, outOfOrderRatio = 0 } = faultConfig;
  const events = [];

  const deviceTypes = ['Mobile', 'ATM_Kiosk', 'Teller_POS', 'Workstation', 'IoT_Scanner'];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    const seq = i + 1;
    const deviceType = deviceTypes[i % deviceTypes.length];
    const mac = `00:1B:44:11:A3:${(i % 50).toString(16).padStart(2, '0')}`;
    
    // Pick random location in branch bounds
    const x = Math.floor(Math.random() * (branchConfig.width - 4)) + 2;
    const y = Math.floor(Math.random() * (branchConfig.height - 4)) + 2;

    const rssi = -45 - Math.floor(Math.random() * 40);
    const snr = Math.max(5, Math.floor(rssi + 95));

    let timestamp = baseTime + i * 100;
    let isDelayed = false;
    let isDuplicate = false;
    let isOutOfOrder = false;

    // Inject Faults
    if (Math.random() < delayRatio) {
      timestamp -= Math.floor(5000 + Math.random() * 20000); // 5s-25s lag
      isDelayed = true;
    }

    if (Math.random() < outOfOrderRatio) {
      timestamp -= Math.floor(Math.random() * 4000);
      isOutOfOrder = true;
    }

    const event = {
      eventId: `evt_${baseTime}_${seq}_${Math.random().toString(36).substring(2, 6)}`,
      sequenceNumber: seq,
      timestamp,
      deviceMac: mac,
      deviceType,
      x,
      y,
      rssiDbm: rssi,
      snrDb: snr,
      band: branchConfig.aps[i % branchConfig.aps.length]?.band || '5GHz',
      channel: branchConfig.aps[i % branchConfig.aps.length]?.channel || 36,
      faultType: isDelayed ? 'DELAYED' : (isOutOfOrder ? 'OUT_OF_ORDER' : 'NORMAL')
    };

    events.push(event);

    // Duplicate fault injection
    if (Math.random() < duplicateRatio) {
      const dupEvent = {
        ...event,
        faultType: 'DUPLICATE'
      };
      events.push(dupEvent);
    }
  }

  return events;
}
