import { useState } from "react";
import { getVoteStatus } from "@/utils/api";

interface VoteStatusCheckerProps {
  eventId: string;
}
interface VoteStatusData {
  message: string;
  eventId: string;
  userId: string;
  hasVoted: boolean;
}

const VoteStatusChecker = ({ eventId }: VoteStatusCheckerProps) => {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<VoteStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await getVoteStatus(eventId, userId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-3">
      <h2 className="text-lg font-semibold">Vote Status</h2>
      <form onSubmit={handleCheck} className="flex space-x-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="px-2 py-1 border rounded"
        />
        <button
          disabled={loading}
          className="bg-gray-900 text-white px-3 py-1 rounded"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {data && (
        <div className="text-sm bg-gray-50 border rounded p-2">
          <p>{data.message}</p>
          <p>
            Status:{" "}
            <span
              className={data.hasVoted ? "text-green-600" : "text-yellow-600"}
            >
              {data.hasVoted ? "Already Voted" : "Not Voted"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VoteStatusChecker;
