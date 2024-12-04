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
import Link from "next/link"
import { SendHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

type Campaign = {
  id: string
  collection_id: string
  template_id: string
  sent_at: string | null
  created_at: string
  collections: {
    name: string
  }
  email_templates: {
    name: string
  }
}

export function CampaignsTable() {
  const router = useRouter()
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          collections (
            name
          ),
          email_templates (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Campaign[]
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
          <TableHead>Collection</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns?.map((campaign) => (
          <TableRow 
            key={campaign.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
          >
            <TableCell>{campaign.collections.name}</TableCell>
            <TableCell>{campaign.email_templates.name}</TableCell>
            <TableCell>
              <Badge variant={campaign.sent_at ? "default" : "secondary"}>
                {campaign.sent_at ? "Sent" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(campaign.created_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              {campaign.sent_at 
                ? format(new Date(campaign.sent_at), "MMM d, yyyy")
                : "-"
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 