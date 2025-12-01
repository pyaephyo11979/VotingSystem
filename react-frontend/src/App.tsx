import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useToast } from '@/components/ui/useToast';
import router from "@/router";

interface EventData { eventId: string; eventName?: string; eventPassword?: string }

function AppShell() {
  const [eventData, setEventData] = useState<EventData|null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { show } = useToast();


  useEffect(() => {
    const stored = localStorage.getItem('eventData');
    if (stored) {
      try { setEventData(JSON.parse(stored)); } catch { /* ignore */ }
    }
    // Fallback: if eventData not stored but individual keys exist (user login), hydrate it
    if (!stored) {
      const eventId = localStorage.getItem('eventId');
      const eventPassword = localStorage.getItem('eventPassword');
      const eventName = localStorage.getItem('eventName') || undefined;
      if (eventId && eventPassword) {
        const data = { eventId, eventPassword, eventName };
        setEventData(data);
        try { localStorage.setItem('eventData', JSON.stringify(data)); } catch { /* ignore */ }
      }
    }
  }, []);

  useEffect(() => {
  // Guards removed: no navigation enforcement.
  }, [location.pathname, eventData, navigate, show]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          <Link to="/">Voting System</Link><span className="ml-1">🎓</span>
        </h1>
        <div className="space-x-3 flex items-center">
          <Link to={eventData ? `/admin/${eventData.eventId}` : '/admin'}>
            <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">Admin Dashboard</button>
          </Link>
          <Link to="/login">
            <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">Login</button>
          </Link>
          {localStorage.getItem('userId') && (
            <button type={'button'} onClick={() => {
              try {
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                navigate('/login');
              } catch {/* ignore */}
              show('Logged out', { type: 'info' });
              if (location.pathname.startsWith('/vote')) navigate('/login');
            }} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Voter Logout</button>
          )}
        </div>
      </header>

      <main className="flex-1 justify-center items-center p-4 w-full">
          <div>
            <Outlet context={{ eventData, setEventData }} />
          </div>       
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
