import React, { useState, useRef, useEffect } from 'react';
import { ClientContract, NetworkConfig } from '../types/game';
import { Play, Terminal as TermIcon, Shield, Radio, CheckCircle, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface Phase2LogicTabletProps {
  contract: ClientContract;
  networkConfig: NetworkConfig;
  terminalLogs: string[];
  onUpdateConfig: (updated: Partial<NetworkConfig>) => void;
  onAddTerminalLog: (line: string) => void;
  onGoLive: () => void;
}

export const Phase2LogicTablet: React.FC<Phase2LogicTabletProps> = ({
  contract,
  networkConfig,
  terminalLogs,
  onUpdateConfig,
  onAddTerminalLog,
  onGoLive,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Execute terminal command
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    sound.playTerminalBeep();
    onAddTerminalLog(`> ${trimmed}`);

    const lower = trimmed.toLowerCase();

    if (lower === 'help') {
      onAddTerminalLog('Available commands:');
      onAddTerminalLog('  /ip address add address=<IP/CIDR> interface=<interface>');
      onAddTerminalLog('  /interface vlan add name=<name> vlan-id=<ID> interface=<interface>');
      onAddTerminalLog('  /ip firewall filter add chain=forward action=drop dst-port=80,443 connection-limit=<N>');
      onAddTerminalLog('  /system health print');
      onAddTerminalLog('  /interface monitor-traffic');
      onAddTerminalLog('  /ping 8.8.8.8');
      onAddTerminalLog('  status');
      onAddTerminalLog('  clear');
    } else if (lower === 'clear') {
      // Clear logs
      onAddTerminalLog('Terminal buffer cleared.');
    } else if (lower.includes('/ip address add') || lower.includes('ip address')) {
      const match = trimmed.match(/address=([^\s]+)/i);
      const ip = match ? match[1] : contract.requiredSubnet.replace('.0/', '.1/');
      onUpdateConfig({ ipAddress: ip });
      onAddTerminalLog(`[OK] Interface ether1 IP assigned: ${ip}`);
    } else if (lower.includes('/interface vlan add') || lower.includes('vlan-id')) {
      const match = trimmed.match(/vlan-id=([0-9]+)/i);
      const vlan = match ? parseInt(match[1], 10) : contract.vlanId;
      onUpdateConfig({ vlanId: vlan, vlanEnabled: true });
      onAddTerminalLog(`[OK] VLAN interface active: VLAN ID ${vlan} tagged on ether2`);
    } else if (lower.includes('/ip firewall') || lower.includes('firewall')) {
      onUpdateConfig({
        firewallEnabled: true,
        firewallRule: lower.includes('connection-limit') || lower.includes('drop') ? 'strict_antiddos' : 'basic',
      });
      onAddTerminalLog('[OK] Firewall filter rule applied: SYN-flood rate-limiting & port isolation ACTIVE');
    } else if (lower.includes('/system health print') || lower === 'status') {
      onAddTerminalLog(`--- System Health Report ---`);
      onAddTerminalLog(`Rack IP: ${networkConfig.ipAddress}`);
      onAddTerminalLog(`VLAN: ${networkConfig.vlanEnabled ? `ID ${networkConfig.vlanId}` : 'Disabled'}`);
      onAddTerminalLog(`Firewall Rule: ${networkConfig.firewallRule.toUpperCase()}`);
      onAddTerminalLog(`Uplink: 1000Mbps Full Duplex (UP)`);
    } else if (lower.includes('ping')) {
      onAddTerminalLog('PING 8.8.8.8 (8.8.8.8): 56 data bytes');
      onAddTerminalLog('64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=4.2 ms');
      onAddTerminalLog('64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=3.9 ms');
      onAddTerminalLog('2 packets transmitted, 2 packets received, 0% packet loss');
    } else {
      onAddTerminalLog(`Executed: ${trimmed} (command accepted)`);
    }

    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
    }
  };

  // Quick Action Buttons matching prompt & image_0.png
  const quickCommands = [
    {
      label: 'Set IP Subnet',
      cmd: `/ip address add address=${contract.requiredSubnet.replace('.0/', '.1/')} interface=ether1`,
    },
    {
      label: `Tag VLAN ${contract.vlanId}`,
      cmd: `/interface vlan add name=vlan${contract.vlanId} vlan-id=${contract.vlanId} interface=ether2`,
    },
    {
      label: 'Anti-DDoS Firewall',
      cmd: `/ip firewall filter add chain=forward action=drop protocol=tcp dst-port=80,443 connection-limit=100`,
    },
    {
      label: 'Test Ping Uplink',
      cmd: `/ping 8.8.8.8`,
    },
  ];

  const isConfigReady =
    networkConfig.ipAddress.length > 0 &&
    networkConfig.vlanEnabled &&
    networkConfig.firewallEnabled;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
            Fase 2 (Logika)
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Konfigurasi Jaringan & Terminal Virtual
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi alamat IP, VLAN isolasi, dan aturan firewall anti-DDoS di tablet virtual sebelum klik GO LIVE.
          </p>
        </div>

        {/* Requirements status pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Validasi Target Klien:</span>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              isConfigReady
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
            }`}
          >
            {isConfigReady ? '✓ Siap Go Live' : 'Belum Lengkap'}
          </span>
        </div>
      </div>

      {/* The In-Game Tablet Device Container (matching image_0.png) */}
      <div className="relative mx-auto max-w-5xl rounded-[32px] p-4 sm:p-6 bg-[#232730] border-4 border-[#333a46] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-slate-700/50">
        {/* Tablet Top Camera & Sensor bezel notch */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>

        {/* Tablet Screen Glass */}
        <div className="rounded-2xl bg-[#0c1017] border border-slate-800 p-4 sm:p-5 overflow-hidden">
          {/* Tablet Screen Top Bar */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-slate-300">NetOS v7.14 · RouterOS Active</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>ETH1: 1Gbps Full</span>
              <span>CPU: 4%</span>
              <span className="text-emerald-400 font-semibold">LINK UP</span>
            </div>
          </div>

          {/* 2-Column Tablet Screen: Left = Topology Diagram, Right = Virtual Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Interactive Network Topology (as in image_0.png) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                Topologi Jaringan Real-Time
              </span>

              {/* Visual Node Diagram */}
              <div className="relative w-full h-64 bg-slate-900/50 rounded-lg border border-slate-800/80 p-3 flex flex-col justify-between overflow-hidden">
                {/* Simulated connecting lines with SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Internet -> Router */}
                  <line x1="50%" y1="18%" x2="50%" y2="40%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  {/* Router -> Switch */}
                  <line x1="50%" y1="40%" x2="30%" y2="75%" stroke="#10b981" strokeWidth="2" />
                  {/* Switch -> Server Rack */}
                  <line x1="50%" y1="40%" x2="70%" y2="75%" stroke="#3b82f6" strokeWidth="2" />
                </svg>

                {/* Node 1: Internet Gateway */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="px-3 py-1 rounded-md bg-sky-950 border border-sky-500/50 text-[11px] font-mono font-bold text-sky-300 shadow-md">
                    ISP WAN · 8.8.8.8
                  </div>
                </div>

                {/* Node 2: Core Router */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/60 text-xs font-mono font-bold text-emerald-300 shadow-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>MikroTik Core Router</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {networkConfig.ipAddress || '192.168.10.1/24'}
                  </span>
                </div>

                {/* Bottom Row: Switch & Server Rack */}
                <div className="relative z-10 flex items-center justify-between px-2">
                  {/* Switch Node */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center w-32 shadow-md">
                    <span className="text-[11px] font-bold text-slate-200 block">Switch Gigabit</span>
                    <span className="text-[9px] font-mono text-cyan-400 block">
                      VLAN {networkConfig.vlanEnabled ? networkConfig.vlanId : 'Off'}
                    </span>
                  </div>

                  {/* Server Rack Node */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-emerald-600/80 text-center w-32 shadow-md">
                    <span className="text-[11px] font-bold text-emerald-300 block">Server Blades</span>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      FW: {networkConfig.firewallRule.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badges on Tablet Footer (matching image_0.png) */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block text-[9px] uppercase">VLAN Status</span>
                  <span className={networkConfig.vlanEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    VLAN ID: {networkConfig.vlanEnabled ? networkConfig.vlanId : 'None'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block text-[9px] uppercase">Firewall Rule</span>
                  <span className={networkConfig.firewallEnabled ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                    {networkConfig.firewallRule === 'strict_antiddos' ? 'ANTI-DDOS STRICT' : 'BASIC RULES'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Virtual Terminal Console (as in image_0.png) */}
            <div className="lg:col-span-7 bg-[#080b10] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TermIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    TERMINAL VIRTUAL (MikroTik OS)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">CLI Mode</span>
              </div>

              {/* Scrollable Command Output Area */}
              <div className="h-52 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1 bg-black/60 p-3 rounded-lg border border-slate-900 selection:bg-emerald-500/30">
                {terminalLogs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('>') ? 'text-amber-300 font-semibold' : log.startsWith('[OK]') ? 'text-emerald-300' : 'text-slate-300'}>
                    {log}
                  </p>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Quick Preset Paste Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-mono">Quick Preset:</span>
                {quickCommands.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      executeCommand(q.cmd);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
                  >
                    + {q.label}
                  </button>
                ))}
              </div>

              {/* Interactive CLI Input Line */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <span className="text-amber-400 font-mono text-sm font-bold">&gt;</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik perintah (contoh: /ip address add... atau 'help')"
                  className="flex-1 bg-transparent text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
                />
                <button
                  onClick={() => executeCommand(commandInput)}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono"
                  title="Kirim perintah"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Big Green [GO LIVE 🟢] CTA Button (matching center tablet in image_0.png) */}
          <div className="mt-5 pt-4 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Siap meluncurkan server?</span>
              <p className="text-[11px] text-slate-500">
                Sistem akan menghubungkan trafik klien secara langsung ke server rack.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playVictory();
                onGoLive();
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>GO LIVE (Luncurkan Server)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
