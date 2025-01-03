"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CollectionsTable } from "./components/collections-table"

export default function AdminCollectionsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Collections</h1>
          <Link href="/admin/collections/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <CollectionsTable />
        </div>
      </div>
    </div>
  )
} 