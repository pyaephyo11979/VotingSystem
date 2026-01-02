import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getResults } from "@/utils/api";
import { useToast } from "@/components/ui/useToast";

interface ResultsData {
  eventId: string;
  totalVotes: number;
  results: Record<string, number>;
}

const POLL_INTERVAL_MS = 4000;

export default function ResultsLivePage() {
  const { eventId } = useParams();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);

  const fetchData = async () => {
    if (!eventId) return;
    try {
      const res = await getResults(eventId);
      setData(res);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch results";
      setError(msg);
      show(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    timerRef.current = window.setInterval(fetchData, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const totalVotes = data?.totalVotes || 0;
  const resultsEntries = Object.entries(data?.results || {}).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Results</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 text-sm rounded bg-gray-900 text-white hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Back
          </button>
        </div>
      </div>
      {!eventId && <p className="text-red-500">Missing event id</p>}
      {loading && <p className="text-gray-600">Loading results...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {data && (
        <div className="w-full max-w-5xl space-y-6">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-4 items-end justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Event ID: <span className="font-mono">{data.eventId}</span>
                </h2>
                <p className="text-sm text-gray-500">
                  Total Votes: {totalVotes}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Auto-updates every {POLL_INTERVAL_MS / 1000}s
              </p>
            </div>
            <div className="space-y-3">
              {resultsEntries.length === 0 && (
                <p className="text-gray-500">No votes yet.</p>
              )}
              {resultsEntries.map(([candidate, votes]) => {
                const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                return (
                  <div key={candidate} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span>{candidate}</span>
                      <span className="font-mono">
                        {votes} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
