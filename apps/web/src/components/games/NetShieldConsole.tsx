"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";

const CONTROLS = [
  { id: "EMAIL_FILTER", label: "Email Gateway Filter" },
  { id: "ANTIVIRUS", label: "Endpoint Antivirus / EDR" },
  { id: "MFA_VAULT", label: "Multi-Factor Auth (MFA)" },
  { id: "BACKUPS", label: "Immutable Backups" },
  { id: "VPN_TLS", label: "VPN / TLS Tunnel" },
];

export function NetShieldConsole() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [waves, setWaves] = useState<Array<{ wave: number; threats: string[] }>>([]);
  const [waveIdx, setWaveIdx] = useState(0);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [waveResults, setWaveResults] = useState<any[] | null>(null);
  const [finalResult, setFinalResult] = useState<{
    serverScore: number;
    xpAwarded: number;
  } | null>(null);

  const startMutation = useMutation({
    mutationFn: () =>
      apiClient.post<{
        sessionId: string;
        waves: Array<{ wave: number; threats: string[] }>;
      }>("/api/v1/games/netshield/start"),
    onSuccess: (res) => {
      setSessionId(res.sessionId);
      setWaves(res.waves);
      setWaveIdx(0);
      setPlacements({});
      setWaveResults(null);
      setFinalResult(null);
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const finishMutation = useMutation({
    mutationFn: (sid: string) =>
      apiClient.post<{ serverScore: number; xpAwarded: number }>(
        "/api/v1/games/netshield/finish",
        { sessionId: sid }
      ),
    onSuccess: (res) => {
      setFinalResult(res);
      setSessionId(null);
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const waveMutation = useMutation({
    mutationFn: (payload: {
      sessionId: string;
      wave: number;
      placements: Array<{ threat: string; control: string }>;
    }) =>
      apiClient.post<{ event: { results: any[]; points: number } }>(
        "/api/v1/games/netshield/event",
        payload
      ),
    onSuccess: (res) => {
      setWaveResults(res.event.results);
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const activeWave = waves[waveIdx];

  // Light enterprise HTML5 Canvas visualization of incoming threats vs assigned controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeWave) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#F6F7F9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rowHeight = canvas.height / activeWave.threats.length;

    activeWave.threats.forEach((threat, i) => {
      const y = i * rowHeight + rowHeight / 2;

      // Lane line
      ctx.strokeStyle = "#E2E5EA";
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();

      // Threat badge on left
      ctx.fillStyle = "#FEF2F2";
      ctx.strokeStyle = "#FECACA";
      ctx.fillRect(20, y - 14, 130, 28);
      ctx.strokeRect(20, y - 14, 130, 28);
      ctx.fillStyle = "#DC2626";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.fillText(threat, 30, y + 4);

      // Assigned control node on right
      const assigned = placements[threat];
      ctx.fillStyle = assigned ? "#EFF6FF" : "#FFFFFF";
      ctx.strokeStyle = assigned ? "#1E3A8A" : "#CBD2D9";
      ctx.fillRect(canvas.width - 190, y - 14, 170, 28);
      ctx.strokeRect(canvas.width - 190, y - 14, 170, 28);
      ctx.fillStyle = assigned ? "#1E3A8A" : "#64748B";
      ctx.fillText(assigned || "Select control below", canvas.width - 180, y + 4);
    });
  }, [activeWave, placements]);

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-5">
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            NetShield Defense
          </h2>
          <p className="text-xs text-ink-secondary">
            Pair each incoming threat vector with the exact technical control that mitigates it.
          </p>
        </div>
        {activeWave && (
          <span className="text-xs font-medium text-ink-secondary tabular-nums">
            Wave {activeWave.wave} of {waves.length}
          </span>
        )}
      </div>

      {!sessionId && !finalResult && (
        <div className="py-6 text-center space-y-4">
          <p className="text-sm text-ink-secondary max-w-md mx-auto">
            Phishing, malware, brute force, ransomware, and MITM attacks are each neutralized only by their corresponding safeguard.
          </p>
          <button
            type="button"
            disabled={startMutation.isPending}
            onClick={() => startMutation.mutate()}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            {startMutation.isPending ? "Initializing..." : "Start defense simulation"}
          </button>
        </div>
      )}

      {sessionId && activeWave && (
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={680}
            height={260}
            aria-label="NetShield threat lane diagram"
            className="w-full rounded-md border border-border"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeWave.threats.map((threat) => (
              <div
                key={threat}
                className="flex items-center justify-between rounded-md border border-border bg-canvas px-3 py-2 text-xs"
              >
                <span className="font-semibold text-ink-primary">{threat}</span>
                <select
                  aria-label={`Control for ${threat}`}
                  value={placements[threat] ?? ""}
                  disabled={Boolean(waveResults)}
                  onChange={(e) =>
                    setPlacements((prev) => ({
                      ...prev,
                      [threat]: e.target.value,
                    }))
                  }
                  className="rounded border border-border bg-surface px-2 py-1 text-xs text-ink-primary"
                >
                  <option value="">Choose safeguard...</option>
                  {CONTROLS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {waveResults && (
            <div className="space-y-2">
              {waveResults.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-md border p-2.5 text-xs ${
                    r.blocked
                      ? "border-green-200 bg-green-50 text-risk-low"
                      : "border-red-200 bg-red-50 text-risk-high"
                  }`}
                >
                  <span className="font-semibold">
                    {r.threat} ({r.blocked ? "Blocked" : "Missed"}):
                  </span>{" "}
                  {r.why}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            {!waveResults ? (
              <button
                type="button"
                disabled={
                  waveMutation.isPending ||
                  activeWave.threats.some((t) => !placements[t])
                }
                onClick={() =>
                  waveMutation.mutate({
                    sessionId,
                    wave: activeWave.wave,
                    placements: activeWave.threats.map((t) => ({
                      threat: t,
                      control: placements[t],
                    })),
                  })
                }
                className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {waveMutation.isPending ? "Validating wave..." : "Run wave defense"}
              </button>
            ) : waveIdx + 1 < waves.length ? (
              <button
                type="button"
                onClick={() => {
                  setWaveIdx((i) => i + 1);
                  setPlacements({});
                  setWaveResults(null);
                }}
                className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover"
              >
                Next wave
              </button>
            ) : (
              <button
                type="button"
                disabled={finishMutation.isPending}
                onClick={() => finishMutation.mutate(sessionId)}
                className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover"
              >
                Finish & record score
              </button>
            )}
          </div>
        </div>
      )}

      {finalResult && (
        <div className="rounded-md border border-border bg-canvas p-5 text-center space-y-3">
          <div className="text-lg font-semibold text-ink-primary tabular-nums">
            Defense Complete · {finalResult.serverScore} pts (+{finalResult.xpAwarded} XP)
          </div>
          <button
            type="button"
            onClick={() => startMutation.mutate()}
            className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
