import React, { useState } from 'react';
import { COMPLETE_INO_CODE, WOKWI_DIAGRAM_JSON, PINOUT_TABLE } from '../embeddedCode';
import { Code2, Copy, Check, Download, FileText, Cpu, ExternalLink, BookOpen } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ino' | 'wokwi' | 'pinout' | 'guide'>('ino');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="code-viewer-container" className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden shadow-2xl flex flex-col">
      {/* Tab Navigation Header */}
      <div className="bg-[#111111] px-4 py-2 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="tab-ino-btn"
            onClick={() => setActiveTab('ino')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'ino'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-850'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>smart_home.ino (ESP32 C++)</span>
          </button>

          <button
            id="tab-wokwi-btn"
            onClick={() => setActiveTab('wokwi')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'wokwi'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>diagram.json (Wokwi)</span>
          </button>

          <button
            id="tab-pinout-btn"
            onClick={() => setActiveTab('pinout')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'pinout'
                ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-850'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Pinout Mapping Table</span>
          </button>

          <button
            id="tab-guide-btn"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-850'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Simulator & Hardware Guide</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'ino' && (
            <>
              <button
                id="copy-code-btn"
                onClick={() => handleCopy(COMPLETE_INO_CODE)}
                className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-mono transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy INO'}</span>
              </button>
              <button
                id="download-code-btn"
                onClick={() => handleDownload('smart_home.ino', COMPLETE_INO_CODE)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ino</span>
              </button>
            </>
          )}

          {activeTab === 'wokwi' && (
            <>
              <button
                id="copy-wokwi-btn"
                onClick={() => handleCopy(WOKWI_DIAGRAM_JSON)}
                className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-mono transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                id="download-wokwi-btn"
                onClick={() => handleDownload('diagram.json', WOKWI_DIAGRAM_JSON)}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download diagram.json</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 overflow-y-auto max-h-[600px] font-mono text-xs text-gray-300 bg-[#0a0a0a]">
        
        {/* TAB 1: INO CODE */}
        {activeTab === 'ino' && (
          <div className="space-y-4">
            <div className="bg-[#161616] p-3 rounded-lg border border-gray-800 text-gray-400 text-xs font-sans flex items-start gap-2">
              <span className="font-mono text-emerald-400 font-bold text-sm">&bull;</span>
              <span>
                <strong>Dependencies:</strong> Install <code className="text-emerald-400 font-mono">Adafruit SSD1306</code>, <code className="text-emerald-400 font-mono">Adafruit GFX Library</code>, and <code className="text-emerald-400 font-mono">DHT sensor library</code> via Arduino Library Manager or PlatformIO.
              </span>
            </div>
            <pre className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800 overflow-x-auto text-[11px] leading-relaxed text-emerald-400/90 font-mono select-all">
              {COMPLETE_INO_CODE}
            </pre>
          </div>
        )}

        {/* TAB 2: WOKWI DIAGRAM JSON */}
        {activeTab === 'wokwi' && (
          <div className="space-y-4">
            <div className="bg-cyan-950/40 p-3 rounded-lg border border-cyan-800/40 text-cyan-200 text-xs font-sans">
              <strong>How to run in Wokwi (1-Click Instructions):</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1 text-cyan-300/90">
                <li>Go to <strong className="text-white">wokwi.com/projects/new/esp32</strong></li>
                <li>Create a file named <code className="bg-cyan-950 px-1 py-0.5 rounded font-mono text-white">diagram.json</code> and paste the JSON below.</li>
                <li>Paste the contents of <code className="bg-cyan-950 px-1 py-0.5 rounded font-mono text-white">smart_home.ino</code> into <code className="bg-cyan-950 px-1 py-0.5 rounded font-mono text-white">sketch.ino</code>.</li>
                <li>Click the green <strong className="text-white">Play / Start Simulation</strong> button!</li>
              </ol>
            </div>
            <pre className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800 overflow-x-auto text-[11px] leading-relaxed text-cyan-300 font-mono select-all">
              {WOKWI_DIAGRAM_JSON}
            </pre>
          </div>
        )}

        {/* TAB 3: PINOUT TABLE */}
        {activeTab === 'pinout' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#161616] text-gray-300 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Peripheral Component</th>
                    <th className="py-2.5 px-3">ESP32 Pin</th>
                    <th className="py-2.5 px-3">I/O Mode</th>
                    <th className="py-2.5 px-3">Functional Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono text-[11px]">
                  {PINOUT_TABLE.map((row, i) => (
                    <tr key={i} className="hover:bg-[#161616]/50">
                      <td className="py-2 px-3 font-semibold text-gray-200">{row.component}</td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">{row.espPin}</td>
                      <td className="py-2 px-3 text-gray-400">{row.mode}</td>
                      <td className="py-2 px-3 text-gray-300 font-sans text-xs">{row.function}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SIMULATOR & HARDWARE GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-4 font-sans text-xs text-gray-300">
            <div className="bg-[#161616] p-4 rounded-lg border border-gray-800 space-y-3">
              <h4 className="text-sm font-bold text-gray-100 font-mono">1. Wokwi Simulator Setup</h4>
              <p className="text-gray-400">
                Wokwi provides native emulation for the ESP32 dual-core processor, I2C SSD1306 OLED, DHT22, LDR photoresistor, and relays in full real-time.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Load <code className="text-emerald-400 font-mono">smart_home.ino</code> and <code className="text-cyan-400 font-mono">diagram.json</code>.</li>
                <li>Simulate motion by clicking the PIR sensor circle on the canvas.</li>
                <li>Slide the LDR dial to simulate daylight (low ADC) or nighttime dark (high ADC).</li>
                <li>Click the DHT22 sensor to raise or lower room temperature.</li>
              </ul>
            </div>

            <div className="bg-[#161616] p-4 rounded-lg border border-gray-800 space-y-3">
              <h4 className="text-sm font-bold text-gray-100 font-mono">2. Tinkercad Circuits & Proteus Implementation</h4>
              <p className="text-gray-400">
                For Tinkercad Circuits (which uses Arduino Uno / ATmega328P) or Proteus ISIS VSM:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Map PIR to Pin 2 (INT0), LDR to Pin A0, DHT to Pin 4, OLED I2C to A4 (SDA) / A5 (SCL).</li>
                <li>Map Relay 1 (Light) to Pin 8, Relay 2 (Fan) to Pin 9, Buzzer to Pin 10.</li>
                <li>In Proteus, load the compiled <code className="text-purple-400 font-mono">.hex</code> file directly into the microcontroller properties dialog.</li>
              </ul>
            </div>

            <div className="bg-[#161616] p-4 rounded-lg border border-gray-800 space-y-3">
              <h4 className="text-sm font-bold text-gray-100 font-mono">3. Physical Industry Hardware Assembly</h4>
              <p className="text-gray-400">
                When transferring from simulator to real physical hardware:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Use optically isolated 5V/3.3V relay modules with flyback diode protection (e.g. PC817 optocouplers).</li>
                <li>Connect 10k pull-down resistors to manual toggle switches on GPIO 12, 14, 26, 27 (or use internal <code className="text-emerald-400 font-mono">INPUT_PULLDOWN</code>).</li>
                <li>Ensure the power supply can provide at least 500mA continuous current for ESP32 Wi-Fi bursts.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
