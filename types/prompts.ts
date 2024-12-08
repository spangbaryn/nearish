export type PromptType = 'content' | 'type_id' | null

export type AIPrompt = {
  id: string
  name: string
  description: string | null
  prompt: string
  is_active: boolean
  prompt_type: PromptType
  is_default: boolean
  created_at: string
  updated_at: string | null
  collections?: {
    id: string
    name: string
  }[]
}

export type CollectionPrompt = {
  id: string
  prompt_id: string
  collection_id: string
  created_at: string
} 