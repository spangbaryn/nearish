1. Centralize Error Handling
Goal: Streamline error handling logic across all components and features.
Plan (pseudocode):
Create a dedicated <ErrorBoundary> component:
Wrap critical component trees.
Provide fallback UI (like "Something went wrong. Please refresh.").
Leverage the existing AppError class:
Extend AppError for specific error categories (e.g., AuthError, ValidationError).
Use handleError utility in catch blocks or in React Query error boundaries.
Standardize error notifications:
Use a single toast pattern for user-facing error messages.
Ensure toast triggers in a consistent place (React Query onError or inside the ErrorBoundary).
---
2. Consolidate and Abstract Modal Functionality
Goal: Eliminate repetitive code in AI Generation Modal, Facebook Fetch Modal, etc.
Plan (pseudocode):
Create a new <BaseModal> in “components/ui/BaseModal.tsx”:
Accept props like isOpen, onClose, title, etc.
Internally wrap the <Dialog>, <DialogContent>, and <DialogHeader> from shadcn/ui.
Refactor existing modals:
Import <BaseModal> instead of manually structuring <Dialog> each time.
Keep only feature-specific business logic in child modals.
---
3. Standardize React Query usage
Goal: Improve consistency and reduce repetition in API fetching/mutations.
Plan (pseudocode):
Centralize queries in a “queries/” or “lib/queries/” directory:
Each file exports query keys (e.g., collectionsKeys(), postsKeys()).
Keep all query (useQuery) and mutation (useMutation) configurations near each domain.
Use query key factories:
Example: collectionsKeys.list(), collectionsKeys.detail(id), etc.
Implement consistent error handling:
onError: handleError(error) -> show toast with standardized message.
---
4. Reusable Form Patterns
Goal: Cut down on repeated form logic and unify validation.
Plan (pseudocode):
Create custom hooks (e.g., useBasicForm) that wrap react-hook-form + zod logic.
Abstract form field components:
<FormInput>, <FormTextarea>, etc., that handle error messages, labels, control.
Keep consistent styling:
Reuse shadcn/ui form components for uniform design.
---
5. Loading State Consistency
Goal: Make loading indicators and states predictable and uniform.
Plan (pseudocode):
Centralize <LoadingSpinner> usage:
Replace ad-hoc spinners with a single <LoadingSpinner> from “components/ui/loading-spinner”.
Create consistent loading placeholders:
Full-screen loads (route transitions) vs. inline component loads (table data fetching).
Maintain standard naming and structure:
always check if (isLoading) { return <LoadingSpinner /> }
---
6. Style and CSS Organization
Goal: Keep Tailwind usage consistent and maintainable.
Plan (pseudocode):
Modularize global CSS:
Create logical groupings for forms, layout, email previews, etc.
Use shared utility classes in Tailwind:
Factor out repeated margin/padding combos.
Keep all brand colors in tailwind.config.js for consistency.
Avoid inline style variety:
Rely on Tailwind or a className-based approach for consistent design tokens.