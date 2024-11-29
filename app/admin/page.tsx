"use client"

import { RequireAdmin } from "./components/require-admin"

export default function AdminDashboard() {
  return (
    <RequireAdmin>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {/* Admin dashboard content */}
      </div>
    </RequireAdmin>
  )
} 