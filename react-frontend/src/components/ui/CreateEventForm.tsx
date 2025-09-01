import { useState } from "react";
import type { FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { createEvent } from "@/utils/api";
import EventCreatedCard from "@/components/ui/event_card";
import {AppLogo} from "@/components/AppLogo.tsx";

const CreateEventForm = () => {
  interface EventData { eventId: string; eventName: string; eventPassword: string }
  const { setEventData } = useOutletContext<{ setEventData: (d: EventData)=>void }>();
  const [eventName, setEventName] = useState("");
  const [localEventData, setLocalEventData] = useState<EventData|null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
  const data = await createEvent(eventName);
  setEventData(data);
  try { localStorage.setItem("eventData", JSON.stringify(data)); } catch { /* ignore */ }
  setLocalEventData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
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
          <AppLogo />
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
