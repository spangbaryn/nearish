// components/features/users/user-row.tsx
import { FC } from 'react'
import { UserRowProps } from './types'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getUserRole } from './utils'

export const UserRow: FC<UserRowProps> = ({ user }) => {
  const role = getUserRole(user)
  
  return (
    <TableRow>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {role ? (
          <Badge variant={role === "admin" ? "destructive" : "secondary"}>
            {role}
          </Badge>
        ) : (
          <span className="text-muted-foreground">No role</span>
        )}
      </TableCell>
      <TableCell>
        {new Date(user.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>{/* Add UserActions component here */}</TableCell>
    </TableRow>
  );
};
