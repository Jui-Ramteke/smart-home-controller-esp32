import React, { useEffect, useRef } from 'react';
import { SensorState, ActuatorState } from '../types';

interface OledDisplayProps {
  sensors: SensorState;
  actuators: ActuatorState;
  motionCountdown: number;
}

export const OledDisplay: React.FC<OledDisplayProps> = ({
  sensors,
  actuators,
  motionCountdown
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 128x64 resolution scaled to canvas
    const width = 128;
    const height = 64;
    ctx.imageSmoothingEnabled = false;

    // OLED Deep Black Background
    ctx.fillStyle = '#060b10';
    ctx.fillRect(0, 0, width, height);

    // Grid dots simulation (monochrome cyan/blue OLED appearance)
    const oledColor = '#4ee4ff';
    const oledDim = '#1b5e6b';
    const oledAlert = '#ff4444';

    if (actuators.buzzerActive || actuators.redAlertLed) {
      // INTRUDER ALERT SCREEN
      const blink = Math.floor(Date.now() / 200) % 2 === 0;
      if (blink) {
        ctx.fillStyle = oledAlert;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#000000';
      } else {
        ctx.fillStyle = oledAlert;
      }
      
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! INTRUDER ALERT !', width / 2, 18);

      ctx.beginPath();
      ctx.moveTo(10, 24);
      ctx.lineTo(118, 24);
      ctx.strokeStyle = blink ? '#000000' : oledAlert;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '8px monospace';
      ctx.fillText('MOTION DETECTED', width / 2, 38);
      ctx.fillText('SECURITY BREACH', width / 2, 52);
      return;
    }

    // Normal OLED Operating Screen
    // Header Bar
    ctx.fillStyle = '#0f2430';
    ctx.fillRect(0, 0, width, 12);
    ctx.fillStyle = oledColor;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SMART HOME', 3, 9);

    // Mode Pill
    ctx.textAlign = 'right';
    ctx.font = '7px monospace';
    ctx.fillStyle = sensors.manualOverride ? '#ffaa00' : '#00ff88';
    ctx.fillText(sensors.manualOverride ? '[MANUAL]' : '[AUTO]', width - 3, 9);

    // Divider
    ctx.strokeStyle = oledDim;
    ctx.beginPath();
    ctx.moveTo(0, 12.5);
    ctx.lineTo(width, 12.5);
    ctx.stroke();

    // Row 1: Temperature & Light ADC
    ctx.fillStyle = oledColor;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`T:${sensors.temperature.toFixed(1)}°C`, 4, 23);
    
    ctx.fillStyle = sensors.isDark ? '#88a0b0' : '#ffea79';
    ctx.fillText(sensors.isDark ? 'L:DARK' : 'L:BRIGHT', 72, 23);

    // Row 2: PIR Motion & Timer
    ctx.fillStyle = oledColor;
    if (sensors.pirMotion) {
      ctx.fillStyle = '#00ff88';
      ctx.fillText('PIR: DETECTED', 4, 35);
    } else if (motionCountdown > 0 && actuators.roomLightRelay && !sensors.manualOverride) {
      ctx.fillStyle = '#88a0b0';
      ctx.fillText(`PIR: OFF in ${motionCountdown}s`, 4, 35);
    } else {
      ctx.fillStyle = '#88a0b0';
      ctx.fillText('PIR: CLEAR', 4, 35);
    }

    // Humidity
    ctx.fillStyle = oledColor;
    ctx.textAlign = 'right';
    ctx.fillText(`H:${Math.round(sensors.humidity)}%`, width - 4, 35);

    // Row 3: Actuator Relay States
    ctx.textAlign = 'left';
    ctx.fillStyle = actuators.roomLightRelay ? '#ffdd44' : '#445566';
    ctx.fillText(`LT:${actuators.roomLightRelay ? 'ON ' : 'OFF'}`, 4, 47);

    ctx.fillStyle = actuators.fanRelay ? '#00e5ff' : '#445566';
    ctx.fillText(`FAN:${actuators.fanRelay ? 'ON ' : 'OFF'}`, 48, 47);

    // Divider before footer
    ctx.strokeStyle = oledDim;
    ctx.beginPath();
    ctx.moveTo(0, 52.5);
    ctx.lineTo(width, 52.5);
    ctx.stroke();

    // Footer: Security Status
    ctx.font = '7px monospace';
    if (sensors.securityMode) {
      ctx.fillStyle = '#00ff88';
      ctx.fillText('SEC: ARMED [SAFE]', 4, 61);
    } else {
      ctx.fillStyle = '#888888';
      ctx.fillText('SEC: DISARMED', 4, 61);
    }

    // Small blinking heartbeat icon in bottom right
    const hbBlink = Math.floor(Date.now() / 500) % 2 === 0;
    if (hbBlink) {
      ctx.fillStyle = oledColor;
      ctx.fillRect(width - 8, 55, 4, 4);
    }
  }, [sensors, actuators, motionCountdown]);

  return (
    <div id="oled-display-container" className="flex flex-col items-center">
      {/* Physical OLED Bezel */}
      <div className="relative p-3 bg-[#161616] rounded-lg border border-gray-700 shadow-xl inline-block">
        {/* Screen PCB Header Pins */}
        <div className="flex justify-center gap-3 mb-1.5">
          <span className="text-[9px] font-mono text-gray-400">GND</span>
          <span className="text-[9px] font-mono text-red-400">VCC</span>
          <span className="text-[9px] font-mono text-cyan-400">SCL:22</span>
          <span className="text-[9px] font-mono text-yellow-400">SDA:21</span>
        </div>

        {/* OLED Glass Display Area */}
        <div className="relative bg-black p-1 rounded border border-gray-800 shadow-inner overflow-hidden">
          <canvas
            ref={canvasRef}
            width={128}
            height={64}
            className="w-[200px] h-[100px] sm:w-[240px] sm:h-[120px] rendering-pixelated block"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Glass glare effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        </div>

        {/* OLED Model Label */}
        <div className="text-center mt-1.5 flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-gray-400">SSD1306 0.96" I2C</span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/40">128×64</span>
        </div>
      </div>
    </div>
  );
};
