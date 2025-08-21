import EventCreatedCard from "./components/ui/event_card";
import { useState } from "react";


function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">

      <header className="w-full bg-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          UCSPathein Voting System<span className="ml-1">🎓</span>
        </h1>
        <div className="space-x-3">
          <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">
            Admin Dashboard
          </button>
          <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">
            Login
          </button> 
        </div>
      </header>
    
      {open && <EventCreatedCard setOpen={setOpen}/>}

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1">
        {/* Logo */}
        <div className="w-40 h-40 bg-gray-300 flex items-center justify-center text-xl font-medium text-black mb-6">
          Logo
        </div>
        {/* Input + Button */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Event Name"
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => setOpen(true)} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700">
            Create Event
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
