"use client"

import { UsersTable } from "./components/users-table"

export default function AdminUsersPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 border-2 border-red-500">
      <div className="min-w-0 flex-1 border-2 border-blue-500">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-2 border-green-500">
          <UsersTable />
        </div>
      </div>
    </div>
  )
} 