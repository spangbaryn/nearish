"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBusinessMembers, removeBusinessMember, updateBusinessMemberRole } from "@/lib/business"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BusinessRole } from "@/types/auth"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { BusinessService } from '@/lib/services/business.service'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info as InfoIconLucide } from "lucide-react"

interface TeamMember {
  id: string;
  role: BusinessRole;
  profile: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export function TeamMembersList({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: members, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['business-members', businessId],
    queryFn: () => getBusinessMembers(businessId)
  })

  const { data: currentMember } = useQuery({
    queryKey: ['business-member', businessId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('business_members')
        .select('role')
        .eq('business_id', businessId)
        .eq('profile_id', user!.id)
        .single()
      return data
    },
    enabled: !!user?.id
  })

  const ownerCount = members?.filter(member => member.role === 'owner').length || 0;

  const updateRoleMutation = useMutation({
    mutationFn: ({ profileId, role }: { profileId: string, role: BusinessRole }) => {
      if (role !== 'owner' && ownerCount <= 1) {
        throw new Error('Cannot remove the last owner')
      }
      return updateBusinessMemberRole(businessId, profileId, role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-staff', businessId]
      })
      toast.success('Role updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update role')
    }
  })

  const removeMutation = useMutation({
    mutationFn: (profileId: string) => {
      const member = members?.find(m => m.profile.id === profileId)
      if (member?.role === 'owner' && ownerCount <= 1) {
        throw new Error('Cannot remove the last owner')
      }
      return removeBusinessMember(businessId, profileId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-staff', businessId]
      })
      toast.success('Team member removed')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove member')
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members?.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {member.profile?.first_name?.[0] || member.profile?.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>{member.profile?.first_name} {member.profile?.last_name}</div>
                <div className="text-sm text-muted-foreground">{member.profile?.email}</div>
              </div>
            </TableCell>
            <TableCell>
              {currentMember?.role === 'owner' ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(role) => 
                      updateRoleMutation.mutate({ 
                        profileId: member.profile.id, 
                        role: role as BusinessRole 
                      })
                    }
                    disabled={member.role === 'owner' && ownerCount <= 1}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {member.role === 'owner' && ownerCount <= 1 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIconLucide className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Cannot remove the last owner
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ) : (
                <span className="capitalize">{member.role}</span>
              )}
            </TableCell>
            <TableCell>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => removeMutation.mutate(member.profile.id)}
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}