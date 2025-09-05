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
interface AccountDto { username: string; userId: string; password?: string; eventId: string }

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (networkErr) {
    // Browser fetch network failure (CORS, DNS, connection refused, mixed content, etc.)
    console.error('[API] Network error', { input, init, error: networkErr });
    throw new Error('Network error: failed to reach server');
  }
  let json: StandardResponse<T>;
  try {
    json = await res.json();
  } catch (parseErr) {
    console.error('[API] Parse error', { input, status: res.status, parseErr });
    throw new Error('Invalid server response');
  }
  if (!res.ok || !json.success) {
    let msg = json?.error?.message || (json as unknown as { message?: string })?.message || res.statusText;
    if (res.status === 404 && json?.error?.code === 'EVENT_OR_PASSWORD_INVALID') {
      msg = 'Event not found or password incorrect';
    }
    if (res.status === 409 && json?.error?.code === 'ALREADY_VOTED') {
      msg = 'You have already voted in this event';
    }
    console.warn('[API] Error response', { input, status: res.status, body: json });
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
  if (!eventId) return Promise.reject(new Error('Missing eventId'));
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
  if (!eventId) return Promise.reject(new Error('Missing eventId'));
  if (!candidateId) return Promise.reject(new Error('Missing candidateId'));
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (photo) formData.append("photo", photo);
  return request<{candidateId:string; eventId:string; updated:boolean}>(`${base_url}/${eventId}/candidates/${candidateId}`, {
    method: "PUT",
    body: formData
  });
};

export const deleteCandidate = (eventId: string, candidateId: string) => {
  if (!eventId) return Promise.reject(new Error('Missing eventId'));
  if (!candidateId) return Promise.reject(new Error('Missing candidateId'));
  return request<{candidateId:string; eventId:string; deleted:boolean}>(
    `${base_url}/${eventId}/candidates/${candidateId}`,
    { method: "DELETE" }
  );
};

// Accounts
export const createAccounts = (eventId: string, eventSize: number) => request<{eventId:string; accountsCreated:number; accounts:AccountDto[]}>(
  `${base_url}/${eventId}/accounts`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventSize })
  }
);

// Backend returns: { eventId, totalAccounts, accounts: AccountDto[] }
// (legacy expectation was Record<string,string>; keep runtime guard to normalize)
interface AccountsMetaResponse { eventId: string; totalAccounts: number; accounts?: unknown; __accounts_json?: string }
export const getAccounts = async (eventId: string) => {
  const meta = await request<AccountsMetaResponse>(`${base_url}/${eventId}/accounts`);
  if (typeof meta.__accounts_json === 'string') {
    try {
      const arrParsed = JSON.parse(meta.__accounts_json) as unknown;
      if (Array.isArray(arrParsed)) {
        const cleaned: AccountDto[] = arrParsed.map(o => {
          const obj = o as Record<string, unknown>;
          return {
            userId: String(obj.userId ?? ''),
            username: String(obj.username ?? ''),
            password: obj.password ? String(obj.password) : undefined,
            eventId: String(obj.eventId ?? meta.eventId)
          };
        });
        return { eventId: meta.eventId, totalAccounts: meta.totalAccounts, accounts: cleaned };
      }
    } catch { /* parse fallback */ }
  }
  if (Array.isArray(meta.accounts)) {
    const cleaned: AccountDto[] = (meta.accounts as unknown[]).map(o => {
      const obj = o as Record<string, unknown>;
      return {
        userId: String(obj.userId ?? ''),
        username: String(obj.username ?? ''),
        password: obj.password ? String(obj.password) : undefined,
        eventId: String(obj.eventId ?? meta.eventId)
      };
    });
    return { eventId: meta.eventId, totalAccounts: meta.totalAccounts, accounts: cleaned };
  }
  const rec = (meta.accounts as Record<string, unknown>) || {};
  const parsed: AccountDto[] = Object.entries(rec).map(([k, val]) => {
    if (val && typeof val === 'object') {
      const vObj = val as Record<String, unknown>;
      return {
        userId: String(vObj.userId ?? k),
        username: String(vObj.username ?? ''),
        password: vObj.password ? String(vObj.password) : undefined,
        eventId: String(vObj.eventId ?? meta.eventId)
      };
    }
    const str = String(val);
    const r1 = /UserID:\s*(\S+)\s+Password:\s*(\S+)/i.exec(str);
    if (r1) return { userId: r1[1], password: r1[2], username: '', eventId: meta.eventId };
    const r2 = /ID:\s*(\S+)\s*\|\s*Password:\s*(\S+)/i.exec(str);
    if (r2) return { userId: r2[1], password: r2[2], username: '', eventId: meta.eventId };
    const r3 = /(\S+)[:|](\S+)[:|](\S+)/.exec(str);
    if (r3) return { userId: r3[1], username: r3[2], password: r3[3], eventId: meta.eventId };
    return { userId: k, username: str, eventId: meta.eventId };
  });
  return { eventId: meta.eventId, totalAccounts: meta.totalAccounts, accounts: parsed };
};

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
