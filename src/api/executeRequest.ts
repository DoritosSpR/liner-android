import { ApiError } from "./apiError";
import { refreshAuthSession } from "./authRefresh";
import { getAuthSession, setAuthSession, clearAuthSession } from "./auth-session";
import { signApiRequest } from "./requestSigner";
import { getApiBaseUrl } from "./baseUrl";

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const { timeoutMs = TIMEOUT_MS, ...fetchInit } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, { ...fetchInit, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function executeRequest(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; skipAuthRefresh?: boolean } = {},
): Promise<Response> {
  const { auth = true, skipAuthRefresh = false } = options;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;

    const session = auth ? await getAuthSession() : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };

    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    const body = init.body ? String(init.body) : undefined;
    if (auth && session?.accessToken) {
      const signed = await signApiRequest({
        method: init.method ?? "GET",
        path,
        body,
      });
      Object.assign(headers, signed);
    }

    const response = await fetchWithTimeout(url, {
      ...init,
      headers,
    });

    if (response.status === 401 && auth && !skipAuthRefresh && session?.refreshToken) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        continue;
      }
      await clearAuthSession();
      throw new ApiError("Session expired", 401, "SESSION_EXPIRED");
    }

    if (!response.ok) {
      let code: string | undefined;
      try {
        const body = await response.json();
        code = body.code || body.error;
      } catch {}
      throw new ApiError(
        response.statusText || `Request failed with status ${response.status}`,
        response.status,
        code,
      );
    }

    return response;
  }

  throw new ApiError("Request failed after retries", 0, "REQUEST_FAILED");
}
