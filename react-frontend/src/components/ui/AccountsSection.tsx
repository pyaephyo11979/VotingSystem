import { useState } from "react";
import { createAccounts, getAccounts } from "@/utils/api";

interface AccountRecord { username: string; userId: string; password: string; eventId: string; }
interface AccountsArrayResponse { message: string; eventId: string; accountsCreated?: number; accounts: AccountRecord[]; }
interface AccountsObjectResponse { message: string; eventId: string; totalAccounts?: number; accounts: Record<string,string>; }
type AccountsResponse = AccountsArrayResponse | AccountsObjectResponse | null;

interface AccountsSectionProps { eventId: string; }

const AccountsSection = ({ eventId }: AccountsSectionProps) => {
  const [size, setSize] = useState<number>(1);
  const [accountsData, setAccountsData] = useState<AccountsResponse>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await createAccounts(eventId, size);
      setAccountsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setLoading(true); setError("");
    try {
      const data = await getAccounts(eventId);
      setAccountsData(data);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); } finally { setLoading(false); }
  };

  return (
    <div className="p-4 border rounded-md space-y-3">
      <h2 className="text-lg font-semibold">User Accounts</h2>
      <form onSubmit={handleCreate} className="flex items-center space-x-2">
        <input type="number" min={1} value={size} onChange={e=>setSize(parseInt(e.target.value)||1)} className="w-24 px-2 py-1 border rounded" />
        <button disabled={loading} className="bg-gray-900 text-white px-3 py-1 rounded">{loading?"Processing...":"Create"}</button>
        <button type="button" onClick={handleRefresh} disabled={loading} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Refresh</button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
  {accountsData && (
        <div className="text-sm max-h-48 overflow-auto border rounded p-2 bg-gray-50">
          <p className="font-medium mb-1">{accountsData.message}</p>
          <ExportButtons data={accountsData} />
      {Array.isArray(accountsData.accounts) && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left bg-gray-200">
                  <th className="p-1">Username</th>
                  <th className="p-1">User ID</th>
                  <th className="p-1">Password</th>
                </tr>
              </thead>
              <tbody>
        {accountsData.accounts.map((acc, idx)=>(
                  <tr key={idx} className="odd:bg-white even:bg-gray-100">
                    <td className="p-1">{acc.username}</td>
                    <td className="p-1">{acc.userId}</td>
                    <td className="p-1 font-mono">{acc.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      {!Array.isArray(accountsData.accounts) && (
            <ul className="list-disc ml-4">
      {Object.values(accountsData.accounts as Record<string,string>).map((v,i)=>(<li key={i}>{v}</li>))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// --- Export Helpers ---
interface ExportButtonsProps { data: AccountsArrayResponse | AccountsObjectResponse }

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
