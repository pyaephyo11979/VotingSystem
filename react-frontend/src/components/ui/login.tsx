import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { loginUser } from "@/utils/api";
import { useNavigate } from "react-router-dom";

export function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(username, password);
      // Persist credentials needed for voting actions
      localStorage.setItem("username", username);
      if (res.userId) localStorage.setItem("userId", res.userId);
      if (res.eventId) localStorage.setItem("eventId", res.eventId);
      if (res.eventPassword) localStorage.setItem("eventPassword", res.eventPassword);
      navigate("/vote");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Voter Login</CardTitle>
          <CardDescription>Enter your username and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e=>setUsername(e.target.value)} required className="outline-none focus-visible:ring-0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="outline-none focus-visible:ring-0" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading?"Logging in...":"Login"}</Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500 w-full text-center">Use credentials provided by admin</p>
        </CardFooter>
      </Card>
    </div>
  );
}
