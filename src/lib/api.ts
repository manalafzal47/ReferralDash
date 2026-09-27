const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://127.0.0.1:8000/api";
const AUTH_TOKEN_KEY = "career_muse_token";
const AUTH_USER_KEY = "career_muse_user";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export type Campaign = {
  id: string;
  company: {
    id: string;
    name: string;
    website_url: string | null;
    domain: string | null;
  };
  target_role: string;
  job_posting_url: string | null;
  location: string | null;
  seniority: string | null;
  contact_goal: number;
  preferred_background: string | null;
  keywords: string[] | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export type CreateCampaignInput = {
  company_name: string;
  target_role: string;
  job_posting_url?: string;
  location?: string;
  seniority?: string;
  contact_goal: number;
  preferred_background?: string;
  keywords: string[];
  notes?: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  current_company: string | null;
  current_role: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  personal_site_url: string | null;
  email: string | null;
  status: string | null;
  created_at: string;
};

export type CreateCandidateInput = {
  full_name: string;
  current_company?: string;
  current_role?: string;
  location?: string;
  linkedin_url?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let detail = body;
    try {
      const payload = JSON.parse(body) as { detail?: unknown };
      if (typeof payload.detail === "string") detail = payload.detail;
      else if (Array.isArray(payload.detail)) detail = payload.detail.map(String).join(", ");
    } catch {
      // Keep the raw response when the API did not return JSON.
    }
    throw new Error(detail || `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listCampaigns() {
  return request<Campaign[]>("/campaigns");
}

export function createCampaign(input: CreateCampaignInput) {
  return request<Campaign>("/campaigns", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listCampaignCandidates(campaignId: string) {
  return request<Candidate[]>(`/campaigns/${campaignId}/candidates`);
}

export function discoverCandidates(campaignId: string) {
  return request<{ campaign_id: string; source: string; candidates: Candidate[] }>(
    `/campaigns/${campaignId}/discover`,
    {
      method: "POST",
    },
  );
}

export function addCandidate(campaignId: string, input: CreateCandidateInput) {
  return request<Candidate>(`/campaigns/${campaignId}/candidates`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((response) => {
    setAuthToken(response.token);
    setStoredUser(response.user);
    return response;
  });
}

export function registerUser(input: { name: string; email: string; password: string }) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((response) => {
    setAuthToken(response.token);
    setStoredUser(response.user);
    return response;
  });
}

export function getCurrentUser() {
  return request<AuthUser>("/auth/me");
}

export type ConnectionImportItem = {
  name: string;
  company?: string | null;
  role?: string | null;
  relationship?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
};

export type LinkedInImportInput = {
  company?: string;
  keywords?: string;
  target_role?: string;
  location?: string;
  limit?: number;
};

export type WarmLead = {
  name: string;
  company: string | null;
  role: string | null;
  relationship: string | null;
  email: string | null;
  linkedin_url: string | null;
  match_score: number;
  reason: string;
};

export function importConnections(connections: ConnectionImportItem[]) {
  return request<{ saved: number; user_id: string }>("/auth/connections/import", {
    method: "POST",
    body: JSON.stringify({ connections }),
  });
}

export function importLinkedInConnections(input: LinkedInImportInput) {
  return request<{ saved: number; user_id: string; source: string }>("/auth/connections/import-linkedin", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getWarmLeads(input?: { target_role?: string; company?: string }) {
  const params = new URLSearchParams();
  if (input?.target_role) params.set("target_role", input.target_role);
  if (input?.company) params.set("company", input.company);
  const query = params.toString();
  const path = query ? `/auth/warm-leads?${query}` : "/auth/warm-leads";
  return request<{ leads: WarmLead[] }>(path);
}
