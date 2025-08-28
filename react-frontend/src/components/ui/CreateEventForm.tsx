import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createEvent } from "@/utils/api";
import EventCreatedCard from "@/components/ui/event_card";

const CreateEventForm = () => {
  const { setEventData } = useOutletContext();
  const [eventName, setEventName] = useState("");
  const [localEventData, setLocalEventData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await createEvent(eventName);
      setEventData(data);
      setLocalEventData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (localEventData) {
    return <EventCreatedCard event={localEventData} setOpen={() => setLocalEventData(null)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {/* Logo */}
        <div className="w-40 h-40 bg-gray-300 flex items-center justify-center text-xl font-medium text-black mb-6">
          Logo
        </div>
        {/* Input + Button */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default CreateEventForm;
