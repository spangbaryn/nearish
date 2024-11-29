import { TextEncoder, TextDecoder } from 'util'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key'

// Set up TextEncoder/Decoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any 