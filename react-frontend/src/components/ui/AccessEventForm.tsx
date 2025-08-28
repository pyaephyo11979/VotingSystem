import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getCandidates } from "@/utils/api";

const AccessEventForm = () => {
  const { setEventData } = useOutletContext();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // We use getCandidates to verify the credentials
      await getCandidates(eventId, password);
      const eventData = { eventId, password };
      setEventData(eventData);
      localStorage.setItem("eventData", JSON.stringify(eventData));
      navigate(`/admin/${eventId}`);
    } catch (error) {
      setError("Invalid Event ID or Password");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="w-full max-w-sm p-4 border rounded-md">
          <h2 className="text-xl font-bold mb-4 text-center">Access Event</h2>
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700" disabled={isLoading}>
              {isLoading ? "Accessing..." : "Access Event"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default AccessEventForm;
