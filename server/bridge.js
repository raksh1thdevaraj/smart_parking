/**
 * Node.js Real-Time Serial & WebSocket Bridge
 * Connects Arduino UNO via USB CDC Serial to Full-Stack Web Clients.
 * Includes automatic USB discovery, auto-reconnect, and seamless Mock Mode fallback.
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { VirtualParkingSimulator } from './mockSimulator.js';
import { analyzeCapacityWithGemini, predictRushWithGemini, chatWithGemini } from './geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.BRIDGE_PORT || '5001', 10);
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600', 10);
const FORCED_MOCK = process.env.MOCK_MODE === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_smart_parking_admin_key_2026';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'adminparking2026';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Current System State Cache
let activeMode = FORCED_MOCK ? 'SIMULATION' : 'DISCONNECTED';
let activePortPath = null;
let serialPortInstance = null;
let serialParserInstance = null;
let reconnectTimer = null;
let packetsPerSecondCounter = 0;
let lastPpsCalculation = Date.now();
let currentPps = 0;

let currentTelemetry = {
  availableSlots: 4,
  occupiedSlots: 0,
  totalCapacity: 4,
  deniedCount: 0,
  gateState: 'CLOSED',
  mode: activeMode,
  port: null,
  baudRate: BAUD_RATE,
  packetsPerSec: 0,
  timestamp: new Date().toISOString()
};

// Virtual Simulator Instance
const simulator = new VirtualParkingSimulator({
  totalCapacity: 4,
  onTelemetry: (data) => {
    if (activeMode !== 'HARDWARE') {
      updateTelemetryAndBroadcast({
        ...data,
        port: activeMode === 'HARDWARE' ? activePortPath : 'NOT_CONNECTED',
        baudRate: BAUD_RATE,
        packetsPerSec: currentPps
      });
    }
  }
});

// Periodic Packets Per Second (PPS) calculation
setInterval(() => {
  const now = Date.now();
  const elapsedSec = (now - lastPpsCalculation) / 1000;
  currentPps = parseFloat((packetsPerSecondCounter / elapsedSec).toFixed(1));
  packetsPerSecondCounter = 0;
  lastPpsCalculation = now;
  currentTelemetry.packetsPerSec = currentPps;
}, 1000);

// --- Broadcast Function ---
function updateTelemetryAndBroadcast(data) {
  currentTelemetry = {
    ...currentTelemetry,
    ...data,
    timestamp: new Date().toISOString()
  };

  const payload = JSON.stringify({
    type: 'TELEMETRY',
    data: currentTelemetry
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// --- Serial Hardware Connection Logic ---
async function discoverAndConnectSerial() {
  if (FORCED_MOCK) {
    console.log('[BRIDGE] MOCK_MODE=true is enabled. Running strictly in simulation mode.');
    enableSimulation();
    return;
  }

  try {
    const ports = await SerialPort.list();
    console.log(`[BRIDGE] Scanning USB ports... Found ${ports.length} port(s).`);

    // Target Arduino or specified serial port
    const targetPort = process.env.SERIAL_PORT
      ? ports.find(p => p.path === process.env.SERIAL_PORT)
      : ports.find(p => {
          const info = `${p.manufacturer || ''} ${p.pnpId || ''} ${p.vendorId || ''}`.toLowerCase();
          return info.includes('arduino') || info.includes('ch340') || info.includes('2341') || info.includes('silicon');
        });

    if (!targetPort) {
      if (activeMode !== 'DISCONNECTED') {
        console.warn('[BRIDGE] No physical Arduino detected. Entering Standby Mode (Slots: 4/4 Available, Gate: CLOSED).');
        enableSimulation('DISCONNECTED');
      }
      scheduleHardwareReconnect();
      return;
    }

    console.log(`[BRIDGE] Connecting to physical Arduino on port: ${targetPort.path} at ${BAUD_RATE} baud...`);
    activePortPath = targetPort.path;

    serialPortInstance = new SerialPort({
      path: targetPort.path,
      baudRate: BAUD_RATE,
      autoOpen: false
    });

    serialPortInstance.open((err) => {
      if (err) {
        console.error(`[BRIDGE] Failed to open ${targetPort.path}:`, err.message);
        enableSimulation('DISCONNECTED');
        scheduleHardwareReconnect();
        return;
      }

      console.log(`[BRIDGE] Successfully connected to Hardware Serial: ${targetPort.path}`);
      activeMode = 'HARDWARE';
      simulator.stop();

      serialParserInstance = serialPortInstance.pipe(new ReadlineParser({ delimiter: '\n' }));
      serialParserInstance.on('data', handleSerialRawData);

      serialPortInstance.on('close', () => {
        console.warn(`[BRIDGE] Hardware connection on ${activePortPath} closed.`);
        activeMode = 'DISCONNECTED';
        enableSimulation('DISCONNECTED');
        scheduleHardwareReconnect();
      });

      serialPortInstance.on('error', (portErr) => {
        console.error(`[BRIDGE] Serial Port Error:`, portErr.message);
      });
    });
  } catch (err) {
    console.error('[BRIDGE] USB discovery exception:', err.message);
    enableSimulation('DISCONNECTED');
    scheduleHardwareReconnect();
  }
}

function handleSerialRawData(rawLine) {
  const line = rawLine.trim();
  packetsPerSecondCounter++;

  // Expected format: DATA:available,occupied,total,denied,gate
  if (line.startsWith('DATA:')) {
    const parts = line.substring(5).split(',');
    if (parts.length >= 5) {
      const available = parseInt(parts[0], 10);
      const occupied = parseInt(parts[1], 10);
      const total = parseInt(parts[2], 10);
      const denied = parseInt(parts[3], 10);
      const gate = parts[4].trim();

      updateTelemetryAndBroadcast({
        availableSlots: isNaN(available) ? currentTelemetry.availableSlots : available,
        occupiedSlots: isNaN(occupied) ? currentTelemetry.occupiedSlots : occupied,
        totalCapacity: isNaN(total) ? currentTelemetry.totalCapacity : total,
        deniedCount: isNaN(denied) ? currentTelemetry.deniedCount : denied,
        gateState: gate || currentTelemetry.gateState,
        mode: 'HARDWARE',
        port: activePortPath,
        baudRate: BAUD_RATE,
        packetsPerSec: currentPps
      });
    }
  } else {
    console.log(`[SERIAL RAW] ${line}`);
  }
}

function scheduleHardwareReconnect() {
  if (reconnectTimer || FORCED_MOCK) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (activeMode !== 'HARDWARE') {
      discoverAndConnectSerial();
    }
  }, 4000);
}

function enableSimulation(mode = 'DISCONNECTED') {
  activeMode = mode;
  simulator.start();
  updateTelemetryAndBroadcast({
    availableSlots: 4,
    occupiedSlots: 0,
    totalCapacity: 4,
    deniedCount: 0,
    gateState: 'CLOSED',
    mode: mode,
    port: mode === 'HARDWARE' ? activePortPath : 'NOT_CONNECTED',
    baudRate: BAUD_RATE
  });
}

// --- Outgoing Command Execution ---
function executeCommand(commandStr) {
  const sanitized = commandStr.trim();
  console.log(`[COMMAND DISPATCH] Executing: ${sanitized} (Mode: ${activeMode})`);

  if (activeMode === 'HARDWARE' && serialPortInstance && serialPortInstance.isOpen) {
    serialPortInstance.write(sanitized + '\n', (err) => {
      if (err) {
        console.error('[BRIDGE] Error writing to Serial Port:', err.message);
      } else {
        console.log(`[BRIDGE] Sent hardware command: ${sanitized}`);
      }
    });
    return { success: true, target: 'HARDWARE', command: sanitized };
  } else {
    // Forward to virtual simulator
    const handled = simulator.handleCommand(sanitized);
    return { success: handled, target: 'SIMULATION', command: sanitized };
  }
}

// --- WebSocket Connection Management ---
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[WS] Client connected from ${clientIp}`);

  // Send current cached state immediately upon connection
  ws.send(JSON.stringify({
    type: 'TELEMETRY',
    data: currentTelemetry
  }));

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());
      if (msg.action === 'COMMAND' && msg.command) {
        const result = executeCommand(msg.command);
        ws.send(JSON.stringify({ type: 'COMMAND_ACK', result }));
      } else if (msg.action === 'REQUEST_STATE') {
        ws.send(JSON.stringify({ type: 'TELEMETRY', data: currentTelemetry }));
      }
    } catch (err) {
      console.error('[WS] Error processing message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log(`[WS] Client disconnected (${clientIp})`);
  });
});

// --- REST Endpoints ---
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    mode: activeMode,
    telemetry: currentTelemetry,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ports', async (req, res) => {
  try {
    const list = await SerialPort.list();
    res.json({
      ports: list,
      activePort: activePortPath,
      mode: activeMode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'SIMULATION') {
    if (serialPortInstance && serialPortInstance.isOpen) {
      serialPortInstance.close();
    }
    enableSimulation();
    res.json({ success: true, mode: 'SIMULATION' });
  } else if (mode === 'HARDWARE') {
    simulator.stop();
    activeMode = 'CONNECTING';
    discoverAndConnectSerial();
    res.json({ success: true, mode: 'HARDWARE_SEARCHING' });
  } else {
    res.status(400).json({ error: 'Invalid mode. Use "SIMULATION" or "HARDWARE".' });
  }
});

app.post('/api/command', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command parameter missing' });
  }
  const result = executeCommand(command);
  res.json(result);
});

// Admin Authentication Route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { username, role: 'FACILITY_ADMIN' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({
      success: true,
      token,
      user: { username, role: 'FACILITY_ADMIN' }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

// --- Gemini AI Telemetry & Capacity Intelligence Routes ---
app.post('/api/ai/capacity-analysis', async (req, res) => {
  try {
    const telemetryData = req.body?.telemetry || currentTelemetry;
    const analysis = await analyzeCapacityWithGemini(telemetryData);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/rush-prediction', async (req, res) => {
  try {
    const prediction = await predictRushWithGemini(currentTelemetry, req.body?.history || []);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    const answer = await chatWithGemini(query, currentTelemetry);
    res.json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Smart Parking Serial & WebSocket Bridge Running     `);
  console.log(`  HTTP REST API:    http://localhost:${PORT}/api/status`);
  console.log(`  WebSocket Server: ws://localhost:${PORT}             `);
  console.log(`  Target Baud Rate: ${BAUD_RATE}                       `);
  console.log(`  Simulation Mode:  ${FORCED_MOCK ? 'FORCED' : 'AUTO-FALLBACK'}`);
  console.log(`======================================================\n`);

  discoverAndConnectSerial();
});
