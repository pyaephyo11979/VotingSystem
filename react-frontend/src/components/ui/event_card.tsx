import { useState } from "react";

export default function EventCreatedCard({ event, setOpen }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const credentials = `Event ID: ${event.eventId}\nPassword: ${event.eventPassword}`;
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
