import React from 'react';
import { ActuatorState, SystemMetrics } from '../types';
import { Zap, DollarSign, Leaf, Gauge, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface EnergyMonitorProps {
  actuators: ActuatorState;
  metrics: SystemMetrics;
  powerHistory: Array<{ time: string; watts: number; lightWatts: number; fanWatts: number }>;
}

export const EnergyMonitor: React.FC<EnergyMonitorProps> = ({
  actuators,
  metrics,
  powerHistory
}) => {
  const espWatts = 0.8;
  const lightWatts = actuators.roomLightRelay ? 40 : 0;
  const fanWatts = actuators.fanRelay ? 65 : 0;
  const buzzerWatts = actuators.buzzerActive ? 1.2 : 0;
  const totalWatts = espWatts + lightWatts + fanWatts + buzzerWatts;

  const costPerKwh = 0.16; // $0.16 / kWh average
  const estimatedCost = (metrics.totalKwh * costPerKwh).toFixed(4);
  const co2Kg = (metrics.totalKwh * 0.4).toFixed(3); // ~0.4kg CO2 per kWh

  return (
    <div id="energy-monitor-container" className="space-y-6">
      {/* Header */}
      <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Real-Time Smart Energy & Power Consumption Monitor</span>
          </h3>
          <p className="text-xs text-gray-400">
            Microcontroller load telemetry, appliance wattage tracking, and energy efficiency analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-yellow-950/60 border border-yellow-700/50 rounded text-right">
            <span className="text-[10px] font-mono text-yellow-400 block uppercase">Instantaneous Load</span>
            <span className="text-sm font-mono font-bold text-yellow-300">{totalWatts.toFixed(1)} W</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Power */}
        <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Current Power Draw</span>
            <Gauge className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-100">{totalWatts.toFixed(1)} <span className="text-xs font-normal text-gray-400">Watts</span></div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            MCU: {espWatts}W | Light: {lightWatts}W | Fan: {fanWatts}W
          </div>
        </div>

        {/* Card 2: Cumulative Energy */}
        <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Total Consumed Energy</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{metrics.totalKwh.toFixed(4)} <span className="text-xs font-normal text-gray-400">kWh</span></div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            Session Uptime: {Math.floor(metrics.uptimeSeconds / 60)}m {metrics.uptimeSeconds % 60}s
          </div>
        </div>

        {/* Card 3: Electricity Cost */}
        <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Estimated Running Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">${estimatedCost}</div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            Tariff Rate: $0.16 / kWh
          </div>
        </div>

        {/* Card 4: Carbon Emissions */}
        <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Carbon Footprint</span>
            <Leaf className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-green-300">{co2Kg} <span className="text-xs font-normal text-gray-400">kg CO₂</span></div>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            Eco-optimized by automated sensor timeouts
          </div>
        </div>
      </div>

      {/* Real-Time Power Draw Recharts Graph */}
      <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
            Live Power Consumption Stream (Watts vs Time)
          </h4>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Real-Time Telemetry
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={powerHistory}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 120]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#374151', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Area type="monotone" dataKey="watts" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#powerGrad)" name="Total Load (W)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
