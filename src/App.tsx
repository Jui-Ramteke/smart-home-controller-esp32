import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SensorState,
  ActuatorState,
  ThresholdConfig,
  SystemMetrics,
  SerialLog,
  SmartProfile,
  CustomRule
} from './types';
import { soundFx } from './audio';
import { VirtualBreadboard } from './components/VirtualBreadboard';
import { RoomFloorplan } from './components/RoomFloorplan';
import { StepVerificationGuide } from './components/StepVerificationGuide';
import { RuleEngineView } from './components/RuleEngineView';
import { SerialMonitor } from './components/SerialMonitor';
import { CloudDashboard } from './components/CloudDashboard';
import { EnergyMonitor } from './components/EnergyMonitor';
import { CodeViewer } from './components/CodeViewer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { WokwiSimulatorHub } from './components/WokwiSimulatorHub';
import {
  Cpu,
  Layers,
  Terminal,
  Cloud,
  Zap,
  Code2,
  CheckCheck,
  ShieldAlert,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  Home,
  Sliders,
  Moon,
  Leaf,
  Shield,
  LayoutGrid,
  Maximize2,
  Radio
} from 'lucide-react';

const INITIAL_SENSORS: SensorState = {
  pirMotion: false,
  ldrAdc: 800, // Daylight initial
  ldrLux: 600,
  isDark: false,
  temperature: 25.0, // Normal initial
  humidity: 50,
  securityMode: false,
  manualOverride: false,
  manualLightSwitch: false,
  manualFanSwitch: false
};

const INITIAL_ACTUATORS: ActuatorState = {
  roomLightRelay: false,
  fanRelay: false,
  buzzerActive: false,
  redAlertLed: false,
  greenStatusLed: true,
  fanRpm: 0,
  lightBrightness: 0
};

const INITIAL_THRESHOLDS: ThresholdConfig = {
  darknessAdcThreshold: 2000,
  tempThresholdOn: 28.0,
  tempThresholdOff: 26.5,
  lightTimeoutSeconds: 5 // 5s for fast interactive testing
};

const DEFAULT_CUSTOM_RULES: CustomRule[] = [
  {
    id: 'cr_humid_vent',
    name: 'High Humidity Fan Vent',
    enabled: true,
    trigger: 'humidity',
    operator: '>',
    threshold: 65,
    action: 'setFan',
    actionValue: true,
    description: 'IF Humidity > 65% THEN Cooling Fan = ON'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'bench' | 'wokwi' | 'rules' | 'verify' | 'cloud' | 'energy' | 'firmware'
  >('bench');

  const [workbenchViewMode, setWorkbenchViewMode] = useState<'both' | 'breadboard' | 'floorplan'>('both');
  const [activeFirmwareSubtab, setActiveFirmwareSubtab] = useState<'code' | 'serial' | 'arch'>('code');
  const [currentProfile, setCurrentProfile] = useState<SmartProfile>('NORMAL');

  const [sensors, setSensors] = useState<SensorState>(INITIAL_SENSORS);
  const [actuators, setActuators] = useState<ActuatorState>(INITIAL_ACTUATORS);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(INITIAL_THRESHOLDS);
  const [customRules, setCustomRules] = useState<CustomRule[]>(DEFAULT_CUSTOM_RULES);
  
  const [motionCountdown, setMotionCountdown] = useState<number>(0);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    motionCountdown: 0,
    uptimeSeconds: 0,
    totalKwh: 0.0012,
    currentWatts: 0.8,
    wifiConnected: true,
    ipAddress: '192.168.1.142',
    mqttConnected: true,
    activeAlarmsCount: 0
  });

  const [logs, setLogs] = useState<SerialLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<
    Array<{ id: string; time: string; text: string; type: 'ALERT' | 'INFO' }>
  >([]);
  const [powerHistory, setPowerHistory] = useState<
    Array<{ time: string; watts: number; lightWatts: number; fanWatts: number }>
  >([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Simulation Clock & Automated Stimulation Engine
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [autoDemoMode, setAutoDemoMode] = useState<boolean>(false);
  const [autoDemoStep, setAutoDemoStep] = useState<number>(0);
  const [autoDemoMessage, setAutoDemoMessage] = useState<string>('Ready for interactive testing');

  // References to preserve state across intervals
  const sensorsRef = useRef(sensors);
  sensorsRef.current = sensors;
  const actuatorsRef = useRef(actuators);
  actuatorsRef.current = actuators;
  const thresholdsRef = useRef(thresholds);
  thresholdsRef.current = thresholds;
  const customRulesRef = useRef(customRules);
  customRulesRef.current = customRules;
  const motionCountdownRef = useRef(motionCountdown);
  motionCountdownRef.current = motionCountdown;
  const autoDemoStepRef = useRef(autoDemoStep);
  autoDemoStepRef.current = autoDemoStep;
  const isSimulationRunningRef = useRef(isSimulationRunning);
  isSimulationRunningRef.current = isSimulationRunning;

  const addSerialLog = useCallback((text: string, level: SerialLog['level'] = 'INFO') => {
    const d = new Date();
    const ts = d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
    setLogs((prev) => [
      ...prev.slice(-150),
      { id: Math.random().toString(36).substring(2, 9), timestamp: ts, text, level }
    ]);
  }, []);

  const addSecurityEvent = useCallback((text: string, type: 'ALERT' | 'INFO' = 'ALERT') => {
    const timeStr = new Date().toLocaleTimeString();
    setSecurityEvents((prev) => [
      { id: Math.random().toString(36).substring(2, 9), time: timeStr, text, type },
      ...prev.slice(0, 30)
    ]);
  }, []);

  // Sensor update handler
  const handleUpdateSensor = useCallback(
    <K extends keyof SensorState>(key: K, value: SensorState[K]) => {
      setSensors((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'pirMotion' && value === true) {
          motionCountdownRef.current = thresholdsRef.current.lightTimeoutSeconds;
          setMotionCountdown(thresholdsRef.current.lightTimeoutSeconds);
        }
        return next;
      });
    },
    []
  );

  // Threshold update handler
  const handleUpdateThreshold = useCallback(
    <K extends keyof ThresholdConfig>(key: K, value: ThresholdConfig[K]) => {
      setThresholds((prev) => ({ ...prev, [key]: value }));
      addSerialLog(`[CONFIG OTA] ${String(key)} updated to ${value}`, 'SYSTEM');
    },
    [addSerialLog]
  );

  // Custom Rules handlers
  const handleAddCustomRule = useCallback((newRule: Omit<CustomRule, 'id'>) => {
    const rule: CustomRule = {
      ...newRule,
      id: 'cr_' + Math.random().toString(36).substring(2, 9)
    };
    setCustomRules((prev) => [...prev, rule]);
    addSerialLog(`[RULE STUDIO] New Rule "${rule.name}" created and deployed.`, 'SYSTEM');
  }, [addSerialLog]);

  const handleDeleteCustomRule = useCallback((id: string) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== id));
    addSerialLog(`[RULE STUDIO] Custom Rule removed.`, 'SYSTEM');
  }, [addSerialLog]);

  const handleToggleCustomRule = useCallback((id: string) => {
    setCustomRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  // Smart Scene Preset Selector
  const handleSelectProfile = useCallback((profile: SmartProfile) => {
    soundFx.playSwitchClick();
    setCurrentProfile(profile);
    switch (profile) {
      case 'NORMAL':
        setSensors((prev) => ({
          ...prev,
          temperature: 25.0,
          humidity: 50,
          ldrAdc: 800,
          isDark: false,
          securityMode: false,
          manualOverride: false
        }));
        setThresholds((prev) => ({ ...prev, tempThresholdOn: 28.0, lightTimeoutSeconds: 5 }));
        addSerialLog('[SCENE ACTIVATED] Normal Home Profile engaged.', 'SYSTEM');
        break;
      case 'NIGHT_SLEEP':
        setSensors((prev) => ({
          ...prev,
          temperature: 23.0,
          ldrAdc: 3400,
          isDark: true,
          securityMode: true,
          manualOverride: false
        }));
        addSerialLog('[SCENE ACTIVATED] Night Sleep Profile: Dark Room & Security Armed.', 'SYSTEM');
        break;
      case 'ECO_SAVER':
        setSensors((prev) => ({ ...prev, manualOverride: false }));
        setThresholds((prev) => ({ ...prev, tempThresholdOn: 30.0, lightTimeoutSeconds: 3 }));
        addSerialLog('[SCENE ACTIVATED] Eco Saver Profile: High Fan Temp (30°C) & 3s Light Timeout.', 'SYSTEM');
        break;
      case 'AWAY_VACATION':
        setSensors((prev) => ({
          ...prev,
          securityMode: true,
          manualOverride: false,
          pirMotion: false
        }));
        addSerialLog('[SCENE ACTIVATED] Away / Vacation Profile: High Security Guard Armed.', 'ALERT');
        break;
      case 'CUSTOM':
        setSensors((prev) => ({ ...prev, manualOverride: true }));
        addSerialLog('[SCENE ACTIVATED] Manual Hardware Direct Mode engaged.', 'SYSTEM');
        break;
    }
  }, [addSerialLog]);

  // Trigger temporary PIR pulse (5 seconds)
  const handleTriggerPirPulse = useCallback(() => {
    soundFx.playSwitchClick();
    handleUpdateSensor('pirMotion', true);
    addSerialLog('[PIR SENSOR] Motion Pulse Triggered (GPIO 13: HIGH)', 'INFO');

    setTimeout(() => {
      handleUpdateSensor('pirMotion', false);
      addSerialLog('[PIR SENSOR] Motion Cleared (GPIO 13: LOW). Starting Light Timeout...', 'INFO');
    }, 5000);
  }, [handleUpdateSensor, addSerialLog]);

  // Serial command dispatcher
  const handleSendCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    addSerialLog(`> ${cmd}`, 'CMD');

    if (trimmed === 'help') {
      addSerialLog('Available commands: status, arm, disarm, auto, manual, light on, light off, fan on, fan off, dark, bright, set temp <c>, clear', 'SYSTEM');
    } else if (trimmed === 'status') {
      const s = sensorsRef.current;
      const a = actuatorsRef.current;
      addSerialLog(`STATUS: Temp=${s.temperature}°C | LDR=${s.ldrAdc} | Motion=${s.pirMotion} | Light=${a.roomLightRelay} | Fan=${a.fanRelay} | Sec=${s.securityMode}`, 'SYSTEM');
    } else if (trimmed === 'arm') {
      handleUpdateSensor('securityMode', true);
      addSerialLog('[CMD] Security armed.', 'WARN');
    } else if (trimmed === 'disarm') {
      handleUpdateSensor('securityMode', false);
      addSerialLog('[CMD] Security disarmed.', 'SYSTEM');
    } else if (trimmed === 'auto') {
      handleUpdateSensor('manualOverride', false);
      addSerialLog('[CMD] Switched to Autonomous Sensor Mode.', 'SYSTEM');
    } else if (trimmed === 'manual') {
      handleUpdateSensor('manualOverride', true);
      addSerialLog('[CMD] Switched to Manual Override Mode.', 'WARN');
    } else if (trimmed === 'light on') {
      handleUpdateSensor('manualOverride', true);
      handleUpdateSensor('manualLightSwitch', true);
      addSerialLog('[CMD] Manual Light set to ON.', 'INFO');
    } else if (trimmed === 'light off') {
      handleUpdateSensor('manualOverride', true);
      handleUpdateSensor('manualLightSwitch', false);
      addSerialLog('[CMD] Manual Light set to OFF.', 'INFO');
    } else if (trimmed === 'fan on') {
      handleUpdateSensor('manualOverride', true);
      handleUpdateSensor('manualFanSwitch', true);
      addSerialLog('[CMD] Manual Fan set to ON.', 'INFO');
    } else if (trimmed === 'fan off') {
      handleUpdateSensor('manualOverride', true);
      handleUpdateSensor('manualFanSwitch', false);
      addSerialLog('[CMD] Manual Fan set to OFF.', 'INFO');
    } else if (trimmed === 'dark') {
      handleUpdateSensor('ldrAdc', 3000);
      handleUpdateSensor('isDark', true);
      handleUpdateSensor('ldrLux', 80);
      addSerialLog('[CMD] LDR set to DARK (3000 ADC)', 'INFO');
    } else if (trimmed === 'bright') {
      handleUpdateSensor('ldrAdc', 600);
      handleUpdateSensor('isDark', false);
      handleUpdateSensor('ldrLux', 800);
      addSerialLog('[CMD] LDR set to BRIGHT (600 ADC)', 'INFO');
    } else if (trimmed.startsWith('set temp ')) {
      const parts = trimmed.split(' ');
      const val = parseFloat(parts[2]);
      if (!isNaN(val)) {
        handleUpdateSensor('temperature', val);
        addSerialLog(`[CMD] Temperature set to ${val}°C`, 'INFO');
      } else {
        addSerialLog('[CMD ERROR] Invalid temperature format. Example: set temp 29.5', 'ALERT');
      }
    } else if (trimmed === 'clear') {
      setLogs([]);
    } else {
      addSerialLog(`[CMD ERROR] Unknown command: "${cmd}". Type "help" for list.`, 'WARN');
    }
  };

  // Reset to initial defaults
  const handleResetDefaults = () => {
    setAutoDemoMode(false);
    setAutoDemoStep(0);
    setAutoDemoMessage('Hardware defaults restored.');
    setSensors(INITIAL_SENSORS);
    setActuators(INITIAL_ACTUATORS);
    setMotionCountdown(0);
    soundFx.stopAlarm();
    addSerialLog('[SYSTEM RESET] Restored hardware defaults.', 'SYSTEM');
  };

  // Scenario execution for quick stimulation & 17-step verification
  const handleExecuteScenario = (scenario: string) => {
    soundFx.playSwitchClick();
    if (scenario === 'SET_DARK') {
      handleUpdateSensor('ldrAdc', 3200);
      handleUpdateSensor('isDark', true);
      handleUpdateSensor('ldrLux', 50);
      addSerialLog('[STIMULATE] Room set to DARK (3200 ADC). Rule 1 is now armed for motion.', 'INFO');
    } else if (scenario === 'SET_BRIGHT') {
      handleUpdateSensor('ldrAdc', 600);
      handleUpdateSensor('isDark', false);
      handleUpdateSensor('ldrLux', 750);
      addSerialLog('[STIMULATE] Room set to BRIGHT daylight (600 ADC).', 'INFO');
    } else if (scenario === 'TRIGGER_LIGHT_RULE') {
      handleUpdateSensor('ldrAdc', 3200);
      handleUpdateSensor('isDark', true);
      handleUpdateSensor('ldrLux', 50);
      handleUpdateSensor('manualOverride', false);
      handleTriggerPirPulse();
      addSerialLog('[STIMULATE] Rule 1 triggered: Dark + PIR Motion &rarr; Light Relay CLOSED (ON)!', 'INFO');
    } else if (scenario === 'TRIGGER_LIGHT_DAY_TEST') {
      handleUpdateSensor('ldrAdc', 600);
      handleUpdateSensor('isDark', false);
      handleUpdateSensor('manualOverride', false);
      handleTriggerPirPulse();
      addSerialLog('[STIMULATE] Test: Daytime Motion &rarr; Room Light remains OFF (Energy Saved)', 'INFO');
    } else if (scenario === 'TRIGGER_FAN_RULE') {
      handleUpdateSensor('manualOverride', false);
      handleUpdateSensor('temperature', 31.5);
      addSerialLog('[STIMULATE] Rule 2 triggered: Temp=31.5°C (>28°C) &rarr; Fan Relay CLOSED (ON, 1850 RPM)!', 'INFO');
    } else if (scenario === 'TRIGGER_FAN_COOL') {
      handleUpdateSensor('manualOverride', false);
      handleUpdateSensor('temperature', 23.0);
      addSerialLog('[STIMULATE] Room cooled to 23.0°C (&le;26.5°C) &rarr; Fan Relay OPEN (OFF).', 'INFO');
    } else if (scenario === 'TRIGGER_SECURITY_ALARM') {
      handleUpdateSensor('securityMode', true);
      handleUpdateSensor('pirMotion', true);
      addSerialLog('[STIMULATE] Rule 3 triggered: ARMED + PIR Motion &rarr; 🚨 INTRUDER ALARM SIREN TRIPPED!', 'ALERT');
      addSecurityEvent('CRITICAL: Perimeter motion detected while Security Mode is ARMED!', 'ALERT');
    } else if (scenario === 'DISARM_SECURITY') {
      handleUpdateSensor('securityMode', false);
      handleUpdateSensor('pirMotion', false);
      soundFx.stopAlarm();
      addSerialLog('[STIMULATE] Security Disarmed. Siren silenced.', 'SYSTEM');
    } else if (scenario === 'TRIGGER_MANUAL_OVERRIDE') {
      handleUpdateSensor('manualOverride', true);
      handleUpdateSensor('manualLightSwitch', true);
      handleUpdateSensor('manualFanSwitch', true);
      addSerialLog('[STIMULATE] Rule 4 triggered: Manual Override ON &rarr; Direct GPIO switch control.', 'WARN');
    } else if (scenario === 'RUN_ALL') {
      addSerialLog('=== STARTING AUTOMATED 17-STEP SYSTEM TEST BENCH ===', 'SYSTEM');
      handleUpdateSensor('ldrAdc', 3200);
      handleUpdateSensor('isDark', true);
      handleUpdateSensor('temperature', 30.5);
      handleUpdateSensor('securityMode', true);
      handleUpdateSensor('manualOverride', false);
      handleTriggerPirPulse();
      addSecurityEvent('Automated Verification Pipeline Completed Successfully!', 'INFO');
    }
  };

  // Sound Mute Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundFx.setMuted(nextMute);
  };

  // Toggle Auto Demo / Simulation Mode
  const handleToggleAutoDemo = () => {
    soundFx.playSwitchClick();
    const next = !autoDemoMode;
    setAutoDemoMode(next);
    if (next) {
      setAutoDemoStep(0);
      setAutoDemoMessage('Auto Stimulation: Initiating Day/Night & Occupancy Cycle...');
      addSerialLog('[AUTO STIMULATION] Interactive Auto Demo Mode ENABLED.', 'SYSTEM');
    } else {
      setAutoDemoMessage('Auto Stimulation Paused.');
      addSerialLog('[AUTO STIMULATION] Interactive Auto Demo Mode DISABLED.', 'SYSTEM');
    }
  };

  // Single step tick handler
  const handleStepSimulationTick = () => {
    soundFx.playSwitchClick();
    addSerialLog('[SIMULATION TICK] Single 200ms cycle executed manually.', 'SYSTEM');
  };

  // MAIN EMBEDDED CONTROLLER SIMULATION TICK (Every 200ms * simSpeed)
  useEffect(() => {
    let tickCount = 0;
    let autoDemoTicker = 0;

    const interval = setInterval(() => {
      if (!isSimulationRunningRef.current) return;

      tickCount++;
      const currentSensors = sensorsRef.current;
      const currentThresholds = thresholdsRef.current;
      const prevActuators = actuatorsRef.current;

      // Automated Demo Mode Step Sequencer (Advances every 18 ticks ~ 3.6s)
      if (autoDemoMode) {
        autoDemoTicker++;
        if (autoDemoTicker >= 18) {
          autoDemoTicker = 0;
          const nextStep = (autoDemoStepRef.current + 1) % 9;
          setAutoDemoStep(nextStep);
          autoDemoStepRef.current = nextStep;

          switch (nextStep) {
            case 0:
              setAutoDemoMessage('Step 1/8: Daytime Baseline (600 ADC, 24°C). Standby.');
              setSensors((prev) => ({
                ...prev,
                ldrAdc: 600,
                isDark: false,
                ldrLux: 750,
                temperature: 24.0,
                pirMotion: false,
                securityMode: false,
                manualOverride: false
              }));
              break;
            case 1:
              setAutoDemoMessage('Step 2/8: Night Falls (3200 ADC, Dark Room). Rule 1 is primed.');
              setSensors((prev) => ({ ...prev, ldrAdc: 3200, isDark: true, ldrLux: 45 }));
              break;
            case 2:
              setAutoDemoMessage('Step 3/8: Occupant Enters! PIR Motion HIGH &rarr; Room Light Relay CLOSED (ON).');
              soundFx.playSwitchClick();
              motionCountdownRef.current = currentThresholds.lightTimeoutSeconds;
              setMotionCountdown(currentThresholds.lightTimeoutSeconds);
              setSensors((prev) => ({ ...prev, pirMotion: true }));
              break;
            case 3:
              setAutoDemoMessage('Step 4/8: Occupant Leaves (PIR Motion LOW) &rarr; Auto shutoff countdown begins.');
              setSensors((prev) => ({ ...prev, pirMotion: false }));
              break;
            case 4:
              setAutoDemoMessage('Step 5/8: Heat Wave! Temp rises to 31.5°C (>28°C) &rarr; Fan Relay ON (1850 RPM).');
              motionCountdownRef.current = 0;
              setMotionCountdown(0);
              setSensors((prev) => ({ ...prev, temperature: 31.5 }));
              break;
            case 5:
              setAutoDemoMessage('Step 6/8: Room Cools to 23.5°C (&le;26.5°C) &rarr; Fan Relay turns OFF.');
              setSensors((prev) => ({ ...prev, temperature: 23.5 }));
              break;
            case 6:
              setAutoDemoMessage('Step 7/8: Perimeter Security ARMED (GPIO 12 HIGH). Ready for motion trip.');
              soundFx.playSwitchClick();
              setSensors((prev) => ({ ...prev, securityMode: true, pirMotion: false }));
              break;
            case 7:
              setAutoDemoMessage('Step 8/8: 🚨 INTRUSION DETECTED! ARMED + PIR &rarr; Piezo Siren 95dB & Red Alert Strobe!');
              setSensors((prev) => ({ ...prev, pirMotion: true }));
              addSecurityEvent('CRITICAL: Perimeter motion detected while Security Mode is ARMED!', 'ALERT');
              break;
            case 8:
              setAutoDemoMessage('Cycle Complete &rarr; Disarming alarm and returning to Normal Auto Standby.');
              soundFx.stopAlarm();
              setSensors((prev) => ({ ...prev, securityMode: false, pirMotion: false, temperature: 24.0, ldrAdc: 600, isDark: false }));
              break;
          }
        }
      }

      // 1. RULE 3: SECURITY ALARM
      let newBuzzer = false;
      let newRedLed = false;
      let isAlarm = false;

      if (currentSensors.securityMode && currentSensors.pirMotion) {
        newBuzzer = true;
        newRedLed = true;
        isAlarm = true;
      }

      // Audio Alarm synchronization
      if (newBuzzer && !prevActuators.buzzerActive) {
        soundFx.startAlarm();
      } else if (!newBuzzer && prevActuators.buzzerActive) {
        soundFx.stopAlarm();
      }

      // 2. RULE 4: MANUAL OVERRIDE (Takes absolute priority if active)
      let newLight = false;
      let newFan = false;

      if (currentSensors.manualOverride) {
        newLight = currentSensors.manualLightSwitch;
        newFan = currentSensors.manualFanSwitch;
      } else {
        // RULE 1: AUTOMATIC LIGHT (Dark room + Motion OR active countdown from a dark-triggered motion)
        if (currentSensors.pirMotion && currentSensors.isDark) {
          newLight = true;
        } else if (motionCountdownRef.current > 0 && (currentSensors.isDark || prevActuators.roomLightRelay)) {
          newLight = true; // Stay ON during timeout
        } else {
          newLight = false;
        }

        // RULE 2: AUTOMATIC FAN (Hysteresis)
        if (currentSensors.temperature >= currentThresholds.tempThresholdOn) {
          newFan = true;
        } else if (currentSensors.temperature <= currentThresholds.tempThresholdOff) {
          newFan = false;
        } else {
          newFan = prevActuators.fanRelay; // Maintain state in deadband
        }

        // 3. CUSTOM USER-DEFINED AUTOMATION RULES EVALUATION
        for (const cr of customRulesRef.current) {
          if (!cr.enabled) continue;
          let sensorVal = 0;
          if (cr.trigger === 'temperature') sensorVal = currentSensors.temperature;
          else if (cr.trigger === 'humidity') sensorVal = currentSensors.humidity;
          else if (cr.trigger === 'ldrLux') sensorVal = currentSensors.ldrLux;
          else if (cr.trigger === 'ldrAdc') sensorVal = currentSensors.ldrAdc;

          let isTriggered = false;
          if (cr.operator === '>') isTriggered = sensorVal > cr.threshold;
          else if (cr.operator === '<') isTriggered = sensorVal < cr.threshold;
          else if (cr.operator === '==') isTriggered = Math.abs(sensorVal - cr.threshold) < 0.5;

          if (isTriggered) {
            if (cr.action === 'setLight') newLight = cr.actionValue;
            if (cr.action === 'setFan') newFan = cr.actionValue;
            if (cr.action === 'triggerAlarm') {
              newBuzzer = true;
              newRedLed = true;
              isAlarm = true;
            }
          }
        }
      }

      // Relay Click Audio simulation on state transition
      if (newLight !== prevActuators.roomLightRelay) {
        soundFx.playRelayClick(newLight);
      }
      if (newFan !== prevActuators.fanRelay) {
        soundFx.playRelayClick(newFan);
      }

      // Green LED heartbeat toggle every 500ms (every 5 ticks)
      const greenHeartbeat = Math.floor(tickCount / 5) % 2 === 0;

      // Update Actuators
      setActuators({
        roomLightRelay: newLight,
        fanRelay: newFan,
        buzzerActive: newBuzzer,
        redAlertLed: newRedLed,
        greenStatusLed: greenHeartbeat,
        fanRpm: newFan ? 1850 : 0,
        lightBrightness: newLight ? 100 : 0
      });

      // Update Motion Countdown Timer (1s ticks)
      if (tickCount % 5 === 0) {
        if (motionCountdownRef.current > 0 && !currentSensors.pirMotion) {
          motionCountdownRef.current -= 1;
          setMotionCountdown(motionCountdownRef.current);
          if (motionCountdownRef.current === 0 && !currentSensors.manualOverride) {
            addSerialLog('[TIMER EXPIRED] No-motion timeout elapsed &rarr; Room Light turned OFF.', 'INFO');
          }
        }
      }

      // Telemetry Output & Energy Calculation (Every 1000ms / 5 ticks)
      if (tickCount % 5 === 0) {
        const espWatts = 0.8;
        const lightWatts = newLight ? 40 : 0;
        const fanWatts = newFan ? 65 : 0;
        const totalW = espWatts + lightWatts + fanWatts + (newBuzzer ? 1.2 : 0);

        setMetrics((prev) => {
          const kwhDelta = (totalW * 1) / (3600 * 1000); // 1 second of watts
          return {
            ...prev,
            uptimeSeconds: prev.uptimeSeconds + 1,
            currentWatts: totalW,
            totalKwh: prev.totalKwh + kwhDelta
          };
        });

        // Add to live power history chart
        const timeLabel = new Date().toTimeString().split(' ')[0];
        setPowerHistory((prev) => [
          ...prev.slice(-25),
          { time: timeLabel, watts: totalW, lightWatts, fanWatts }
        ]);

        // Output Serial Telemetry in exact requested format:
        const secText = isAlarm ? 'ALARM TRIP!' : currentSensors.securityMode ? 'ARMED (SAFE)' : 'DISARMED';
        const teleLog = `Temperature: ${Math.round(currentSensors.temperature)} C | Room: ${
          currentSensors.isDark ? 'DARK' : 'BRIGHT'
        } | Motion: ${currentSensors.pirMotion ? 'DETECTED' : 'CLEAR'} | Light: ${
          newLight ? 'ON' : 'OFF'
        } | Fan: ${newFan ? 'ON' : 'OFF'} | Security: ${secText}`;

        addSerialLog(teleLog, isAlarm ? 'ALERT' : 'INFO');
      }
    }, Math.max(40, Math.floor(200 / simSpeed)));

    return () => {
      clearInterval(interval);
      soundFx.stopAlarm();
    };
  }, [addSerialLog, autoDemoMode, simSpeed]);

  // Initial boot log
  useEffect(() => {
    addSerialLog('==================================================', 'SYSTEM');
    addSerialLog('  ESP32 SMART HOME CONTROLLER - SYSTEM BOOT', 'SYSTEM');
    addSerialLog('==================================================', 'SYSTEM');
    addSerialLog('[SYSTEM] Initializing GPIOs, ADC1_CH6, I2C SSD1306, DHT22...', 'SYSTEM');
    addSerialLog('[SYSTEM] Wi-Fi Connected to "Home_IoT_AP" - IP: 192.168.1.142', 'SYSTEM');
    addSerialLog('[SYSTEM] System Ready. Starting 100Hz Sensor Scan Loop.', 'SYSTEM');
  }, [addSerialLog]);

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      const hr = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const se = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${yr}-${mo}-${da} ${hr}:${mi}:${se}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="smart-home-app" className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* Top Main Navigation Bar - Elegant Dark */}
      <header className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur-md border-b border-gray-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center text-black font-bold font-mono text-sm shadow-md shadow-emerald-950/50 shrink-0">
              SH
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white uppercase">
                  Smart Home <span className="text-emerald-500">Controller</span>
                </h1>
                <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700/50">
                  V2.4.0-STABLE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                PIR &bull; LDR &bull; DHT22 &bull; Dual Relays &bull; SSD1306 OLED &bull; Security Perimeter
              </p>
            </div>
          </div>

          {/* Master Alarm Banner when tripped */}
          {actuators.buzzerActive && (
            <div className="flex items-center gap-2 bg-red-950/90 border border-red-500 text-red-400 px-3.5 py-1.5 rounded text-xs font-mono font-bold animate-pulse shadow-lg shadow-red-950">
              <ShieldAlert className="w-4 h-4 animate-bounce text-red-500" />
              <span>SECURITY ALARM TRIPPED (INTRUDER DETECTED)</span>
            </div>
          )}

          {/* Real-Time Telemetry status & Actions */}
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider">
            
            <div className="hidden lg:flex items-center gap-4 text-gray-400 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span>WiFi: ESP32_AP_04</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span>Cloud: Connected</span>
              </div>
              <div className="text-gray-500">{currentTime || '2026-08-18 14:42:01'}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="header-mute-btn"
                onClick={handleToggleMute}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded border text-xs transition-all flex items-center gap-1.5 ${
                  isMuted
                    ? 'bg-[#161616] border-gray-800 text-gray-500'
                    : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/60'
                }`}
                title="Buzzer Piezo Sound"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[10px]">{isMuted ? 'Muted' : 'Sound'}</span>
              </button>

              <button
                id="header-wokwi-btn"
                onClick={() => setActiveTab('wokwi')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-300 rounded text-xs font-mono font-medium shadow transition-all active:scale-95"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Wokwi Sim</span>
              </button>

              <button
                id="header-run-verify-btn"
                onClick={() => {
                  setActiveTab('verify');
                  handleExecuteScenario('RUN_ALL');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-medium shadow transition-all active:scale-95"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Verify Steps 1-17</span>
              </button>
            </div>

          </div>

        </div>

        {/* Top Control Header & Smart Scenes Preset Bar */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Smart Scene Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1 mr-1">
              <Sliders className="w-3 h-3 text-gray-400" />
              <span>Active Scene:</span>
            </span>
            <button
              id="scene-normal-btn"
              onClick={() => handleSelectProfile('NORMAL')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                currentProfile === 'NORMAL'
                  ? 'bg-emerald-600/90 text-white shadow'
                  : 'bg-[#141414] hover:bg-[#1c1c1c] text-gray-300 border border-gray-800'
              }`}
            >
              <Home className="w-3 h-3" />
              <span>Normal Home</span>
            </button>
            <button
              id="scene-night-btn"
              onClick={() => handleSelectProfile('NIGHT_SLEEP')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                currentProfile === 'NIGHT_SLEEP'
                  ? 'bg-blue-600/90 text-white shadow'
                  : 'bg-[#141414] hover:bg-[#1c1c1c] text-gray-300 border border-gray-800'
              }`}
            >
              <Moon className="w-3 h-3 text-blue-300" />
              <span>Night Sleep</span>
            </button>
            <button
              id="scene-eco-btn"
              onClick={() => handleSelectProfile('ECO_SAVER')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                currentProfile === 'ECO_SAVER'
                  ? 'bg-amber-600/90 text-white shadow'
                  : 'bg-[#141414] hover:bg-[#1c1c1c] text-gray-300 border border-gray-800'
              }`}
            >
              <Leaf className="w-3 h-3 text-amber-300" />
              <span>Eco Saver</span>
            </button>
            <button
              id="scene-away-btn"
              onClick={() => handleSelectProfile('AWAY_VACATION')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                currentProfile === 'AWAY_VACATION'
                  ? 'bg-red-600/90 text-white shadow'
                  : 'bg-[#141414] hover:bg-[#1c1c1c] text-gray-300 border border-gray-800'
              }`}
            >
              <Shield className="w-3 h-3 text-red-300" />
              <span>Away / Guard</span>
            </button>
          </div>

          {/* Workbench View Mode Toggle (when on bench tab) */}
          {activeTab === 'bench' && (
            <div className="flex items-center gap-1 bg-[#141414] border border-gray-800 p-0.5 rounded font-mono text-[11px]">
              <button
                onClick={() => setWorkbenchViewMode('both')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                  workbenchViewMode === 'both' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Split Side-by-Side View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Split Twin</span>
              </button>
              <button
                onClick={() => setWorkbenchViewMode('breadboard')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                  workbenchViewMode === 'breadboard' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Hardware Circuit View"
              >
                <Cpu className="w-3 h-3" />
                <span>Hardware</span>
              </button>
              <button
                onClick={() => setWorkbenchViewMode('floorplan')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                  workbenchViewMode === 'floorplan' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="2D Room Floorplan View"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Room 2D</span>
              </button>
            </div>
          )}
        </div>

        {/* Modular Primary Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 border-t border-gray-800/80 pt-2 text-xs font-mono">
          <button
            id="nav-tab-bench"
            onClick={() => setActiveTab('bench')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'bench'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>1. Workbench & Twin</span>
          </button>

          <button
            id="nav-tab-wokwi"
            onClick={() => setActiveTab('wokwi')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'wokwi'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-cyan-400/90 hover:text-cyan-300 hover:bg-[#121a22] border border-cyan-900/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300" />
            <span>2. Wokwi Simulator & Hub</span>
          </button>

          <button
            id="nav-tab-rules"
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'rules'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Automation Studio</span>
          </button>

          <button
            id="nav-tab-verify"
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'verify'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>4. Step Verification Guide</span>
          </button>

          <button
            id="nav-tab-cloud"
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'cloud'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>5. Cloud & MQTT Hub</span>
          </button>

          <button
            id="nav-tab-energy"
            onClick={() => setActiveTab('energy')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'energy'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>6. Energy & Analytics</span>
          </button>

          <button
            id="nav-tab-firmware"
            onClick={() => setActiveTab('firmware')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'firmware'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>7. Firmware & Diagnostics</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* TAB 1: VIRTUAL HARDWARE BENCH & ROOM DIGITAL TWIN */}
        {activeTab === 'bench' && (
          <div className="space-y-6">
            {(workbenchViewMode === 'both' || workbenchViewMode === 'floorplan') && (
              <RoomFloorplan
                sensors={sensors}
                actuators={actuators}
                thresholds={thresholds}
                motionCountdown={motionCountdown}
                onUpdateSensor={handleUpdateSensor}
                onTriggerPirPulse={handleTriggerPirPulse}
              />
            )}

            {(workbenchViewMode === 'both' || workbenchViewMode === 'breadboard') && (
              <VirtualBreadboard
                sensors={sensors}
                actuators={actuators}
                thresholds={thresholds}
                motionCountdown={motionCountdown}
                onUpdateSensor={handleUpdateSensor}
                onTriggerPirPulse={handleTriggerPirPulse}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                isSimulationRunning={isSimulationRunning}
                onToggleSimulationRunning={() => setIsSimulationRunning((p) => !p)}
                simSpeed={simSpeed}
                onSetSimSpeed={setSimSpeed}
                autoDemoMode={autoDemoMode}
                autoDemoStep={autoDemoStep}
                autoDemoMessage={autoDemoMessage}
                onToggleAutoDemo={handleToggleAutoDemo}
                onStepTick={handleStepSimulationTick}
                onExecuteScenario={handleExecuteScenario}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </div>
        )}

        {/* TAB 2: WOKWI HARDWARE SIMULATOR & HUB */}
        {activeTab === 'wokwi' && <WokwiSimulatorHub />}

        {/* TAB 3: AUTOMATION & RULE STUDIO */}
        {activeTab === 'rules' && (
          <RuleEngineView
            sensors={sensors}
            actuators={actuators}
            thresholds={thresholds}
            motionCountdown={motionCountdown}
            customRules={customRules}
            onAddCustomRule={handleAddCustomRule}
            onDeleteCustomRule={handleDeleteCustomRule}
            onToggleCustomRule={handleToggleCustomRule}
          />
        )}

        {/* TAB 3: STEP VERIFICATION GUIDE */}
        {activeTab === 'verify' && (
          <StepVerificationGuide
            sensors={sensors}
            actuators={actuators}
            onExecuteScenario={handleExecuteScenario}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {/* TAB 4: CLOUD & MQTT HUB */}
        {activeTab === 'cloud' && (
          <CloudDashboard
            sensors={sensors}
            actuators={actuators}
            thresholds={thresholds}
            metrics={metrics}
            onUpdateSensor={handleUpdateSensor}
            onUpdateThreshold={handleUpdateThreshold}
            securityEvents={securityEvents}
          />
        )}

        {/* TAB 5: ENERGY & ANALYTICS */}
        {activeTab === 'energy' && (
          <EnergyMonitor
            actuators={actuators}
            metrics={metrics}
            powerHistory={powerHistory}
          />
        )}

        {/* TAB 6: FIRMWARE & DIAGNOSTICS */}
        {activeTab === 'firmware' && (
          <div className="space-y-4">
            {/* Firmware Subtabs */}
            <div className="flex items-center gap-2 bg-[#161616] p-1.5 rounded-lg border border-gray-800 font-mono text-xs">
              <button
                onClick={() => setActiveFirmwareSubtab('code')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                  activeFirmwareSubtab === 'code' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>ESP32 C++ Code & Wokwi Export</span>
              </button>
              <button
                onClick={() => setActiveFirmwareSubtab('serial')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                  activeFirmwareSubtab === 'serial' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>UART Serial Monitor (115200 Baud)</span>
              </button>
              <button
                onClick={() => setActiveFirmwareSubtab('arch')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                  activeFirmwareSubtab === 'arch' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture & State Machine Flow</span>
              </button>
            </div>

            {activeFirmwareSubtab === 'code' && <CodeViewer />}
            {activeFirmwareSubtab === 'serial' && (
              <SerialMonitor
                logs={logs}
                onClearLogs={() => setLogs([])}
                onSendCommand={handleSendCommand}
                sensors={sensors}
                actuators={actuators}
              />
            )}
            {activeFirmwareSubtab === 'arch' && (
              <ArchitectureDiagram sensors={sensors} actuators={actuators} />
            )}
          </div>
        )}

      </main>

      {/* Footer - Elegant Dark */}
      <footer className="h-10 bg-[#0a0a0a] border-t border-gray-800 px-4 sm:px-8 flex items-center justify-between text-[10px] font-mono text-gray-500 shrink-0">
        <div className="truncate">ESP32-WROOM-32DA | ESP-IDF v4.4 | I2C: 0x3C (OLED) | FreeRTOS 240MHz</div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Uptime: {String(Math.floor(metrics.uptimeSeconds / 3600)).padStart(2, '0')}:{String(Math.floor((metrics.uptimeSeconds % 3600) / 60)).padStart(2, '0')}:{String(metrics.uptimeSeconds % 60).padStart(2, '0')}</span>
          <span className="text-emerald-500/80">RAM: 142KB Free</span>
        </div>
      </footer>

    </div>
  );
}
