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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/database.types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  list_id?: string;
};

type Template = {
  id: string
  name: string
  subject: string
  type: 'transactional' | 'campaign'
  created_at: string
}

const campaignSchema = z.object({
  collection_id: z.string().min(1, "Collection is required"),
  template_id: z.string().min(1, "Template is required"),
  list_id: z.string().min(1, "Email list is required"),
})

type CampaignForm = z.infer<typeof campaignSchema>

interface CampaignFormProps {
  campaign?: Campaign
  onSubmit: (data: CampaignForm) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function CampaignForm({ 
  campaign, 
  onSubmit, 
  isSubmitting = false,
  submitLabel = "Save Changes" 
}: CampaignFormProps) {
  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      collection_id: campaign?.collection_id ?? "",
      template_id: campaign?.template_id ?? "",
      list_id: campaign?.list_id ?? "",
    },
  })

  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'campaign')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Template[]
    }
  })

  const { data: lists } = useQuery({
    queryKey: ['email-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_lists')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="collection_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collections?.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Template</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="list_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email List</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an email list" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lists?.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
} 