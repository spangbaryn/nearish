type PostData = {
  id: string;
  business_id: string | null;
  content: string;
  created_at: string;
  external_id: string | null;
  facebook_page_id: string | null;
  facebook_post_id: string | null;
  final_content: string | null;
  final_type: 'Promotion' | 'Event' | 'Update' | null;
  included: boolean | null;
  platform: string | null;
  published_at: string | null;
  source: "facebook" | "admin" | "platform";
  updated_at: string | null;
  url: string | null;
  ai_generated_content: string | null;
  ai_generated_type: string | null;
  businesses: {
    name: string;
  } | null | undefined;
}

export function replaceDynamicTags(promptTemplate: string, post: PostData): string {
  // Define tag mappings with safe fallbacks
  const tags: { [key: string]: string } = {
    '{{business_name}}': post.businesses?.name || 'Unknown Business',
    '{{content}}': post.content || '',
    '{{post_type}}': post.final_type || post.ai_generated_type || 'Unknown Type',
    '{{post_url}}': post.url || '',
    '{{published_date}}': post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unknown Date'
  }

  // Replace all tags in the template
  return Object.entries(tags).reduce((prompt, [tag, value]) => {
    // Use a global regex to replace all instances of the tag
    return prompt.replace(new RegExp(escapeRegExp(tag), 'g'), value)
  }, promptTemplate)
}

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
} 