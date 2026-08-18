import React from 'react';
import { SensorState, ActuatorState, ThresholdConfig } from '../types';
import { soundFx } from '../audio';
import {
  Sun,
  Moon,
  Thermometer,
  Eye,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Fan,
  Lightbulb,
  User,
  Power,
  ChevronUp,
  ChevronDown,
  Volume2
} from 'lucide-react';

interface RoomFloorplanProps {
  sensors: SensorState;
  actuators: ActuatorState;
  thresholds: ThresholdConfig;
  motionCountdown: number;
  onUpdateSensor: <K extends keyof SensorState>(key: K, value: SensorState[K]) => void;
  onTriggerPirPulse: () => void;
}

export const RoomFloorplan: React.FC<RoomFloorplanProps> = ({
  sensors,
  actuators,
  thresholds,
  motionCountdown,
  onUpdateSensor,
  onTriggerPirPulse
}) => {
  return (
    <div id="interactive-room-twin" className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] border border-gray-800 p-3 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
              2D Smart Room Digital Twin
            </h3>
            <span className="text-[10px] font-mono bg-gray-800 text-cyan-400 px-2 py-0.5 rounded border border-gray-700">
              Interactive Spatial View
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Click directly on room appliances, windows, thermostat, or doors to interact with the environment in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-400">Room Status:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${
            actuators.buzzerActive
              ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
              : sensors.securityMode
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}>
            {actuators.buzzerActive
              ? '🚨 INTRUSION ALERT'
              : sensors.securityMode
              ? '🛡️ ARMED & SAFE'
              : '🟢 NORMAL STANDBY'}
          </span>
        </div>
      </div>

      {/* Main Floorplan Canvas / Blueprint Box */}
      <div className="relative w-full min-h-[480px] bg-[#0c0c0c] border border-gray-800 rounded-xl overflow-hidden p-4 sm:p-6 shadow-2xl flex flex-col justify-between">
        
        {/* Subtle Architectural Grid Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Dynamic Room Illumination Glow Overlay when Light is ON */}
        {actuators.roomLightRelay && (
          <div className="absolute inset-0 bg-gradient-radial from-amber-400/15 via-amber-500/5 to-transparent pointer-events-none transition-opacity duration-500" />
        )}

        {/* Dynamic Alarm Strobe Overlay when Alarm is Tripped */}
        {actuators.buzzerActive && (
          <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse border-4 border-red-500/40 rounded-xl" />
        )}

        {/* ================= TOP WALL: WINDOW (LDR) & AIR VENT ================= */}
        <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
          
          {/* WINDOW (LDR SENSOR HOTSPOT) */}
          <div
            id="room-window-hotspot"
            onClick={() => {
              soundFx.playSwitchClick();
              const nextDark = !sensors.isDark;
              onUpdateSensor('isDark', nextDark);
              onUpdateSensor('ldrAdc', nextDark ? 3200 : 600);
              onUpdateSensor('ldrLux', nextDark ? 40 : 800);
            }}
            className={`cursor-pointer px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 ${
              sensors.isDark
                ? 'bg-indigo-950/40 border-indigo-700/60 hover:bg-indigo-900/40'
                : 'bg-amber-950/40 border-amber-700/60 hover:bg-amber-900/40'
            }`}
            title="Click to toggle Window Blinds (Daylight / Night)"
          >
            <div className={`p-2 rounded ${sensors.isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {sensors.isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-200">Smart Window (LDR)</span>
                <span className="text-[9px] font-mono text-gray-400 bg-[#161616] px-1.5 py-0.2 rounded">Click to Toggle</span>
              </div>
              <p className="text-[11px] font-mono text-gray-400">
                {sensors.isDark ? '🌙 Night / Dark (3200 ADC)' : '☀️ Daylight Sunlight (600 ADC)'}
              </p>
            </div>
          </div>

          {/* ROOM CEILING LABELS */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-gray-500">
            <span>Room Dimensions: 4.8m x 3.6m</span>
            <span>&bull;</span>
            <span>Sensor Node: Node-01 (ESP32)</span>
          </div>

          {/* SMART WALL THERMOSTAT (DHT22) */}
          <div
            id="room-thermostat-hotspot"
            className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-3 ${
              sensors.temperature >= thresholds.tempThresholdOn
                ? 'bg-red-950/40 border-red-700/60'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className={`p-2 rounded ${sensors.temperature >= thresholds.tempThresholdOn ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">Wall Thermostat</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold ${
                  sensors.temperature >= thresholds.tempThresholdOn ? 'text-red-400' : 'text-cyan-400'
                }`}>
                  {sensors.temperature.toFixed(1)}°C
                </span>
                <span className="text-[10px] font-mono text-gray-400">({sensors.humidity}%)</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 ml-1">
              <button
                id="thermostat-inc-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('temperature', Math.min(42, Number((sensors.temperature + 1).toFixed(1))));
                }}
                className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[9px] transition-colors"
                title="Increase Temperature (+1°C)"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                id="thermostat-dec-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('temperature', Math.max(16, Number((sensors.temperature - 1).toFixed(1))));
                }}
                className="p-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[9px] transition-colors"
                title="Decrease Temperature (-1°C)"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* ================= CENTER ROOM: CEILING LIGHT & COOLING FAN ================= */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-auto py-6 items-center justify-items-center">
          
          {/* CEILING LIGHT FIXTURE */}
          <div
            id="room-light-fixture"
            className={`p-5 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center gap-2.5 ${
              actuators.roomLightRelay
                ? 'bg-amber-950/30 border-yellow-500/80 shadow-2xl shadow-yellow-500/20'
                : 'bg-[#161616]/80 border-gray-800'
            }`}
          >
            <div className="relative">
              {actuators.roomLightRelay && (
                <div className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full scale-150 animate-pulse pointer-events-none" />
              )}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                actuators.roomLightRelay
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-200 border-yellow-100 text-amber-950 shadow-2xl shadow-yellow-300'
                  : 'bg-gray-800 border-gray-700 text-gray-600'
              }`}>
                <Lightbulb className="w-10 h-10" />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-200">Ceiling Pendant (Relay 1)</h4>
              <p className="text-[10px] font-mono text-gray-400">
                {actuators.roomLightRelay ? '⚡ ACTIVE (40 Watts Draw)' : '💤 STANDBY (0 Watts)'}
              </p>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
              actuators.roomLightRelay ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'
            }`}>
              {actuators.roomLightRelay ? 'ILLUMINATED' : 'OFF'}
            </span>
          </div>

          {/* CEILING COOLING FAN */}
          <div
            id="room-fan-fixture"
            className={`p-5 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center gap-2.5 ${
              actuators.fanRelay
                ? 'bg-cyan-950/30 border-cyan-500/80 shadow-2xl shadow-cyan-500/20'
                : 'bg-[#161616]/80 border-gray-800'
            }`}
          >
            <div className="relative">
              {actuators.fanRelay && (
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full scale-150 pointer-events-none animate-pulse" />
              )}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                actuators.fanRelay
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-xl shadow-cyan-500/40'
                  : 'bg-gray-800 border-gray-700 text-gray-600'
              }`}>
                <Fan
                  className={`w-11 h-11 transition-transform duration-300 ${
                    actuators.fanRelay ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: actuators.fanRelay ? '0.35s' : '0s' }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-200">Ventilation Fan (Relay 2)</h4>
              <p className="text-[10px] font-mono text-gray-400">
                {actuators.fanRelay ? '🌀 1850 RPM (65 Watts Draw)' : '💤 STANDBY (0 RPM)'}
              </p>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
              actuators.fanRelay ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-gray-400'
            }`}>
              {actuators.fanRelay ? 'COOLING AIRFLOW' : 'OFF'}
            </span>
          </div>

        </div>

        {/* ================= BOTTOM WALL: DOORWAY & PIR MOTION DETECTOR ================= */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800/80">
          
          {/* DOORWAY & OCCUPANT WALK-BY HOTSPOT */}
          <div
            id="room-door-hotspot"
            onClick={onTriggerPirPulse}
            className={`cursor-pointer px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 active:scale-95 ${
              sensors.pirMotion
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40'
                : 'bg-[#161616] border-gray-800 hover:border-gray-700'
            }`}
            title="Click doorway to simulate person walking into the room"
          >
            <div className={`p-2 rounded ${sensors.pirMotion ? 'bg-emerald-500 text-black animate-bounce' : 'bg-gray-800 text-gray-400'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-200">Room Entrance & Doorway</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                  Click to Walk In
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400">
                PIR Sensor: {sensors.pirMotion ? '⚡ MOTION DETECTED (GPIO 13 HIGH)' : 'No presence (GPIO 13 LOW)'}
              </p>
            </div>
          </div>

          {/* PIR FIELD OF VIEW CONE STATUS */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] border border-gray-800 rounded-lg text-xs font-mono text-gray-400">
            <Eye className={`w-4 h-4 ${sensors.pirMotion ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span>PIR Radar:</span>
            <span className={sensors.pirMotion ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
              {sensors.pirMotion ? 'HUMAN IN CONE (110°)' : 'CLEAR (STANDBY)'}
            </span>
            {motionCountdown > 0 && (
              <span className="text-amber-400 font-bold border-l border-gray-700 pl-2">
                Timer: {motionCountdown}s
              </span>
            )}
          </div>

          {/* PERIMETER SECURITY KEYPAD & SIREN */}
          <div
            id="room-security-hotspot"
            onClick={() => {
              soundFx.playSwitchClick();
              onUpdateSensor('securityMode', !sensors.securityMode);
            }}
            className={`cursor-pointer px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 ${
              actuators.buzzerActive
                ? 'bg-red-950/60 border-red-500 animate-pulse text-red-300'
                : sensors.securityMode
                ? 'bg-red-950/20 border-red-800 text-red-400'
                : 'bg-[#161616] border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
            title="Click to Arm / Disarm Perimeter Security"
          >
            <div className={`p-2 rounded ${
              actuators.buzzerActive
                ? 'bg-red-600 text-white animate-bounce'
                : sensors.securityMode
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-800 text-gray-400'
            }`}>
              {actuators.buzzerActive ? (
                <ShieldAlert className="w-5 h-5 text-white" />
              ) : sensors.securityMode ? (
                <Shield className="w-5 h-5 text-red-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <span>Perimeter Siren (GPIO 25)</span>
                <span className="text-[9px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.2 rounded">
                  Toggle Arm
                </span>
              </div>
              <p className="text-[11px] font-mono">
                {actuators.buzzerActive
                  ? '🚨 ALARM TRIPPED (95dB SIREN ACTIVE)'
                  : sensors.securityMode
                  ? 'ARMED: Perimeter Guard Active'
                  : 'DISARMED: Safe Entry'}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
