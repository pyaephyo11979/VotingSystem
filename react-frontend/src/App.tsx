import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useToast } from '@/components/ui/useToast';
import {LanguagesIcon} from "lucide-react";
import '@/utils/i18n';
import {useTranslation} from "react-i18next";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"

interface EventData { eventId: string; eventName?: string; eventPassword?: string }

function AppShell() {
  const [eventData, setEventData] = useState<EventData|null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {t,i18n} = useTranslation();
  const { show } = useToast();
  const isUserLoggedIn = Boolean(localStorage.getItem('userId'));


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

  const changeLanguage = (lng:string) => {
      i18n.changeLanguage(lng);
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center overflow-hidden">
      <header className="w-full bg-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          <Link to="/">Voting System</Link><span className="ml-1">🎓</span>
        </h1>
        <div className="space-x-3 flex items-center">
            {!isUserLoggedIn && (<>
                <Link to={eventData ? `/admin/${eventData.eventId}` : '/admin'}>
                    <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">{t('dashboard')}</button>
                </Link>
                <Link to="/login">
                    <button className="bg-gray-900 text-white px-4 py-1 rounded hover:bg-gray-700">{t('voter_login')}</button>
                </Link>
                </>
            )
            }
          {localStorage.getItem('userId') && (
            <button type={'button'} onClick={() => {
              try {
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                navigate('/login');
              } catch {/* ignore */}
              show(t('logged_out'), { type: 'info' });
              if (location.pathname.startsWith('/vote')) navigate('/login');
            }} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">{t('voter_logout')}</button>
          )}
            <Select  onValueChange={(value: string) => changeLanguage(value)} defaultValue={i18n.language ?? 'en'} >
                 <SelectTrigger className={"bg-black"}>
                     <LanguagesIcon className="w-5 h-5  text-white" />
                 </SelectTrigger>
                 <SelectContent>
                     <SelectGroup>
                         <SelectItem value="en">English</SelectItem>
                         <SelectItem value="mm">မြန်မာ</SelectItem>
                     </SelectGroup>
                 </SelectContent>
             </Select>
        </div>
      </header>

      <main className="flex-1 w-full flex justify-center items-center overflow-hidden flex-shrink-0">
          <div className='w-full h-full overflow-hidden'>
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
