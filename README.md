# Nearish

A modern web application with authentication and navigation, built with Next.js 14, Supabase, and shadcn/ui.

## Features

- 🔐 Authentication with Supabase
  - Email/Password Sign Up
  - Email Verification
  - Secure Password Reset
  - Protected Routes with Auth Checks
  - Persistent Authentication State

- 🎨 Modern UI with shadcn/ui
  - Custom Yellow & Blue Theme
  - Dark Mode Support
  - Responsive Design
  - Beautiful Form Components
  - Clean Navigation
  - Mobile-Responsive Layout

- 📱 Navigation
  - Protected Routes
  - Persistent Sidebar
  - Users Section
  - Mobile-Responsive Design
  - Secure Sign Out

- 🚀 Tech Stack
  - Next.js 14 with App Router
  - TypeScript for Type Safety
  - Supabase for Authentication & Database
  - Tailwind CSS for Styling
  - shadcn/ui Components
  - Custom React Hooks
  - Client-Side Authentication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account

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
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
nearish/
├── app/                    # Next.js app directory
│   ├── auth/              # Auth-related routes
│   ├── home/              # Protected home page with layout
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layouts/          # Layout components
│   │   └── authenticated-layout.tsx  # Auth wrapper
│   ├── hooks/            # Custom React hooks
│   │   └── use-mobile.ts # Mobile detection
│   ├── lib/              # Utility functions
│   │   └── utils.ts      # Helper functions
│   ├── sidebar-01.tsx    # Sidebar navigation component
│   ├── login-form.tsx    # Login form component
│   └── signup-form.tsx   # Signup form component
└── lib/                  # Core utilities
    ├── auth-context.tsx  # Authentication context
    └── supabase.ts      # Supabase client
```

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
   - Layout-level authentication checks
   - Automatic redirect for unauthenticated users
   - Protected routes
   - Secure sign out through sidebar

## Styling

The project uses a custom theme with:
- Tailwind CSS for utility classes
- CSS variables for theme customization
- Custom sidebar theming
- Mobile-responsive design
- Geist font family integration

## Deployment

The project is deployed on Vercel. For deployment, ensure these environment variables are set in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
