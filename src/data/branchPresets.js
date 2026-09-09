/**
 * Financial Branch Scenarios & Architectural Layout Presets
 */

export const BRANCH_PRESETS = [
  {
    id: 'branch_a_downtown',
    name: 'Downtown Main Branch & Vault Hub',
    code: 'FN-BR-0104',
    width: 30,
    height: 20,
    wanLinkStatus: 'ONLINE',
    bandwidthMbps: 500,
    aps: [
      { id: 'ap_a1', name: 'AP-01 (Teller & Lobby)', x: 6, y: 5, band: '5GHz', channel: 36, txPowerDbm: 20 },
      { id: 'ap_a2', name: 'AP-02 (Vault & Records)', x: 22, y: 6, band: '5GHz', channel: 36, txPowerDbm: 20 }, // CCI Collision intentional
      { id: 'ap_a3', name: 'AP-03 (Executive Offices)', x: 15, y: 15, band: '2.4GHz', channel: 6, txPowerDbm: 21 }
    ],
    obstacles: [
      { id: 'obs_v1', type: 'VAULT_WALL', x1: 20, y1: 2, x2: 20, y2: 12 },
      { id: 'obs_v2', type: 'VAULT_WALL', x1: 20, y1: 12, x2: 28, y2: 12 },
      { id: 'obs_t1', type: 'TELLER_COUNTER', x1: 4, y1: 10, x2: 14, y2: 10 },
      { id: 'obs_g1', type: 'GLASS_PARTITION', x1: 10, y1: 12, x2: 10, y2: 18 },
      { id: 'obs_atm', type: 'ATM_ENCLOSURE', x1: 2, y1: 2, x2: 2, y2: 6 }
    ]
  },
  {
    id: 'branch_b_wealth',
    name: 'Westside Wealth Management Center',
    code: 'FN-BR-0219',
    width: 25,
    height: 15,
    wanLinkStatus: 'ONLINE',
    bandwidthMbps: 300,
    aps: [
      { id: 'ap_b1', name: 'AP-01 (Main Salon)', x: 8, y: 7, band: '5GHz', channel: 44, txPowerDbm: 20 },
      { id: 'ap_b2', name: 'AP-02 (Private Client Suites)', x: 18, y: 8, band: '5GHz', channel: 149, txPowerDbm: 18 }
    ],
    obstacles: [
      { id: 'obs_g1', type: 'GLASS_PARTITION', x1: 12, y1: 1, x2: 12, y2: 14 },
      { id: 'obs_g2', type: 'GLASS_PARTITION', x1: 12, y1: 7, x2: 24, y2: 7 },
      { id: 'obs_c1', type: 'CONCRETE_PILLAR', x1: 6, y1: 4, x2: 7, y2: 5 }
    ]
  },
  {
    id: 'branch_c_kiosk',
    name: 'Metro Kiosk & Self-Service ATM Center',
    code: 'FN-BR-0388',
    width: 15,
    height: 10,
    wanLinkStatus: 'DEGRADED',
    bandwidthMbps: 100,
    aps: [
      { id: 'ap_c1', name: 'AP-01 (Micro Hub)', x: 4, y: 5, band: '2.4GHz', channel: 1, txPowerDbm: 17 }
    ],
    obstacles: [
      { id: 'obs_a1', type: 'ATM_ENCLOSURE', x1: 8, y1: 2, x2: 8, y2: 8 },
      { id: 'obs_c1', type: 'CONCRETE_PILLAR', x1: 11, y1: 4, x2: 12, y2: 5 }
    ]
  }
];
