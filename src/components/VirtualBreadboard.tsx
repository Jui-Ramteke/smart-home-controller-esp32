import React from 'react';
import { SensorState, ActuatorState, ThresholdConfig } from '../types';
import { OledDisplay } from './OledDisplay';
import { soundFx } from '../audio';
import {
  Sun,
  Moon,
  Thermometer,
  Droplets,
  Eye,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Flame,
  Fan,
  Lightbulb,
  Radio,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  FastForward,
  Cpu
} from 'lucide-react';

interface VirtualBreadboardProps {
  sensors: SensorState;
  actuators: ActuatorState;
  thresholds: ThresholdConfig;
  motionCountdown: number;
  onUpdateSensor: <K extends keyof SensorState>(key: K, value: SensorState[K]) => void;
  onTriggerPirPulse: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isSimulationRunning?: boolean;
  onToggleSimulationRunning?: () => void;
  simSpeed?: number;
  onSetSimSpeed?: (speed: number) => void;
  autoDemoMode?: boolean;
  autoDemoStep?: number;
  autoDemoMessage?: string;
  onToggleAutoDemo?: () => void;
  onStepTick?: () => void;
  onExecuteScenario?: (scenario: string) => void;
  onResetDefaults?: () => void;
}

export const VirtualBreadboard: React.FC<VirtualBreadboardProps> = ({
  sensors,
  actuators,
  thresholds,
  motionCountdown,
  onUpdateSensor,
  onTriggerPirPulse,
  isMuted,
  onToggleMute,
  isSimulationRunning = true,
  onToggleSimulationRunning,
  simSpeed = 1,
  onSetSimSpeed,
  autoDemoMode = false,
  autoDemoStep = 0,
  autoDemoMessage = 'Ready for stimulation tests',
  onToggleAutoDemo,
  onStepTick,
  onExecuteScenario,
  onResetDefaults
}) => {
  return (
    <div id="virtual-hardware-bench" className="space-y-5">
      {/* ================= SIMULATION CONTROL & STIMULATION TOOLBAR ================= */}
      <div className="bg-[#111111] border border-gray-800 rounded-lg p-3.5 space-y-3 shadow-md">
        
        {/* Top Row: Engine Status, Clock Controls & Auto Demo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#161616] border border-gray-800 rounded">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isSimulationRunning
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse'
                  : 'bg-amber-500'
              }`} />
              <span className="text-xs font-mono font-bold text-gray-200">
                {isSimulationRunning ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED'}
              </span>
              <span className="text-[10px] font-mono text-gray-400 border-l border-gray-700 pl-2">
                100Hz RTOS
              </span>
            </div>

            {/* Play / Pause Toggle */}
            {onToggleSimulationRunning && (
              <button
                id="sim-play-pause-btn"
                onClick={onToggleSimulationRunning}
                className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
                  isSimulationRunning
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow'
                }`}
                title={isSimulationRunning ? 'Pause simulation clock' : 'Resume simulation clock'}
              >
                {isSimulationRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                <span>{isSimulationRunning ? 'Pause' : 'Resume'}</span>
              </button>
            )}

            {/* Manual Step Tick */}
            {onStepTick && (
              <button
                id="sim-step-tick-btn"
                onClick={onStepTick}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 text-xs font-mono flex items-center gap-1 transition-all"
                title="Execute 1 single 200ms tick"
              >
                <FastForward className="w-3 h-3" />
                <span>Step Tick</span>
              </button>
            )}

            {/* Speed Multiplier */}
            {onSetSimSpeed && (
              <div className="flex items-center gap-1 bg-[#161616] border border-gray-800 rounded px-1 py-0.5 text-xs font-mono">
                <span className="text-gray-500 text-[10px] px-1">Speed:</span>
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    id={`sim-speed-${spd}x-btn`}
                    onClick={() => onSetSimSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      simSpeed === spd
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Live Auto-Demo Switch & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleAutoDemo && (
              <button
                id="sim-auto-demo-btn"
                onClick={onToggleAutoDemo}
                className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
                  autoDemoMode
                    ? 'bg-purple-900/80 border-purple-500 text-purple-200 shadow-lg shadow-purple-950 animate-pulse'
                    : 'bg-[#161616] hover:bg-purple-950/40 text-purple-300 border-purple-900/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{autoDemoMode ? 'Auto-Stimulation ACTIVE' : 'Start Auto Stimulation'}</span>
              </button>
            )}

            {onResetDefaults && (
              <button
                id="sim-reset-defaults-btn"
                onClick={onResetDefaults}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded border border-gray-700 text-xs font-mono flex items-center gap-1 transition-all"
                title="Reset all hardware inputs and actuators to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <button
              id="audio-mute-toggle-btn"
              onClick={onToggleMute}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all border ${
                isMuted
                  ? 'bg-[#161616] border-gray-800 text-gray-500'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
              }`}
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-gray-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>
          </div>

        </div>

        {/* Auto Demo Real-Time Progress Banner (When Active) */}
        {autoDemoMode && (
          <div className="p-2.5 bg-purple-950/40 border border-purple-800/80 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-purple-200 font-bold">Auto-Stimulation Engine:</span>
              <span className="text-purple-300">{autoDemoMessage}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-purple-400">
              <span>Step {autoDemoStep + 1} of 9</span>
            </div>
          </div>
        )}

        {/* Bottom Row: 1-Click Quick Scenario Stimulation Presets */}
        <div className="pt-2 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> Quick Stimulate:
          </span>

          <button
            id="quick-stim-night-motion-btn"
            onClick={() => onExecuteScenario?.('TRIGGER_LIGHT_RULE')}
            className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-yellow-300 border border-amber-800/60 rounded text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Sets room Dark + triggers PIR motion -> Room Light turns ON"
          >
            <Moon className="w-3 h-3" />
            <span>Dark + Motion (Light ON)</span>
          </button>

          <button
            id="quick-stim-day-motion-btn"
            onClick={() => onExecuteScenario?.('TRIGGER_LIGHT_DAY_TEST')}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Sets room Bright + triggers PIR motion -> Room Light stays OFF"
          >
            <Sun className="w-3 h-3" />
            <span>Day + Motion (Light OFF)</span>
          </button>

          <button
            id="quick-stim-heatwave-btn"
            onClick={() => onExecuteScenario?.('TRIGGER_FAN_RULE')}
            className="px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 rounded text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Sets Temperature to 31.5°C -> Fan Relay turns ON"
          >
            <Flame className="w-3 h-3 text-red-400" />
            <span>Heat Wave 31.5°C (Fan ON)</span>
          </button>

          <button
            id="quick-stim-cooldown-btn"
            onClick={() => onExecuteScenario?.('TRIGGER_FAN_COOL')}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Sets Temperature to 23°C -> Fan Relay turns OFF"
          >
            <Thermometer className="w-3 h-3 text-cyan-400" />
            <span>Cool 23°C (Fan OFF)</span>
          </button>

          <button
            id="quick-stim-intruder-btn"
            onClick={() => onExecuteScenario?.('TRIGGER_SECURITY_ALARM')}
            className="px-2.5 py-1 bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-700 rounded text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Arms Security + triggers PIR motion -> 95dB Siren + Red Alert LED"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Intruder Alarm (Siren ON)</span>
          </button>

          <button
            id="quick-stim-manual-btn"
            onClick={() => onExecuteScenario?.('TRIGGER_MANUAL_OVERRIDE')}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-purple-300 border border-gray-700 rounded text-[11px] font-mono flex items-center gap-1 transition-all active:scale-95"
            title="Enables Manual Override Switch"
          >
            <Sliders className="w-3 h-3 text-purple-400" />
            <span>Manual Mode</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Inputs (Left) | Microcontroller & Display (Center) | Outputs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ================= LEFT COLUMN: INPUT SENSORS & SWITCHES (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> 1. Virtual Inputs & Sensors
            </h3>
            <span className="text-[10px] font-mono text-gray-500">Analog & Digital Inputs</span>
          </div>

          {/* SENSOR 1: PIR MOTION SENSOR */}
          <div
            id="sensor-pir-card"
            className={`p-4 rounded-lg border transition-all ${
              sensors.pirMotion
                ? 'bg-emerald-950/20 border-emerald-500/80 shadow-lg shadow-emerald-950/30'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${sensors.pirMotion ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">PIR Motion Sensor (HC-SR501)</h4>
                  <p className="text-[10px] font-mono text-gray-400">GPIO 13 &bull; Digital Input</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                sensors.pirMotion ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                {sensors.pirMotion ? 'MOTION DETECTED' : 'NO MOTION'}
              </span>
            </div>

            {/* Smart Rule Helper: Informs user why Light turns on or stays off */}
            {!sensors.manualOverride && !sensors.securityMode && (
              <div className="my-2 p-2 bg-[#0f0f0f] border border-gray-800/80 rounded text-[10px] font-mono">
                {sensors.isDark ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    ✓ Rule 1 Armed: Room is DARK ({sensors.ldrAdc} ADC). Motion turns Room Light ON.
                  </span>
                ) : (
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-amber-400/90">
                      Rule 1: Room is BRIGHT (Daylight). Light stays OFF.
                    </span>
                    <button
                      id="pir-card-switch-dark-btn"
                      onClick={() => {
                        soundFx.playSwitchClick();
                        onUpdateSensor('ldrAdc', 3200);
                        onUpdateSensor('isDark', true);
                        onUpdateSensor('ldrLux', 50);
                      }}
                      className="text-[10px] font-bold text-amber-300 underline hover:text-amber-200"
                    >
                      Make Room Dark 🌙
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <button
                id="pir-walk-by-btn"
                onClick={onTriggerPirPulse}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Simulate Human Walk-By (5s Pulse)</span>
              </button>

              <button
                id="pir-toggle-lock-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('pirMotion', !sensors.pirMotion);
                }}
                className={`px-3 py-2 text-xs font-mono rounded border transition-all ${
                  sensors.pirMotion
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-gray-200'
                }`}
                title="Continuous Motion Hold"
              >
                {sensors.pirMotion ? 'Release' : 'Hold ON'}
              </button>
            </div>

            {motionCountdown > 0 && !sensors.pirMotion && (
              <div className="mt-2 text-[10px] font-mono text-amber-400 flex items-center justify-between">
                <span>Auto-light shutoff timer:</span>
                <span className="font-bold">{motionCountdown}s remaining</span>
              </div>
            )}
          </div>

          {/* SENSOR 2: LDR LIGHT SENSOR */}
          <div id="sensor-ldr-card" className="p-4 bg-[#161616] border border-gray-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${sensors.isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {sensors.isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">LDR Photoresistor</h4>
                  <p className="text-[10px] font-mono text-gray-400">GPIO 34 &bull; ADC1 (0–4095)</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                sensors.isDark ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-700/40' : 'bg-amber-900/80 text-amber-300 border border-amber-700/40'
              }`}>
                {sensors.isDark ? 'ROOM: DARK' : 'ROOM: BRIGHT'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>ADC Reading: <strong className="text-gray-200">{sensors.ldrAdc}</strong> / 4095</span>
                <span>Lux: <strong className="text-gray-200">{Math.round(sensors.ldrLux)} lx</strong></span>
              </div>
              <input
                id="ldr-adc-slider"
                type="range"
                min="0"
                max="4095"
                step="25"
                value={sensors.ldrAdc}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const isDark = val >= thresholds.darknessAdcThreshold;
                  const lux = Math.max(5, Math.round(1000 - (val / 4095) * 980));
                  onUpdateSensor('ldrAdc', val);
                  onUpdateSensor('isDark', isDark);
                  onUpdateSensor('ldrLux', lux);
                }}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>0 (Direct Sunlight)</span>
                <span className="text-amber-500/80 font-semibold">Threshold: {thresholds.darknessAdcThreshold}</span>
                <span>4095 (Pitch Dark)</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                id="ldr-preset-dark-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('ldrAdc', 3200);
                  onUpdateSensor('isDark', true);
                  onUpdateSensor('ldrLux', 50);
                }}
                className={`flex-1 py-1.5 text-xs font-mono rounded border flex items-center justify-center gap-1 transition-all ${
                  sensors.isDark
                    ? 'bg-indigo-950/80 text-indigo-200 border-indigo-700'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
                }`}
              >
                <Moon className="w-3 h-3" /> Night / Dark (3200 ADC)
              </button>

              <button
                id="ldr-preset-bright-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('ldrAdc', 600);
                  onUpdateSensor('isDark', false);
                  onUpdateSensor('ldrLux', 750);
                }}
                className={`flex-1 py-1.5 text-xs font-mono rounded border flex items-center justify-center gap-1 transition-all ${
                  !sensors.isDark
                    ? 'bg-amber-950/80 text-amber-200 border-amber-700'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'
                }`}
              >
                <Sun className="w-3 h-3" /> Daylight (600 ADC)
              </button>
            </div>
          </div>

          {/* SENSOR 3: DHT22 TEMPERATURE & HUMIDITY */}
          <div id="sensor-dht22-card" className="p-4 bg-[#161616] border border-gray-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${sensors.temperature >= thresholds.tempThresholdOn ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">DHT22 Temp & Humidity Sensor</h4>
                  <p className="text-[10px] font-mono text-gray-400">GPIO 4 &bull; 1-Wire Digital</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                sensors.temperature >= thresholds.tempThresholdOn
                  ? 'bg-red-900/80 text-red-300 border border-red-700/40'
                  : 'bg-cyan-900/80 text-cyan-300 border border-cyan-700/40'
              }`}>
                {sensors.temperature >= thresholds.tempThresholdOn ? 'HIGH TEMP (>28°C)' : 'NORMAL TEMP'}
              </span>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>Temperature:</span>
                <strong className={`text-xs ${sensors.temperature >= thresholds.tempThresholdOn ? 'text-red-400' : 'text-cyan-400'}`}>
                  {sensors.temperature.toFixed(1)} °C / {(sensors.temperature * 1.8 + 32).toFixed(1)} °F
                </strong>
              </div>
              <input
                id="temp-slider"
                type="range"
                min="16"
                max="45"
                step="0.5"
                value={sensors.temperature}
                onChange={(e) => onUpdateSensor('temperature', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>16°C (Cool)</span>
                <span className="text-cyan-500/80 font-semibold">Fan Trigger: &gt; {thresholds.tempThresholdOn}°C</span>
                <span>45°C (Extreme)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400" /> Humidity:</span>
                <strong className="text-xs text-gray-200">{Math.round(sensors.humidity)} %</strong>
              </div>
              <input
                id="humidity-slider"
                type="range"
                min="20"
                max="95"
                step="1"
                value={sensors.humidity}
                onChange={(e) => onUpdateSensor('humidity', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            {/* Quick Temp Presets */}
            <div className="flex gap-2 pt-1">
              <button
                id="temp-preset-cool-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('temperature', 23.0);
                }}
                className="flex-1 py-1 text-[11px] font-mono bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors"
              >
                Cool (23°C)
              </button>
              <button
                id="temp-preset-warm-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('temperature', 31.5);
                }}
                className="flex-1 py-1 text-[11px] font-mono bg-red-950/60 hover:bg-red-900/80 text-red-200 rounded border border-red-800/60 transition-colors"
              >
                Hot (31.5°C)
              </button>
            </div>
          </div>

          {/* HARDWARE SWITCHES & OVERRIDES */}
          <div id="switches-panel" className="p-4 bg-[#161616] border border-gray-800 rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-gray-200 flex items-center justify-between">
              <span>Manual Switches & Security Panel</span>
              <span className="text-[10px] font-mono text-gray-400">Hardware GPIO Controls</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Security Mode Switch */}
              <button
                id="security-mode-toggle-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('securityMode', !sensors.securityMode);
                }}
                className={`p-3 rounded border text-left transition-all ${
                  sensors.securityMode
                    ? 'bg-red-950/40 border-red-600 text-red-300 shadow-md shadow-red-950/30'
                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Shield className="w-4 h-4" />
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    sensors.securityMode ? 'bg-red-500 text-black' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {sensors.securityMode ? 'ARMED' : 'DISARMED'}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-200">Security Mode</div>
                <div className="text-[10px] font-mono text-gray-500">GPIO 12 Switch</div>
              </button>

              {/* Auto / Manual Mode Switch */}
              <button
                id="manual-override-toggle-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('manualOverride', !sensors.manualOverride);
                }}
                className={`p-3 rounded border text-left transition-all ${
                  sensors.manualOverride
                    ? 'bg-amber-950/40 border-amber-600 text-amber-300 shadow-md shadow-amber-950/30'
                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Sliders className="w-4 h-4" />
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    sensors.manualOverride ? 'bg-amber-500 text-black' : 'bg-emerald-900/60 text-emerald-300'
                  }`}>
                    {sensors.manualOverride ? 'MANUAL' : 'AUTO'}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-200">Override Mode</div>
                <div className="text-[10px] font-mono text-gray-500">GPIO 14 Switch</div>
              </button>

              {/* Manual Light Switch (only active or takes priority in manual mode) */}
              <button
                id="manual-light-toggle-btn"
                disabled={!sensors.manualOverride}
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('manualLightSwitch', !sensors.manualLightSwitch);
                }}
                className={`p-2.5 rounded border text-left transition-all ${
                  !sensors.manualOverride
                    ? 'opacity-40 cursor-not-allowed bg-[#0f0f0f] border-gray-800 text-gray-600'
                    : sensors.manualLightSwitch
                    ? 'bg-yellow-950/60 border-yellow-500 text-yellow-300'
                    : 'bg-gray-800 border-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono">
                    {sensors.manualLightSwitch ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="text-[11px] font-bold">Manual Light</div>
                <div className="text-[9px] font-mono text-gray-500">GPIO 27</div>
              </button>

              {/* Manual Fan Switch */}
              <button
                id="manual-fan-toggle-btn"
                disabled={!sensors.manualOverride}
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('manualFanSwitch', !sensors.manualFanSwitch);
                }}
                className={`p-2.5 rounded border text-left transition-all ${
                  !sensors.manualOverride
                    ? 'opacity-40 cursor-not-allowed bg-[#0f0f0f] border-gray-800 text-gray-600'
                    : sensors.manualFanSwitch
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                    : 'bg-gray-800 border-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Fan className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono">
                    {sensors.manualFanSwitch ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="text-[11px] font-bold">Manual Fan</div>
                <div className="text-[9px] font-mono text-gray-500">GPIO 26</div>
              </button>
            </div>
          </div>

        </div>

        {/* ================= CENTER COLUMN: ESP32 MCU & OLED DISPLAY (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-1 border-b border-gray-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Radio className="w-4 h-4" /> 2. MCU & Display
            </h3>
            <span className="text-[10px] font-mono text-gray-500">ESP32 Core</span>
          </div>

          {/* SSD1306 OLED DISPLAY */}
          <div className="bg-[#161616] border border-gray-800 p-3 rounded-lg flex flex-col items-center justify-center">
            <OledDisplay
              sensors={sensors}
              actuators={actuators}
              motionCountdown={motionCountdown}
            />
          </div>

          {/* ESP32 MICROCONTROLLER BOARD VISUAL */}
          <div id="esp32-board-card" className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 shadow-2xl relative flex-1 flex flex-col justify-between">
            {/* USB Port Top */}
            <div className="w-8 h-3 bg-gray-700 rounded-t mx-auto border border-gray-600 shadow-inner" />

            {/* Board PCB Face */}
            <div className="my-2 p-2.5 bg-[#161616] rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider">DOIT ESP32 DEVKIT V1</span>
                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  Dual-Core 240MHz
                </span>
              </div>

              {/* Metal RF Shield */}
              <div className="bg-gray-800/90 border border-gray-700 rounded p-2 text-center my-2 shadow-inner">
                <span className="text-[10px] font-mono text-gray-300 font-semibold block">ESP-WROOM-32</span>
                <span className="text-[8px] font-mono text-gray-500">Wi-Fi + BLE + 4MB Flash</span>
              </div>

              {/* Live Pin Status Matrix */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono">
                <div className="flex justify-between items-center text-gray-400">
                  <span>D13 (PIR):</span>
                  <span className={`w-2 h-2 rounded-full ${sensors.pirMotion ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-gray-700'}`} />
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>D2 (Light):</span>
                  <span className={`w-2 h-2 rounded-full ${actuators.roomLightRelay ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]' : 'bg-gray-700'}`} />
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>D34 (LDR):</span>
                  <span className={`w-2 h-2 rounded-full ${sensors.isDark ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>D15 (Fan):</span>
                  <span className={`w-2 h-2 rounded-full ${actuators.fanRelay ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'bg-gray-700'}`} />
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>D4 (DHT):</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>D25 (Buzzer):</span>
                  <span className={`w-2 h-2 rounded-full ${actuators.buzzerActive ? 'bg-red-500 animate-ping' : 'bg-gray-700'}`} />
                </div>
              </div>
            </div>

            {/* LED Status Section */}
            <div className="flex items-center justify-around pt-1 border-t border-gray-800">
              {/* Green Heartbeat */}
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${actuators.greenStatusLed ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 'bg-emerald-950'}`} />
                <span className="text-[9px] font-mono text-gray-400">D33 (RUN)</span>
              </div>

              {/* Red Alert LED */}
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${actuators.redAlertLed ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse' : 'bg-red-950'}`} />
                <span className="text-[9px] font-mono text-gray-400">D32 (ALERT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: OUTPUT ACTUATORS & APPLIANCES (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-yellow-400 font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 3. Outputs & Appliances
            </h3>
            <span className="text-[10px] font-mono text-gray-500">Relays & Sirens</span>
          </div>

          {/* ACTUATOR 1: ROOM LIGHT (RELAY 1 + BULB) */}
          <div
            id="actuator-room-light-card"
            className={`p-4 rounded-lg border transition-all ${
              actuators.roomLightRelay
                ? 'bg-amber-950/20 border-yellow-500/80 shadow-xl shadow-yellow-950/30'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${actuators.roomLightRelay ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/50' : 'bg-gray-800 text-gray-400'}`}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Room Light (Relay 1)</h4>
                  <p className="text-[10px] font-mono text-gray-400">GPIO 2 &bull; 230V / 40W AC</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                actuators.roomLightRelay ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                {actuators.roomLightRelay ? 'LIGHT ON' : 'LIGHT OFF'}
              </span>
            </div>

            {/* Visual Glowing Bulb */}
            <div className="flex items-center justify-center py-4 bg-[#0f0f0f] rounded border border-gray-800 relative overflow-hidden">
              <div className={`relative transition-all duration-300 ${actuators.roomLightRelay ? 'scale-110' : 'scale-95 opacity-40'}`}>
                {/* Glow ring */}
                {actuators.roomLightRelay && (
                  <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full scale-150 animate-pulse pointer-events-none" />
                )}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                  actuators.roomLightRelay
                    ? 'bg-gradient-to-t from-yellow-300 to-amber-100 border-yellow-200 text-amber-950 shadow-2xl shadow-yellow-300'
                    : 'bg-gray-800 border-gray-700 text-gray-600'
                }`}>
                  <Lightbulb className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-2">
              <span>Power Draw: {actuators.roomLightRelay ? '40 W' : '0 W'}</span>
              <span>Trigger: {sensors.manualOverride ? 'Manual Sw' : 'Motion + Dark'}</span>
            </div>
          </div>

          {/* ACTUATOR 2: VENTILATION FAN (RELAY 2 + MOTOR) */}
          <div
            id="actuator-fan-card"
            className={`p-4 rounded-lg border transition-all ${
              actuators.fanRelay
                ? 'bg-cyan-950/20 border-cyan-500/80 shadow-xl shadow-cyan-950/30'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${actuators.fanRelay ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/50' : 'bg-gray-800 text-gray-400'}`}>
                  <Fan className={`w-4 h-4 ${actuators.fanRelay ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Cooling Fan (Relay 2)</h4>
                  <p className="text-[10px] font-mono text-gray-400">GPIO 15 &bull; 65W High-Flow</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                actuators.fanRelay ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                {actuators.fanRelay ? 'FAN ON' : 'FAN OFF'}
              </span>
            </div>

            {/* Visual Spinning Fan */}
            <div className="flex items-center justify-center py-4 bg-[#0f0f0f] rounded border border-gray-800 relative overflow-hidden">
              <div className={`relative transition-all ${actuators.fanRelay ? 'scale-110' : 'scale-95 opacity-40'}`}>
                {actuators.fanRelay && (
                  <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full scale-125 pointer-events-none" />
                )}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                  actuators.fanRelay
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-xl shadow-cyan-500/40'
                    : 'bg-gray-800 border-gray-700 text-gray-600'
                }`}>
                  <Fan
                    className={`w-9 h-9 transition-transform duration-500 ${
                      actuators.fanRelay ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: actuators.fanRelay ? '0.4s' : '0s' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-2">
              <span>RPM: {actuators.fanRelay ? '1850 RPM' : '0 RPM'}</span>
              <span>Power Draw: {actuators.fanRelay ? '65 W' : '0 W'}</span>
            </div>
          </div>

          {/* ACTUATOR 3: SECURITY PIEZO BUZZER & ALARM SIREN */}
          <div
            id="actuator-security-buzzer-card"
            className={`p-4 rounded-lg border transition-all ${
              actuators.buzzerActive
                ? 'bg-red-950/40 border-red-500 shadow-2xl shadow-red-950/60 animate-pulse'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${actuators.buzzerActive ? 'bg-red-500 text-white animate-bounce' : 'bg-gray-800 text-gray-400'}`}>
                  {actuators.buzzerActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Security Siren & Buzzer</h4>
                  <p className="text-[10px] font-mono text-gray-400">GPIO 25 &bull; 95dB Piezo</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                actuators.buzzerActive ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400'
              }`}>
                {actuators.buzzerActive ? 'ALARM TRIPPED' : 'QUIET (SAFE)'}
              </span>
            </div>

            {actuators.buzzerActive ? (
              <div className="p-2.5 bg-red-950/80 border border-red-600/60 rounded text-center">
                <span className="text-xs font-bold text-red-200 block font-mono">
                  🚨 INTRUSION DETECTED!
                </span>
                <span className="text-[10px] font-mono text-red-300">
                  Red Alert LED STROBE &bull; Piezo Siren Pulsing
                </span>
              </div>
            ) : (
              <div className="p-2 bg-[#0f0f0f] border border-gray-800 rounded flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Arm State: {sensors.securityMode ? 'ARMED' : 'DISARMED'}</span>
                <span>Threshold: Motion Event</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
