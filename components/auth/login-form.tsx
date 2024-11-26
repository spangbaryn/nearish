'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AuthCard } from "./auth-card"
import { AuthForm, AuthFormField, AuthFormFooter } from "./auth-form"

export function LoginForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push("/home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Login"
      description="Enter your email below to login to your account"
    >
      <AuthForm onSubmit={handleSubmit} loading={loading} error={error}>
        <AuthFormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="m@example.com"
        />
        <AuthFormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          }
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={() => {
            // TODO: Implement Google sign-in
          }}
        >
          Login with Google
        </Button>
        <AuthFormFooter
          text="Don't have an account?"
          linkText="Sign up"
          linkHref="/signup"
        />
      </AuthForm>
    </AuthCard>
  )
}
