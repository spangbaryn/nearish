"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { RequireAdmin } from "../../components/require-admin"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject line is required"),
  type: z.enum(["transactional", "campaign"], {
    required_error: "Please select a template type",
  }),
  content: z.string().min(1, "Template content is required"),
})

type TemplateForm = z.infer<typeof templateSchema>

export default function CreateTemplatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      subject: "",
      type: "transactional",
      content: "",
    },
  })

  const createTemplate = useMutation({
    mutationFn: async (data: TemplateForm) => {
      const { error, data: template } = await supabase
        .from('email_templates')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return template
    },
    onSuccess: () => {
      toast.success("Template created successfully")
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      router.push('/admin/templates')
    },
    onError: (error) => {
      toast.error("Failed to create template", {
        description: error.message
      })
    }
  })

  async function onSubmit(data: TemplateForm) {
    createTemplate.mutate(data)
  }

  return (
    <AuthenticatedLayout>
      <RequireAdmin>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin/templates">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Create Email Template</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Welcome Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Line</FormLabel>
                          <FormControl>
                            <Input placeholder="Welcome to Nearish!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="transactional">Transactional</SelectItem>
                              <SelectItem value="campaign">Campaign</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your email content here..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={createTemplate.isPending}
                      >
                        {createTemplate.isPending ? "Creating..." : "Create Template"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireAdmin>
    </AuthenticatedLayout>
  )
} 