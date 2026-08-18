import React, { useState } from 'react';
import { SensorState, ActuatorState, ThresholdConfig, CustomRule } from '../types';
import { soundFx } from '../audio';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Sparkles,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Play
} from 'lucide-react';

interface RuleEngineViewProps {
  sensors: SensorState;
  actuators: ActuatorState;
  thresholds: ThresholdConfig;
  motionCountdown: number;
  customRules?: CustomRule[];
  onAddCustomRule?: (rule: Omit<CustomRule, 'id'>) => void;
  onDeleteCustomRule?: (id: string) => void;
  onToggleCustomRule?: (id: string) => void;
  onExecuteScenario?: (scenario: string) => void;
}

export const RuleEngineView: React.FC<RuleEngineViewProps> = ({
  sensors,
  actuators,
  thresholds,
  motionCountdown,
  customRules = [],
  onAddCustomRule,
  onDeleteCustomRule,
  onToggleCustomRule,
  onExecuteScenario
}) => {
  // New rule form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState('High Humidity Ventilation');
  const [newRuleTrigger, setNewRuleTrigger] = useState<CustomRule['trigger']>('humidity');
  const [newRuleOp, setNewRuleOp] = useState<CustomRule['operator']>('>');
  const [newRuleThreshold, setNewRuleThreshold] = useState<number>(70);
  const [newRuleAction, setNewRuleAction] = useState<CustomRule['action']>('setFan');
  const [newRuleActionValue, setNewRuleActionValue] = useState<boolean>(true);

  // Evaluations
  const rule1_cond_motion = sensors.pirMotion;
  const rule1_cond_dark = sensors.isDark;
  const rule1_active = !sensors.manualOverride && (rule1_cond_motion && rule1_cond_dark);
  const rule1_timer_active = !sensors.manualOverride && !rule1_cond_motion && motionCountdown > 0 && actuators.roomLightRelay;

  const rule2_cond_temp = sensors.temperature >= thresholds.tempThresholdOn;
  const rule2_active = !sensors.manualOverride && actuators.fanRelay;

  const rule3_cond_armed = sensors.securityMode;
  const rule3_cond_motion = sensors.pirMotion;
  const rule3_active = rule3_cond_armed && rule3_cond_motion;

  const rule4_active = sensors.manualOverride;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddCustomRule) return;
    soundFx.playSwitchClick();
    onAddCustomRule({
      name: newRuleName,
      enabled: true,
      trigger: newRuleTrigger,
      operator: newRuleOp,
      threshold: Number(newRuleThreshold),
      action: newRuleAction,
      actionValue: newRuleActionValue,
      description: `IF ${newRuleTrigger} ${newRuleOp} ${newRuleThreshold} THEN ${newRuleAction} = ${newRuleActionValue ? 'ON' : 'OFF'}`
    });
    setShowAddForm(false);
    setNewRuleName('');
  };

  return (
    <div id="rule-engine-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>EMBEDDED AUTOMATION RULES ENGINE (ESP32 RTOS)</span>
          </h3>
          <p className="text-xs text-gray-400">
            Microcontroller FreeRTOS task evaluates state conditions every 100ms with prioritized execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400">Execution Mode:</span>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
            sensors.manualOverride
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {sensors.manualOverride ? 'RULE 4: MANUAL OVERRIDE ENGAGED' : 'AUTONOMOUS SENSOR RULES ACTIVE'}
          </span>
        </div>
      </div>

      {/* 4 Standard Industry Rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Core Embedded Rules
          </h4>
          <span className="text-[10px] font-mono text-gray-500">Firmware Logic v2.4</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* RULE 1 CARD */}
          <div
            id="rule-1-card"
            className={`p-4 rounded-lg border transition-all ${
              rule1_active || rule1_timer_active
                ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                : sensors.manualOverride
                ? 'bg-[#161616]/40 border-gray-800/60 opacity-60'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-300">RULE 1 – SMART OCCUPANCY LIGHT</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                rule1_active
                  ? 'bg-emerald-500 text-black'
                  : rule1_timer_active
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : sensors.manualOverride
                  ? 'bg-gray-800 text-gray-500'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {rule1_active ? 'STATE: ON' : rule1_timer_active ? `OFF IN ${motionCountdown}s` : 'STATE: OFF'}
              </span>
            </div>

            <div className="text-xs font-mono space-y-1.5 my-3 bg-[#0f0f0f] p-2.5 rounded border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Condition 1: Motion == DETECTED</span>
                <span className={`flex items-center gap-1 text-[11px] ${rule1_cond_motion ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {rule1_cond_motion ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rule1_cond_motion ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Condition 2: Room == DARK (ADC &ge; {thresholds.darknessAdcThreshold})</span>
                <span className={`flex items-center gap-1 text-[11px] ${rule1_cond_dark ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {rule1_cond_dark ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rule1_cond_dark ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Action: Relay 1 (Light) &rarr; ON with {thresholds.lightTimeoutSeconds}s timeout</span>
              </div>
              {onExecuteScenario && (
                <button
                  id="stim-rule1-btn"
                  onClick={() => onExecuteScenario('TRIGGER_LIGHT_RULE')}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-yellow-300 text-[10px] font-mono rounded border border-gray-700 flex items-center gap-1 transition-all"
                >
                  <Play className="w-2.5 h-2.5" /> Stimulate
                </button>
              )}
            </div>
          </div>

          {/* RULE 2 CARD */}
          <div
            id="rule-2-card"
            className={`p-4 rounded-lg border transition-all ${
              rule2_active
                ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                : sensors.manualOverride
                ? 'bg-[#161616]/40 border-gray-800/60 opacity-60'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-300">RULE 2 – CLIMATE FAN AUTOMATION</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                rule2_active
                  ? 'bg-cyan-500 text-black'
                  : sensors.manualOverride
                  ? 'bg-gray-800 text-gray-500'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {rule2_active ? 'STATE: ON' : 'STATE: OFF'}
              </span>
            </div>

            <div className="text-xs font-mono space-y-1.5 my-3 bg-[#0f0f0f] p-2.5 rounded border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Temp &ge; {thresholds.tempThresholdOn}°C (Curr: {sensors.temperature.toFixed(1)}°C)</span>
                <span className={`flex items-center gap-1 text-[11px] ${rule2_cond_temp ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {rule2_cond_temp ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rule2_cond_temp ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Hysteresis Cutoff: &le; {thresholds.tempThresholdOff}°C</span>
                <span>Chatter Guard: ACTIVE</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Action: Relay 2 (Fan) &rarr; ON at 1850 RPM</span>
              </div>
              {onExecuteScenario && (
                <button
                  id="stim-rule2-btn"
                  onClick={() => onExecuteScenario('TRIGGER_FAN_RULE')}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 text-[10px] font-mono rounded border border-gray-700 flex items-center gap-1 transition-all"
                >
                  <Play className="w-2.5 h-2.5" /> Stimulate
                </button>
              )}
            </div>
          </div>

          {/* RULE 3 CARD */}
          <div
            id="rule-3-card"
            className={`p-4 rounded-lg border transition-all ${
              rule3_active
                ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/50 animate-pulse'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-300">RULE 3 – SECURITY ALARM PERIMETER</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                rule3_active ? 'bg-red-600 text-white' : sensors.securityMode ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'
              }`}>
                {rule3_active ? 'ALARM ACTIVE' : sensors.securityMode ? 'ARMED (SECURE)' : 'DISARMED'}
              </span>
            </div>

            <div className="text-xs font-mono space-y-1.5 my-3 bg-[#0f0f0f] p-2.5 rounded border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Condition 1: Security Mode == ARMED</span>
                <span className={`flex items-center gap-1 text-[11px] ${rule3_cond_armed ? 'text-red-400' : 'text-gray-500'}`}>
                  {rule3_cond_armed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rule3_cond_armed ? 'ARMED' : 'DISARMED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Condition 2: Motion == DETECTED</span>
                <span className={`flex items-center gap-1 text-[11px] ${rule3_cond_motion ? 'text-red-400' : 'text-gray-500'}`}>
                  {rule3_cond_motion ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rule3_cond_motion ? 'INTRUDER' : 'NONE'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Action: 95dB Siren + Red Alert LED Strobe + Cloud Alarm</span>
              </div>
              {onExecuteScenario && (
                <button
                  id="stim-rule3-btn"
                  onClick={() => onExecuteScenario('TRIGGER_SECURITY_ALARM')}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-red-300 text-[10px] font-mono rounded border border-gray-700 flex items-center gap-1 transition-all"
                >
                  <Play className="w-2.5 h-2.5" /> Stimulate
                </button>
              )}
            </div>
          </div>

          {/* RULE 4 CARD */}
          <div
            id="rule-4-card"
            className={`p-4 rounded-lg border transition-all ${
              rule4_active
                ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-950/40'
                : 'bg-[#161616] border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-300">RULE 4 – MANUAL GPIO OVERRIDE</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                rule4_active ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                {rule4_active ? 'OVERRIDE ENGAGED' : 'STANDBY (AUTO)'}
              </span>
            </div>

            <div className="text-xs font-mono space-y-1.5 my-3 bg-[#0f0f0f] p-2.5 rounded border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Manual Mode Switch (GPIO 14)</span>
                <span className={`flex items-center gap-1 text-[11px] ${sensors.manualOverride ? 'text-amber-400' : 'text-gray-500'}`}>
                  {sensors.manualOverride ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {sensors.manualOverride ? 'ENGAGED' : 'OFF (AUTO)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Manual Switches</span>
                <span className="text-gray-300 text-[11px]">
                  Light (GPIO 27): {sensors.manualLightSwitch ? 'ON' : 'OFF'} | Fan (GPIO 26): {sensors.manualFanSwitch ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Action: Bypasses automated sensor rules for direct switch control</span>
              </div>
              {onExecuteScenario && (
                <button
                  id="stim-rule4-btn"
                  onClick={() => onExecuteScenario('TRIGGER_MANUAL_OVERRIDE')}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-amber-300 text-[10px] font-mono rounded border border-gray-700 flex items-center gap-1 transition-all"
                >
                  <Play className="w-2.5 h-2.5" /> Stimulate
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ================= CUSTOM AUTOMATION RULES BUILDER ================= */}
      <div className="bg-[#111111] border border-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-800">
          <div>
            <h4 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Custom Automation Rule Studio
            </h4>
            <p className="text-[11px] text-gray-400">
              Create custom conditional triggers that run in the firmware evaluation loop alongside default rules.
            </p>
          </div>

          <button
            id="add-custom-rule-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium rounded flex items-center gap-1 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel Form' : 'New Custom Rule'}</span>
          </button>
        </div>

        {/* Add New Rule Form */}
        {showAddForm && (
          <form onSubmit={handleCreateRule} className="p-3.5 bg-[#161616] border border-purple-900/60 rounded-lg space-y-3 text-xs font-mono">
            <div className="font-bold text-purple-300 flex items-center gap-1">
              <span>Create Conditional IoT Automation Rule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-gray-700 rounded px-2.5 py-1 text-gray-200 text-xs"
                  placeholder="e.g. High Humidity Alert"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">IF Sensor Trigger</label>
                <select
                  value={newRuleTrigger}
                  onChange={(e) => setNewRuleTrigger(e.target.value as any)}
                  className="w-full bg-[#0c0c0c] border border-gray-700 rounded px-2.5 py-1 text-gray-200 text-xs"
                >
                  <option value="humidity">Humidity (% RH)</option>
                  <option value="temperature">Temperature (°C)</option>
                  <option value="ldrAdc">Light LDR (ADC)</option>
                  <option value="pirMotion">PIR Motion</option>
                  <option value="securityMode">Security Armed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Condition & Threshold</label>
                <div className="flex gap-1.5">
                  <select
                    value={newRuleOp}
                    onChange={(e) => setNewRuleOp(e.target.value as any)}
                    className="w-16 bg-[#0c0c0c] border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
                  >
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                  </select>
                  <input
                    type="number"
                    value={newRuleThreshold}
                    onChange={(e) => setNewRuleThreshold(Number(e.target.value))}
                    className="flex-1 bg-[#0c0c0c] border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">THEN Actuator Action</label>
                <div className="flex gap-1.5">
                  <select
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value as any)}
                    className="flex-1 bg-[#0c0c0c] border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
                  >
                    <option value="setFan">Cooling Fan</option>
                    <option value="setLight">Room Light</option>
                    <option value="setAlarm">Security Buzzer</option>
                  </select>
                  <select
                    value={newRuleActionValue ? 'true' : 'false'}
                    onChange={(e) => setNewRuleActionValue(e.target.value === 'true')}
                    className="w-16 bg-[#0c0c0c] border border-gray-700 rounded px-1.5 py-1 text-gray-200 text-xs"
                  >
                    <option value="true">ON</option>
                    <option value="false">OFF</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold shadow"
              >
                Save & Deploy Rule
              </button>
            </div>
          </form>
        )}

        {/* Rules List */}
        {customRules.length === 0 ? (
          <div className="text-center py-4 text-xs font-mono text-gray-500 border border-dashed border-gray-800 rounded-lg">
            No custom rules active. Click "+ New Custom Rule" to build a custom smart home automation routine.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customRules.map((cr) => (
              <div
                key={cr.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-all flex flex-col justify-between ${
                  cr.isTriggered && cr.enabled
                    ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/40'
                    : cr.enabled
                    ? 'bg-[#161616] border-gray-800'
                    : 'bg-[#161616]/40 border-gray-800/50 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-200">{cr.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      cr.isTriggered && cr.enabled
                        ? 'bg-purple-500 text-white animate-pulse'
                        : cr.enabled
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {cr.isTriggered && cr.enabled ? 'TRIGGERED' : cr.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                    {onToggleCustomRule && (
                      <button
                        onClick={() => onToggleCustomRule(cr.id)}
                        className="text-gray-400 hover:text-gray-200"
                        title={cr.enabled ? 'Disable rule' : 'Enable rule'}
                      >
                        {cr.enabled ? (
                          <ToggleRight className="w-4 h-4 text-purple-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}
                    {onDeleteCustomRule && (
                      <button
                        onClick={() => onDeleteCustomRule(cr.id)}
                        className="text-gray-500 hover:text-red-400 p-0.5"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 my-1 bg-[#0c0c0c] p-2 rounded border border-gray-800">
                  {cr.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

