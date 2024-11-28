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
    - **`useContext`** for global state sharing (e.g., theme, authentication status).
    - **`useSyncExternalStore`** for consistent subscription to real-time data sources.
- **Next.js**
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui**

### **Backend**

- **Supabase** (Authentication, database, and real-time updates)
- **REST API** (Custom Next.js API routes)

### **State Management**

- **Redux Toolkit** (For critical global state)
- Local state via React’s `useState` and `useReducer`.

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

- Use `useState` and `useReducer` for local component state.
- Use `useContext` for global state that doesn’t change frequently (e.g., auth, theme).
- Use `useSyncExternalStore` for subscribing to real-time data sources.
- For global, application-wide state:
    - Use **Redux Toolkit** with slices stored in the `store/` directory.

---

### **4. Component Structure**

Each component file should include:

1. **Imports**:
    - Separate external imports and internal imports with a blank line.
2. **Type Definitions** (if applicable): Place before the component definition.
3. **Component Code**: Default export at the end of the file.

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