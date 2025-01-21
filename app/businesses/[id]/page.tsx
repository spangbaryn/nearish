"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { SendHorizontal, Facebook, MapPin, Phone, Globe, RefreshCw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BusinessDashboardData {
  id: string
  name: string
  social_connections?: {
    id: string
    external_id: string
    name: string
    credentials: {
      token: string
    }[]
  }[]
}

export default function BusinessDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [postToFacebook, setPostToFacebook] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          social_connections:business_social_connections(
            id,
            external_id,
            name,
            credentials:social_credentials(token)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as BusinessDashboardData
    }
  })

  const { data: posts } = useQuery({
    queryKey: ['business-posts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const facebookPages = business?.social_connections || []
  const selectedPage = facebookPages.find(page => page.id === selectedPageId)

  const createPost = useMutation({
    mutationFn: async () => {
      const { data: post, error } = await supabase
        .from('posts')
        .insert([{
          business_id: id,
          content,
          source: postToFacebook ? 'facebook' : 'platform',
          included: true
        }])
        .select()
        .single()

      if (error) throw error

      if (postToFacebook && selectedPage) {
        try {
          const response = await fetch(`https://graph.facebook.com/${selectedPage.external_id}/feed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              access_token: selectedPage.credentials[0].token,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to post to Facebook')
          }
        } catch (error) {
          toast.error('Failed to post to Facebook, but saved locally')
        }
      }

      return post
    },
    onSuccess: () => {
      toast.success('Post created successfully')
      setContent('')
      setPostToFacebook(false)
      queryClient.invalidateQueries({ queryKey: ['business-posts', id] })
    },
    onError: (error) => {
      toast.error('Failed to create post: ' + error.message)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Please enter some content')
      return
    }
    setIsSubmitting(true)
    try {
      await createPost.mutateAsync()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-destructive">Business not found</h1>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{business.name}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            {facebookPages.length === 0 && (
              <Alert className="mb-4">
                <AlertDescription>
                  Connect your Facebook page to post directly to Facebook. {" "}
                  <Link 
                    href={`/businesses/${id}/settings`} 
                    className="font-medium underline underline-offset-4"
                  >
                    Connect now
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
              />
              
              {facebookPages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="facebook"
                      checked={postToFacebook}
                      onCheckedChange={(checked) => {
                        setPostToFacebook(checked as boolean)
                        if (checked && facebookPages.length === 1) {
                          setSelectedPageId(facebookPages[0].id)
                        }
                        else if (checked && facebookPages.length > 1) {
                          setSelectedPageId(facebookPages[0].id)
                        }
                      }}
                    />
                    <label
                      htmlFor="facebook"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
                      {facebookPages.length === 1 
                        ? `Also post to ${facebookPages[0].name} Facebook Page`
                        : "Also post to Facebook"
                      }
                    </label>
                  </div>

                  {postToFacebook && facebookPages.length > 1 && (
                    <Select
                      value={selectedPageId}
                      onValueChange={setSelectedPageId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {facebookPages.map(page => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting || !content.trim() || (postToFacebook && !selectedPageId)}
                className="w-full"
              >
                {isSubmitting ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <SendHorizontal className="mr-2 h-4 w-4" />
                )}
                {postToFacebook 
                  ? `Post to Platform & ${selectedPage?.name} Facebook Page` 
                  : 'Post to Platform'
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                    <p className="text-sm text-muted-foreground">
                      Posted {new Date(post.created_at).toLocaleDateString()}
                      {post.source === 'facebook' && (
                        <span className="ml-2 inline-flex items-center">
                          <Facebook className="h-3 w-3 mr-1 text-[#1877F2]" />
                          Posted to Facebook
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts?.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No posts yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 