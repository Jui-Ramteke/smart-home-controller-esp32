import React, { useState, useRef, useEffect } from 'react';
import { SerialLog, SensorState, ActuatorState } from '../types';
import { Terminal, Send, Trash2, Pause, Play, Copy, Check, Info } from 'lucide-react';

interface SerialMonitorProps {
  logs: SerialLog[];
  onClearLogs: () => void;
  onSendCommand: (cmd: string) => void;
  sensors: SensorState;
  actuators: ActuatorState;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({
  logs,
  onClearLogs,
  onSendCommand,
  sensors,
  actuators
}) => {
  const [inputVal, setInputVal] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && !isPaused) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isPaused]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendCommand(inputVal.trim());
    setInputVal('');
  };

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="serial-monitor-panel" className="bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden shadow-2xl flex flex-col h-[400px]">
      {/* Terminal Header */}
      <div className="bg-[#161616] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-700 inline-block" />
          </div>
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-gray-200">ESP32 UART0 SERIAL MONITOR</span>
          <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">
            115200 BAUD
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-autoscroll-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
              autoScroll ? 'bg-gray-800 text-gray-300' : 'bg-gray-800/40 text-gray-500'
            }`}
            title="Auto-scroll"
          >
            Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            id="pause-serial-btn"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded transition-colors text-xs ${
              isPaused ? 'bg-amber-950/70 text-amber-300' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
            title={isPaused ? 'Resume Serial Stream' : 'Pause Serial Stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            id="copy-serial-logs-btn"
            onClick={handleCopy}
            className="p-1.5 bg-gray-800 text-gray-400 hover:text-gray-200 rounded transition-colors text-xs"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="clear-serial-logs-btn"
            onClick={onClearLogs}
            className="p-1.5 bg-gray-800 text-gray-400 hover:text-red-400 rounded transition-colors text-xs"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-1 bg-[#0a0a0a]">
        <div className="text-gray-500 border-b border-gray-800 pb-1 mb-2">
          --- Connected to ESP32-WROOM-32 @ 115200 baud (8-N-1) ---
          <br />
          Type <span className="text-emerald-400">help</span> to view available serial commands.
        </div>

        {logs.map((log) => {
          let textClass = 'text-gray-300';
          if (log.level === 'ALERT') textClass = 'text-red-400 font-bold bg-red-950/30 px-1 rounded';
          if (log.level === 'WARN') textClass = 'text-amber-400';
          if (log.level === 'SYSTEM') textClass = 'text-cyan-400';
          if (log.level === 'CMD') textClass = 'text-purple-300 font-semibold';

          return (
            <div key={log.id} className="leading-relaxed flex items-start gap-2">
              <span className="text-gray-600 select-none shrink-0 text-[10px]">[{log.timestamp}]</span>
              <span className={`break-all ${textClass}`}>{log.text}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Line Input */}
      <form onSubmit={handleSend} className="bg-[#161616] border-t border-gray-800 p-2 flex items-center gap-2">
        <span className="text-emerald-400 font-mono text-xs pl-2">&gt;</span>
        <input
          id="serial-command-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter command: 'help', 'set temp 31', 'arm', 'disarm', 'status', 'light on'..."
          className="flex-1 bg-transparent text-gray-200 font-mono text-xs focus:outline-none placeholder-gray-600"
        />
        <button
          id="send-serial-cmd-btn"
          type="submit"
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-medium flex items-center gap-1 transition-colors"
        >
          <Send className="w-3 h-3" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
