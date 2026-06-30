import type {
  AuthStatus,
  DemoActionResponse,
  DemoState,
  HealthResponse,
  LoginRequest,
  OnboardingRequest,
} from "./types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8790";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health");
}

export function getDemoState(runId?: string): Promise<DemoState> {
  const query = runId ? `?run_id=${encodeURIComponent(runId)}` : "";
  return request<DemoState>(`/api/demo/state${query}`);
}

export function getAuthStatus(): Promise<AuthStatus> {
  return request<AuthStatus>("/api/auth/me");
}

export function login(requestBody: LoginRequest): Promise<AuthStatus> {
  return request<AuthStatus>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function logout(): Promise<AuthStatus> {
  return request<AuthStatus>("/api/auth/logout", { method: "POST" });
}

export function saveOnboarding(requestBody: OnboardingRequest): Promise<DemoActionResponse> {
  return request<DemoActionResponse>("/api/demo/onboarding", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function createWorkflow(requestBody: OnboardingRequest): Promise<DemoActionResponse> {
  return request<DemoActionResponse>("/api/demo/workflows", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function selectWorkflow(workflowId: string): Promise<DemoActionResponse> {
  return request<DemoActionResponse>(`/api/demo/workflows/${encodeURIComponent(workflowId)}/select`, {
    method: "POST",
  });
}

export function deleteWorkflow(workflowId: string): Promise<DemoActionResponse> {
  return request<DemoActionResponse>(`/api/demo/workflows/${encodeURIComponent(workflowId)}/delete`, {
    method: "POST",
  });
}

export function runDemo(): Promise<DemoActionResponse> {
  return request<DemoActionResponse>("/api/demo/run", { method: "POST" });
}

export function resetDemo(): Promise<DemoActionResponse> {
  return request<DemoActionResponse>("/api/demo/reset", { method: "POST" });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = await readJson(response);
  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response.statusText), response.status);
  }

  return payload as T;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail: unknown }).detail);
  }

  if (typeof payload === "string") {
    return payload;
  }

  return fallback || "Request failed.";
}
