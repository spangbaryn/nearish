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

type ZipCodeWithStatus = {
  id: string
  code: string
  city: string
  state: string
  created_at: string
  zip_code_status: {
    is_active: boolean
    start_date: string
    reason: string | null
    campaign_id: string | null
  } | null
}

export function ZipCodesTable() {
  const router = useRouter()
  const { data: zipCodes, isLoading } = useQuery({
    queryKey: ['zip-codes'],
    queryFn: async () => {
      // First get all zip codes
      const { data: zipCodesData, error: zipError } = await supabase
        .from('zip_codes')
        .select('*')
        .order('code');

      if (zipError) throw zipError;

      // Then get the most recent status for each zip code
      const zipCodesWithStatus = await Promise.all(
        zipCodesData.map(async (zipCode) => {
          const { data: statusData, error: statusError } = await supabase
            .from('zip_code_status')
            .select('*')
            .eq('zip_code_id', zipCode.id)
            .is('end_date', null)
            .order('start_date', { ascending: false })
            .limit(1)
            .single();

          if (statusError && statusError.code !== 'PGRST116') throw statusError;

          return {
            ...zipCode,
            zip_code_status: statusData || null
          };
        })
      );

      return zipCodesWithStatus as ZipCodeWithStatus[];
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
          <TableHead>Notes</TableHead>
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
              <Badge variant={zipCode.zip_code_status?.is_active ? "default" : "secondary"}>
                {zipCode.zip_code_status?.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {zipCode.zip_code_status?.start_date 
                ? format(new Date(zipCode.zip_code_status.start_date), "MMM d, yyyy")
                : "-"
              }
            </TableCell>
            <TableCell className="text-muted-foreground">
              {zipCode.zip_code_status?.reason || "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 