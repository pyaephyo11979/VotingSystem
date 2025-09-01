import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { addCandidates } from "@/utils/api";

interface Props { eventId: string; onCandidateAdded: (c: {candidateId:string; eventId:string; name:string; hasPhoto:boolean}) => void }
const AddCandidateForm = ({ eventId, onCandidateAdded }: Props) => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File|null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await addCandidates(eventId, name, photo);
      onCandidateAdded(data);
      setName("");
      setPhoto(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add candidate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Add Candidate</h2>
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          placeholder="Candidate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoto(e.target.files?.[0] || null)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Candidate"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default AddCandidateForm;
