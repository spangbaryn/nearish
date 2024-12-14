**Nearish** is a social network for small businesses and their customers, designed to foster local engagement and streamline interactions between businesses and their communities. Built with modern web technologies, Nearish aims to deliver a scalable, efficient, and user-friendly experience.

---

## **Features**

- **Hierarchical Role-Based Access Control**
    - Roles: `Customer`, `Business`, and `Admin`.
    - Businesses are divided into two sub-roles:
        - `Store Account Owner`: Full control over the business account, including managing `Staff Members`.
        - `Staff Member`: Limited permissions for managing specific business-related tasks.
- **Dynamic Email Sending**
    - Create and send personalized email summaries to customers using dynamic templates.
- **Dedicated Admin Panel**
    - Manage businesses, customers, and platform content efficiently.
- **Social Features (Future Placeholder)**
    - Business and customer profiles.
    - Posts, comments, and likes.
    - Messaging between users.
- **Analytics (Future Placeholder)**
    - Business-level analytics for customer engagement and sales performance.
- **Notifications (Future Placeholder)**
    - Real-time notifications for key events and updates.

---

## **Tech Stack**

### **Frontend**

- **React**
    - **`useContext`** for global state sharing (auth, theme, sidebar state)
    - **`useReducer`** for complex component state
    - **`forwardRef`** for component composition
- **Next.js 14**
    - App Router
    - Server Components
- **TypeScript**
- **TailwindCSS**
    - Custom design tokens
    - Responsive utilities
- **shadcn/ui**
    - Customized components
    - Composable primitives

### **Backend**

- **Supabase** (Authentication, database, and real-time updates)
- **REST API** (Custom Next.js API routes)

### **State Management**

- **Server State**
    - React Query for auth and data fetching
    - Automatic cache invalidation
    - Background revalidation
    - Optimistic updates

- **Client State**
    - `useState` for simple component state
    - `useContext` for global UI state (sidebar, theme)
    - No Redux - keeping state management simple and focused

- **Authentication Pattern**

We use middleware-based authentication and layout control:

1. **Middleware Authentication**
   - Centralized auth checks in middleware
   - Automatic redirects for unauthenticated users
   - Role-based access control for admin routes
   - Layout switching based on auth state

2. **Layout Control**
   - Middleware sets `x-layout` header
   - Root layout switches between auth and main layouts
   - No manual auth checks needed in pages

3. **Best Practices**
   - No redundant auth wrappers in pages
   - Consistent layout handling
   - Automatic role enforcement for admin routes
   - Clean separation of concerns

Example protected route:

"use client"
export default function ProtectedPage() {
return (
<div className="p-8">
{/ Content here - auth is handled by middleware /}
</div>
)
}


- **Loading Pattern**
    ```tsx
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
    ```

### **Email Service**

- **Mailgun** (Dynamic email templates and delivery)

### **Testing**

- **Jest** (Unit testing)
- **Cypress** (End-to-end testing)


---

## **Folder Structure**

```bash
bash
Copy code
app/
├── api/                         # Next.js API routes (server-side logic)
├── auth/                        # Auth pages (login, register, etc.)
├── admin/                       # Admin panel
│   ├── layout.tsx
│   ├── page.tsx
│   └── components/
├── businesses/                  # Business-specific features
│   ├── page.tsx                 # Main businesses page
│   ├── components/              # Business-specific UI components
│   ├── hooks/                   # Feature-specific hooks
│   ├── redux/                   # Redux slices/actions
│   └── utils.ts                 # Business-specific utilities
├── components/                  # Shared components
│   ├── ui/                      # shadcn/ui components
│   ├── Sidebar.tsx              # Sidebar navigation
│   ├── Footer.tsx               # Shared footer
│   └── ...
├── features/                    # Future placeholder directories
│   ├── analytics/               # Business analytics
│   ├── messaging/               # Direct messaging features
│   ├── posts/                   # Social posts and interactions
│   ├── profiles/                # User and business profiles
│   └── notifications/           # Notifications system
├── layout.tsx                   # Global layout
├── page.tsx                     # Main entry point
└── styles/                      # Global styles

store/                           # Redux store
lib/                             # Supabase client and helpers
utils/                           # Shared utility functions
types/                           # TypeScript interfaces
tests/                           # Jest and Cypress tests
email/                           # Dynamic email templates and logic
docs/                            # Documentation

```

---

## **Coding Standards and Conventions**

### **1. General Structure Guidelines**

- **Folder Structure**:
    - Stick to the outlined folder structure in this README.
    - Place feature-specific code under `features/` and reusable/shared code under `components/` or `utils/`.
- **Component Placement**:
    - Place feature-specific components in their respective `features/<feature>/components` folder.
    - Shared, reusable components should go in `components/ui/`.

---

### **2. Naming Conventions**

- **Files**:
    - Use `camelCase` for files and folders: `userProfile.tsx`.
    - For components, use `PascalCase`: `UserProfile.tsx`.
- **Variables and Functions**:
    - Use `camelCase` for variables and functions: `fetchUserData`.
    - Constants in `SCREAMING_SNAKE_CASE`: `API_URL`.
- **React Components**:
    - Name components after the file: A component in `UserProfile.tsx` should be named `UserProfile`.
- **Tests**:
    - Name test files with `.test.tsx` or `.spec.tsx`: `UserProfile.test.tsx`.

---

### **3. State Management Patterns**

- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Use `useContext` for:
    - Global UI state (sidebar, theme)
    - Authentication state
    - Feature flags
- Use `forwardRef` for:
    - Component composition
    - DOM node access
    - Component libraries
- For global state:
    - Redux Toolkit for business logic
    - Context for UI state
- **Authentication State**
    - Use React Query for server state management
    - Cache invalidation on auth state changes
    - Automatic background revalidation
    - Centralized auth context with React Query
- **Loading States**
    - Consistent LoadingSpinner component using shadcn/ui
    - Centralized loading state management
    - Full-screen loading states for route transitions
    - Component-level loading indicators for actions

Example usage:

---

### **4. Error Handling Patterns**

- **Error Types**
    - Business logic errors
    - API/Network errors
    - Validation errors
    - Authentication errors

#### Centralized Error System
- Use the `AppError` class hierarchy for all errors
- Specific error types extend `AppError`:
  - `AuthError`: Authentication and authorization issues
  - `ValidationError`: Input validation failures
  - `NetworkError`: API and connection issues

#### Error Handling Best Practices
- Always throw appropriate error type with meaningful messages
- Only access documented error properties (status, message)
- Use error codes for programmatic handling:  ```typescript
  throw new AuthError('Invalid credentials', 'AUTH_ERROR');  ```

- Error codes and their meanings:
  - `AUTH_ERROR`: Authentication/authorization failures
  - `VALIDATION_ERROR`: Input validation issues
  - `NETWORK_ERROR`: Connection/API problems

#### Component Error Handling
- Use `useAuthError` hook for auth-related errors:  ```typescript
  const { error, handleAuthError } = useAuthError();
  
  try {
    await signIn(email, password);
  } catch (err) {
    handleAuthError(err);
  }  ```

- Display errors consistently using the error state:  ```typescript
  {error && (
    <div className="text-red-500 text-sm mt-2">
      {error}
    </div>
  )}  ```

#### Route Handler Error Handling
Reference implementation in:

typescript:app/auth/callback/route.ts
startLine: 16
endLine: 44


#### Middleware Error Handling
Reference implementation in:

typescript:middleware.ts
startLine: 10
endLine: 28


#### Error Logging
- Log errors at appropriate levels:
  - Authentication errors: INFO/WARN
  - Validation errors: WARN
  - System errors: ERROR
- Include relevant context but no sensitive data
- Use structured logging format

#### Testing Error Scenarios
- Test both successful and error paths
- Verify error messages are user-friendly
- Ensure errors are properly propagated
- Mock different error types:

ypescript
test('handles auth error', async () => {
mockSupabase.auth.signIn.mockRejectedValue(
new AuthError('Invalid credentials')
);
// Test error handling
});


#### Error Boundaries
- Implement React Error Boundaries for component trees
- Handle unexpected errors gracefully
- Provide fallback UI for error states
- Log errors to monitoring service

Example Error Boundary usage:

typescript
<ErrorBoundary
fallback={<AuthErrorFallback />}
onError={(error) => logError(error)}
>
<AuthenticatedLayout>{children}</AuthenticatedLayout>
</ErrorBoundary>


For implementation details, see:
- `useAuthError` hook: Used for handling auth-specific errors
- `AuthError` class: Base class for auth errors
- Error handling in auth context: Consistent error propagation


---

### **5. Styling**

- Use **TailwindCSS** for all styling.
- Avoid inline styles unless dynamically calculated.
- Define custom colors and spacing in `tailwind.config.js`.

---

### **6. Testing Standards**

- Use **Jest** for unit tests and **Cypress** for end-to-end tests.
- Test all critical components and workflows.
- Write descriptive test names:
    
    ```tsx
    tsx
    Copy code
    test('renders user greeting', () => {
      render(<Greeting name="John" />);
      expect(screen.getByText('Hello, John!')).toBeInTheDocument();
    });
    
    ```
    

---

### **7. Component Patterns**

- **Loading States**
    ```tsx
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
    ```

- **Auth Protection**
    ```tsx
    const { user, loading } = useAuth();
    if (!user) redirect("/auth/login");
    ```

- **Authenticated Layout**
    - Use `AuthenticatedLayout` from `@/components/authenticated-layout` for protected routes.
    - Handles loading, error, and authentication states.
    - Provides consistent layout with sidebar navigation.
    - Example usage:

### **8. React Query Integration**

- Use for server state management (auth, user data)
- Automatic cache invalidation
- Background revalidation
- Optimistic updates
- Error handling

### **Form Patterns**

- **React Hook Form + Zod**
    ```tsx
    const schema = z.object({
      name: z.string().min(1, "Required"),
    })
    
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema)
    })
    ```

- **Form Components**
    - Use shadcn/ui form components
    - Consistent validation and error handling
    - Accessible by default
    ```tsx
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
    ```

- **Mutations**
    ```tsx
    const mutation = useMutation({
      mutationFn: async (data) => {
        const { error } = await supabase
          .from('table')
          .insert([data])
        if (error) throw error
      },
      onSuccess: () => {
        toast.success("Success")
        queryClient.invalidateQueries(['key'])
      }
    })
    ```

### **Toast Notifications**

- Use Sonner for toast notifications
- Consistent error and success messages
- Automatic dismissal

Would you like me to expand on any of these sections or add additional documentation?

---

## **Future Features**

### **1. Profiles**

- Showcase user and business profiles with profile pictures, descriptions, and activity.

### **2. Posts and Comments**

- Enable businesses and customers to create and engage with posts.

### **3. Messaging**

- Facilitate private messaging between users.

### **4. Notifications**

- Notify users about new posts, messages, and updates.

### **5. Analytics**

- Provide businesses with insights into customer engagement and sales performance.

---

## **Documentation**

For more details:

- Database Schema
- Admin Panel Feature
- Email Campaigns

---

## **AI Assistant Interaction**

To ensure consistent collaboration with AI tools:

- Add comments for complex logic.
- Use `TODO` comments to highlight areas needing AI assistance.
- Example AI-specific task list:
    - Generate boilerplate for new features (e.g., `posts`).
    - Write tests for `api/messages` endpoint.
-  "Always use the centralized AppError class and error handling patterns established in the codebase. When logging Supabase errors, only access properties that are documented in their AuthError type: status and message. Don't assume additional properties exist."
- "When defining async functions in a context provider, ensure the return type in the interface matches the actual implementation. If a function returns data (like signUp returning a User), the interface should reflect this instead of using void."

The middleware handles:
- Authentication state checks
- Role-based access control
- Layout switching
- Redirects for unauthenticated users