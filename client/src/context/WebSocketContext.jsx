import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [telemetry, setTelemetry] = useState({
    availableSlots: 4,
    occupiedSlots: 0,
    totalCapacity: 4,
    deniedCount: 0,
    gateState: 'CLOSED', // 'CLOSED' | 'OPEN' | 'MANUAL_HOLD'
    mode: 'DISCONNECTED',
    port: 'NOT_CONNECTED',
    baudRate: 9600,
    packetsPerSec: 0,
    timestamp: new Date().toISOString()
  });

  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [historyLog, setHistoryLog] = useState([]);
  const [totalEntered, setTotalEntered] = useState(0);
  const [totalExited, setTotalExited] = useState(0);

  const [hourlyTraffic, setHourlyTraffic] = useState([
    { hour: '08:00', entry: 0, exit: 0, denied: 0 },
    { hour: '10:00', entry: 0, exit: 0, denied: 0 },
    { hour: '12:00', entry: 0, exit: 0, denied: 0 },
    { hour: '14:00', entry: 0, exit: 0, denied: 0 },
    { hour: '16:00', entry: 0, exit: 0, denied: 0 },
    { hour: '18:00', entry: 0, exit: 0, denied: 0 },
    { hour: 'Now', entry: 0, exit: 0, denied: 0 }
  ]);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const previousOccupiedRef = useRef(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:5001`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('CONNECTED');
        console.log('[CLIENT WS] Connected to Hardware Telemetry Bridge');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'TELEMETRY' && message.data) {
            const data = message.data;
            setTelemetry(data);

            // Track cumulative admissions and departures
            if (data.occupiedSlots > previousOccupiedRef.current) {
              setTotalEntered(prev => prev + (data.occupiedSlots - previousOccupiedRef.current));
            } else if (data.occupiedSlots < previousOccupiedRef.current) {
              setTotalExited(prev => prev + (previousOccupiedRef.current - data.occupiedSlots));
            }
            previousOccupiedRef.current = data.occupiedSlots;

            // Append to rolling history timeline (last 25 points)
            setHistoryLog((prev) => {
              const pointTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const newPoint = {
                time: pointTime,
                occupied: data.occupiedSlots,
                available: data.availableSlots,
                denied: data.deniedCount,
                gate: data.gateState === 'OPEN' ? 1 : 0
              };
              const updated = [...prev, newPoint];
              return updated.length > 25 ? updated.slice(updated.length - 25) : updated;
            });
          }
        } catch (parseErr) {
          console.error('[CLIENT WS] Parse error:', parseErr);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('DISCONNECTED');
        socketRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        setConnectionStatus('DISCONNECTED');
        ws.close();
      };
    } catch (e) {
      setConnectionStatus('DISCONNECTED');
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Transmit command to bridge via WebSocket with fallback to HTTP POST
  const sendCommand = async (commandStr) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: 'COMMAND',
        command: commandStr
      }));
      return true;
    }

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandStr })
      });
      return res.ok;
    } catch (e) {
      console.error('[CLIENT] Command transmission error:', e);
      return false;
    }
  };

  // Toggle Mode (HARDWARE vs SIMULATION)
  const toggleMode = async (targetMode) => {
    try {
      const res = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error('[CLIENT] Failed to switch mode:', err);
      return null;
    }
  };

  return (
    <WebSocketContext.Provider value={{
      telemetry,
      connectionStatus,
      historyLog,
      totalEntered: Math.max(totalEntered, telemetry.occupiedSlots),
      totalExited,
      hourlyTraffic,
      sendCommand,
      toggleMode
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a WebSocketProvider');
  }
  return context;
}
