"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const promptSchema = z.object({
  name: z.string().min(1, "Prompt name is required"),
  description: z.string().optional(),
  prompt: z.string().min(1, "Prompt content is required"),
  prompt_type: z.enum(['content', 'type_id']).nullable(),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
})

type PromptForm = z.infer<typeof promptSchema>

interface PromptFormProps {
  onSubmit: (data: PromptForm) => void
  isSubmitting?: boolean
  submitLabel?: string
  defaultValues?: Partial<PromptForm>
}

export function PromptForm({ 
  onSubmit, 
  isSubmitting, 
  submitLabel = "Save",
  defaultValues 
}: PromptFormProps) {
  const form = useForm<PromptForm>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      prompt: defaultValues?.prompt || "",
      prompt_type: defaultValues?.prompt_type || null,
      is_active: defaultValues?.is_active ?? true,
      is_default: defaultValues?.is_default ?? false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="content">Content Generation</SelectItem>
                  <SelectItem value="type_id">Type ID Generation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Default Prompt</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this the default prompt for its type
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
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
} 