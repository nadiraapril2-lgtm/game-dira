import { ClientContract } from '../types/game';

export const INITIAL_CONTRACTS: ClientContract[] = [
  {
    id: 'contract_xyz',
    clientType: 'Indie Game Studio',
    clientName: 'Startup Game XYZ',
    avatar: 'game',
    initialGoal: 'Perlu server rendah latensi untuk multiplayer matchmaking & lobby backend game RPG anime.',
    budget: 5000,
    hardwareRequirements: {
      minRackUnits: 12,
      minBlades: 1,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 40
    },
    coreNetworkRequirement: 'VLAN 100 configured, Port 80/443 firewall filter, 1Gbps Bandwidth, Subnet 192.168.10.0/24',
    hiddenCrisisEvent: 'Serangan DDoS botnet mendadak (800MB/s) & suhu rak melonjak hingga 82°C!',
    crisisType: 'dual',
    vlanId: 100,
    requiredSubnet: '192.168.10.0/24'
  },
  {
    id: 'contract_warkop',
    clientType: 'UMKM & Cafe',
    clientName: 'Warkop WiFi Santai 24 Jam',
    avatar: 'coffee',
    initialGoal: 'Membangun infrastruktur Wi-Fi publik berkapasitas 50 pengunjung dengan isolasi jaringan tamu & captive portal.',
    budget: 2800,
    hardwareRequirements: {
      minRackUnits: 12,
      minBlades: 1,
      requiresSwitch: true,
      requiresUps: false,
      minCooling: 20
    },
    coreNetworkRequirement: 'VLAN ID: 20 (Guest Wi-Fi), Subnet 192.168.20.0/24, DNS Caching',
    hiddenCrisisEvent: 'Lonjakan pengunduh file berlebihan membebani server dan suhu garasi meningkat!',
    crisisType: 'overheat',
    vlanId: 20,
    requiredSubnet: '192.168.20.0/24'
  },
  {
    id: 'contract_vtuber',
    clientType: 'Streaming & Media Agency',
    clientName: 'Starlight Live VTuber Studio',
    avatar: 'video',
    initialGoal: 'Studio live stream 4K 60FPS multicam tanpa frame drop dengan bit rate 50Mbps & server RTMP lokal.',
    budget: 7200,
    hardwareRequirements: {
      minRackUnits: 12,
      minBlades: 2,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 60
    },
    coreNetworkRequirement: 'VLAN ID: 77 (Streaming RTMP), QoS prioritaskan Video Feed UDP, Subnet 192.168.77.0/24',
    hiddenCrisisEvent: 'Buffer underrun & serangan DDoS sabotase kompetitor tepat saat konser debut 3D live!',
    crisisType: 'dual',
    vlanId: 77,
    requiredSubnet: '192.168.77.0/24'
  },
  {
    id: 'contract_esports',
    clientType: 'E-Sports LAN Center',
    clientName: 'Nexus Cyber Arena',
    avatar: 'trophy',
    initialGoal: 'Server game turnamen LAN sub-2ms ping dengan QoS prioritas paket game UDP & anti-cheat engine sync.',
    budget: 9500,
    hardwareRequirements: {
      minRackUnits: 24,
      minBlades: 2,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 80
    },
    coreNetworkRequirement: 'VLAN ID: 50 (Gaming Arena), QoS UDP low-latency, Subnet 192.168.50.0/24',
    hiddenCrisisEvent: 'Serangan DDoS dari lawan saat partai grand final turnamen live stream!',
    crisisType: 'ddos',
    vlanId: 50,
    requiredSubnet: '192.168.50.0/24'
  },
  {
    id: 'contract_factory',
    clientType: 'Smart Logistics & IoT',
    clientName: 'TransLogistik Robotik Warehousing',
    avatar: 'factory',
    initialGoal: 'Jaringan 500+ sensor RFID gudang & armada robot AGV otomatis dengan MQTT edge broker lokal.',
    budget: 11500,
    hardwareRequirements: {
      minRackUnits: 24,
      minBlades: 2,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 80
    },
    coreNetworkRequirement: 'VLAN ID: 88 (IoT Telemetry), Firewall port MQTT 1883, Subnet 172.16.88.0/24',
    hiddenCrisisEvent: 'Interferensi elektromagnetik genset pabrik memicu lonjakan panas ekstrem pada rak switch!',
    crisisType: 'overheat',
    vlanId: 88,
    requiredSubnet: '172.16.88.0/24'
  },
  {
    id: 'contract_hospital',
    clientType: 'Healthcare & MedTech',
    clientName: 'RS Medika Sehat Sentosa',
    avatar: 'hospital',
    initialGoal: 'Pusat data radiologi PACS (CT-Scan/MRI) real-time dengan enkripsi medis HIPAA & proteksi daya zero-drop.',
    budget: 14000,
    hardwareRequirements: {
      minRackUnits: 24,
      minBlades: 3,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 100
    },
    coreNetworkRequirement: 'VLAN ID: 120 (Medical PACS), Port 104 DICOM Encryption, Subnet 10.12.0.0/24',
    hiddenCrisisEvent: 'Fluktuasi daya PLN & serangan brute-force ransomware pada gerbang server medis!',
    crisisType: 'dual',
    vlanId: 120,
    requiredSubnet: '10.12.0.0/24'
  },
  {
    id: 'contract_bank',
    clientType: 'Fintech & Core Banking',
    clientName: 'Bank MegaArtha Digital',
    avatar: 'bank',
    initialGoal: 'Cluster server database transaksi perbankan dengan redundansi dual UPS dan hardware firewall tingkat tinggi.',
    budget: 16000,
    hardwareRequirements: {
      minRackUnits: 42,
      minBlades: 3,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 120
    },
    coreNetworkRequirement: 'VLAN ID: 200 (Secure DB), Firewall Rule blocking unapproved ports, Subnet 10.50.10.0/24',
    hiddenCrisisEvent: 'Serangan SYN-Flood DDoS terkoordinasi 950MB/s dan lonjakan beban pendingin AC!',
    crisisType: 'dual',
    vlanId: 200,
    requiredSubnet: '10.50.10.0/24'
  },
  {
    id: 'contract_ai_lab',
    clientType: 'AI & Machine Learning',
    clientName: 'DeepNeural AI Compute Lab',
    avatar: 'cpu',
    initialGoal: 'Cluster compute training model AI lokal dengan transfer data paralel 10Gbps & pendinginan loop chiller cair.',
    budget: 22000,
    hardwareRequirements: {
      minRackUnits: 42,
      minBlades: 3,
      requiresSwitch: true,
      requiresUps: true,
      minCooling: 140
    },
    coreNetworkRequirement: 'VLAN ID: 300 (AI Training Cluster), MTU 9000 Jumbo Frames, Subnet 10.99.0.0/24',
    hiddenCrisisEvent: 'Thermal runaway lonjakan daya GPU 1200W yang mengancam integritas seluruh modul rack!',
    crisisType: 'overheat',
    vlanId: 300,
    requiredSubnet: '10.99.0.0/24'
  }
];
