import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getVoterCandidates, castVote, getVoteStatus } from "@/utils/api";
import { useTranslation } from "react-i18next";

interface Candidate {
  id?: string;
  name: string;
  photo?: string | null;
}
interface CandidateApi {
  id?: string;
  candidateId?: string;
  name?: string;
  candidateName?: string;
  photo?: string;
  image?: string;
}

export default function VotingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventMeta, setEventMeta] = useState<{
    eventId: string;
    eventName?: string;
  } | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const eventId = localStorage.getItem("eventId");
      const eventPassword = localStorage.getItem("eventPassword");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setNeedsLogin(true);
      }
      if (eventId && eventPassword) {
        try {
          const response = await getVoterCandidates(eventId, eventPassword);
          const list = (response.candidates || []).map(
            (c: CandidateApi, idx: number) => ({
              id: c.id || c.candidateId || c.name || String(idx),
              name: c.name || c.candidateName || c.id || `Candidate ${idx + 1}`,
              photo: c.photo || c.image || null,
            }),
          );
          setCandidates(list);
          setEventMeta({
            eventId,
            eventName: localStorage.getItem("eventName") || undefined,
          });
          if (userId) {
            try {
              const vs = await getVoteStatus(eventId, userId);
              if (vs.hasVoted) setSuccess(true);
            } catch {
              /* ignore status errors */
            }
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch candidates",
          );
        }
      }
    };

    fetchData();
  }, []);

  const handleVote = async () => {
    if (success) return; // already voted
    if (!selectedCandidate) {
      setError("Please select a candidate to vote for.");
      return;
    }

    const eventId = localStorage.getItem("eventId");
    const userId = localStorage.getItem("userId");
    if (eventId && userId) {
      try {
        setIsSubmitting(true);
        await castVote(eventId, userId, selectedCandidate);
        setSuccess(true);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cast vote");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (needsLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Voting Requires Login</h1>
        <p className="text-gray-600 mb-6 max-w-md text-center">
          You must log in with your voter credentials before you can view
          candidates and cast your vote.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold shadow"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t("cast")}</h1>
      {eventMeta && (
        <p className="text-gray-600 mb-6">
          Event ID: <span className="font-mono">{eventMeta.eventId}</span>
        </p>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{t("recorded")}</p>}
      <div className="w-full max-w-4xl flex justify-end mb-4">
        {eventMeta && (
          <Link
            to={`/results/${eventMeta.eventId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {t("view")}→
          </Link>
        )}
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl w-full mb-8">
        {candidates.map((candidate) => {
          const cid = candidate.id || candidate.name;
          const selected = selectedCandidate === cid;
          return (
            <button
              type="button"
              key={cid}
              onClick={() => !success && setSelectedCandidate(cid)}
              className={`group relative flex flex-col items-center p-4 rounded-lg border shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${selected ? "border-blue-600 ring-2 ring-blue-400" : "border-gray-200 hover:shadow-md hover:border-gray-300"}`}
              disabled={success}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-3 flex items-center justify-center">
                {candidate.photo ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No Photo</span>
                )}
              </div>
              <span className="font-medium text-gray-900 mb-1">
                {candidate.name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {selected ? t("selected") : t("tap2select")}
              </span>
            </button>
          );
        })}
      </div>
      <button
        onClick={handleVote}
        disabled={!selectedCandidate || isSubmitting || success}
        className="bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold shadow"
      >
        {success
          ? t("submitted")
          : isSubmitting
            ? t("submitting")
            : t("submitVote")}
      </button>
    </div>
  );
}
