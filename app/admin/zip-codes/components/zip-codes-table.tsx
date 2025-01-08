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
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

type ZipCode = {
  id: string
  code: string
  city: string
  state: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export function ZipCodesTable() {
  const router = useRouter()
  const { data: zipCodes, isLoading } = useQuery({
    queryKey: ['zip-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zip_codes')
        .select('*')
        .order('code');

      if (error) throw error;
      return data as ZipCode[];
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
          <TableHead>Zip Code</TableHead>
          <TableHead>City</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zipCodes?.map((zipCode) => (
          <TableRow 
            key={zipCode.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/admin/zip-codes/${zipCode.id}`)}
          >
            <TableCell className="font-medium">{zipCode.code}</TableCell>
            <TableCell>{zipCode.city}</TableCell>
            <TableCell>{zipCode.state}</TableCell>
            <TableCell>
              <Badge variant={zipCode.is_active ? "default" : "secondary"}>
                {zipCode.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {zipCode.updated_at 
                ? format(new Date(zipCode.updated_at), "MMM d, yyyy")
                : format(new Date(zipCode.created_at), "MMM d, yyyy")
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 