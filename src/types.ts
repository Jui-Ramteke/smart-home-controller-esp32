export interface SensorState {
  pirMotion: boolean;
  ldrAdc: number; // 0 - 4095 (ESP32 12-bit ADC)
  ldrLux: number; // calculated lux
  isDark: boolean;
  temperature: number; // °C
  humidity: number; // %
  securityMode: boolean; // Armed / Disarmed
  manualOverride: boolean; // Auto vs Manual mode
  manualLightSwitch: boolean;
  manualFanSwitch: boolean;
}

export interface ActuatorState {
  roomLightRelay: boolean;
  fanRelay: boolean;
  buzzerActive: boolean;
  redAlertLed: boolean;
  greenStatusLed: boolean;
  fanRpm: number;
  lightBrightness: number;
}

export interface ThresholdConfig {
  darknessAdcThreshold: number; // Default: 2000 (higher ADC = darker on pull-down LDR)
  tempThresholdOn: number; // Default: 28°C
  tempThresholdOff: number; // Default: 26.5°C (hysteresis)
  lightTimeoutSeconds: number; // Default: 5s for simulation (60s default)
}

export interface SystemMetrics {
  motionCountdown: number; // seconds remaining before auto light off
  uptimeSeconds: number;
  totalKwh: number;
  currentWatts: number;
  wifiConnected: boolean;
  ipAddress: string;
  mqttConnected: boolean;
  activeAlarmsCount: number;
}

export interface SerialLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ALERT' | 'SYSTEM' | 'CMD';
  text: string;
}

export type SmartProfile = 'NORMAL' | 'NIGHT_SLEEP' | 'ECO_SAVER' | 'AWAY_VACATION' | 'CUSTOM';

export interface CustomRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: 'temperature' | 'ldrAdc' | 'pirMotion' | 'securityMode' | 'humidity';
  operator: '>' | '<' | '==' | '!=';
  threshold: number | boolean;
  action: 'setLight' | 'setFan' | 'setAlarm' | 'setSecurity';
  actionValue: boolean;
  description: string;
  isTriggered?: boolean;
}

export interface MqttMessage {
  id: string;
  timestamp: string;
  topic: string;
  payload: string;
  qos: 0 | 1;
  direction: 'PUB' | 'SUB';
}
