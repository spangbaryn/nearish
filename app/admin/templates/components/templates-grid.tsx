"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

type Template = {
  id: string
  name: string
  subject: string
  type: 'transactional' | 'campaign'
  created_at: string
}

export function TemplatesGrid() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Template[]
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {templates?.map((template) => (
        <Link key={template.id} href={`/admin/templates/${template.id}`}>
          <Card className="hover:bg-muted/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {template.name}
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {template.subject}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {template.type}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 