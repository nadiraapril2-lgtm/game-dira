import { HardwareItem } from '../types/game';

export const HARDWARE_CATALOG: HardwareItem[] = [
  // Server Racks
  {
    id: 'rack_12u',
    name: 'Rak 12U Wall/Floor Compact',
    category: 'rack',
    uSize: 12,
    price: 800,
    powerDrawWatts: 0,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 0,
    description: '12U open-frame steel rack for garage setups and boutique startups. Exactly as seen in Fase 1.',
    icon: 'Box',
    badge: 'Popular for Garage'
  },
  {
    id: 'rack_24u',
    name: 'Rak 24U Mid-Tower Enclosure',
    category: 'rack',
    uSize: 24,
    price: 1500,
    powerDrawWatts: 0,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 0,
    description: '24U sound-dampened server cabinet with mesh front door and cable management ducts.',
    icon: 'Layers'
  },
  {
    id: 'rack_42u',
    name: 'Rak 42U Enterprise Data Center Rack',
    category: 'rack',
    uSize: 42,
    price: 2800,
    powerDrawWatts: 0,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 0,
    description: 'Standard black 42U full-height datacenter rack with high-capacity PDU bays and vertical raceways.',
    icon: 'Server',
    badge: 'Enterprise Tier'
  },

  // Server Blades
  {
    id: 'blade_l1',
    name: 'Server Blade L1 (Quad-Core Xeon)',
    category: 'server',
    uSize: 2,
    price: 1200,
    powerDrawWatts: 180,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 250,
    description: 'Standard 2U blade module with redundant hot-swap power supplies and dual 1Gbps NICs.',
    icon: 'Cpu',
    badge: 'Fase 1 Match'
  },
  {
    id: 'blade_l2_pro',
    name: 'Server Blade L2 Pro (16-Core EPYC)',
    category: 'server',
    uSize: 2,
    price: 2200,
    powerDrawWatts: 320,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 650,
    description: 'High-throughput 2U server node for heavy database transactions and high-concurrency game matchmaking.',
    icon: 'Cpu'
  },
  {
    id: 'blade_quantum_ai',
    name: 'Server Blade Ultra (64-Core High Density)',
    category: 'server',
    uSize: 3,
    price: 3600,
    powerDrawWatts: 550,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 1400,
    description: 'Enterprise compute node engineered to withstand intense traffic bursts and large database loads.',
    icon: 'Zap',
    badge: 'High Compute'
  },

  // Networking
  {
    id: 'switch_gigabit',
    name: 'Switch Gigabit 16-Port',
    category: 'networking',
    uSize: 1,
    price: 400,
    powerDrawWatts: 25,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 1000,
    description: '1U unmanaged/managed Layer 2 Gigabit rack switch with RJ45 activity status LEDs.',
    icon: 'Network',
    badge: 'Fase 1 Match'
  },
  {
    id: 'switch_10g_managed',
    name: 'Managed Switch 10G SFP+ 24-Port',
    category: 'networking',
    uSize: 1,
    price: 1100,
    powerDrawWatts: 50,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 10000,
    description: 'Layer 3 managed enterprise switch with VLAN isolation, port mirroring, and hardware ACL filtering.',
    icon: 'Share2'
  },
  {
    id: 'router_core_gateway',
    name: 'Core Enterprise Router (RouterOS)',
    category: 'networking',
    uSize: 1,
    price: 850,
    powerDrawWatts: 45,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 5000,
    description: 'Edge firewall and packet filter unit supporting BGP, MikroTik-style CLI, and dynamic NAT rules.',
    icon: 'Radio'
  },

  // Cooling Units
  {
    id: 'cooling_fan_tray',
    name: 'Quad-Fan Rack Top Tray',
    category: 'cooling',
    uSize: 1,
    price: 250,
    powerDrawWatts: 30,
    coolingPowerBonus: 40,
    trafficCapacityMBs: 0,
    description: '1U exhaust fan tray equipped with 4 ball-bearing fans pulling hot exhaust out of rack upper slots.',
    icon: 'Wind'
  },
  {
    id: 'cooling_ac_precision',
    name: 'Precision In-Row Air Conditioner',
    category: 'cooling',
    uSize: 2,
    price: 1400,
    powerDrawWatts: 180,
    coolingPowerBonus: 140,
    trafficCapacityMBs: 0,
    description: 'Chilled-loop high CFM cooling unit with automatic thermal thermostat sensor, preventing rack overheat > 75°C.',
    icon: 'Snowflake',
    badge: 'Overheat Shield'
  },

  // Power / UPS
  {
    id: 'ups_1500va',
    name: 'UPS 1500VA Online Sine Wave',
    category: 'power',
    uSize: 2,
    price: 350,
    powerDrawWatts: 15,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 0,
    description: '2U true online double-conversion battery backup protecting hardware against brownouts and voltage surges.',
    icon: 'BatteryCharging',
    badge: 'Fase 1 Match'
  },
  {
    id: 'ups_redundant_enterprise',
    name: 'Dual-Feed Redundant UPS 3000VA',
    category: 'power',
    uSize: 3,
    price: 950,
    powerDrawWatts: 35,
    coolingPowerBonus: 0,
    trafficCapacityMBs: 0,
    description: 'High capacity battery storage with generator switchover and surge blackhole suppression.',
    icon: 'Battery'
  }
];
