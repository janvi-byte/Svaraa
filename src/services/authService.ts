import { apiPut, apiRequest, getStoredToken, storeAuth } from './api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  preferredLanguage?: string;
  practiceGoal?: string;
  avatarUrl?: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type ProfileResponse = {
  user: AuthUser;
};

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  storeAuth(result.token, result.user);
  return result;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  storeAuth(result.token, result.user);
  return result;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
  storeAuth(result.token, result.user);
  return result;
}

export async function getProfile(): Promise<AuthUser> {
  const result = await apiRequest<ProfileResponse>('/auth/profile');
  return result.user;
}


export async function updateProfile(name: string): Promise<AuthUser> {
  const token = getStoredToken();
  const result = await apiPut<ProfileResponse>('/auth/profile', { name });

  if (token) {
    storeAuth(token, result.user);
  }

  return result.user;
}
