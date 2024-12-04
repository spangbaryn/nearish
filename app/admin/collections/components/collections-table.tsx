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

type Collection = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export function CollectionsTable() {
  const router = useRouter()
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Collection[]
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
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections?.map((collection) => (
          <TableRow 
            key={collection.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/admin/collections/${collection.id}`)}
          >
            <TableCell className="font-medium">{collection.name}</TableCell>
            <TableCell>{collection.description || '-'}</TableCell>
            <TableCell>
              {format(new Date(collection.created_at), "MMM d, yyyy")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 