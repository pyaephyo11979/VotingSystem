import { useState } from "react";
import { getResults } from "@/utils/api";

interface ResultsSectionProps { eventId: string; }

interface ResultsData {
  message: string;
  eventId: string;
  totalVotes?: number;
  results?: Record<string, number>;
}

const ResultsSection = ({ eventId }: ResultsSectionProps) => {
  const [data, setData] = useState<ResultsData|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    setLoading(true); setError("");
    try {
      const res = await getResults(eventId);
      setData(res);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setLoading(false); }
  };

  return (
    <div className="p-4 border rounded-md space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Results</h2>
        <button onClick={handleLoad} disabled={loading} className="bg-gray-900 text-white px-3 py-1 rounded">{loading?"Loading...":"Refresh"}</button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {data && (
        <div>
          <p className="text-sm text-gray-700 mb-2">Total Votes: {data.totalVotes ?? 0}</p>
          <ul className="space-y-1">
            {data.results && Object.entries(data.results).map(([name,count])=> (
              <li key={name} className="flex justify-between bg-gray-100 px-2 py-1 rounded text-sm">
                <span>{name}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;
