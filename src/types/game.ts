export type GamePhase = 
  | 'phase1_planning'      // Fase 1: Kontrak & Perencanaan
  | 'phase2_hardware'      // Fase 2: Instalasi & Kabel
  | 'phase2_logic'         // Fase 2 (Logika): Konfigurasi Jaringan (Tablet)
  | 'phase3_crisis'        // Fase 3: Krisis! DDoS Attack & Overheat
  | 'phase4_evaluation';   // Fase 4: Evaluasi & Ekspansi

export type OfficeLevel = 'garage' | 'coworking' | 'datacenter';

export type CharacterGender = 'male' | 'female';

export type HardwareCategory = 'rack' | 'server' | 'networking' | 'cooling' | 'power';

export interface HardwareItem {
  id: string;
  name: string;
  category: HardwareCategory;
  uSize: number; // rack units occupied (1U, 2U, 4U, or 12U/24U/42U rack capacity)
  price: number;
  powerDrawWatts: number;
  coolingPowerBonus: number; // for cooling units
  trafficCapacityMBs: number; // for servers/switches
  description: string;
  icon: string;
  badge?: string;
}

export interface InstalledComponent {
  slotU: number; // U slot position in rack (e.g. 1 to 12)
  hardware: HardwareItem;
  id: string;
}

export interface CableConnection {
  id: string;
  type: 'patch_blue' | 'fiber_green' | 'power_black';
  fromComponentId: string;
  toComponentId: string;
  fromLabel: string;
  toLabel: string;
}

export interface ClientContract {
  id: string;
  clientType: string;
  clientName: string;
  avatar: string;
  initialGoal: string;
  budget: number;
  hardwareRequirements: {
    minRackUnits: number;
    minBlades: number;
    requiresSwitch: boolean;
    requiresUps: boolean;
    minCooling: number;
  };
  coreNetworkRequirement: string;
  hiddenCrisisEvent: string;
  crisisType: 'ddos' | 'overheat' | 'dual';
  vlanId: number;
  requiredSubnet: string;
}

export interface NetworkConfig {
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  vlanId: number;
  vlanEnabled: boolean;
  firewallEnabled: boolean;
  firewallRule: 'open' | 'basic' | 'strict_antiddos';
  rateLimitMBs: number;
}

export interface TelemetryPoint {
  time: number;
  trafficMBs: number;
  temperatureC: number;
  cpuLoadPercent: number;
}

export interface GameState {
  cash: number;
  reputation: number; // 1.0 to 5.0
  officeLevel: OfficeLevel;
  currentPhase: GamePhase;
  activeContract: ClientContract;
  inventory: HardwareItem[];
  selectedRackSize: 12 | 24 | 42;
  installedComponents: InstalledComponent[];
  cables: CableConnection[];
  networkConfig: NetworkConfig;
  terminalLogs: string[];
  
  // Crisis simulation state
  crisisActive: boolean;
  crisisResolved: boolean;
  crisisProgress: number; // 0 to 100%
  coolingOverdrive: boolean;
  firewallActive: boolean;
  upsStabilized: boolean;
  currentTempC: number;
  currentTrafficMBs: number;
  
  // Audio state
  soundEnabled: boolean;
}
