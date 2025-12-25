import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/utils/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const data = await loginUser(username, password);
      localStorage.setItem("eventId", data.eventId);
      localStorage.setItem("userId", data.userId);
      const eventData = {
        eventId: data.eventId,
        eventPassword: data.eventPassword,
        eventName: data.eventName,
      };
      try {
        localStorage.setItem("eventData", JSON.stringify(eventData));
      } catch {
        /* ignore */
      }
      // Small timeout to ensure React effect sees storage (rarely needed but safe)
      setTimeout(() => navigate("/vote"), 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid username or password",
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-40 h-40 bg-gray-300 flex items-center justify-center text-xl font-medium text-black mb-6">
        Logo
      </div>
      <h1 className="text-3xl font-bold mb-8">Voter Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}
