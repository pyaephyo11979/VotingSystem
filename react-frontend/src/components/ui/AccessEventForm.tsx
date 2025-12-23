import { useState } from "react";
import type { FormEvent } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getCandidates } from "@/utils/api";
import { useToast } from "@/components/ui/useToast";
import {useTranslation} from "react-i18next";
import {EyeIcon,EyeClosedIcon} from 'lucide-react';

interface EventData { eventId: string; eventPassword: string }
const AccessEventForm = () => {
  const { setEventData } = useOutletContext<{ setEventData: (d: EventData)=>void }>();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useToast();
  const {t} = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId || !password) {
      setError("Both Event ID and Password required");
      show("Provide Event ID and Password", { type: 'warning' });
      return;
    }
    if (isLoading) return; // prevent rapid double submits
    setIsLoading(true);
    setError("");

    try {
      // We use getCandidates to verify the credentials
      await getCandidates(eventId, password);
      const eventData: EventData = { eventId, eventPassword: password };
      setEventData(eventData);
      localStorage.setItem("eventData", JSON.stringify(eventData));
      show("Event accessed", { type: 'success' });
      localStorage.setItem("eventId", eventId);
      navigate(`/admin/${eventId}`);
    } catch (e) {
      setError("Invalid Event ID or Password");
      show(e instanceof Error ? e.message : "Access failed", { type: 'error' });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="w-full max-w-sm p-4 border rounded-md">
          <h2 className="text-xl font-bold mb-4 text-center">{t('access')}</h2>
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder={t('event_id')}
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2 pr-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                aria-label="Event password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p=>!p)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-600 hover:text-gray-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeIcon size={16} /> : <EyeClosedIcon size={16} />}
              </button>
            </div>
            <button type="submit" className="bg-gray-900 mt-4 text-white px-4 py-2 rounded hover:bg-gray-700" disabled={isLoading}>
              {isLoading ? t('accessing'): t("login")}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default AccessEventForm;
