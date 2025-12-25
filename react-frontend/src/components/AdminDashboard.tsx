import { useState, useEffect } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { getCandidates } from "@/utils/api";
import AddCandidateForm from "@/components/ui/AddCandidateForm";
import CandidateList from "@/components/ui/CandidateList";
import AccountsSection from "@/components/ui/AccountsSection";
import ResultsSection from "@/components/ui/ResultsSection";
import { Link } from 'react-router-dom';
import VoteStatusChecker from "@/components/ui/VoteStatusChecker";
import {useTranslation} from "react-i18next";


interface EventData { eventId: string; eventName?: string; eventPassword?: string; }
interface Candidate { id?: string; candidateId?: string; name?: string; photo?: string | null; image?: string }
interface OutletCtx { eventData: EventData | null; setEventData: (v: EventData|null)=>void }

const AdminDashboard = () => {
  const { eventId: eventIdFromUrl } = useParams();
  const { eventData, setEventData } = useOutletContext<OutletCtx>();
  const eventId = eventIdFromUrl || eventData?.eventId;
  // eventData persists from create event response: {eventId, eventName, eventPassword}
  const password = eventData?.eventPassword;
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError("");
      try {
  const data = await getCandidates(eventId as string, password);
        setCandidates(data.candidates as unknown as Candidate[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && password) {
      fetchCandidates();
    }
  }, [eventId, password]);

  const handleCandidateAdded = (newCandidate: {candidateId:string; name:string; hasPhoto:boolean}) => {
    setCandidates(prev => ([
      ...prev,
      { id: newCandidate.candidateId, name: newCandidate.name, photo: newCandidate.hasPhoto ? "" : undefined }
    ]));
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("eventData");
      localStorage.removeItem("eventId");
      localStorage.removeItem("eventPassword");
    } catch {/* ignore */}
    setEventData(null);
    navigate("/");
  };

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 w-full">
        <div className="w-full max-w-4xl flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700">{t('back')}</button>
        </div>
        <p>{t('dashboard_403')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 w-full">
      <div className="w-full max-w-6xl flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
          <h2 className="text-lg font-medium">Event ID: {eventId}</h2>
        </div>
        <div className='flex gap-2'>
          {eventId && <Link to={`/results/${eventId}`} className='px-3 py-1 h-fit rounded bg-blue-600 text-white text-sm hover:bg-blue-700'>{t('live')}</Link>}
          <button onClick={handleLogout} className="px-3 py-1 h-fit rounded bg-red-600 text-white text-sm hover:bg-red-700">{t('logout')}</button>
        </div>
      </div>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AddCandidateForm eventId={eventId} onCandidateAdded={handleCandidateAdded} />
        <div>
          {isLoading && <p>Loading candidates...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && <CandidateList 
            eventId={eventId}
            candidates={candidates}
            onUpdated={(id, partial)=>setCandidates(prev=>prev.map(c=> (c.id===id? {...c, ...partial}: c)))}
            onDeleted={(id)=>setCandidates(prev=>prev.filter(c=>c.id!==id))}
          />}
        </div>
        <AccountsSection eventId={eventId} />
        <ResultsSection eventId={eventId} />
        <VoteStatusChecker eventId={eventId} />
      </div>
    </div>
  );
};

export default AdminDashboard;
