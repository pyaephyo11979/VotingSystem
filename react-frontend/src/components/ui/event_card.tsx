import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface EventInfoProps { event: { eventId: string; eventPassword: string; eventName?: string }; setOpen: (open: boolean)=>void }

export default function EventCreatedCard({ event, setOpen }: EventInfoProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyWithFallback = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed"; // avoid scroll jump
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (_err) {
      return false;
    }
  };

  const handleCopy = async () => {
    const credentials = `Event ID: ${event.eventId}\nPassword: ${event.eventPassword}`;
    setCopyError(null);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(credentials);
        setCopied(true);
      } else {
        const ok = copyWithFallback(credentials);
        if (ok) {
          setCopied(true);
        } else {
          throw new Error("Clipboard API not available");
        }
      }
    } catch (err) {
      console.warn("Copy failed", err);
      setCopyError("Could not copy. Please copy manually.");
    } finally {
      setTimeout(() => {
        setCopied(false);
        setCopyError(null);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900">Event Created</h2>
        <p className="text-sm text-gray-500 mb-4">
          Copy the credentials to access admin portal
        </p>
        {copyError && (
          <p className="text-xs text-red-600 mb-2" role="alert">{copyError}</p>
        )}

        {/* Event ID */}
        <div className="mb-3 flex items-center gap-x-2">
          <label className="w-24 text-sm font-medium text-gray-700">
            Event ID
          </label>
          <input
            type="text"
            value={event.eventId}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mb-4 flex items-center gap-x-2">
          <label className="w-24 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="text"
            value={event.eventPassword}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-60"
            disabled={copied}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => navigate(`/admin/${event.eventId}`)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
