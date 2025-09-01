import { useState, useMemo } from "react";
import { createAccounts, getAccounts } from "@/utils/api";
import { useToast } from "@/components/ui/useToast";

interface AccountRecord { username: string; userId: string; password?: string; eventId: string; }
interface AccountsArrayData { eventId: string; accountsCreated?: number; accounts: AccountRecord[]; }
interface AccountsObjectData { eventId: string; totalAccounts?: number; accounts: Record<string,string>; }
type AccountsResponse = AccountsArrayData | AccountsObjectData | null;

interface AccountsSectionProps { eventId: string; }

const AccountsSection = ({ eventId }: AccountsSectionProps) => {
  const [size, setSize] = useState<number>(1);
  const [accountsData, setAccountsData] = useState<AccountsResponse>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState("");
  // Password display removed per request
  const { show } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await createAccounts(eventId, size);
      setAccountsData(data);
      show(`Created ${'accountsCreated' in data ? data.accountsCreated : size} account(s)`, { type: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      show('Failed to create accounts', { type: 'error' });
    } finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setLoading(true); setError("");
    try {
      const data = await getAccounts(eventId);
      setAccountsData(data);
      show('Accounts refreshed', { type: 'info' });
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); } finally { setLoading(false); }
  };

  const rows = useMemo(() => {
    if (!accountsData) return [] as AccountRecord[];
    if (Array.isArray(accountsData.accounts)) {
      // array form (newly created accounts) we keep username & userId only
      return accountsData.accounts.map(a => ({ username: a.username, userId: a.userId, eventId: a.eventId }));
    }
    // object form: keep raw lines; we won't parse password, just show entire string
    return Object.values(accountsData.accounts).map(line => ({ username: line, userId: '', eventId }));
  }, [accountsData, eventId]);

  const filtered = rows.filter(r => !filter || r.userId.toLowerCase().includes(filter.toLowerCase()) || r.username.toLowerCase().includes(filter.toLowerCase()));

  const copyRow = (r: AccountRecord) => {
    const text = r.username && !r.userId ? r.username : `${r.userId}\t${r.username}`;
    navigator.clipboard.writeText(text).then(()=>show('Copied', { type: 'success' })).catch(()=>show('Copy failed', { type: 'error' }));
  };
  const copyAll = () => {
    const text = rows.map(r => (r.username && !r.userId) ? r.username : `${r.userId}\t${r.username}`).join('\n');
    navigator.clipboard.writeText(text).then(()=>show('Copied all', { type: 'success' })).catch(()=>show('Copy failed', { type: 'error' }));
  };

  const skeleton = Array.from({ length: 4 }).map((_,i)=>(
    <tr key={i} className="animate-pulse">
      <td className="p-1"><div className="h-3 bg-gray-300 rounded w-16" /></td>
      <td className="p-1"><div className="h-3 bg-gray-300 rounded w-24" /></td>
  <td className="p-1"><div className="h-3 bg-gray-300 rounded w-28" /></td>
    </tr>
  ));

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold">Voter Accounts</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {accountsData && <span>Total: {Array.isArray(accountsData.accounts) ? accountsData.accounts.length : Object.keys(accountsData.accounts).length}</span>}
          {('accountsCreated' in (accountsData||{})) && (accountsData as AccountsArrayData).accountsCreated && <span className="text-green-600">+{(accountsData as AccountsArrayData).accountsCreated} new</span>}
        </div>
      </div>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium">Generate</span>
          <input type="number" min={1} value={size} onChange={e=>setSize(parseInt(e.target.value)||1)} className="w-28 px-2 py-1 border rounded" />
        </label>
        <button disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50">{loading?"Processing...":"Create"}</button>
        <button type="button" onClick={handleRefresh} disabled={loading} className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 disabled:opacity-50">Refresh</button>
        <div className="ml-auto flex items-center gap-2">
          <input type="text" placeholder="Search user..." value={filter} onChange={e=>setFilter(e.target.value)} className="px-2 py-1 text-sm border rounded w-40" />
          {accountsData && <button type="button" onClick={copyAll} className="text-xs px-2 py-1 rounded border bg-gray-50 hover:bg-gray-100">Copy All</button>}
        </div>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="text-sm max-h-64 overflow-auto border rounded p-3 bg-gray-50 relative">
        {!accountsData && !loading && <p className="text-gray-500">No accounts loaded yet. Create or refresh.</p>}
        {loading && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left bg-gray-200">
                <th className="p-1">User / Line</th>
                <th className="p-1">User ID</th>
                <th className="p-1">Actions</th>
              </tr>
            </thead>
            <tbody>{skeleton}</tbody>
          </table>
        )}
        {accountsData && !loading && (
          <>
            <ExportButtons data={accountsData} />
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left bg-gray-200">
                  <th className="p-1">Username</th>
                  <th className="p-1">User ID</th>
                  <th className="p-1">Password</th>
                  <th className="p-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="p-3 text-center text-gray-500">No matches</td></tr>
                )}
                {filtered.map((acc, idx)=>(
                  <tr key={idx} className="odd:bg-white even:bg-gray-100">
                    <td className="p-1 break-all">{acc.username || <span className="text-gray-400">(auto)</span>}</td>
                    <td className="p-1 font-mono">{acc.userId || <span className="text-gray-400">(n/a)</span>}</td>
                    <td className="p-1 space-x-1">
                      <button onClick={()=>copyRow(acc)} className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700">Copy</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

// --- Export Helpers ---
interface ExportButtonsProps { data: AccountsArrayData | AccountsObjectData }

const ExportButtons = ({ data }: ExportButtonsProps) => {
  const buildRows = () => {
    if (Array.isArray(data.accounts)) {
      return data.accounts.map(a => ({ username: a.username, userId: a.userId, password: a.password, eventId: a.eventId }));
    }
    // Object style (index -> "ID: USER001 | Password: PASS123")
    return Object.values(data.accounts).map(line => {
      const match = /ID:\s*(\S+)\s*\|\s*Password:\s*(\S+)/i.exec(line);
      return {
        username: "",
        userId: match ? match[1] : line,
        password: match ? match[2] : "",
        eventId: data.eventId,
      };
    });
  };

  const rows = buildRows();

  const download = (format: 'csv' | 'json' | 'txt') => {
    let content = "";
    let mime = "text/plain";
    if (format === 'json') {
      content = JSON.stringify(rows, null, 2);
      mime = 'application/json';
    } else if (format === 'csv') {
      const header = 'username,userId,password,eventId';
      const csvRows = rows.map(r => [r.username, r.userId, r.password, r.eventId].map(v => `"${(v??'').replace(/"/g,'""')}"`).join(','));
      content = [header, ...csvRows].join('\n');
      mime = 'text/csv';
    } else {
      content = rows.map(r => `UserID: ${r.userId}\tPassword: ${r.password}`).join('\n');
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts_${data.eventId}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    const text = rows.map(r => `${r.userId}\t${r.password}`).join('\n');
    navigator.clipboard.writeText(text).catch(()=>{});
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <button type="button" onClick={() => download('csv')} className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">CSV</button>
      <button type="button" onClick={() => download('json')} className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">JSON</button>
      <button type="button" onClick={() => download('txt')} className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">TXT</button>
      <button type="button" onClick={copy} className="px-2 py-0.5 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400">Copy</button>
    </div>
  );
};

export default AccountsSection;
