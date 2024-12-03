"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { RequireAdmin } from "../components/require-admin"
import { UsersTable } from "./components/users-table"

export default function AdminUsersPage() {
  return (
    <AuthenticatedLayout>
      <RequireAdmin>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <UsersTable />
          </div>
        </div>
      </RequireAdmin>
    </AuthenticatedLayout>
  )
} 