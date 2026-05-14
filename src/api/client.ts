/**
 * HTTP client for the Conduit API (`basePath` /api). Set `REACT_APP_API_URL` in `.env`
 * (e.g. http://localhost:3000/api). Falls back to the local Docker backend from the README.
 */

function getBaseUrl(): string {
  const raw = process.env.REACT_APP_API_URL;
  if (raw != null && raw !== "") {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000/api";
}

function joinUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

async function readErrorBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export type ApiRequestOptions = RequestInit & {
  /** Sent as `Authorization: Token <token>` when set */
  token?: string | null;
};

export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<Response> {
  const { token, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders ?? undefined);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  return fetch(joinUrl(path), {
    ...rest,
    headers,
  });
}

export async function apiGetJson<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const res = await apiRequest(path, { ...options, method: "GET" });
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorBody(res));
  }
  return (await res.json()) as T;
}

export async function apiPostJson<TResponse>(
  path: string,
  body: unknown,
  options?: ApiRequestOptions
): Promise<TResponse> {
  const headers = new Headers(options?.headers ?? undefined);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await apiRequest(path, {
    ...options,
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError(res.status, await readErrorBody(res));
  }

  return (await res.json()) as TResponse;
}

/** `DELETE` — response body is ignored (e.g. empty 200). */
export async function apiDelete(path: string, options?: ApiRequestOptions): Promise<void> {
  const res = await apiRequest(path, { ...options, method: "DELETE" });
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorBody(res));
  }
}
