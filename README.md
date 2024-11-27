# Nearish

A modern web application with authentication and navigation, built with Next.js 14, Supabase, and shadcn/ui.

## Features

- 🔐 Authentication with Supabase

  - Email/Password Sign Up
  - Email Verification
  - Secure Password Reset
  - Protected Routes with Auth Checks
  - Persistent Authentication State
  - Role-Based Access Control (RBAC)
  - Admin User Management
    - View All Users with Role Badges
    - User Creation Dates
    - Secure Admin API
    - Type-Safe Database Access

- 🎨 Modern UI with shadcn/ui

  - Custom Yellow & Blue Theme
  - Dark Mode Support
  - Responsive Design
  - Beautiful Form Components
  - Clean Navigation
  - Mobile-Responsive Layout
  - Custom Logo Integration
  - Accessible Components
  - Role-Based Badges

- 📱 Navigation

  - Protected Routes
  - Persistent Sidebar
  - Users Section
  - Mobile-Responsive Design
  - Secure Sign Out
  - Role-Protected Navigation Items
  - Improved Mobile Sidebar

- 🚀 Tech Stack
  - Next.js 14 with App Router
  - TypeScript for Type Safety
  - Supabase for Authentication & Database
  - Supabase Storage for Assets
  - Tailwind CSS for Styling
  - shadcn/ui Components
  - Custom React Hooks
  - Client-Side Authentication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account
- Supabase CLI (optional, for type generation)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/spangbaryn/nearish.git
cd nearish
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up Supabase:

   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Email Auth in Authentication settings
   - Set up storage buckets:
     ```
     assets/
     └── logo/
         └── logo.svg    # Your application logo
     ```
   - Set up storage policies:
     ```sql
     CREATE POLICY "Public Access"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'assets' AND path LIKE 'logo/%');
     ```
   - Set up user roles:
     - Go to Authentication > Users
     - Select a user
     - Add custom metadata: `{ "role": "admin" }` for admin users

5. (Optional) Generate TypeScript types for your Supabase database:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase CLI
supabase login

# Generate types
supabase gen types typescript --project-id your-project-id > lib/database.types.ts
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
nearish/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── users/        # User management API
│   ├── auth/             # Auth-related routes
│   ├── home/             # Protected home page
│   └── users/            # Admin user management
├── components/
│   ├── auth/             # Authentication components
│   │   ├── auth-card.tsx    # Shared auth card
│   │   ├── auth-form.tsx    # Shared form components
│   │   ├── auth-layout.tsx  # Auth page layout
│   │   ├── login-form.tsx   # Login form
│   │   ├── protected.tsx    # RBAC protection
│   │   └── signup-form.tsx  # Signup form
│   ├── hooks/            # Custom React hooks
│   │   ├── use-mobile.ts       # Mobile detection
│   │   └── use-authorization.ts # RBAC hook
│   ├── layouts/          # Layout components
│   │   └── main-sidebar.tsx    # Main navigation
│   └── ui/              # UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── logo.tsx     # Logo with Supabase storage
│       └── ...
├── lib/                 # Core utilities
│   ├── auth-context.tsx # Authentication context
│   ├── roles.ts        # Role definitions & logic
│   ├── database.types.ts # Generated Supabase types
│   └── utils.ts        # Shared utilities
└── public/             # Static assets
```

## Type Safety

The project uses TypeScript throughout and includes:

- Generated Supabase database types
- Type-safe API routes
- Type-safe authentication
- Type-safe components
- Type-safe hooks

To update database types after schema changes:

```bash
supabase gen types typescript --project-id your-project-id > lib/database.types.ts
```

## API Type Safety Guidelines

The project enforces strict type safety for all API interactions:

### Request/Response Types

- Define explicit types for all API request and response objects:
  ```typescript
  type CreateUserRequest = {
    email: string;
    role: UserRole;
    metadata?: Record<string, unknown>;
  };

  type CreateUserResponse = {
    user: Database['public']['Tables']['users']['Row'];
    error?: string;
  };
  ```

### API Route Types

- Use TypeScript for all API routes with proper typing:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';

  export async function POST(
    req: NextRequest
  ): Promise<NextResponse<CreateUserResponse>> {
    // Implementation
  }
  ```

### Error Handling

- Type-safe error responses using discriminated unions:
  ```typescript
  type ApiError = {
    error: string;
    code: number;
    details?: Record<string, unknown>;
  };

  type ApiResponse<T> = 
    | { data: T; error?: never }
    | { data?: never; error: ApiError };
  ```

### Database Types

- Utilize generated Supabase types for database operations:
  ```typescript
  import { Database } from '@/lib/database.types';
  
  type User = Database['public']['Tables']['users']['Row'];
  type UserInsert = Database['public']['Tables']['users']['Insert'];
  ```

### Type Guards

- Implement type guards for runtime type checking:
  ```typescript
  function isApiError(response: unknown): response is ApiError {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response &&
      'code' in response
    );
  }
  ```

### Best Practices

- Use zod or similar libraries for runtime validation
- Keep API types in dedicated files (e.g., `types/api.ts`)
- Maintain consistent type naming conventions
- Share types between client and server when appropriate
- Use strict TypeScript compiler options

## Authentication Flow

1. **Sign Up**

   - User enters email and password
   - Email verification is sent
   - User confirms email
   - Redirected to home page

2. **Login**

   - User enters credentials
   - Redirected to home page
   - Protected routes and sidebar become accessible

3. **Protection**

   - Centralized authentication layout
   - Automatic session refresh handling
   - Loading states with skeleton UI
   - Role-based access control
   - Automatic redirect for:
     - Unauthenticated users
     - Invalid refresh tokens
     - Insufficient permissions
   - Protected routes and components
   - Secure sign out through sidebar

4. **Error Handling**
   - Graceful handling of expired sessions
   - Automatic sign out on invalid refresh tokens
   - Proper loading states during authentication
   - Type-safe error handling
   - Consistent user experience

## Role-Based Access Control

The application implements RBAC with:

- Predefined user roles (USER, ADMIN)
- Protected components and routes
- Role-based navigation items
- Admin-only sections
- User role management
- Type-safe role checking
- Centralized role validation
- Loading states during authorization checks

### Admin Features

The admin section includes:

- User management dashboard
- Role visualization with badges
- User creation date tracking
- Protected admin API
- Service role security
- Server-side role validation

### Setting Up Admin Access

1. Get your Supabase service role key from Project Settings > API
2. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
3. Set admin role for users in Supabase:
   - Go to Authentication > Users
   - Select a user
   - Add custom metadata: `{ "role": "admin" }`

## Asset Management

- Logo storage in Supabase
- Public bucket with access policies
- Custom Logo component
- Responsive image handling

## Styling

The project uses a custom theme with:

- Tailwind CSS for utility classes
- CSS variables for theme customization
- Custom sidebar theming
- Mobile-responsive design
- Geist font family integration
- Improved mobile sidebar layout

## Deployment

The project is deployed on Vercel. For deployment, ensure these environment variables are set in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Development Guidelines

### Component Structure

- Components follow a consistent pattern:
  ```typescript
  // components/features/user-profile/user-card.tsx
  import { type FC } from 'react'
  import { cn } from '@/lib/utils'
  
  interface UserCardProps {
    user: Database['public']['Tables']['users']['Row']
    className?: string
  }
  
  export const UserCard: FC<UserCardProps> = ({ user, className }) => {
    return (
      <div className={cn('rounded-lg p-4', className)}>
        {/* Component content */}
      </div>
    )
  }
  ```

### File Organization

- Feature-first organization:
  ```
  components/
  ├── features/           # Feature-specific components
  │   ├── auth/
  │   ├── users/
  │   └── settings/
  ├── shared/            # Reusable components
  │   ├── forms/
  │   └── layouts/
  └── ui/               # Base UI components
  ```

### State Management

- Local state: React useState
- Complex state: React useReducer
- Global state: React Context
- Server state: React Query
- Form state: React Hook Form

### Data Fetching Patterns

```typescript
// hooks/queries/use-users.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    }
  })
}
```

### Error Handling

- Use custom error boundaries for feature sections
- Consistent error types across the application
- Error logging and monitoring setup

### Performance Guidelines

- Use React.memo() for expensive computations
- Implement virtualization for long lists
- Lazy load routes and heavy components
- Image optimization with next/image
- Proper key usage in lists

### Testing Patterns

```typescript
// __tests__/components/user-card.test.tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from '@/components/features/user-profile/user-card'

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }
    render(<UserCard user={user} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})
```

### Form Handling

- Use React Hook Form for all forms
- Zod schema validation
- Consistent error messaging
- Loading states for submissions

### CSS & Styling

- Use CSS Modules for component-specific styles
- Tailwind utility classes for common patterns
- CSS variables for theme values
- Mobile-first responsive design

### Security Practices

- CSRF protection on all forms
- XSS prevention in content rendering
- Input sanitization
- Rate limiting on API routes
- Proper CORS configuration

### Code Quality Standards

- ESLint configuration:
  ```json
  {
    "extends": [
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
  ```

### Documentation Requirements

- JSDoc for all components and functions:
  ```typescript
  /**
   * Displays user information in a card format
   * @param {UserCardProps} props - Component props
   * @param {User} props.user - User data to display
   * @param {string} [props.className] - Optional CSS class names
   * @returns {JSX.Element} Rendered card component
   */
  export const UserCard = ...
  ```

### Git Workflow

- Branch naming: `feature/`, `fix/`, `refactor/`
- Commit message format: `type(scope): description`
- PR template requirements
- Required PR checks

### API Design Principles

- RESTful endpoint structure
- GraphQL schema design (if applicable)
- Versioning strategy
- Rate limiting implementation
- Response format consistency

### Monitoring & Logging

- Error tracking setup
- Performance monitoring
- User analytics
- Server-side logging patterns

### Accessibility Standards

- ARIA attributes usage
- Keyboard navigation
- Color contrast requirements
- Screen reader compatibility

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
