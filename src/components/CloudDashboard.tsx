import React from 'react';
import { SensorState, ActuatorState, ThresholdConfig, SystemMetrics } from '../types';
import { soundFx } from '../audio';
import {
  Smartphone,
  Wifi,
  Cloud,
  Shield,
  ShieldAlert,
  Power,
  Sliders,
  Bell,
  Thermometer,
  Sun,
  Lightbulb,
  Fan,
  Activity
} from 'lucide-react';

interface CloudDashboardProps {
  sensors: SensorState;
  actuators: ActuatorState;
  thresholds: ThresholdConfig;
  metrics: SystemMetrics;
  onUpdateSensor: <K extends keyof SensorState>(key: K, value: SensorState[K]) => void;
  onUpdateThreshold: <K extends keyof ThresholdConfig>(key: K, value: ThresholdConfig[K]) => void;
  securityEvents: Array<{ id: string; time: string; text: string; type: 'ALERT' | 'INFO' }>;
}

export const CloudDashboard: React.FC<CloudDashboardProps> = ({
  sensors,
  actuators,
  thresholds,
  metrics,
  onUpdateSensor,
  onUpdateThreshold,
  securityEvents
}) => {
  return (
    <div id="cloud-dashboard-container" className="space-y-6">
      {/* Cloud Header */}
      <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <span>IoT Cloud Connectivity & Remote Web / Mobile Dashboard</span>
            </h3>
            <p className="text-xs text-gray-400">
              Bi-directional MQTT / WebSocket bridge syncing with ESP32 device ID: <code className="text-blue-400 font-mono">ESP32_SHC_8365</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0f0f0f] rounded border border-gray-800 text-gray-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>IP: {metrics.ipAddress}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800/40">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>MQTT Broker: ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT / MAIN: REMOTE CONTROL & TELEMETRY (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Quick Remote Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Security Remote Toggle */}
            <div className={`p-4 rounded-lg border transition-all ${
              sensors.securityMode ? 'bg-red-950/30 border-red-600' : 'bg-[#161616] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Shield className={`w-5 h-5 ${sensors.securityMode ? 'text-red-400' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  sensors.securityMode ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                  {sensors.securityMode ? 'ARMED' : 'DISARMED'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-200">Security Perimeter</h4>
              <p className="text-[11px] text-gray-400 mb-3">Intruder alarm armed state</p>
              <button
                id="cloud-toggle-security-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  onUpdateSensor('securityMode', !sensors.securityMode);
                }}
                className={`w-full py-2 rounded text-xs font-bold transition-all ${
                  sensors.securityMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
                }`}
              >
                {sensors.securityMode ? 'Disarm Alarm' : 'Arm Security'}
              </button>
            </div>

            {/* Room Light Remote Switch */}
            <div className={`p-4 rounded-lg border transition-all ${
              actuators.roomLightRelay ? 'bg-amber-950/30 border-yellow-500' : 'bg-[#161616] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Lightbulb className={`w-5 h-5 ${actuators.roomLightRelay ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  actuators.roomLightRelay ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {actuators.roomLightRelay ? 'ON' : 'OFF'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-200">Room Lighting</h4>
              <p className="text-[11px] text-gray-400 mb-3">
                {sensors.manualOverride ? 'Manual Override Control' : 'Auto Motion + Dark'}
              </p>
              <button
                id="cloud-toggle-light-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  if (!sensors.manualOverride) {
                    onUpdateSensor('manualOverride', true);
                  }
                  onUpdateSensor('manualLightSwitch', !sensors.manualLightSwitch);
                }}
                className={`w-full py-2 rounded text-xs font-bold transition-all ${
                  actuators.roomLightRelay
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-950/50'
                }`}
              >
                {actuators.roomLightRelay ? 'Turn OFF Light' : 'Turn ON Light'}
              </button>
            </div>

            {/* Cooling Fan Remote Switch */}
            <div className={`p-4 rounded-lg border transition-all ${
              actuators.fanRelay ? 'bg-cyan-950/30 border-cyan-500' : 'bg-[#161616] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Fan className={`w-5 h-5 ${actuators.fanRelay ? 'text-cyan-400 animate-spin' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  actuators.fanRelay ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {actuators.fanRelay ? 'ON' : 'OFF'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-200">HVAC Fan Relay</h4>
              <p className="text-[11px] text-gray-400 mb-3">
                {sensors.manualOverride ? 'Manual Override Control' : 'Auto Temp Trigger'}
              </p>
              <button
                id="cloud-toggle-fan-btn"
                onClick={() => {
                  soundFx.playSwitchClick();
                  if (!sensors.manualOverride) {
                    onUpdateSensor('manualOverride', true);
                  }
                  onUpdateSensor('manualFanSwitch', !sensors.manualFanSwitch);
                }}
                className={`w-full py-2 rounded text-xs font-bold transition-all ${
                  actuators.fanRelay
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                }`}
              >
                {actuators.fanRelay ? 'Turn OFF Fan' : 'Turn ON Fan'}
              </button>
            </div>
          </div>

          {/* Cloud Threshold Calibration Sliders */}
          <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h4 className="text-xs font-bold text-gray-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>OTA Threshold Calibration & Rule Parameters</span>
              </h4>
              <span className="text-[10px] font-mono text-gray-500">Live Over-The-Air Config</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Darkness ADC Trigger */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-gray-300">
                  <span>LDR Darkness Threshold:</span>
                  <strong className="text-amber-400">{thresholds.darknessAdcThreshold} ADC</strong>
                </div>
                <input
                  id="cloud-darkness-threshold-slider"
                  type="range"
                  min="500"
                  max="3500"
                  step="50"
                  value={thresholds.darknessAdcThreshold}
                  onChange={(e) => onUpdateThreshold('darknessAdcThreshold', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-gray-500 font-mono block">
                  Higher ADC value requires darker ambient room light to trigger auto lighting.
                </span>
              </div>

              {/* Fan Temperature Trigger */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-gray-300">
                  <span>Fan Auto ON Temperature:</span>
                  <strong className="text-cyan-400">{thresholds.tempThresholdOn.toFixed(1)} °C</strong>
                </div>
                <input
                  id="cloud-temp-threshold-slider"
                  type="range"
                  min="20"
                  max="38"
                  step="0.5"
                  value={thresholds.tempThresholdOn}
                  onChange={(e) => onUpdateThreshold('tempThresholdOn', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] text-gray-500 font-mono block">
                  Fan turns ON above this temperature; turns OFF when temperature drops by 1.5°C (hysteresis).
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: SECURITY EVENT LOG & MQTT PACKET INSPECTOR (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Security Feed */}
          <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h4 className="text-xs font-bold text-gray-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <span>Security Alerts & Event Feed</span>
              </h4>
              <span className="text-[10px] font-mono bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800/40">
                Push Notifications
              </span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto font-mono text-xs">
              {securityEvents.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs font-sans">
                  No security alerts recorded. System is secure.
                </div>
              ) : (
                securityEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-2.5 rounded border flex items-start gap-2 ${
                      evt.type === 'ALERT'
                        ? 'bg-red-950/40 border-red-700/60 text-red-200'
                        : 'bg-[#0f0f0f] border-gray-800 text-gray-300'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold">{evt.text}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">{evt.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live MQTT Packet Streamer */}
          <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h4 className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>MQTT Broker Payload Feed</span>
              </h4>
              <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                QoS 1 &bull; 1883
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-[#0c0c0c] border border-gray-800 rounded">
                <div className="flex justify-between text-[10px] text-blue-400 mb-1">
                  <span>PUB: esp32/telemetry</span>
                  <span className="text-gray-500">Live</span>
                </div>
                <div className="text-gray-300 text-[10px] font-mono break-all">
                  {`{"temp":${sensors.temperature.toFixed(1)},"lux":${sensors.ldrLux},"pir":${sensors.pirMotion},"light":"${actuators.roomLightRelay ? 'ON' : 'OFF'}","fan":"${actuators.fanRelay ? 'ON' : 'OFF'}"}`}
                </div>
              </div>

              <div className="p-2 bg-[#0c0c0c] border border-gray-800 rounded">
                <div className="flex justify-between text-[10px] text-emerald-400 mb-1">
                  <span>PUB: esp32/power</span>
                  <span className="text-gray-500">2s Interval</span>
                </div>
                <div className="text-gray-300 text-[10px] font-mono break-all">
                  {`{"watts":${metrics.currentWatts.toFixed(1)},"kwh":${metrics.totalKwh.toFixed(4)},"uptime":${metrics.uptimeSeconds}}`}
                </div>
              </div>

              <div className="p-2 bg-[#0c0c0c] border border-gray-800 rounded">
                <div className="flex justify-between text-[10px] text-purple-400 mb-1">
                  <span>SUB: esp32/command</span>
                  <span className="text-gray-500">Armed</span>
                </div>
                <div className="text-gray-300 text-[10px] font-mono">
                  {`{"sec_arm":${sensors.securityMode},"override":${sensors.manualOverride}}`}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
