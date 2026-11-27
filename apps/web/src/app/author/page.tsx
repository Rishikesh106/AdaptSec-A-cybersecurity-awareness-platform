"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shell/AppShell";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import { Download, Plus, CheckCircle2, EyeOff, Trash2, Upload } from "lucide-react";

interface ScenarioItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  channel: string;
  difficulty: string;
  skillTag: string;
  isPublished: boolean;
  organizationId: string | null;
}

interface QuestionItem {
  id: string;
  type: string;
  skillTag: string;
  difficulty: string;
  prompt: string;
  isPublished?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AuthorStudioPage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"scenarios" | "questions">("scenarios");

  // Scenario Create Form
  const [sTitle, setSTitle] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sChannel, setSChannel] = useState("INBOX");
  const [sDifficulty, setSDifficulty] = useState("INTERMEDIATE");
  const [sSkill, setSSkill] = useState("phishing");
  const [sSubject, setSSubject] = useState("Urgent: Verify your payroll bank details");
  const [sSender, setSSender] = useState("hr-payroll@meridain-support.co");
  const [sBody, setSBody] = useState(
    "Your payroll deposit requires immediate confirmation before 5 PM today."
  );
  const [sCorrectAction, setSCorrectAction] = useState("REPORT_PHISH");
  const [sPublish, setSPublish] = useState(true);

  // Question Create Form
  const [qPrompt, setQPrompt] = useState("");
  const [qSkill, setQSkill] = useState("phishing");
  const [qDifficulty, setQDifficulty] = useState("BEGINNER");
  const [qOptA, setQOptA] = useState("Verify via official internal directory");
  const [qOptB, setQOptB] = useState("Click the urgent email link immediately");
  const [qExplanation, setQExplanation] = useState(
    "Always verify urgent financial or credential requests out-of-band."
  );

  // Import JSON modal state
  const [importJson, setImportJson] = useState("");
  const [showImport, setShowImport] = useState(false);

  const { data: scenariosData, isLoading: loadingScenarios } = useQuery<{
    items: ScenarioItem[];
  }>({
    queryKey: ["author-scenarios"],
    queryFn: () => apiClient.get("/api/v1/scenarios?limit=50"),
  });

  const { data: questionsData, isLoading: loadingQuestions } = useQuery<{
    items: QuestionItem[];
  }>({
    queryKey: ["author-questions"],
    queryFn: () => apiClient.get("/api/v1/questions?limit=50"),
  });

  const createScenarioMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/api/v1/scenarios", {
        title: sTitle,
        description: sDesc,
        channel: sChannel,
        difficulty: sDifficulty,
        skillTag: sSkill,
        contentJson: {
          senderName: "Payroll Desk",
          senderEmail: sSender,
          subject: sSubject,
          body: sBody,
        },
        redFlagsJson: [
          {
            id: "lookalike_domain",
            label: "Lookalike sender domain",
            clue: sSender,
          },
        ],
        correctAction: sCorrectAction,
        explanationSuccess: "You spotted the social-engineering indicator and reported it safely.",
        explanationFailure: "The sender domain and urgency cues indicate a phishing lure.",
        whatToDoInstead: "Verify payroll changes through the official HR portal.",
        isPublished: sPublish,
      }),
    onSuccess: () => {
      setSTitle("");
      setSDesc("");
      queryClient.invalidateQueries({ queryKey: ["author-scenarios"] });
      notify("Scenario created", "success");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Failed to create scenario", "error"),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiClient.patch(`/api/v1/scenarios/${id}`, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["author-scenarios"] });
      notify("Scenario publication status updated", "success");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Update failed", "error"),
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/scenarios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["author-scenarios"] });
      notify("Scenario deleted", "success");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Cannot delete scenario", "error"),
  });

  const createQuestionMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/api/v1/questions", {
        type: "MCQ",
        skillTag: qSkill,
        difficulty: qDifficulty,
        prompt: qPrompt,
        optionsJson: [
          { id: "a", text: qOptA, isCorrect: true },
          { id: "b", text: qOptB, isCorrect: false },
        ],
        explanation: qExplanation,
        isPublished: true,
      }),
    onSuccess: () => {
      setQPrompt("");
      queryClient.invalidateQueries({ queryKey: ["author-questions"] });
      notify("Question added to adaptive bank", "success");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Failed to create question", "error"),
  });

  const importMutation = useMutation({
    mutationFn: () => {
      const parsed = JSON.parse(importJson);
      const scenarios = Array.isArray(parsed) ? parsed : parsed.scenarios;
      return apiClient.post<{ importedCount: number }>("/api/v1/scenarios/import", {
        scenarios,
      });
    },
    onSuccess: (res) => {
      setShowImport(false);
      setImportJson("");
      queryClient.invalidateQueries({ queryKey: ["author-scenarios"] });
      notify(`Imported ${res.importedCount} scenario(s)`, "success");
    },
    onError: (err) =>
      notify(err instanceof Error ? err.message : "Invalid JSON payload", "error"),
  });

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/scenarios/export`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "adaptsec-scenarios.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify("Failed to export scenarios", "error");
    }
  };

  return (
    <AppShell breadcrumb="Content Studio">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Content Authoring Studio
            </h1>
            <p className="text-sm text-ink-secondary">
              Author custom organization scenarios, manage adaptive quiz items, and import/export JSON packs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-canvas"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => setShowImport((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-canvas"
            >
              <Upload className="h-3.5 w-3.5" />
              Import JSON
            </button>
          </div>
        </div>

        {showImport && (
          <div className="rounded-md border border-border bg-surface p-4 space-y-3">
            <h2 className="text-xs font-semibold text-ink-primary">
              Import Scenarios JSON (array or {`{ "scenarios": [...] }`})
            </h2>
            <textarea
              rows={5}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[{"title": "...", "description": "...", "channel": "INBOX", "skillTag": "phishing", ...}]'
              className="w-full rounded-md border border-border bg-canvas p-2.5 font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="rounded border border-border px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => importMutation.mutate()}
                disabled={importMutation.isPending || !importJson.trim()}
                className="rounded bg-brand px-3.5 py-1.5 text-xs font-medium text-white"
              >
                {importMutation.isPending ? "Importing..." : "Run Import"}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("scenarios")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "scenarios"
                ? "border-brand text-brand"
                : "border-transparent text-ink-secondary"
            }`}
          >
            Scenarios ({scenariosData?.items.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setTab("questions")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "questions"
                ? "border-brand text-brand"
                : "border-transparent text-ink-secondary"
            }`}
          >
            Question Bank ({questionsData?.items.length ?? 0})
          </button>
        </div>

        {tab === "scenarios" ? (
          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createScenarioMutation.mutate();
              }}
              className="rounded-md border border-border bg-surface p-5 space-y-4"
            >
              <h2 className="text-sm font-semibold text-ink-primary">
                Create Organization Scenario
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  required
                  minLength={4}
                  placeholder="Scenario title"
                  value={sTitle}
                  onChange={(e) => setSTitle(e.target.value)}
                  className="sm:col-span-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <select
                  value={sChannel}
                  onChange={(e) => setSChannel(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                >
                  <option value="INBOX">INBOX</option>
                  <option value="SMS">SMS</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                  <option value="UPI">UPI</option>
                  <option value="VOICE_CALL">VOICE_CALL</option>
                  <option value="FAKE_LOGIN">FAKE_LOGIN</option>
                </select>
                <select
                  value={sSkill}
                  onChange={(e) => setSSkill(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                >
                  <option value="phishing">phishing</option>
                  <option value="credentials">credentials</option>
                  <option value="payments">payments</option>
                  <option value="social_eng">social_eng</option>
                  <option value="browsing_wifi">browsing_wifi</option>
                  <option value="data_privacy">data_privacy</option>
                  <option value="incident_response">incident_response</option>
                </select>
                <select
                  value={sDifficulty}
                  onChange={(e) => setSDifficulty(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                  <option value="EXPERT">EXPERT</option>
                </select>
                <select
                  value={sCorrectAction}
                  onChange={(e) => setSCorrectAction(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                >
                  <option value="REPORT_PHISH">REPORT_PHISH</option>
                  <option value="IGNORE_SAFE">IGNORE_SAFE</option>
                  <option value="ESCALATE_SOC">ESCALATE_SOC</option>
                </select>
                <input
                  type="text"
                  required
                  minLength={5}
                  placeholder="Short description"
                  value={sDesc}
                  onChange={(e) => setSDesc(e.target.value)}
                  className="sm:col-span-3 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Sender / Caller"
                  value={sSender}
                  onChange={(e) => setSSender(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Subject / Header"
                  value={sSubject}
                  onChange={(e) => setSSubject(e.target.value)}
                  className="sm:col-span-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <textarea
                  rows={2}
                  value={sBody}
                  onChange={(e) => setSBody(e.target.value)}
                  className="sm:col-span-3 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={sPublish}
                    onChange={(e) => setSPublish(e.target.checked)}
                  />
                  Publish immediately to org learners
                </label>
                <button
                  type="submit"
                  disabled={createScenarioMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                >
                  <Plus className="h-4 w-4" />
                  Create Scenario
                </button>
              </div>
            </form>

            <div className="rounded-md border border-border bg-surface divide-y divide-border">
              {loadingScenarios ? (
                <div className="p-6 text-sm text-ink-muted">Loading scenarios...</div>
              ) : (
                scenariosData?.items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-ink-primary">
                        {s.title}{" "}
                        {!s.organizationId && (
                          <span className="ml-1 rounded bg-canvas px-1.5 py-0.5 text-[10px] text-ink-muted border border-border">
                            Global
                          </span>
                        )}
                      </div>
                      <div className="text-ink-muted">
                        {s.channel} · {s.skillTag} · {s.difficulty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.organizationId && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              togglePublishMutation.mutate({
                                id: s.id,
                                isPublished: !s.isPublished,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-ink-primary hover:bg-canvas"
                          >
                            {s.isPublished ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Published
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5 text-ink-muted" />
                                Draft
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteScenarioMutation.mutate(s.id)}
                            aria-label="Delete scenario"
                            className="rounded p-1 text-ink-muted hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createQuestionMutation.mutate();
              }}
              className="rounded-md border border-border bg-surface p-5 space-y-4"
            >
              <h2 className="text-sm font-semibold text-ink-primary">
                Add Adaptive Question
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={qSkill}
                  onChange={(e) => setQSkill(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                >
                  <option value="phishing">phishing</option>
                  <option value="credentials">credentials</option>
                  <option value="payments">payments</option>
                  <option value="social_eng">social_eng</option>
                  <option value="browsing_wifi">browsing_wifi</option>
                  <option value="data_privacy">data_privacy</option>
                  <option value="incident_response">incident_response</option>
                </select>
                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
                <textarea
                  required
                  minLength={8}
                  rows={2}
                  placeholder="Question prompt..."
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  className="sm:col-span-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Correct option"
                  value={qOptA}
                  onChange={(e) => setQOptA(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Distractor option"
                  value={qOptB}
                  onChange={(e) => setQOptB(e.target.value)}
                  className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Explanation"
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="sm:col-span-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={createQuestionMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>
            </form>

            <div className="rounded-md border border-border bg-surface divide-y divide-border">
              {loadingQuestions ? (
                <div className="p-6 text-sm text-ink-muted">Loading questions...</div>
              ) : (
                questionsData?.items.map((q) => (
                  <div key={q.id} className="px-4 py-3 text-xs space-y-1">
                    <div className="font-medium text-ink-primary">{q.prompt}</div>
                    <div className="text-ink-muted">
                      {q.type} · {q.skillTag} · {q.difficulty}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
