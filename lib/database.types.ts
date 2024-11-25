export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

interface TableRow {
  created_at?: string
  id?: string
  [key: string]: Json | undefined
}

interface ViewRow {
  [key: string]: Json | undefined
}

interface FunctionResult {
  [key: string]: Json | undefined
}

type EnumValue = string

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: TableRow
        Insert: TableRow
        Update: Partial<TableRow>
      }
    }
    Views: {
      [key: string]: {
        Row: ViewRow
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: FunctionResult
      }
    }
    Enums: {
      [key: string]: EnumValue[]
    }
  }
}
