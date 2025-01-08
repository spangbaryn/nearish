"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const zipCodeSchema = z.object({
  code: z.string().length(5, "Zip code must be exactly 5 digits"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be a 2-letter code"),
  is_active: z.boolean().default(false),
})

type ZipCodeForm = z.infer<typeof zipCodeSchema>

interface ZipCodeFormProps {
  zipCode?: {
    id: string
    code: string
    city: string
    state: string
    is_active: boolean
  }
  onSubmit: (data: ZipCodeForm) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function ZipCodeForm({ zipCode, onSubmit, isSubmitting, submitLabel = "Save" }: ZipCodeFormProps) {
  const form = useForm<ZipCodeForm>({
    resolver: zodResolver(zipCodeSchema),
    defaultValues: {
      code: zipCode?.code || "",
      city: zipCode?.city || "",
      state: zipCode?.state || "",
      is_active: Boolean(zipCode?.is_active),
    }
  });

  // Force update form when zip code data changes
  useEffect(() => {
    if (zipCode?.is_active) {
      form.setValue('is_active', Boolean(zipCode.is_active));
    }
  }, [zipCode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input {...field} maxLength={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} maxLength={2} style={{ textTransform: 'uppercase' }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Determine if this zip code should receive newsletters
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : submitLabel}
        </Button>
      </form>
    </Form>
  );
} 