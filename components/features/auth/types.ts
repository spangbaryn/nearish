import { ReactNode } from "react";
import { UserRole } from "@/lib/roles";

export interface AuthFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string | null;
}

export interface ProtectedProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
}

export interface AuthCardProps {
  title: ReactNode;
  heading?: string;
  description?: string;
  children: ReactNode;
}
