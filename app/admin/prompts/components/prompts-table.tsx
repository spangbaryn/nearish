"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { AIPrompt } from "@/types/prompts"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "lucide-react"

export function PromptsTable() {
  const router = useRouter()
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as AIPrompt[]
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prompts?.map((prompt) => (
          <TableRow 
            key={prompt.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/admin/prompts/${prompt.id}`)}
          >
            <TableCell className="font-medium">{prompt.name}</TableCell>
            <TableCell>{prompt.description || '-'}</TableCell>
            <TableCell>
              {prompt.prompt_type ? (
                <Badge variant="secondary">
                  {prompt.prompt_type === 'content' ? 'Content' : 'Type ID'}
                </Badge>
              ) : '-'}
            </TableCell>
            <TableCell>
              {prompt.is_default && (
                <Badge variant="default" className="gap-1">
                  <StarIcon className="h-3 w-3" />
                  Default
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {format(new Date(prompt.created_at), "MMM d, yyyy")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 