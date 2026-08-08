const API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://127.0.0.1:8000/api";

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
