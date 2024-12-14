"use client";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Nearish</h1>
        <a href="/auth/login" className="text-blue-500 hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
