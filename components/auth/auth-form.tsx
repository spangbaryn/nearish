import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>
  loading: boolean
  error: string | null
  children?: React.ReactNode
}

export function AuthForm({ onSubmit, loading, error, children }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {children}
      {error && <div className="text-sm text-red-500">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : "Continue"}
      </Button>
    </form>
  )
}

interface AuthFormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  rightElement?: React.ReactNode
}

export function AuthFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
  placeholder,
  rightElement,
}: AuthFormFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center">
        <Label htmlFor={id}>{label}</Label>
        {rightElement}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}

interface AuthFormFooterProps {
  text: string
  linkText: string
  linkHref: string
}

export function AuthFormFooter({ text, linkText, linkHref }: AuthFormFooterProps) {
  return (
    <div className="mt-4 text-center text-sm">
      {text}{" "}
      <Link href={linkHref} className="underline">
        {linkText}
      </Link>
    </div>
  )
} 