import { supabase } from "./supabase"
import type { Database } from "@/types/database.types"

type PostWithType = {
  id: string
  final_content: string
  final_type: 'Update' | 'Promotion' | 'Event'
}

type PostsJoinResult = {
  posts: PostWithType[]
}

export async function replaceEmailTags(
  content: string, 
  collectionId: string,
  customClient = supabase // Allow passing a custom client
) {
  if (!content.includes('{{')) return content

  // Fetch posts for this collection using provided client
  console.log('Fetching posts with collection ID:', collectionId)
  const { data: postsCollections, error } = await customClient
    .from('posts_collections')
    .select(`
      posts (
        id,
        final_content,
        final_type
      )
    `)
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false })

  console.log('Full Supabase query result:', {
    postsCollections,
    error: error?.message
  })

  if (!postsCollections) return content

  // Group posts by type
  const postsByType = postsCollections?.reduce((acc, collection) => {
    if (!collection.posts) return acc
    
    // Handle single post or array of posts
    const posts = Array.isArray(collection.posts) ? collection.posts : [collection.posts]
    
    posts.forEach(post => {
      if (post.final_type && post.final_content) {
        if (!acc[post.final_type]) acc[post.final_type] = []
        acc[post.final_type].push(post.final_content)
      }
    })
    return acc
  }, {} as Record<string, string[]>) || {}

  console.log('Posts grouped by type:', postsByType)

  // Define tag mappings
  const tagMappings: Record<string, string[]> = {
    '{{updates_list}}': postsByType['Update'] || [],
    '{{promos_list}}': postsByType['Promotion'] || [],
    '{{events_list}}': postsByType['Event'] || []
  }

  // Replace tags with content
  let processedContent = content
  Object.entries(tagMappings).forEach(([tag, items]) => {
    if (items.length > 0) {
      const contentHtml = `
        <ul style="list-style-type: disc; padding-left: 24px; margin: 10px 0">
          ${items.map(item => `<li style="margin-bottom: 8px">${item}</li>`).join('')}
        </ul>
      `.trim() // Remove newlines to prevent extra spacing
      
      // Replace tag with content while preserving position
      processedContent = processedContent.replace(tag, contentHtml)
    } else {
      // If no items, just remove the tag
      processedContent = processedContent.replace(tag, '')
    }
  })

  return processedContent
} 