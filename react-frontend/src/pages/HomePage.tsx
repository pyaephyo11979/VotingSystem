import { useState } from "react";
import CreateEventForm from "@/components/ui/CreateEventForm";
import AccessEventForm from "@/components/ui/AccessEventForm";

const HomePage = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className=" mt-40 mb-4">
        <button
          onClick={() => setShowCreateEvent(true)}
          className={`px-4 py-2 rounded-l-md ${showCreateEvent ? 'bg-gray-900 text-white' : 'bg-gray-300'}`}>
            Event Creation
        </button>
        <button
          onClick={() => setShowCreateEvent(false)}
          className={`px-4 py-2 rounded-r-md ${!showCreateEvent ? 'bg-gray-900 text-white' : 'bg-gray-300'}`}>
          Access Event
        </button>
      </div>
      {showCreateEvent ? <CreateEventForm /> : <AccessEventForm />}
    </div>
  );
};

export default HomePage;
