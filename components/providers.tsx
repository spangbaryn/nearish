"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from "@/lib/error-context";

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}