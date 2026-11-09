/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GamePhase,
  OfficeLevel,
  CharacterGender,
  ClientContract,
  HardwareItem,
  InstalledComponent,
  CableConnection,
  NetworkConfig,
} from './types/game';
import { INITIAL_CONTRACTS } from './data/contracts';
import { HARDWARE_CATALOG } from './data/hardwareCatalog';
import { Navbar } from './components/Navbar';
import { IsometricRoom } from './components/IsometricRoom';
import { Phase1Planning } from './components/Phase1Planning';
import { Phase2HardwareRack } from './components/Phase2HardwareRack';
import { Phase2LogicTablet } from './components/Phase2LogicTablet';
import { Phase3Crisis } from './components/Phase3Crisis';
import { Phase4Evaluation } from './components/Phase4Evaluation';
import { PromptStudioModal } from './components/PromptStudioModal';
import { NameCustomizerModal } from './components/NameCustomizerModal';
import { Sparkles, Edit3 } from 'lucide-react';
import { sound } from './utils/audio';

export default function App() {
  // Game progression state
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('phase1_planning');
  const [officeLevel, setOfficeLevel] = useState<OfficeLevel>('garage');
  const [characterGender, setCharacterGender] = useState<CharacterGender>('male');
  const [cash, setCash] = useState<number>(5000);
  const [reputation, setReputation] = useState<number>(4.8);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState<boolean>(false);

  // Custom Player Name, Studio Name & Room Neon Theme Color
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('dc_tycoon_player_name') || 'Nadira';
    } catch {
      return 'Nadira';
    }
  });
  const [studioName, setStudioName] = useState<string>(() => {
    try {
      return localStorage.getItem('dc_tycoon_studio_name') || 'Nadira Cyber Lab';
    } catch {
      return 'Nadira Cyber Lab';
    }
  });
  const [neonThemeColor, setNeonThemeColor] = useState<string>(() => {
    try {
      return localStorage.getItem('dc_tycoon_neon_color') || '#00f5ff';
    } catch {
      return '#00f5ff';
    }
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);

  // Contracts
  const [contracts, setContracts] = useState<ClientContract[]>(INITIAL_CONTRACTS);
  const [activeContract, setActiveContract] = useState<ClientContract>(INITIAL_CONTRACTS[0]);

  // Inventory & Hardware
  const [inventory, setInventory] = useState<HardwareItem[]>(() => {
    // Default initial cart matching Fase 1 in image_0.png
    return [
      HARDWARE_CATALOG.find((h) => h.id === 'rack_12u')!,
      HARDWARE_CATALOG.find((h) => h.id === 'blade_l1')!,
      HARDWARE_CATALOG.find((h) => h.id === 'switch_gigabit')!,
      HARDWARE_CATALOG.find((h) => h.id === 'ups_1500va')!,
    ].filter(Boolean);
  });
  const [selectedRackSize, setSelectedRackSize] = useState<12 | 24 | 42>(12);
  const [installedComponents, setInstalledComponents] = useState<InstalledComponent[]>([]);
  const [cables, setCables] = useState<CableConnection[]>([]);

  // Network Logic State
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    ipAddress: '192.168.10.1/24',
    subnetMask: '255.255.255.0',
    gateway: '192.168.10.254',
    vlanId: 100,
    vlanEnabled: true,
    firewallEnabled: true,
    firewallRule: 'basic',
    rateLimitMBs: 1000,
  });
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'NetOS (TM) v7.14 Enterprise Boot sequence complete.',
    'System ready on /dev/ttyS0. Type "help" for command syntax.',
    '> /ip address add address=192.168.10.1/24 interface=ether1',
    '[OK] Address 192.168.10.1/24 assigned to ether1',
    '> /interface vlan add name=vlan100 vlan-id=100 interface=ether2',
    '[OK] VLAN 100 tagged on ether2',
  ]);

  // Crisis simulation state (as in Fase 3 of image_0.png)
  const [currentTempC, setCurrentTempC] = useState<number>(32.0);
  const [currentTrafficMBs, setCurrentTrafficMBs] = useState<number>(45.0);
  const [coolingOverdrive, setCoolingOverdrive] = useState<boolean>(false);
  const [firewallActive, setFirewallActive] = useState<boolean>(false);
  const [upsStabilized, setUpsStabilized] = useState<boolean>(false);
  const [crisisResolved, setCrisisResolved] = useState<boolean>(false);

  // Sound toggle sync
  useEffect(() => {
    sound.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Phase 3 Crisis Simulation Loop (Driven by Unity C# logic from Prompt 3)
  useEffect(() => {
    if (currentPhase !== 'phase3_crisis') {
      return;
    }

    const interval = setInterval(() => {
      // 1. Traffic simulation: DDoS burst spikes to ~800MB/s, dropped to ~35MB/s once firewall mitigation is active!
      setCurrentTrafficMBs((prev) => {
        if (firewallActive) {
          // Traffic drops to healthy rate
          return Math.max(35, prev - 60 + (Math.random() * 8 - 4));
        } else {
          // Spikes up towards 800 - 850 MB/s (matching image_0.png 800MB/S)
          return Math.min(840, Math.max(780, prev + (800 - prev) * 0.4 + (Math.random() * 20 - 10)));
        }
      });

      // 2. Temperature simulation:
      // T rises with traffic load and blade count, cooling power decreases it
      setCurrentTempC((prev) => {
        const bladeCount = Math.max(1, installedComponents.filter((c) => c.hardware.category === 'server').length);
        const coolingPower = (coolingOverdrive ? 160 : 45);

        // Heat generation based on C# logic
        const heatGen = (bladeCount * 14) * (currentTrafficMBs / 200);
        const heatDissipation = coolingPower * 0.7;

        let delta = (heatGen - heatDissipation) * 0.08;

        if (coolingOverdrive && firewallActive) {
          delta = -1.8; // Fast cool down once crisis actions are applied
        }

        const next = Math.max(26.0, Math.min(92.0, prev + delta));
        return next;
      });

      // 3. Check crisis resolution conditions:
      // When temperature drops below 72°C and traffic dropped below 150MB/s
      if (firewallActive && coolingOverdrive && currentTempC < 72 && currentTrafficMBs < 150) {
        if (!crisisResolved) {
          setCrisisResolved(true);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [currentPhase, firewallActive, coolingOverdrive, currentTempC, currentTrafficMBs, installedComponents, crisisResolved]);

  // Inventory handlers
  const handleAddHardware = (item: HardwareItem) => {
    if (item.category === 'rack') {
      setSelectedRackSize(item.uSize as 12 | 24 | 42);
    }
    setInventory((prev) => [...prev, item]);
  };

  const handleRemoveHardware = (index: number) => {
    setInventory((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  // Rack Mounting Handlers
  const handleMountHardware = (hardware: HardwareItem, slotU: number) => {
    const newComponent: InstalledComponent = {
      slotU,
      hardware,
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setInstalledComponents((prev) => [...prev, newComponent]);
  };

  const handleUnmountHardware = (componentId: string) => {
    setInstalledComponents((prev) => prev.filter((c) => c.id !== componentId));
    setCables((prev) => prev.filter((c) => c.fromComponentId !== componentId && c.toComponentId !== componentId));
  };

  const handleAddCable = (cable: CableConnection) => {
    setCables((prev) => [...prev, cable]);
  };

  const handleRemoveCable = (cableId: string) => {
    setCables((prev) => prev.filter((c) => c.id !== cableId));
  };

  // Auto-assemble helper for quick play
  const handleAutoAssemble = () => {
    const newInstalled: InstalledComponent[] = [];
    let currentSlot = 1;

    // Racks typically mount routers/switches top, blades middle, UPS bottom
    const sorted = [...inventory].sort((a, b) => {
      const order = { networking: 1, server: 2, cooling: 3, power: 4, rack: 5 };
      return (order[a.category] || 9) - (order[b.category] || 9);
    });

    sorted.forEach((item) => {
      if (item.category === 'rack') return;
      if (currentSlot + item.uSize <= selectedRackSize + 1) {
        newInstalled.push({
          slotU: currentSlot,
          hardware: item,
          id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        });
        currentSlot += item.uSize;
      }
    });

    setInstalledComponents(newInstalled);

    // Auto-create basic cables
    if (newInstalled.length >= 2) {
      const firstBlade = newInstalled.find((c) => c.hardware.category === 'server');
      const firstSwitch = newInstalled.find((c) => c.hardware.category === 'networking');
      const firstUps = newInstalled.find((c) => c.hardware.category === 'power');

      const newCables: CableConnection[] = [];
      if (firstBlade && firstSwitch) {
        newCables.push({
          id: `cable_${Date.now()}_1`,
          type: 'patch_blue',
          fromComponentId: firstBlade.id,
          toComponentId: firstSwitch.id,
          fromLabel: firstBlade.hardware.name,
          toLabel: firstSwitch.hardware.name,
        });
      }
      if (firstBlade && firstUps) {
        newCables.push({
          id: `cable_${Date.now()}_2`,
          type: 'power_black',
          fromComponentId: firstBlade.id,
          toComponentId: firstUps.id,
          fromLabel: firstBlade.hardware.name,
          toLabel: firstUps.hardware.name,
        });
      }
      setCables(newCables);
    }
  };

  // Launch Server into Phase 3 (Crisis live simulation!)
  const handleGoLive = () => {
    setCurrentTempC(78.5); // Starts in overheat warning > 75°C
    setCurrentTrafficMBs(800.0); // Spikes to 800MB/s DDoS
    setCoolingOverdrive(false);
    setFirewallActive(false);
    setUpsStabilized(false);
    setCrisisResolved(false);
    setCurrentPhase('phase3_crisis');
  };

  // Phase 4 victory completion
  const handleProceedToEvaluation = () => {
    const reward = Math.floor(activeContract.budget * 1.5);
    setCash((prev) => prev + reward);
    setReputation((prev) => Math.min(5.0, prev + 0.1));
    setCurrentPhase('phase4_evaluation');
  };

  // Restart / Next contract
  const handleStartNewContract = () => {
    // Pick next contract
    const nextIdx = (contracts.findIndex((c) => c.id === activeContract.id) + 1) % contracts.length;
    const nextContract = contracts[nextIdx];
    setActiveContract(nextContract);
    setCurrentPhase('phase1_planning');
  };

  // Handle imported AI ticket from Prompt Studio
  const handleImportGeneratedTicket = (ticket: ClientContract) => {
    setContracts((prev) => [ticket, ...prev]);
    setActiveContract(ticket);
    setCurrentPhase('phase1_planning');
    setIsPromptStudioOpen(false);
  };

  const bladeCount = installedComponents.filter((c) => c.hardware.category === 'server').length;

  return (
    <div className="min-h-screen bg-[#121418] text-slate-100 flex flex-col">
      {/* Top Navigation Bar with strict 3-zone contract */}
      <Navbar
        currentPhase={currentPhase}
        onSelectPhase={(phase) => {
          sound.playClick();
          setCurrentPhase(phase);
        }}
        cash={cash}
        reputation={reputation}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenPromptStudio={() => {
          sound.playClick();
          setIsPromptStudioOpen(true);
        }}
        onResetGame={() => {
          setCash(5000);
          setReputation(4.8);
          setCurrentPhase('phase1_planning');
        }}
        playerName={playerName}
        studioName={studioName}
        onOpenNameModal={() => setIsNameModalOpen(true)}
      />

      {/* Main Game Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Personalized Welcome & Request Nama Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/40 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30 shrink-0 text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-white">
                  Data Center: <span className="text-amber-300 underline decoration-amber-400/60 font-black">{studioName}</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm font-bold text-cyan-300">
                  Lead Arsitek: {playerName}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Nama kamu terpampang langsung di plang neon dinding 3D, layar komputer, dan disapa oleh karakter Maya/Rian!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setIsNameModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 active:scale-95 transition-all shrink-0 ml-auto sm:ml-0 border border-amber-300"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Request / Ganti Nama</span>
            <Edit3 className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>

        {/* Isometric Low-Poly 3D Viewport Header (The visual anchor matching image_0.png) */}
        <div className="w-full">
          <IsometricRoom
            phase={currentPhase}
            officeLevel={officeLevel}
            tempC={currentTempC}
            trafficMBs={currentTrafficMBs}
            crisisActive={currentPhase === 'phase3_crisis' && !crisisResolved}
            bladeCount={bladeCount}
            rackSize={selectedRackSize}
            coolingOverdrive={coolingOverdrive}
            gender={characterGender}
            onToggleGender={(g) => setCharacterGender(g)}
            playerName={playerName}
            studioName={studioName}
            neonThemeColor={neonThemeColor}
            onOpenNameModal={() => setIsNameModalOpen(true)}
            onEmergencyRepairClick={() => {
              sound.playClick();
              setCoolingOverdrive(true);
            }}
            onPcClick={() => {
              const el = document.getElementById('planning-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Phase-specific interactive control zones */}
        {currentPhase === 'phase1_planning' && (
          <Phase1Planning
            contract={activeContract}
            allContracts={contracts}
            onSelectContract={(c) => setActiveContract(c)}
            inventory={inventory}
            onAddHardware={handleAddHardware}
            onRemoveHardware={handleRemoveHardware}
            onProceedToHardware={() => {
              if (installedComponents.length === 0) {
                handleAutoAssemble();
              }
              setCurrentPhase('phase2_hardware');
            }}
            onOpenPromptStudio={() => setIsPromptStudioOpen(true)}
          />
        )}

        {currentPhase === 'phase2_hardware' && (
          <Phase2HardwareRack
            rackSize={selectedRackSize}
            inventory={inventory}
            installedComponents={installedComponents}
            cables={cables}
            onMountHardware={handleMountHardware}
            onUnmountHardware={handleUnmountHardware}
            onAddCable={handleAddCable}
            onRemoveCable={handleRemoveCable}
            onAutoAssemble={handleAutoAssemble}
            onProceedToLogic={() => setCurrentPhase('phase2_logic')}
          />
        )}

        {currentPhase === 'phase2_logic' && (
          <Phase2LogicTablet
            contract={activeContract}
            networkConfig={networkConfig}
            terminalLogs={terminalLogs}
            onUpdateConfig={(upd) => setNetworkConfig((prev) => ({ ...prev, ...upd }))}
            onAddTerminalLog={(log) => setTerminalLogs((prev) => [...prev, log])}
            onGoLive={handleGoLive}
          />
        )}

        {currentPhase === 'phase3_crisis' && (
          <Phase3Crisis
            contract={activeContract}
            currentTempC={currentTempC}
            currentTrafficMBs={currentTrafficMBs}
            coolingOverdrive={coolingOverdrive}
            firewallActive={firewallActive}
            upsStabilized={upsStabilized}
            crisisResolved={crisisResolved}
            onToggleCoolingOverdrive={() => setCoolingOverdrive((prev) => !prev)}
            onActivateFirewallMitigation={() => setFirewallActive(true)}
            onStabilizeUPS={() => setUpsStabilized(true)}
            onProceedToEvaluation={handleProceedToEvaluation}
          />
        )}

        {currentPhase === 'phase4_evaluation' && (
          <Phase4Evaluation
            contract={activeContract}
            cash={cash}
            reputation={reputation}
            officeLevel={officeLevel}
            onUpgradeOffice={(lvl) => setOfficeLevel(lvl)}
            onStartNewContract={handleStartNewContract}
            onOpenPromptStudio={() => setIsPromptStudioOpen(true)}
          />
        )}
      </main>

      {/* Built-in Prompt Studio & Reference Inspector Modal */}
      <PromptStudioModal
        isOpen={isPromptStudioOpen}
        onClose={() => setIsPromptStudioOpen(false)}
        onImportGeneratedTicket={handleImportGeneratedTicket}
      />

      {/* Customizable Player & Studio Name Modal */}
      <NameCustomizerModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        playerName={playerName}
        studioName={studioName}
        neonThemeColor={neonThemeColor}
        onSave={(newName, newStudio, newColor) => {
          setPlayerName(newName);
          setStudioName(newStudio);
          setNeonThemeColor(newColor);
          try {
            localStorage.setItem('dc_tycoon_player_name', newName);
            localStorage.setItem('dc_tycoon_studio_name', newStudio);
            localStorage.setItem('dc_tycoon_neon_color', newColor);
          } catch {
            // Ignore quota/private mode errors
          }
        }}
      />
    </div>
  );
}
