// Centralized API client with StandardResponse envelope handling
declare global {
  interface Window { __API_BASE_URL__?: string }
}
interface ViteEnv { VITE_API_BASE_URL?: string }
const envBase = (import.meta as unknown as { env: ViteEnv }).env.VITE_API_BASE_URL;
const base_url = envBase || window.__API_BASE_URL__ || "http://localhost:8080/api/events";

interface ApiErrorEnvelope { code: string; message: string }
interface StandardResponse<T> { success: boolean; data?: T; error?: ApiErrorEnvelope }
interface CandidateDto { id?: string; candidateId?: string; name?: string; candidateName?: string; photo?: string; image?: string }
interface AccountDto { username: string; userId: string; password: string; eventId: string }

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  let json: StandardResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }
  if (!res.ok || !json.success) {
  let msg = json?.error?.message || (json as unknown as { message?: string })?.message || res.statusText;
    if (res.status === 404 && json?.error?.code === 'EVENT_OR_PASSWORD_INVALID') {
      msg = 'Event not found or password incorrect';
    }
    if (res.status === 409 && json?.error?.code === 'ALREADY_VOTED') {
      msg = 'You have already voted in this event';
    }
    throw new Error(msg);
  }
  return json.data as T;
}

// Event creation
export const createEvent = (eventName: string) => request<{eventId:string; eventName:string; eventPassword:string}>(
  `${base_url}/create`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName })
  }
);

// Candidates
export const addCandidates = (eventId: string, name: string, photo?: File|null) => {
  const formData = new FormData();
  formData.append("name", name);
  if (photo) formData.append("photo", photo);
  return request<{candidateId:string; eventId:string; name:string; hasPhoto:boolean}>(`${base_url}/${eventId}/candidates`, {
    method: "POST",
    body: formData
  });
};

export const getCandidates = (eventId: string, password?: string) => {
  let url = `${base_url}/${eventId}/candidates`;
  if (password) url += `?password=${encodeURIComponent(password)}`;
  return request<{eventId:string; totalCandidates:number; candidates:CandidateDto[]}>(url);
};

export const updateCandidate = (eventId: string, candidateId: string, name?: string, photo?: File|null) => {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (photo) formData.append("photo", photo);
  return request<{candidateId:string; eventId:string; updated:boolean}>(`${base_url}/${eventId}/candidates/${candidateId}`, {
    method: "PUT",
    body: formData
  });
};

export const deleteCandidate = (eventId: string, candidateId: string) => request<{candidateId:string; eventId:string; deleted:boolean}>(
  `${base_url}/${eventId}/candidates/${candidateId}`,
  { method: "DELETE" }
);

// Accounts
export const createAccounts = (eventId: string, eventSize: number) => request<{eventId:string; accountsCreated:number; accounts:AccountDto[]}>(
  `${base_url}/${eventId}/accounts`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventSize })
  }
);

export const getAccounts = (eventId: string) => request<{eventId:string; totalAccounts:number; accounts:Record<string,string>}>(
  `${base_url}/${eventId}/accounts`
);

// Results
export const getResults = (eventId: string) => request<{eventId:string; totalVotes:number; results:Record<string,number>}>(
  `${base_url}/${eventId}/results`
);

// Vote status
export const getVoteStatus = (eventId: string, userId: string) => request<{eventId:string; userId:string; hasVoted:boolean}>(
  `${base_url}/${eventId}/vote-status/${userId}`
);

// Auth / login
export const loginUser = (username: string, password: string) => request<{userId:string; eventId:string; eventName:string; eventPassword:string}>(
  `${base_url}/login`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  }
);

export const getVoterCandidates = (eventId: string, password: string) => getCandidates(eventId, password);

export const castVote = (eventId: string, userId: string, candidateId: string) => request<{eventId:string; candidateId:string; userId:string; success:boolean}>(
  `${base_url}/${eventId}/vote`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId, userId })
  }
);
