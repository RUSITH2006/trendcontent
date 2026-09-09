/**
 * Synthetic Dataset Exporter
 * Formats telemetry events and branch heatmap metadata into CSV or JSON files.
 */

export function exportDatasetToJSON(branch, events, recommendations) {
  const data = {
    exportTimestamp: new Date().toISOString(),
    branch: {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      dimensions: `${branch.width}m x ${branch.height}m`
    },
    aps: branch.aps,
    recommendationsSummary: recommendations,
    telemetryEvents: events
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `${branch.id}_telemetry_validation_dataset.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportDatasetToCSV(events) {
  if (!events || events.length === 0) return;

  const headers = ['Event ID', 'Sequence', 'Timestamp', 'Anonymized Device ID', 'Device Type', 'X (m)', 'Y (m)', 'RSSI (dBm)', 'SNR (dB)', 'Band', 'Channel', 'Fault Status'];
  
  const rows = events.map(e => [
    e.eventId,
    e.sequenceNumber,
    new Date(e.timestamp).toISOString(),
    e.anonymizedDeviceId || e.deviceMac,
    e.deviceType,
    e.x,
    e.y,
    e.rssiDbm,
    e.snrDb,
    e.band,
    e.channel,
    e.faultType || 'NORMAL'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `wifi_crowdsourced_telemetry_sample.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
