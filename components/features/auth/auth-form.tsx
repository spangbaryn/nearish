import { FC, ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthFormFieldProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  rightElement?: ReactNode
}

interface AuthFormProps {
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error?: string | null
  variant: 'login' | 'signup'
}

export const AuthFormField: FC<AuthFormFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  rightElement
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={id}>{label}</Label>
        {rightElement}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  )
}

export const AuthForm: FC<AuthFormProps> = ({ 
  children, 
  onSubmit, 
  loading, 
  error,
  variant = 'login'
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Loading...' : variant === 'login' ? 'Sign In' : 'Sign Up'}
      </Button>
      <div className="text-center text-sm">
        {variant === 'login' ? (
          <>
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-secondary hover:text-secondary/80">
              Sign up
            </Link>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-secondary hover:text-secondary/80">
              Sign in
            </Link>
          </>
        )}
      </div>
    </form>
  )
}
