const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'speakora.auth.token';
const USER_KEY = 'speakora.auth.user';


export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}


export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}


export function storeAuth(
  token: string,
  user: unknown
): void {
  window.localStorage.setItem(
    TOKEN_KEY,
    token
  );

  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}


export function clearStoredAuth(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}


// ============================================================
// COMMON RESPONSE HANDLING
// ============================================================

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const payload: unknown =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(
        new Event('speakora:auth-expired')
      );
    }

    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'Something went wrong. Please try again.';

    throw new ApiError(
      message,
      response.status
    );
  }

  return payload as T;
}


// ============================================================
// GENERIC REQUEST
// ============================================================

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(
    options.headers
  );

  headers.set(
    'Content-Type',
    'application/json'
  );

  const token = getStoredToken();

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      }
    );
  } catch {
    throw new ApiError(
      'Unable to reach Speakora. Check that the backend is running and try again.',
      0
    );
  }

  return handleResponse<T>(response);
}


// ============================================================
// GET
// ============================================================

export async function apiGet<T>(
  path: string
): Promise<T> {
  const headers = new Headers();

  headers.set(
    'Content-Type',
    'application/json'
  );

  const token = getStoredToken();

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        method: 'GET',
        headers,
      }
    );
  } catch {
    throw new ApiError(
      'Unable to reach Speakora. Check that the backend is running and try again.',
      0
    );
  }

  return handleResponse<T>(response);
}


// ============================================================
// POST JSON
// ============================================================

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const token = getStoredToken();

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );
  } catch {
    throw new ApiError(
      'Unable to reach Speakora. Check that the backend is running and try again.',
      0
    );
  }

  return handleResponse<T>(response);
}


// ============================================================
// PUT JSON
// ============================================================

export async function apiPut<T>(
  path: string,
  body: unknown
): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const token = getStoredToken();

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      }
    );
  } catch {
    throw new ApiError(
      'Unable to reach Speakora. Check that the backend is running and try again.',
      0
    );
  }

  return handleResponse<T>(response);
}


// ============================================================
// POST FOR FILE UPLOAD
// ============================================================

export async function apiUpload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const headers = new Headers();

  const token = getStoredToken();

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );
  } catch {
    throw new ApiError(
      'Unable to reach Speakora. Check that the backend is running and try again.',
      0
    );
  }

  return handleResponse<T>(response);
}