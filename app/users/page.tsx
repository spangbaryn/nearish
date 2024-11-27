"use client";

import { useEffect } from "react";
import { useUsers } from "@/lib/hooks/use-users";
import { UserTable } from "@/components/features/users/user-table";
import { Button } from "@/components/ui/button";

// Loading state component
function LoadingState() {
  return <div className="p-4">Loading users...</div>;
}

// Error state component
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-4">
      <div className="text-red-500 mb-4">Error: {error}</div>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

export default function UsersPage() {
  const { users, loading, error, loadUsers } = useUsers();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadUsers} />;
  if (!users?.length) return <div className="p-4">No users found</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>
      <UserTable users={users} />
    </div>
  );
}
