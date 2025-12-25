import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useToast } from '@/components/ui/useToast';
import {GlobeIcon} from "lucide-react";
import '@/utils/i18n';
import {useTranslation} from "react-i18next";
import {Snowfall} from "react-snowfall";

interface EventData { eventId: string; eventName?: string; eventPassword?: string }

function AppShell() {
  const [eventData, setEventData] = useState<EventData|null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {t,i18n} = useTranslation();
  const { show } = useToast();
  const isUserLoggedIn = Boolean(localStorage.getItem('userId'));

  // Keep <html lang> in sync with current language for accessibility and typography
  useEffect(() => {
    const applyLang = (lng?: string) => {
      const lang = (lng || i18n.resolvedLanguage || i18n.language || 'en').startsWith('my') ? 'mm' : (lng || i18n.resolvedLanguage || i18n.language || 'en');
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', 'ltr');
    };
    applyLang();
    const handler = (lng: string) => applyLang(lng);
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, [i18n]);

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
      try { localStorage.setItem('i18nextLng', lng); } catch { /* ignore */ }
  }

  // Toggle language using resolvedLanguage to handle variants like 'en-US' and 'my'
  const langTrigger = ()=>{
      const resolved = i18n.resolvedLanguage || i18n.language;
      const normalized = (resolved?.startsWith('my') || resolved === 'mm') ? 'mm' : 'en';
      const next = normalized === 'en' ? 'mm' : 'en';
      changeLanguage(next);
  }

  // Helper for showing compact language label
  const currentLangLabel = () => {
    const resolved = i18n.resolvedLanguage || i18n.language;
    const isMyanmar = resolved?.startsWith('my') || resolved === 'mm';
    return isMyanmar ? 'EN' : 'မြန်မာ';
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center overflow-hidden">
        <Snowfall color={'white'}/>
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
            {/* Styled language toggle */}
            <button
              onClick={langTrigger}
              type="button"
              title={(i18n.resolvedLanguage || i18n.language)?.startsWith('en') ? 'Switch to Myanmar' : 'Switch to English'}
              aria-label={(i18n.resolvedLanguage || i18n.language)?.startsWith('en') ? 'Switch to Myanmar' : 'Switch to English'}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
            >
              <GlobeIcon className="w-5 h-5 text-gray-700" />
              <span>{currentLangLabel()}</span>
            </button>
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
