type PostData = {
  content: string
  businesses?: { name: string }
}

export function replaceDynamicTags(promptTemplate: string, post: PostData): string {
  const tags: { [key: string]: string } = {
    '{{business_name}}': post.businesses?.name || 'Unknown Business',
    '{{content}}': post.content,
  }

  return Object.entries(tags).reduce((prompt, [tag, value]) => {
    return prompt.replace(new RegExp(tag, 'g'), value)
  }, promptTemplate)
} 