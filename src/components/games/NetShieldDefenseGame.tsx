"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  Shield,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Laptop,
  Database,
  Lock,
  Wifi,
  Mail,
  Heart,
  DollarSign,
} from "lucide-react";
import confetti from "canvas-confetti";

export type ThreatType = "PHISHING" | "MALWARE" | "BRUTE_FORCE" | "RANSOMWARE" | "MITM";
export type SafeguardType = "EMAIL_FILTER" | "ANTIVIRUS" | "MFA_VAULT" | "BACKUPS" | "VPN_TLS";

interface ThreatEntity {
  id: number;
  type: ThreatType;
  x: number;
  y: number;
  speed: number;
  targetNodeIndex: number;
  hp: number;
  alive: boolean;
}

interface NodeSlot {
  name: string;
  icon: any;
  yPos: number;
  safeguard: SafeguardType | null;
  hp: number;
}

const SAFEGUARD_CATALOG: {
  type: SafeguardType;
  name: string;
  cost: number;
  blocks: ThreatType;
  icon: any;
  description: string;
}[] = [
  {
    type: "EMAIL_FILTER",
    name: "Email Gateway Filter",
    cost: 200,
    blocks: "PHISHING",
    icon: Mail,
    description: "Inspects SPF/DKIM and quashes deceptive phishing lures.",
  },
  {
    type: "ANTIVIRUS",
    name: "EDR / Next-Gen Antivirus",
    cost: 250,
    blocks: "MALWARE",
    icon: Shield,
    description: "Quarantines suspicious payloads, trojans, and worms.",
  },
  {
    type: "MFA_VAULT",
    name: "Hardware MFA Vault",
    cost: 200,
    blocks: "BRUTE_FORCE",
    icon: Lock,
    description: "Renders stolen passwords useless against brute force.",
  },
  {
    type: "BACKUPS",
    name: "Immutable Air-Gapped Backups",
    cost: 300,
    blocks: "RANSOMWARE",
    icon: Database,
    description: "Neutralizes ransomware extortion through rapid restore.",
  },
  {
    type: "VPN_TLS",
    name: "VPN / Mutual TLS Tunnel",
    cost: 250,
    blocks: "MITM",
    icon: Wifi,
    description: "Encrypts all traffic preventing Man-in-the-Middle sniffing.",
  },
];

export function NetShieldDefenseGame() {
  const { addXp, updateSkillScore } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<"PLANNING" | "WAVE_ACTIVE" | "WAVE_DEBRIEF" | "GAME_OVER">("PLANNING");
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [credits, setCredits] = useState<number>(1000);
  const [selectedSafeguard, setSelectedSafeguard] = useState<SafeguardType | null>("EMAIL_FILTER");
  const [networkIntegrity, setNetworkIntegrity] = useState<number>(100);
  const [debriefLogs, setDebriefLogs] = useState<string[]>([]);

  const [nodes, setNodes] = useState<NodeSlot[]>([
    { name: "Employee Workstation", icon: Laptop, yPos: 70, safeguard: "EMAIL_FILTER", hp: 100 },
    { name: "Exchange Mail Server", icon: Mail, yPos: 170, safeguard: "ANTIVIRUS", hp: 100 },
    { name: "Identity & SSO Vault", icon: Lock, yPos: 270, safeguard: "MFA_VAULT", hp: 100 },
    { name: "Production Database", icon: Database, yPos: 370, safeguard: null, hp: 100 },
  ]);

  const threatsRef = useRef<ThreatEntity[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const handleSlotClick = (nodeIndex: number) => {
    if (gameState !== "PLANNING" || !selectedSafeguard) return;

    const catalogItem = SAFEGUARD_CATALOG.find((s) => s.type === selectedSafeguard);
    if (!catalogItem) return;

    const existing = nodes[nodeIndex].safeguard;
    if (existing === selectedSafeguard) return;

    if (credits < catalogItem.cost) return;

    setCredits((prev) => prev - catalogItem.cost);
    setNodes((prev) => {
      const next = [...prev];
      next[nodeIndex].safeguard = selectedSafeguard;
      return next;
    });
  };

  const startWave = () => {
    setGameState("WAVE_ACTIVE");
    setDebriefLogs([]);

    // Generate threats targeting nodes based on wave
    const threatTypes: ThreatType[] = ["PHISHING", "MALWARE", "BRUTE_FORCE", "RANSOMWARE", "MITM"];
    const generated: ThreatEntity[] = [];

    const threatCount = 4 + currentWave * 2;
    for (let i = 0; i < threatCount; i++) {
      const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      const targetIndex = Math.floor(Math.random() * 4);
      generated.push({
        id: i,
        type,
        x: -50 - i * 110,
        y: nodes[targetIndex].yPos + 15,
        speed: 1.2 + currentWave * 0.25,
        targetNodeIndex: targetIndex,
        hp: 1,
        alive: true,
      });
    }

    threatsRef.current = generated;
  };

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Network Nodes on the right side
      nodes.forEach((node, idx) => {
        const nx = canvas.width - 150;
        const ny = node.yPos;

        // Node box
        ctx.fillStyle = node.safeguard ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.04)";
        ctx.strokeStyle = node.safeguard ? "rgba(0, 240, 255, 0.4)" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(nx, ny - 25, 140, 60, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.fillText(node.name, nx + 10, ny);

        ctx.fillStyle = node.safeguard ? "#00f0ff" : "#8899ac";
        ctx.font = "10px monospace";
        ctx.fillText(node.safeguard ? `[${node.safeguard}]` : "[NO DEFENSE]", nx + 10, ny + 18);
      });

      // Update & Render threats
      if (gameState === "WAVE_ACTIVE") {
        let activeThreatsExist = false;

        threatsRef.current.forEach((t) => {
          if (!t.alive) return;
          activeThreatsExist = true;
          t.x += t.speed;

          // Draw threat icon/orb
          const colors: Record<ThreatType, string> = {
            PHISHING: "#00f0ff",
            MALWARE: "#ff007f",
            BRUTE_FORCE: "#ffb703",
            RANSOMWARE: "#ff3366",
            MITM: "#38bdf8",
          };

          ctx.fillStyle = colors[t.type] || "#ffffff";
          ctx.beginPath();
          ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#000000";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillText(t.type.slice(0, 4), t.x, t.y + 3);

          // Check collision with target node (nx = canvas.width - 150)
          if (t.x >= canvas.width - 165) {
            t.alive = false;
            const targetNode = nodes[t.targetNodeIndex];
            const matchingSafeguard = SAFEGUARD_CATALOG.find((s) => s.blocks === t.type);

            if (targetNode.safeguard === matchingSafeguard?.type) {
              // Successfully blocked!
              setCredits((prev) => prev + 60);
              setDebriefLogs((prev) => [
                ...prev,
                `✓ Neutralized ${t.type} targeting ${targetNode.name} using ${targetNode.safeguard}. (+60 credits)`,
              ]);
            } else {
              // Breach!
              setNetworkIntegrity((prev) => {
                const nextHp = Math.max(0, prev - 15);
                if (nextHp <= 0) {
                  setGameState("GAME_OVER");
                }
                return nextHp;
              });
              setDebriefLogs((prev) => [
                ...prev,
                `❌ Breach! ${t.type} hit ${targetNode.name}. Missing required control: ${matchingSafeguard?.name}. (-15% HP)`,
              ]);
            }
          }
        });

        // Check if wave finished
        if (!activeThreatsExist && threatsRef.current.length > 0) {
          setGameState("WAVE_DEBRIEF");
          addXp(150);
          updateSkillScore("browsing_wifi", 85);
          if (currentWave === 5) {
            try {
              confetti({ particleCount: 100, spread: 80 });
            } catch (e) {}
          }
        }
      }

      if (isRunning) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, nodes, currentWave]);

  const handleNextWave = () => {
    if (currentWave < 5) {
      setCurrentWave((prev) => prev + 1);
      setCredits((prev) => prev + 350); // bonus credits
      setGameState("PLANNING");
    } else {
      setGameState("GAME_OVER");
    }
  };

  const handleRestart = () => {
    setCurrentWave(1);
    setCredits(1000);
    setNetworkIntegrity(100);
    setGameState("PLANNING");
    setNodes([
      { name: "Employee Workstation", icon: Laptop, yPos: 70, safeguard: "EMAIL_FILTER", hp: 100 },
      { name: "Exchange Mail Server", icon: Mail, yPos: 170, safeguard: "ANTIVIRUS", hp: 100 },
      { name: "Identity & SSO Vault", icon: Lock, yPos: 270, safeguard: "MFA_VAULT", hp: 100 },
      { name: "Production Database", icon: Database, yPos: 370, safeguard: null, hp: 100 },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono">
            Interactive Canvas Defense Simulation
          </span>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            Wave {currentWave} of 5
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">NetShield Defense</h1>
        <p className="text-xs text-cyber-muted leading-relaxed">
          Deploy the correct technical safeguards to network nodes. In cybersecurity, defense-in-depth requires matching controls to specific threats: Phishing requires Email Filters, Malware requires Antivirus/EDR, Brute Force requires MFA, Ransomware requires Backups, and MITM requires VPN/TLS.
        </p>
      </div>

      {/* Game HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyber-border bg-[#0b111e] p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
            <Heart className="h-4 w-4 fill-rose-500" />
            <span>Health: {networkIntegrity}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <span>Security Budget: {credits} Credits</span>
          </div>
        </div>

        {gameState === "PLANNING" ? (
          <button
            onClick={startWave}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2 text-xs shadow-lg shadow-cyan-950/40 transition hover:scale-105"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Launch Wave {currentWave}</span>
          </button>
        ) : (
          <span className="rounded bg-cyan-950 px-3 py-1 text-xs font-bold font-mono text-cyan-300 animate-pulse">
            {gameState === "WAVE_ACTIVE" ? "Defense Wave Engaged..." : "Wave Completed"}
          </span>
        )}
      </div>

      {/* Canvas Arena */}
      <div className="rounded-3xl border border-cyber-border bg-[#05070e] p-4 overflow-hidden relative shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={430}
          className="w-full h-[430px] rounded-2xl block"
        />

        {/* Node Slot Click Overlays */}
        {gameState === "PLANNING" && (
          <div className="absolute right-6 top-6 bottom-6 w-44 flex flex-col justify-around pointer-events-auto">
            {nodes.map((node, i) => (
              <button
                key={i}
                onClick={() => handleSlotClick(i)}
                className="h-14 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/60 text-left px-3 text-[11px] font-semibold text-cyan-300 transition flex items-center justify-between"
              >
                <span>Deploy Here</span>
                <span>+</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Safeguard Shop / Selector */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-cyber-muted font-mono px-1">
          Safeguard Arsenal (Select and click a node to deploy)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SAFEGUARD_CATALOG.map((item) => {
            const isSelected = selectedSafeguard === item.type;
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                onClick={() => setSelectedSafeguard(item.type)}
                className={`rounded-2xl border p-3.5 space-y-2 cursor-pointer transition ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-lg shadow-cyan-950/20"
                    : "border-cyber-border bg-cyber-card text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs font-bold font-mono text-amber-400">{item.cost} CR</span>
                </div>
                <h4 className="font-bold text-xs leading-snug">{item.name}</h4>
                <p className="text-[10px] text-cyber-muted line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-1 border-t border-cyber-border/40 text-[10px] font-mono text-cyan-300">
                  Blocks: <span className="font-bold text-white">{item.blocks}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wave Debrief Modal */}
      {gameState === "WAVE_DEBRIEF" && (
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h3 className="font-bold text-base text-white">Wave {currentWave} Educational Debrief</h3>
            <span className="text-xs font-mono text-cyber-secondary">+150 XP Awarded</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 text-xs">
            {debriefLogs.map((log, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border ${
                  log.startsWith("✓")
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleNextWave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-5 py-2 text-xs transition"
            >
              <span>{currentWave < 5 ? `Proceed to Wave ${currentWave + 1}` : "Victory! View Results"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === "GAME_OVER" && (
        <div className="rounded-3xl border border-rose-500/30 bg-cyber-card p-8 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white">
            {networkIntegrity > 0 ? "🏆 All Threat Waves Neutralized!" : "Network Perimeter Breached"}
          </h2>
          <p className="text-xs text-cyber-muted max-w-md mx-auto">
            {networkIntegrity > 0
              ? "Outstanding defense-in-depth orchestration! You deployed the correct controls against every attack vector."
              : "Too many unmitigated threats reached critical internal assets. Remember that safeguards must match the specific incoming threat type."}
          </p>
          <button
            onClick={handleRestart}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 text-xs transition"
          >
            Play NetShield Again
          </button>
        </div>
      )}
    </div>
  );
}
