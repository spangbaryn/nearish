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
├── app/ # Next.js app directory
│ ├── api/ # API routes
│ │ └── users/ # User management API
│ ├── auth/ # Auth routes
│ │ ├── login/ # Login page
│ │ └── signup/ # Signup page
│ ├── home/ # Protected home page
│ ├── users/ # Admin user management
│ ├── layout.tsx # Root layout with auth provider
│ └── globals.css # Global styles
├── components/
│ ├── features/ # Feature-specific components
│ │ └── auth/ # Authentication components
│ │ ├── auth-card.tsx # Shared auth card
│ │ ├── auth-form.tsx # Form components
│ │ ├── auth-layout.tsx # Public auth layout
│ │ ├── authenticated-layout.tsx # Protected layout
│ │ ├── login-form.tsx # Login implementation
│ │ ├── protected.tsx # RBAC protection
│ │ ├── signup-form.tsx # Signup implementation
│ │ └── types.ts # Shared auth types
│ ├── hooks/ # Custom React hooks
│ │ ├── use-mobile.ts # Mobile detection
│ │ └── use-authorization.ts # RBAC hook
│ ├── layouts/ # Layout components
│ │ └── main-sidebar.tsx # Main navigation
│ └── ui/ # Shared UI components
│ ├── breadcrumb.tsx
│ ├── button.tsx
│ ├── card.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── logo.tsx # Logo with storage
│ ├── sidebar.tsx # Sidebar components
│ ├── skeleton.tsx # Loading states
│ └── ...
├── lib/ # Core utilities
│ ├── auth-context.tsx # Authentication context
│ ├── roles.ts # Role definitions & logic
│ ├── database.types.ts # Generated types
│ └── utils.ts # Shared utilities
└── public/ # Static assets
└── fonts/ # Local font files
├── GeistVF.woff
└── GeistMonoVF.woff

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
    user: Database["public"]["Tables"]["users"]["Row"];
    error?: string;
  };
  ```

### API Route Types

- Use TypeScript for all API routes with proper typing:

  ```typescript
  import { NextRequest, NextResponse } from "next/server";

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
  import { Database } from "@/lib/database.types";

  type User = Database["public"]["Tables"]["users"]["Row"];
  type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
  ```

### Type Guards

- Implement type guards for runtime type checking:
  ```typescript
  function isApiError(response: unknown): response is ApiError {
    return (
      typeof response === "object" &&
      response !== null &&
      "error" in response &&
      "code" in response
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

### React Data Fetching Best Practices

- Use custom hooks for data fetching logic:

  ```typescript
  // hooks/use-api.ts
  export function useApi() {
    const fetchApi = useCallback(
      async <T>(
        endpoint: string,
        options?: FetchOptions
      ): Promise<ApiResponse<T>> => {
        // Implementation
      },
      []
    );
    return { fetchApi };
  }

  // hooks/use-users.ts
  export function useUsers() {
    const { fetchApi } = useApi();
    const mountedRef = useRef(false);

    const loadUsers = useCallback(async () => {
      if (!mountedRef.current) return;
      // Implementation
    }, [fetchApi]);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return { users, loading, error, loadUsers };
  }
  ```

- Prevent memory leaks and race conditions:

  - Use a mounted ref to track component lifecycle
  - Cancel in-flight requests on unmount
  - Check mounted state before setState calls
  - Clean up subscriptions and intervals

- Optimize re-renders:

  - Memoize fetch functions with useCallback
  - Stabilize hook dependencies
  - Use proper dependency arrays in useEffect
  - Avoid unnecessary state updates

- Handle loading and error states:

  - Maintain consistent loading indicators
  - Provide clear error messages
  - Include retry functionality
  - Show appropriate empty states

- Type safety:
  - Define explicit types for API responses
  - Use generics for reusable fetch utilities
  - Implement proper error typing
  - Validate response data structure

### Component Structure

- Components follow a consistent pattern:

  ```typescript
  // components/features/user-profile/user-card.tsx
  import { type FC } from "react";
  import { cn } from "@/lib/utils";

  interface UserCardProps {
    user: Database["public"]["Tables"]["users"]["Row"];
    className?: string;
  }

  export const UserCard: FC<UserCardProps> = ({ user, className }) => {
    return (
      <div className={cn("rounded-lg p-4", className)}>
        {/* Component content */}
      </div>
    );
  };
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
- Global auth state: React Context (AuthContext)
- Protected route state management
- Loading and error states

### Data Fetching Patterns

```typescript
// hooks/queries/use-users.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });
};
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
import { render, screen } from "@testing-library/react";
import { UserCard } from "@/components/features/user-profile/user-card";

describe("UserCard", () => {
  it("renders user information correctly", () => {
    const user = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
    };
    render(<UserCard user={user} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});
```

### Form Handling

- Controlled components with React useState
- Type-safe form events
- Consistent error handling patterns
- Loading states for submissions
- Reusable form components
- Form field abstraction

### CSS & Styling

- Tailwind CSS for utility classes
- Consistent spacing with space-y utilities
- Mobile-first responsive design
- shadcn/ui component integration
- Custom theme variables

### Security Practices

- CSRF protection on all forms
- XSS prevention in content rendering
- Input sanitization
- Rate limiting on API routes
- Proper CORS configuration

### Code Quality Standards

- TypeScript Configuration:

  - Strict mode enabled
  - No explicit any
  - Required prop types
  - Event handler types
  - React.FC usage

- Component Structure:

  - Feature-based organization
  - Shared UI components
  - Consistent file naming
  - Clear component interfaces
  - JSDoc documentation

- Styling Approach:
  - Tailwind CSS utilities
  - Consistent spacing
  - Responsive design
  - Theme variables
  - Accessible colors

### Documentation Requirements

- Clear TypeScript interfaces
- Descriptive prop types
- Consistent file organization
- README documentation
- Component usage examples

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

### Authentication

- Supabase Authentication Integration:
  - Email/Password Sign Up and Sign In
  - Protected Routes with Auth Context
  - Loading & Error States
  - Persistent Sessions
  - Route Protection with AuthLayout
  - Role-Based Access Control

### Component Architecture

- Auth Components:
  ```typescript
  components/features/auth/
  ├── auth-form.tsx      # Reusable form components
  ├── auth-layout.tsx    # Authentication layout wrapper
  ├── login-form.tsx     # Login implementation
  └── signup-form.tsx    # Signup implementation
  ```

- Type-Safe Interfaces:
  ```typescript
  interface AuthFormProps {
    children: ReactNode
    onSubmit: (e: React.FormEvent) => void
    loading: boolean
    error?: string | null
    variant: 'login' | 'signup'
  }
  ```

### Form Implementation

- Current Pattern:
  - Controlled inputs with useState
  - Type-safe event handlers
  - Shared AuthForm component
  - Reusable AuthFormField
  - Consistent error display
  - Loading state indicators
  - Variant-based rendering (login/signup)
  - Responsive form layout

### UI Components

- shadcn/ui Integration:
  - Custom Button component
  - Form Input fields
  - Label components
  - Card layouts
  - Logo component
  - Mobile-responsive design

### State Management

- Current Implementation:
  - Form state with useState
  - Supabase auth context
  - Loading states
  - Error handling
  - Navigation with useRouter
  - Type-safe state management

### Error Handling

- Try-catch blocks in async operations
- Consistent error state management
- User-friendly error messages
- Loading state handling
- Type-safe error states

### Implemented Patterns

- Component Props:

  - Strict TypeScript interfaces
  - Optional/required prop handling
  - React.FC type usage
  - Children prop support
  - Event handler typing

- Layout Structure:

  - Nested layouts with children
  - Conditional rendering
  - Protected routes
  - Loading skeletons
  - Error boundaries

- Navigation Flow:
  - Protected route redirects
  - Authentication-based routing
  - Home page redirect after auth
  - Login/Signup flow
