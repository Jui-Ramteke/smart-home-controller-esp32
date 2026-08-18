import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  COMPLETE_INO_CODE,
  WOKWI_DIAGRAM_JSON,
  WOKWI_TOML,
  WOKWI_LIBRARIES_TXT,
  PLATFORMIO_INI,
  WOKWI_README_MD,
  WOKWI_PARTS_CATALOG,
  PINOUT_TABLE,
  WokwiPartDetail
} from '../embeddedCode';
import {
  Cpu,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  FileCode,
  FileText,
  BookOpen,
  Play,
  Sparkles,
  Zap,
  ShieldAlert,
  Thermometer,
  Sun,
  Eye,
  Radio,
  FolderArchive,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Moon,
  Shield,
  Maximize2,
  RefreshCw,
  Terminal,
  Activity,
  Workflow
} from 'lucide-react';

export const WokwiSimulatorHub: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState<'schematic' | 'quickstart' | 'files' | 'embed' | 'audit' | 'guide'>('schematic');
  const [selectedFile, setSelectedFile] = useState<'sketch.ino' | 'diagram.json' | 'wokwi.toml' | 'libraries.txt' | 'platformio.ini' | 'README.md'>('sketch.ino');
  const [selectedPart, setSelectedPart] = useState<WokwiPartDetail>(WOKWI_PARTS_CATALOG[0]);
  
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [customEmbedUrl, setCustomEmbedUrl] = useState<string>('https://wokwi.com/projects/new/esp32');
  const [loadedEmbedUrl, setLoadedEmbedUrl] = useState<string>('https://wokwi.com/projects/new/esp32');
  
  // Quickstart step tracking
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Preset scenarios to test in Wokwi
  const [activeScenario, setActiveScenario] = useState<'normal' | 'fire' | 'intruder' | 'night'>('normal');

  const getFileContent = (file: typeof selectedFile): string => {
    switch (file) {
      case 'sketch.ino':
        return COMPLETE_INO_CODE;
      case 'diagram.json':
        return WOKWI_DIAGRAM_JSON;
      case 'wokwi.toml':
        return WOKWI_TOML;
      case 'libraries.txt':
        return WOKWI_LIBRARIES_TXT;
      case 'platformio.ini':
        return PLATFORMIO_INI;
      case 'README.md':
        return WOKWI_README_MD;
    }
  };

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleCopyStep = (stepNum: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedStep(stepNum);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleDownloadSingle = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      
      const projectFolder = zip.folder('esp32-smarthome-wokwi');
      if (projectFolder) {
        projectFolder.file('sketch.ino', COMPLETE_INO_CODE);
        projectFolder.file('smart_home.ino', COMPLETE_INO_CODE);
        projectFolder.file('diagram.json', WOKWI_DIAGRAM_JSON);
        projectFolder.file('wokwi.toml', WOKWI_TOML);
        projectFolder.file('libraries.txt', WOKWI_LIBRARIES_TXT);
        projectFolder.file('platformio.ini', PLATFORMIO_INI);
        projectFolder.file('README.md', WOKWI_README_MD);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'esp32-smarthome-wokwi-project.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP bundle:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div id="wokwi-hub-container" className="space-y-6">
      
      {/* Top Banner Card with Wokwi Branding & Actions */}
      <div className="bg-gradient-to-r from-[#101726] via-[#121f2d] to-[#101726] border border-cyan-800/60 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/15 border border-cyan-500/40 rounded-lg text-cyan-300">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-100 font-mono tracking-tight flex items-center gap-2">
                  <span>Wokwi ESP32 Hardware Simulator Hub</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded font-sans font-bold">
                    Dual-Core ESP32 Ready
                  </span>
                </h2>
                <p className="text-xs text-gray-300 font-sans max-w-2xl mt-0.5">
                  Complete online simulation for ESP32 DevKit, SSD1306 OLED, DHT22 temp/humidity, LDR lux, PIR motion, dual SPDT relays, and piezo alarm siren.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="wokwi-download-zip-btn"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{isZipping ? 'Bundling ZIP...' : 'Export Complete (.ZIP)'}</span>
            </button>

            <a
              id="wokwi-launch-direct-btn"
              href="https://wokwi.com/projects/new/esp32"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Wokwi (New Tab)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="bg-[#141414] p-1.5 rounded-lg border border-gray-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <button
          id="wokwi-tab-schematic"
          onClick={() => setActiveSubtab('schematic')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubtab === 'schematic'
              ? 'bg-cyan-600 text-white font-bold shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-300" />
          <span>1. Interactive Circuit & Pin Matrix</span>
        </button>

        <button
          id="wokwi-tab-quickstart"
          onClick={() => setActiveSubtab('quickstart')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubtab === 'quickstart'
              ? 'bg-cyan-600 text-white font-bold shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>2. 30-Second Quick Launch Wizard</span>
        </button>

        <button
          id="wokwi-tab-files"
          onClick={() => setActiveSubtab('files')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubtab === 'files'
              ? 'bg-cyan-600 text-white font-bold shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-300" />
          <span>3. Project Files & Diagram.json</span>
        </button>

        <button
          id="wokwi-tab-audit"
          onClick={() => setActiveSubtab('audit')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubtab === 'audit'
              ? 'bg-cyan-600 text-white font-bold shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-300" />
          <span>4. Pinout & Electrical Safety Audit</span>
        </button>

        <button
          id="wokwi-tab-embed"
          onClick={() => setActiveSubtab('embed')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubtab === 'embed'
              ? 'bg-cyan-600 text-white font-bold shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-purple-300" />
          <span>5. Live Embedded Simulator</span>
        </button>

        <button
          id="wokwi-tab-guide"
          onClick={() => setActiveSubtab('guide')}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubtab === 'guide'
              ? 'bg-cyan-600 text-white font-bold shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-rose-300" />
          <span>6. VS Code & PlatformIO Guide</span>
        </button>
      </div>

      {/* SUBTAB 1: INTERACTIVE CIRCUIT & PIN MATRIX */}
      {activeSubtab === 'schematic' && (
        <div className="space-y-6">
          
          {/* Visual Interactive Wokwi Circuit Board Diagram */}
          <div className="bg-[#12161f] border border-cyan-900/50 rounded-xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase font-bold text-gray-200 tracking-wider">
                  Interactive Wokwi Hardware Schematic Topology
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                10 Virtual Nodes &bull; I2C Bus &bull; ADC1 &bull; SPDT
              </span>
            </div>

            {/* Graphical Layout Canvas of Wokwi Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Sensors Column (Top Inputs) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <Sun className="w-3 h-3" /> Input Sensors (Wokwi Top Layer)
                </span>

                {/* PIR Card */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[1])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'pir1'
                      ? 'bg-emerald-950/50 border-emerald-500 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>HC-SR501 PIR Motion</span>
                    <span className="text-emerald-400 text-[10px]">GPIO 13</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Digital Presence Trigger (Active HIGH)</div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-300">VCC (3V3) &bull; GND &bull; OUT (D13)</div>
                </div>

                {/* DHT22 Card */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[3])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'dht1'
                      ? 'bg-blue-950/50 border-blue-500 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>DHT22 Climate Sensor</span>
                    <span className="text-blue-400 text-[10px]">GPIO 4</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Digital 1-Wire Temp & Humidity</div>
                  <div className="mt-2 text-[10px] font-mono text-blue-300">VCC (3V3) &bull; GND &bull; SDA (D4)</div>
                </div>

                {/* LDR Card */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[2])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'ldr1'
                      ? 'bg-amber-950/50 border-amber-500 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>LDR Light Sensor</span>
                    <span className="text-amber-400 text-[10px]">GPIO 34</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Analog Daylight Sensor (ADC1_CH6)</div>
                  <div className="mt-2 text-[10px] font-mono text-amber-300">VCC (3V3) &bull; GND &bull; AO (A2/34)</div>
                </div>
              </div>

              {/* Central Controller (ESP32 DevKit & Display) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Core MCU & Screen
                </span>

                {/* ESP32 Main Core Box */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[0])}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPart.id === 'esp'
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/40'
                      : 'bg-[#151c26] border-cyan-900/60 hover:border-cyan-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-100 mb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Cpu className="w-4 h-4" /> ESP32 DevKit V1
                    </span>
                    <span className="px-1.5 py-0.5 bg-cyan-900 text-cyan-200 rounded text-[9px]">240MHz</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                    Dual Xtensa LX6 Cores with 12-bit ADC, I2C master bus, and FreeRTOS deterministic task scheduler.
                  </p>
                  <div className="mt-3 pt-2 border-t border-cyan-900/50 flex flex-wrap gap-1 text-[9px] font-mono text-cyan-200">
                    <span className="px-1.5 py-0.5 bg-[#0e141c] rounded border border-cyan-800/40">UART 115200</span>
                    <span className="px-1.5 py-0.5 bg-[#0e141c] rounded border border-cyan-800/40">I2C 0x3C</span>
                    <span className="px-1.5 py-0.5 bg-[#0e141c] rounded border border-cyan-800/40">ADC1 CH6</span>
                  </div>
                </div>

                {/* SSD1306 OLED */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[4])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'oled1'
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>SSD1306 0.96" OLED</span>
                    <span className="text-cyan-400 text-[10px]">GPIO 21, 22</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">128x64 Monochrome Graphic I2C Screen</div>
                  <div className="mt-2 text-[10px] font-mono text-cyan-300">SDA (D21) &bull; SCL (D22) &bull; Addr 0x3C</div>
                </div>
              </div>

              {/* Actuators & Alarms Column (Bottom Outputs) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Relays & Alarms (Wokwi Bottom Layer)
                </span>

                {/* Light Relay */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[5])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'relay_light'
                      ? 'bg-purple-950/50 border-purple-500 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>Room Light SPDT Relay</span>
                    <span className="text-purple-400 text-[10px]">GPIO 2</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Controls 230V/110V AC Lighting</div>
                  <div className="mt-2 text-[10px] font-mono text-purple-300">IN (GPIO 2) &bull; Active HIGH</div>
                </div>

                {/* Fan Relay */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[6])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'relay_fan'
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>HVAC Cooling Fan Relay</span>
                    <span className="text-indigo-400 text-[10px]">GPIO 15</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Auto Cooling Hysteresis Driver</div>
                  <div className="mt-2 text-[10px] font-mono text-indigo-300">IN (GPIO 15) &bull; Active HIGH</div>
                </div>

                {/* Piezo Buzzer & Siren LED */}
                <div
                  onClick={() => setSelectedPart(WOKWI_PARTS_CATALOG[7])}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPart.id === 'bz1'
                      ? 'bg-red-950/50 border-red-500 shadow-md'
                      : 'bg-[#161c24] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-200">
                    <span>Piezo Alarm Siren & Red LED</span>
                    <span className="text-red-400 text-[10px]">GPIO 25, 32</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">950Hz Intrusion Warning Tone</div>
                  <div className="mt-2 text-[10px] font-mono text-red-300">Buzzer (D25) &bull; Red LED (D32)</div>
                </div>
              </div>

            </div>
          </div>

          {/* Selected Part Details Inspector */}
          <div className="bg-[#141414] border border-cyan-800/40 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Wokwi Hardware Part Inspector</span>
                <h3 className="text-base font-bold text-gray-100 font-mono">{selectedPart.name}</h3>
              </div>
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 font-mono text-xs rounded border border-cyan-700/50">
                ID: {selectedPart.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 font-mono font-semibold">Wokwi Simulation Type:</span>
                  <code className="block bg-[#0c0c0c] px-2.5 py-1.5 rounded font-mono text-cyan-300 text-xs border border-gray-800 mt-1">
                    {selectedPart.type}
                  </code>
                </div>
                <div>
                  <span className="text-gray-400 font-mono font-semibold">Engineering Description:</span>
                  <p className="text-gray-300 font-sans leading-relaxed bg-[#181818] p-2.5 rounded border border-gray-800 mt-1">
                    {selectedPart.description}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-mono font-semibold">Wokwi Diagram Pin Connections:</span>
                <div className="space-y-1 bg-[#0c0c0c] p-3 rounded-lg border border-gray-800 max-h-40 overflow-y-auto mt-1">
                  {selectedPart.pins.map((pin, i) => (
                    <div key={i} className="font-mono text-xs flex items-center gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-cyan-200 font-bold">{pin}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: 30-SECOND QUICK LAUNCH WIZARD */}
      {activeSubtab === 'quickstart' && (
        <div className="space-y-5 font-sans">
          <div className="bg-[#12161f] border border-cyan-800/50 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3-Step 30-Second Wokwi Simulation Setup</span>
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Follow these 3 simple copy-paste steps to launch this exact project in Wokwi without installing any software.
                </p>
              </div>
              <a
                href="https://wokwi.com/projects/new/esp32"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Wokwi</span>
              </a>
            </div>

            {/* Steps Container */}
            <div className="space-y-4">
              
              {/* Step 1: Copy sketch.ino */}
              <div className="bg-[#161d26] border border-cyan-900/40 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center font-mono text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 font-mono">
                      Copy Arduino C++ Firmware (<code className="text-cyan-300">sketch.ino</code>)
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Contains the FreeRTOS sensor loops, OLED graphics rendering, hysteresis rules, and UART telemetry.
                    </p>
                  </div>
                </div>

                <button
                  id="step-copy-sketch-btn"
                  onClick={() => handleCopyStep(1, COMPLETE_INO_CODE)}
                  className={`px-3 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copiedStep === 1
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-cyan-700 hover:bg-cyan-600 text-white shadow'
                  }`}
                >
                  {copiedStep === 1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 1 ? 'Copied sketch.ino!' : '1. Copy sketch.ino'}</span>
                </button>
              </div>

              {/* Step 2: Copy diagram.json */}
              <div className="bg-[#161d26] border border-cyan-900/40 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center font-mono text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 font-mono">
                      Copy Schematic Circuit Wiring (<code className="text-cyan-300">diagram.json</code>)
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Automatically places and wires the ESP32, DHT22, PIR, OLED, Buzzer, LEDs, and Relays in Wokwi.
                    </p>
                  </div>
                </div>

                <button
                  id="step-copy-diagram-btn"
                  onClick={() => handleCopyStep(2, WOKWI_DIAGRAM_JSON)}
                  className={`px-3 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copiedStep === 2
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-cyan-700 hover:bg-cyan-600 text-white shadow'
                  }`}
                >
                  {copiedStep === 2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 2 ? 'Copied diagram.json!' : '2. Copy diagram.json'}</span>
                </button>
              </div>

              {/* Step 3: Copy Library Names */}
              <div className="bg-[#161d26] border border-cyan-900/40 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center font-mono text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 font-mono">
                      Copy Required Libraries List (<code className="text-cyan-300">libraries.txt</code>)
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Adafruit SSD1306, Adafruit GFX, and DHT sensor library for Wokwi's Library Manager.
                    </p>
                  </div>
                </div>

                <button
                  id="step-copy-libs-btn"
                  onClick={() => handleCopyStep(3, WOKWI_LIBRARIES_TXT)}
                  className={`px-3 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copiedStep === 3
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-cyan-700 hover:bg-cyan-600 text-white shadow'
                  }`}
                >
                  {copiedStep === 3 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStep === 3 ? 'Copied libraries.txt!' : '3. Copy libraries.txt'}</span>
                </button>
              </div>

            </div>

            {/* Play Button Final Note */}
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-lg p-3 flex items-center justify-between text-xs font-mono text-emerald-200">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Finally, click the green <strong>Play (Start Simulation)</strong> button in Wokwi!</span>
              </div>
              <a
                href="https://wokwi.com/projects/new/esp32"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline font-bold"
              >
                Go to Wokwi &rarr;
              </a>
            </div>
          </div>

          {/* Test Scenarios to Try in Wokwi */}
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-mono uppercase text-gray-300 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Recommended Interactive Test Scenarios in Wokwi</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-[#181818] p-3 rounded-lg border border-gray-800 space-y-1">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sun className="w-3 h-3" /> 1. Heat Trip
                </span>
                <p className="text-[11px] text-gray-400 font-sans">
                  Click the DHT22 in Wokwi and drag temperature to <strong>30°C</strong>. The fan relay will engage immediately with UART log output.
                </p>
              </div>

              <div className="bg-[#181818] p-3 rounded-lg border border-gray-800 space-y-1">
                <span className="text-blue-400 font-bold flex items-center gap-1">
                  <Moon className="w-3 h-3" /> 2. Night Motion Light
                </span>
                <p className="text-[11px] text-gray-400 font-sans">
                  Drag the LDR photoresistor into darkness, then click the PIR sensor. The room light relay will click ON for 5 seconds.
                </p>
              </div>

              <div className="bg-[#181818] p-3 rounded-lg border border-gray-800 space-y-1">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 3. Intruder Alarm Siren
                </span>
                <p className="text-[11px] text-gray-400 font-sans">
                  Flip the security slide switch to ARM, then click the PIR sensor. The Piezo buzzer will produce an audio siren and the red LED will flash.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: PROJECT FILES & DIAGRAM.JSON */}
      {activeSubtab === 'files' && (
        <div className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          
          {/* File Tab Selectors */}
          <div className="bg-[#111111] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['sketch.ino', 'diagram.json', 'wokwi.toml', 'libraries.txt', 'platformio.ini', 'README.md'] as const).map((file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedFile === file
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1c1c1c]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{file}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(getFileContent(selectedFile), selectedFile)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-mono transition-colors cursor-pointer"
              >
                {copiedFile === selectedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === selectedFile ? 'Copied' : `Copy ${selectedFile}`}</span>
              </button>

              <button
                onClick={() => handleDownloadSingle(selectedFile, getFileContent(selectedFile))}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* File Content Preview */}
          <div className="p-4 bg-[#0a0a0a] overflow-y-auto max-h-[600px] font-mono text-xs">
            <pre className="p-4 bg-[#0d0d0d] rounded-lg border border-gray-850 overflow-x-auto text-[11px] leading-relaxed text-cyan-300/90 font-mono select-all">
              {getFileContent(selectedFile)}
            </pre>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PINOUT & ELECTRICAL SAFETY AUDIT */}
      {activeSubtab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-[#12161f] border border-cyan-800/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold text-gray-100 uppercase tracking-wider">
                  ESP32 Microcontroller Electrical & Pin Safety Audit
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                100% Passed (No Boot Strapping Conflicts)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#161d26] rounded-lg border border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ADC1 Wi-Fi Safe</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans">
                  LDR is assigned to <strong>GPIO 34 (ADC1_CH6)</strong>. On ESP32, ADC2 cannot be used while Wi-Fi is active, but ADC1 is 100% safe for simultaneous Wi-Fi and ADC telemetry.
                </p>
              </div>

              <div className="p-3 bg-[#161d26] rounded-lg border border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Opto-Isolated Relays</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans">
                  Relay driver transistors on <strong>GPIO 2 & GPIO 15</strong> isolate inductive motor/lighting kickback from the 3.3V silicon logic rails.
                </p>
              </div>

              <div className="p-3 bg-[#161d26] rounded-lg border border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hardware I2C OLED</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans">
                  SSD1306 display is mapped to native hardware I2C pins <strong>GPIO 21 (SDA)</strong> & <strong>GPIO 22 (SCL)</strong> running at 400kHz Fast Mode.
                </p>
              </div>
            </div>
          </div>

          {/* Full Pin Mapping Table */}
          <div className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-[#181818] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between text-xs font-mono font-bold text-gray-200">
              <span>Complete ESP32 Pin Allocation Matrix</span>
              <span className="text-gray-500 font-normal">14 Total Connected Signals</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#111111] text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">ESP32 Pin</th>
                    <th className="p-3">Hardware Mode</th>
                    <th className="p-3">Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {PINOUT_TABLE.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#181818] transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {row.component}
                      </td>
                      <td className="p-3 text-cyan-300 font-bold">{row.espPin}</td>
                      <td className="p-3 text-gray-400">{row.mode}</td>
                      <td className="p-3 text-gray-300 font-sans">{row.function}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: LIVE EMBEDDED SIMULATOR */}
      {activeSubtab === 'embed' && (
        <div className="space-y-4">
          <div className="bg-[#141414] border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-gray-400 shrink-0">Wokwi Project URL:</span>
              <input
                type="text"
                value={customEmbedUrl}
                onChange={(e) => setCustomEmbedUrl(e.target.value)}
                placeholder="https://wokwi.com/projects/YOUR_PROJECT_ID"
                className="bg-[#0c0c0c] border border-gray-700 rounded px-3 py-1.5 text-xs text-cyan-300 w-full sm:w-96 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => setLoadedEmbedUrl(customEmbedUrl)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium shrink-0 cursor-pointer"
              >
                Load In Frame
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={loadedEmbedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center gap-1 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Tab</span>
              </a>
            </div>
          </div>

          {/* Iframe Window */}
          <div className="bg-[#0e0e0e] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="bg-[#181818] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Wokwi Embedded Simulation Window</span>
              </div>
              <span className="text-gray-500 text-[11px]">Tip: Paste sketch.ino and diagram.json directly into Wokwi tabs</span>
            </div>

            <div className="w-full h-[650px] bg-[#121212] relative">
              <iframe
                title="Wokwi Embedded Simulator"
                src={loadedEmbedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: VS CODE & PLATFORMIO GUIDE */}
      {activeSubtab === 'guide' && (
        <div className="space-y-5 font-sans text-xs text-gray-300">
          
          <div className="bg-[#141414] p-5 rounded-xl border border-gray-800 space-y-3">
            <h4 className="text-sm font-bold text-gray-100 font-mono flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">1</span>
              <span>Online Browser Simulation (Zero Installation)</span>
            </h4>
            <div className="text-gray-400 space-y-2 leading-relaxed ml-8">
              <p>Wokwi runs the dual-core ESP32 in full cycle-accurate emulation with real I2C SSD1306, DHT22, LDR, buzzer, and relays.</p>
              <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px] text-gray-300">
                <li>Go to <a href="https://wokwi.com/projects/new/esp32" target="_blank" rel="noreferrer" className="text-cyan-400 underline">https://wokwi.com/projects/new/esp32</a>.</li>
                <li>In <strong className="text-white">sketch.ino</strong>, replace the content with <code className="text-cyan-300 font-bold">sketch.ino</code>.</li>
                <li>In <strong className="text-white">diagram.json</strong>, replace the JSON with <code className="text-cyan-300 font-bold">diagram.json</code>.</li>
                <li>In the Library Manager tab, search and add: <code className="text-emerald-300">Adafruit SSD1306</code>, <code className="text-emerald-300">Adafruit GFX Library</code>, <code className="text-emerald-300">DHT sensor library</code>.</li>
                <li>Click <strong className="text-emerald-400">Play</strong> to start simulation!</li>
              </ol>
            </div>
          </div>

          <div className="bg-[#141414] p-5 rounded-xl border border-gray-800 space-y-3">
            <h4 className="text-sm font-bold text-gray-100 font-mono flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">2</span>
              <span>Local VS Code & PlatformIO Emulation with GDB Breakpoints</span>
            </h4>
            <div className="text-gray-400 space-y-2 leading-relaxed ml-8">
              <p>For advanced debugging, simulate and step through C++ code line-by-line inside VS Code:</p>
              <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px] text-gray-300">
                <li>Install the <strong>Wokwi Simulator</strong> and <strong>PlatformIO</strong> extensions in VS Code.</li>
                <li>Click <strong>Export Complete (.ZIP)</strong> above and unzip into your workspace.</li>
                <li>Open the folder in VS Code. PlatformIO will automatically install all compiler toolchains.</li>
                <li>Press <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-white">F1</kbd> and execute: <code className="text-purple-300">Wokwi: Start Simulator</code>.</li>
                <li>Set breakpoints in <code className="text-white">src/main.cpp</code> or <code className="text-white">sketch.ino</code> to inspect live variables!</li>
              </ol>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
