"use client"

import { TemplatesGrid } from "./components/templates-grid"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function AdminTemplatesPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <Link href="/admin/templates/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <TemplatesGrid />
        </div>
      </div>
    </div>
  )
} 