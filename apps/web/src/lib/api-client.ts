import type { ApiErrorEnvelope } from "@adaptsec/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "ApiClientError";
  }
}

async function rawFetch<T>(
  path: string,
  init: RequestInit = {},
  retryOn401 = true
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retryOn401 && !path.includes("/auth/refresh")) {
    const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      return rawFetch<T>(path, init, false);
    }
  }

  if (!res.ok) {
    let errBody: ApiErrorEnvelope | null = null;
    try {
      errBody = (await res.json()) as ApiErrorEnvelope;
    } catch {
      // non-JSON response
    }
    throw new ApiClientError(
      res.status,
      errBody?.error?.code ?? "HTTP_ERROR",
      errBody?.error?.message ?? `Request failed with status ${res.status}`,
      errBody?.error?.details
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => rawFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    rawFetch<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    rawFetch<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, body?: unknown) =>
    rawFetch<T>(path, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
