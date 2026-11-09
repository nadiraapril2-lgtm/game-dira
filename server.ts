import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoint: Procedural Mission Scenario Generator using Gemini API
  app.post('/api/generate-ticket', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { difficulty = 'medium', clientTheme } = req.body;

      if (!apiKey) {
        // High quality fallback scenario if API key is not configured in local environment
        return res.json({
          success: true,
          source: 'procedural_fallback',
          ticket: generateFallbackTicket(difficulty, clientTheme)
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate 1 unique, varied customer ticket scenario for the game 'Network Architect: Data Center Tycoon'.
The scenario must follow this data-driven template:
Clientele Type: (e.g. Warkop, Bank, Tech Startup, E-Sports Arena, Cloud Gaming Studio)
Client Name: (e.g. Startup Game XYZ, Warkop WiFi Santai, Bank MegaArtha)
Initial Goal: (e.g. Build basic public Wi-Fi, High-Security Database server, Low latency game lobby)
Budget: (e.g. integer between 3000 and 25000)
Required Hardware Specs:
- Min Rack Units (12U, 24U, or 42U)
- Min Blade Servers (1 to 4)
- Requires Managed Switch (true/false)
- Requires UPS (true/false)
- Min Cooling Power (30 to 180)
Core Network Requirement: (e.g. Max 50 VLANs, Low latency connection, 1Gbps Bandwidth, Firewall Rule for blocking certain ports)
Hidden Crisis Event: (e.g. DDoS attack with 850MB/s traffic spike, Overheat warning > 75°C from high compute, Power surge from old wiring)
Crisis Type: ("ddos" | "overheat" | "dual")

Respond ONLY with valid JSON matching this schema:
{
  "clientType": "Tech Startup",
  "clientName": "Startup Game XYZ",
  "avatar": "game",
  "initialGoal": "Low latency multiplayer backend with anti-DDoS",
  "budget": 5000,
  "hardwareRequirements": {
    "minRackUnits": 12,
    "minBlades": 2,
    "requiresSwitch": true,
    "requiresUps": true,
    "minCooling": 60
  },
  "coreNetworkRequirement": "VLAN 100 configured, Port 80/443 firewall filter",
  "hiddenCrisisEvent": "Sudden DDoS attack (800MB/s) and rapid temperature rise to 82°C",
  "crisisType": "dual",
  "vlanId": 100,
  "requiredSubnet": "192.168.10.0/24"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        source: 'gemini_ai',
        ticket: {
          id: `ticket_${Date.now()}`,
          ...parsed
        }
      });
    } catch (err) {
      console.error('Error generating ticket with Gemini:', err);
      return res.json({
        success: true,
        source: 'procedural_fallback_on_error',
        ticket: generateFallbackTicket(req.body.difficulty, req.body.clientTheme)
      });
    }
  });

  function generateFallbackTicket(difficulty = 'medium', theme?: string) {
    const fallbackTemplates = [
      {
        id: `ticket_${Date.now()}_1`,
        clientType: 'Tech Startup',
        clientName: 'Startup Game XYZ',
        avatar: 'game',
        initialGoal: 'Build low-latency multiplayer game backend server cluster',
        budget: 5000,
        hardwareRequirements: {
          minRackUnits: 12,
          minBlades: 2,
          requiresSwitch: true,
          requiresUps: true,
          minCooling: 60
        },
        coreNetworkRequirement: 'Max 50 VLANs, Low latency connection, 1Gbps Bandwidth, Firewall Rule for blocking unauthenticated UDP ports',
        hiddenCrisisEvent: 'Massive DDoS botnet attack (800MB/s) and temperature spike up to 82°C',
        crisisType: 'dual',
        vlanId: 100,
        requiredSubnet: '192.168.10.0/24'
      },
      {
        id: `ticket_${Date.now()}_2`,
        clientType: 'Warkop & Community Hub',
        clientName: 'Warkop WiFi Santai 24 Jam',
        avatar: 'coffee',
        initialGoal: 'Setup reliable public Wi-Fi hotspot with guest isolation and bandwidth cap',
        budget: 2500,
        hardwareRequirements: {
          minRackUnits: 12,
          minBlades: 1,
          requiresSwitch: true,
          requiresUps: true,
          minCooling: 30
        },
        coreNetworkRequirement: 'Guest VLAN 20 isolation, rate-limit to 20Mbps per client',
        hiddenCrisisEvent: 'Torrent leeching surge and garage transformer heat wave',
        crisisType: 'overheat',
        vlanId: 20,
        requiredSubnet: '192.168.20.0/24'
      },
      {
        id: `ticket_${Date.now()}_3`,
        clientType: 'Financial Institution',
        clientName: 'Bank MegaArtha Digital',
        avatar: 'bank',
        initialGoal: 'High-security transaction database cluster with redundant power and strict zero-trust firewall',
        budget: 18000,
        hardwareRequirements: {
          minRackUnits: 24,
          minBlades: 3,
          requiresSwitch: true,
          requiresUps: true,
          minCooling: 120
        },
        coreNetworkRequirement: 'Encrypted DB subnet, strict SYN-flood mitigation, redundant UPS bypass',
        hiddenCrisisEvent: 'Coordinated SYN-flood DDoS and UPS battery heat discharge',
        crisisType: 'dual',
        vlanId: 200,
        requiredSubnet: '10.50.0.0/24'
      },
      {
        id: `ticket_${Date.now()}_4`,
        clientType: 'E-Commerce Platform',
        clientName: 'FlashSale Nusantara',
        avatar: 'shop',
        initialGoal: 'Handle 11.11 flash sale traffic with high-performance blade computing',
        budget: 12000,
        hardwareRequirements: {
          minRackUnits: 24,
          minBlades: 3,
          requiresSwitch: true,
          requiresUps: true,
          minCooling: 90
        },
        coreNetworkRequirement: 'VLAN 150 for payment gateway, connection limit 200 per IP',
        hiddenCrisisEvent: 'Scalper botnet wave causing 1.2GB/s traffic burst and CPU thermal spike',
        crisisType: 'ddos',
        vlanId: 150,
        requiredSubnet: '172.16.10.0/24'
      }
    ];

    return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
  }

  // Setup Vite Dev Middleware or Serve Production Build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Network Architect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
