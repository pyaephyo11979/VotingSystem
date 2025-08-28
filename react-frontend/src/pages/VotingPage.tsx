import { useState, useEffect } from "react";
import { getVoterCandidates, castVote } from "@/utils/api";

interface Candidate {
  id: string;
  name: string;
}

export default function VotingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      const eventId = localStorage.getItem("eventId");
      const eventPassword = localStorage.getItem("eventPassword");

      if (eventId && eventPassword) {
        try {
          const response = await getVoterCandidates(eventId, eventPassword);
          setCandidates(response.candidates);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch candidates");
        }
      }
    };

    fetchCandidates();
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate to vote for.");
      return;
    }

    const eventId = localStorage.getItem("eventId");
  const userId = localStorage.getItem("userId");
  if (eventId && userId) {
      try {
    await castVote(eventId, userId, selectedCandidate);
        alert(`You have successfully voted for candidate ${selectedCandidate}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cast vote");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Cast Your Vote</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="flex items-center">
            <input
              type="radio"
              id={candidate.id}
              name="candidate"
              value={candidate.id}
              checked={selectedCandidate === candidate.id}
              onChange={() => setSelectedCandidate(candidate.id)}
              className="mr-2"
            />
            <label htmlFor={candidate.id}>{candidate.name}</label>
          </div>
        ))}
        <button
          onClick={handleVote}
          className="w-full bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cast Vote
        </button>
      </div>
    </div>
  );
}
