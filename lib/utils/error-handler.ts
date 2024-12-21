import { AppError } from "@/lib/errors";
import { toast } from "@/components/ui/use-toast";

export function handleErrorWithToast(error: unknown, defaultMessage = "An unexpected error occurred") {
  const appError = AppError.from(error, defaultMessage);
  
  toast({
    variant: "destructive",
    title: "Error",
    description: appError.message,
  });

  return appError;
} 