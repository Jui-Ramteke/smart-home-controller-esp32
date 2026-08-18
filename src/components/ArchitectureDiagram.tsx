import React from 'react';
import { SensorState, ActuatorState } from '../types';
import { Layers, ArrowDown, Activity, Cpu } from 'lucide-react';

interface ArchitectureDiagramProps {
  sensors: SensorState;
  actuators: ActuatorState;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  sensors,
  actuators
}) => {
  return (
    <div id="architecture-diagram-container" className="space-y-6">
      <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Embedded Hardware & Signal Flow Architecture</span>
            </h3>
            <p className="text-xs text-gray-400">
              Interactive structural block diagram from sensor inputs through ESP32 control logic to relay actuators.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800/40">
            Real-Time Signal Graph
          </span>
        </div>

        {/* ASCII Block Architecture as Requested */}
        <div className="bg-[#0f0f0f] p-4 rounded border border-gray-800 font-mono text-xs overflow-x-auto text-gray-300 leading-relaxed shadow-inner">
          <div className="text-cyan-400 font-bold mb-2">// ----------------- SYSTEM ARCHITECTURE DIAGRAM -----------------</div>
          <pre className="text-emerald-400/90 select-all">{`PIR Sensor ───────────┐
LDR ──────────────────┤
Temperature Sensor ───┤
Manual Switches ──────┤
Security Mode ────────┤
                      ↓
              Arduino / ESP32  [240MHz FreeRTOS]
                      ↓
              Control Algorithm (Rule 1, 2, 3, 4)
               ↓      ↓      ↓
             Light   Fan   Security
               ↓      ↓      ↓
             Relay   Relay  Buzzer + Red LED
                      ↓
                 LCD / OLED Display (SSD1306) & UART Serial`}</pre>
        </div>
      </div>

      {/* Interactive Visual Signal Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* BLOCK 1: INPUT SENSORS */}
        <div className="bg-[#161616] border border-gray-800 p-3.5 rounded-lg space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 pb-1 border-b border-gray-800 flex justify-between">
            <span>1. SENSOR INPUTS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">PIR Motion:</span>
              <strong className={sensors.pirMotion ? 'text-emerald-400' : 'text-gray-500'}>
                {sensors.pirMotion ? 'HIGH (1)' : 'LOW (0)'}
              </strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">LDR (ADC):</span>
              <strong className={sensors.isDark ? 'text-indigo-300' : 'text-amber-300'}>
                {sensors.ldrAdc} ADC
              </strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">DHT22 Temp:</span>
              <strong className="text-cyan-400">{sensors.temperature.toFixed(1)}°C</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Security Switch:</span>
              <strong className={sensors.securityMode ? 'text-red-400' : 'text-gray-500'}>
                {sensors.securityMode ? 'ARMED (1)' : 'DISARMED (0)'}
              </strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Override Mode:</span>
              <strong className={sensors.manualOverride ? 'text-amber-400' : 'text-emerald-400'}>
                {sensors.manualOverride ? 'MANUAL' : 'AUTO'}
              </strong>
            </div>
          </div>
        </div>

        {/* BLOCK 2: MICROCONTROLLER CORE */}
        <div className="bg-[#161616] border border-gray-800 p-3.5 rounded-lg space-y-2">
          <div className="text-xs font-mono font-bold text-cyan-400 pb-1 border-b border-gray-800 flex justify-between">
            <span>2. ESP32 CORE</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-500 block text-[10px]">CPU Frequency:</span>
              <span className="text-gray-200">240 MHz Dual Core Xtensa</span>
            </div>
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-500 block text-[10px]">Sampling Rate:</span>
              <span className="text-cyan-300">100Hz Sensor Scan / 1Hz UART</span>
            </div>
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-500 block text-[10px]">Noise Filter:</span>
              <span className="text-emerald-400">5-Sample LDR Moving Avg</span>
            </div>
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-500 block text-[10px]">Hysteresis Buffer:</span>
              <span className="text-amber-300">1.5°C Thermal Deadband</span>
            </div>
          </div>
        </div>

        {/* BLOCK 3: CONTROL ALGORITHM */}
        <div className="bg-[#161616] border border-gray-800 p-3.5 rounded-lg space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 pb-1 border-b border-gray-800 flex justify-between">
            <span>3. RULE EVALUATION</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Rule 1 (Light):</span>
              <span className={`block font-bold ${actuators.roomLightRelay ? 'text-yellow-400' : 'text-gray-500'}`}>
                {actuators.roomLightRelay ? 'MATCHED &rarr; RELAY ON' : 'IDLE &rarr; OFF'}
              </span>
            </div>
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Rule 2 (Fan):</span>
              <span className={`block font-bold ${actuators.fanRelay ? 'text-cyan-400' : 'text-gray-500'}`}>
                {actuators.fanRelay ? 'MATCHED &rarr; FAN ON' : 'IDLE &rarr; OFF'}
              </span>
            </div>
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Rule 3 (Security):</span>
              <span className={`block font-bold ${actuators.buzzerActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {actuators.buzzerActive ? 'TRIPPED &rarr; ALARM!' : 'SAFE'}
              </span>
            </div>
            <div className="p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Rule 4 (Override):</span>
              <span className={`block font-bold ${sensors.manualOverride ? 'text-amber-300' : 'text-gray-500'}`}>
                {sensors.manualOverride ? 'ENGAGED' : 'AUTO MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* BLOCK 4: ACTUATORS & PERIPHERALS */}
        <div className="bg-[#161616] border border-gray-800 p-3.5 rounded-lg space-y-2">
          <div className="text-xs font-mono font-bold text-yellow-400 pb-1 border-b border-gray-800 flex justify-between">
            <span>4. ACTUATORS & UI</span>
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Relay 1 (Light):</span>
              <strong className={actuators.roomLightRelay ? 'text-yellow-400' : 'text-gray-500'}>
                {actuators.roomLightRelay ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Relay 2 (Fan):</span>
              <strong className={actuators.fanRelay ? 'text-cyan-400' : 'text-gray-500'}>
                {actuators.fanRelay ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">Piezo Buzzer:</span>
              <strong className={actuators.buzzerActive ? 'text-red-400' : 'text-gray-500'}>
                {actuators.buzzerActive ? 'ACTIVE (95dB)' : 'MUTED'}
              </strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">SSD1306 I2C:</span>
              <strong className="text-cyan-300">128x64 Framebuf</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-[#0f0f0f] rounded border border-gray-800">
              <span className="text-gray-400">UART Serial:</span>
              <strong className="text-emerald-400">115200 8N1</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
