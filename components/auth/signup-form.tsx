'use client'

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthCard } from "./auth-card"
import { AuthForm, AuthFormField, AuthFormFooter } from "./auth-form"

export function SignUpForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      await signUp(email, password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent you a confirmation email. Please check your inbox and follow the instructions to complete your registration."
      >
        <div />
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your email below to create your account"
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
        />
        <AuthFormField
          id="confirm-password"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <AuthFormFooter
          text="Already have an account?"
          linkText="Sign in"
          linkHref="/login"
        />
      </AuthForm>
    </AuthCard>
  )
} 