"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BusinessSettingsPage() {
  const params = useParams()
  const businessId = params.id as string

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_members (
            profile:profiles (
              email,
              role
            )
          )
        `)
        .eq('id', businessId)
        .single()

      if (error) throw error
      return data
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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/businesses/${businessId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Business Settings</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm">{business?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm">
                        {new Date(business?.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Team members list will go here */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Billing info will go here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 