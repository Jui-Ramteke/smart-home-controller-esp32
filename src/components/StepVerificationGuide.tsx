import React from 'react';
import { SensorState, ActuatorState } from '../types';
import {
  CheckCircle,
  Play,
  ArrowRight,
  ShieldAlert,
  Flame,
  Moon,
  Eye,
  Sliders,
  CheckCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StepVerificationGuideProps {
  sensors: SensorState;
  actuators: ActuatorState;
  onExecuteScenario: (scenario: string) => void;
  onResetDefaults: () => void;
}

export const StepVerificationGuide: React.FC<StepVerificationGuideProps> = ({
  sensors,
  actuators,
  onExecuteScenario,
  onResetDefaults
}) => {
  // Dynamically verify statuses
  const step12_passed = sensors.isDark;
  const step13_passed = sensors.isDark && sensors.pirMotion && actuators.roomLightRelay;
  const step14_passed = sensors.temperature >= 28.0 && actuators.fanRelay;
  const step15_passed = sensors.securityMode;
  const step16_passed = sensors.securityMode && sensors.pirMotion && actuators.buzzerActive && actuators.redAlertLed;
  const step17_passed = sensors.manualOverride;

  const totalVerified = [step12_passed, step13_passed, step14_passed, step15_passed, step16_passed, step17_passed].filter(Boolean).length;

  const runCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div id="step-verification-container" className="space-y-6">
      {/* Header & Automated Test Runner */}
      <div className="bg-[#161616] border border-gray-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-400" />
            <span>Interactive 17-Step Hardware & Functional Verification Protocol</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Step-by-step verification pipeline for Wokwi, Tinkercad, Proteus, and live hardware.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-simulation-btn"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Setup</span>
          </button>

          <button
            id="run-all-tests-btn"
            onClick={() => {
              onExecuteScenario('RUN_ALL');
              runCelebration();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Auto-Run Verification Sequence</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#161616] p-3 rounded-lg border border-gray-800 flex items-center justify-between gap-4">
        <span className="text-xs font-mono text-gray-400">
          Core Automation Validation: <strong className="text-emerald-400">{totalVerified} / 6</strong> Tests Active/Passed
        </span>
        <div className="flex-1 max-w-xs bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${(totalVerified / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Split: Hardware Setup (Steps 1-11) vs Functional Verification (Steps 12-17) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* SECTION 1: HARDWARE & SIMULATOR SETUP (STEPS 1 - 11) */}
        <div className="bg-[#161616] border border-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold border-b border-gray-800 pb-2">
            Phase 1: Project & Wiring Setup (Steps 1 – 11)
          </h4>

          <div className="space-y-2 text-xs font-mono">
            {[
              { num: 'STEP 1', title: 'Create Arduino/ESP32 Project', desc: 'Select ESP32-WROOM-32 NodeMCU board in IDE or Wokwi simulator.' },
              { num: 'STEP 2', title: 'Add PIR Motion Sensor', desc: 'Connect VCC to 3V3, GND to GND, and OUT signal to GPIO 13.' },
              { num: 'STEP 3', title: 'Add LDR Photoresistor Input', desc: 'Connect voltage divider analog signal to GPIO 34 (ADC1_CH6).' },
              { num: 'STEP 4', title: 'Add DHT11 / DHT22 Sensor', desc: 'Connect 1-Wire Data pin to GPIO 4 with 10k pullup.' },
              { num: 'STEP 5', title: 'Add Relays / Output LEDs', desc: 'Connect Room Light Relay to GPIO 2 and Fan Relay to GPIO 15.' },
              { num: 'STEP 6', title: 'Add Security Buzzer', desc: 'Connect active Piezo Buzzer positive lead to GPIO 25.' },
              { num: 'STEP 7', title: 'Add SSD1306 128x64 OLED', desc: 'Wire I2C lines: SDA to GPIO 21, SCL to GPIO 22.' },
              { num: 'STEP 8', title: 'Add Manual Toggle Switches', desc: 'Wire 4 switches: Mode (GPIO 14), Light (GPIO 27), Fan (GPIO 26), Security (GPIO 12).' },
              { num: 'STEP 9', title: 'Connect All Common Grounds & VCC', desc: 'Verify common 3.3V and GND power rail bus.' },
              { num: 'STEP 10', title: 'Paste Production C++ Code', desc: 'Load smart_home.ino with FreeRTOS non-blocking timing loop.' },
              { num: 'STEP 11', title: 'Start Simulation / Power Board', desc: 'Serial Monitor boots @ 115200 baud; OLED initializes.' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 bg-[#0f0f0f] rounded border border-gray-800">
                <span className="bg-cyan-950 text-cyan-400 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">
                  {step.num}
                </span>
                <div>
                  <span className="font-bold text-gray-200 block">{step.title}</span>
                  <span className="text-[11px] text-gray-400 font-sans">{step.desc}</span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: LIVE AUTOMATION VERIFICATION (STEPS 12 - 17) */}
        <div className="bg-[#161616] border border-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold border-b border-gray-800 pb-2">
            Phase 2: Functional Logic Verification (Steps 12 – 17)
          </h4>

          <div className="space-y-3">
            
            {/* STEP 12 */}
            <div className={`p-3 rounded border text-xs font-mono transition-all ${
              step12_passed ? 'bg-indigo-950/40 border-indigo-500' : 'bg-[#0f0f0f] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-200">STEP 12: Change LDR value to simulate darkness</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  step12_passed ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                  {step12_passed ? 'VERIFIED (DARK)' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mb-2">
                Simulate nighttime / low-light room condition by setting LDR ADC &gt; 2000.
              </p>
              <button
                id="test-step-12-btn"
                onClick={() => onExecuteScenario('SET_DARK')}
                className="w-full py-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Moon className="w-3.5 h-3.5" /> Simulate Darkness (3200 ADC)
              </button>
            </div>

            {/* STEP 13 */}
            <div className={`p-3 rounded border text-xs font-mono transition-all ${
              step13_passed ? 'bg-yellow-950/40 border-yellow-500' : 'bg-[#0f0f0f] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-200">STEP 13: Trigger PIR Motion &rarr; Verify Light turns ON</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  step13_passed ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {step13_passed ? 'VERIFIED (LIGHT ON)' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mb-2">
                Rule 1 verification: When Motion = Detected AND Room = Dark &rarr; Room Light Relay activates.
              </p>
              <button
                id="test-step-13-btn"
                onClick={() => onExecuteScenario('TRIGGER_LIGHT_RULE')}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Test Motion in Dark (Trigger Light)
              </button>
            </div>

            {/* STEP 14 */}
            <div className={`p-3 rounded border text-xs font-mono transition-all ${
              step14_passed ? 'bg-cyan-950/40 border-cyan-500' : 'bg-[#0f0f0f] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-200">STEP 14: Increase Temperature &rarr; Verify Fan turns ON</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  step14_passed ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {step14_passed ? 'VERIFIED (FAN ON)' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mb-2">
                Rule 2 verification: When Temperature &gt; 28.0°C &rarr; Fan Relay activates with 1.5°C hysteresis cutoff.
              </p>
              <button
                id="test-step-14-btn"
                onClick={() => onExecuteScenario('TRIGGER_FAN_RULE')}
                className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Flame className="w-3.5 h-3.5" /> Set Temp to 31.5°C (Trigger Fan)
              </button>
            </div>

            {/* STEP 15 & 16 */}
            <div className={`p-3 rounded border text-xs font-mono transition-all ${
              step16_passed ? 'bg-red-950/50 border-red-500' : 'bg-[#0f0f0f] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-200">STEP 15 & 16: Security Mode + Motion &rarr; Alarm Alert</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  step16_passed ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400'
                }`}>
                  {step16_passed ? 'VERIFIED (ALARM ACTIVE)' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mb-2">
                Rule 3 verification: When Security Mode = ON and Motion = Detected &rarr; Buzzer + Red LED + OLED "INTRUDER ALERT".
              </p>
              <button
                id="test-step-15-16-btn"
                onClick={() => onExecuteScenario('TRIGGER_SECURITY_ALARM')}
                className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-red-950/50"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Arm Security & Trigger Intruder Motion
              </button>
            </div>

            {/* STEP 17 */}
            <div className={`p-3 rounded border text-xs font-mono transition-all ${
              step17_passed ? 'bg-amber-950/40 border-amber-500' : 'bg-[#0f0f0f] border-gray-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-200">STEP 17: Enable Manual Mode &rarr; Control Light & Fan</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  step17_passed ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {step17_passed ? 'VERIFIED (MANUAL MODE)' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mb-2">
                Rule 4 verification: Manual Override bypasses sensor algorithms and grants physical switch control.
              </p>
              <button
                id="test-step-17-btn"
                onClick={() => onExecuteScenario('TRIGGER_MANUAL_OVERRIDE')}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" /> Enable Manual Mode & Toggle Switches
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
