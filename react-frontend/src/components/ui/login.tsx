import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginCard() {
  return (
    <Card className="w-full max-w-sm shadow-lg">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>

      {/* Form */}
      <CardContent>
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              className="outline-none focus-visible:ring-0"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:underline underline-offset-4"
              >
                Forgot password?
              </a>
            </div>
            <Input className="outline-none focus-visible:ring-0" id="password" type="password" required />
          </div>
        </form>
      </CardContent>

      {/* Footer buttons */}
      <CardFooter className="flex flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
