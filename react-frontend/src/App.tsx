import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

function App() {
  const [eventData, setEventData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEventData = localStorage.getItem("eventData");
    if (storedEventData) {
      const parsedEventData = JSON.parse(storedEventData);
      setEventData(parsedEventData);
      navigate(`/admin/${parsedEventData.eventId}`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          <Link to="/">UCSPathein Voting System</Link>
          <span className="ml-1">🎓</span>
        </h1>
        <div className="space-x-3">
          <Link to={eventData ? `/admin/${eventData.eventId}` : "/admin"}>
            <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">
              Admin Dashboard
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">
              Login
            </button>
          </Link>
        </div>
      </header>
      <main className="flex-1 justify-center items-center p-4 w-full">
        <Outlet context={{ eventData, setEventData }} />
      </main>
    </div>
  );
}

export default App;
