import { LoginForm } from "@/components/features/auth/login-form"
import { AuthLayout } from "@/components/features/auth/auth-layout"

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
