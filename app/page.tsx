"use client";

import { useEffect, useState } from 'react'
import { MessageBubble } from './components/ui/message-bubble'
import { TypingIndicator } from './components/ui/typing-indicator'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ScrollingImage } from './components/ui/scrolling-image'

const messages = [
  {
    content: "👋 Hey! I’m Erik. I live on Signal Mountain. ",
    delay: 0
  },
  {
    content: "I’m working on a new way to help people find deals at our nearby local businesses (Signal, Red Bank, Walden and Fairmount).",
    delay: 2000
  },
  {
    content: "If you’d like to be in the first batch to try it, drop your email address below. I’ll reach out when I'm ready for you!",
    delay: 4000
  }
]

export default function Home() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [showTyping, setShowTyping] = useState<boolean>(false)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [email, setEmail] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const createProfile = useMutation({
    mutationFn: async (email: string) => {
      // Generate a secure random password
      const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'customer' },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      return authData.user;
    },
    onSuccess: () => {
      setIsSuccess(true)
      toast.success("Thanks! I'll be in touch soon. 🙌")
    },
    onError: (error: any) => {
      toast.error("Failed to join", {
        description: error.message
      })
    }
  })

  useEffect(() => {
    const showMessage = (index: number) => {
      if (index < messages.length) {
        setShowTyping(true)
        
        // Show the message after the specified delay
        setTimeout(() => {
          setShowTyping(false)
          setVisibleMessages(index + 1)
          
          // Start typing indicator for next message after 1000ms
          if (index + 1 < messages.length) {
            setTimeout(() => {
              showMessage(index + 1)
            }, 1000)
          }
        }, messages[index].delay)
      }
    }

    // Start the first message after 1000ms
    setTimeout(() => {
      showMessage(0)
    }, 1000)
  }, [])

  useEffect(() => {
    if (visibleMessages === messages.length) {
      setTimeout(() => {
        setShowForm(true)
      }, 2000)
    }
  }, [visibleMessages])

  return (
    <div>
      <div className="min-h-screen bg-muted-15 p-4">
        <div className="max-w-md mx-auto pt-8">
          {messages.slice(0, visibleMessages).map((msg, index) => (
            <div key={index} className="flex items-start gap-2">
              {index === 0 && (
                <img
                  src={`https://ufkjyykwialeflrgutef.supabase.co/storage/v1/object/public/assets/static-images/linkedin.jpeg`}
                  alt="Erik"
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className={`flex-1 ${index !== 0 ? 'ml-[48px]' : ''}`}>
                <MessageBubble
                  content={msg.content}
                  type="receiver"
                />
              </div>
            </div>
          ))}
          
          {showTyping && (
            <div className="flex items-start">
              <div className="ml-[48px] flex-1">
                <TypingIndicator />
              </div>
            </div>
          )}

          {visibleMessages === messages.length && !isSuccess && (
            <div className={`ml-[48px] mt-4 transition-opacity duration-500 ${showForm ? 'opacity-100' : 'opacity-0'}`}>
              <ScrollingImage 
                imageUrl="https://ufkjyykwialeflrgutef.supabase.co/storage/v1/object/public/assets/static-images/scrolling-banner.png"
                speed={100}
              />
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  createProfile.mutate(email)
                }}
                className="flex gap-2 mt-4"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={createProfile.isPending}>
                  {createProfile.isPending ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </div>
          )}

          {isSuccess && (
            <div className="max-w-md mx-auto mt-8">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 text-center border border-green-100">
                <h3 className="text-xl font-medium text-green-800 mb-1">
                  You're all set! 🎉
                </h3>
                <p className="text-green-600">
                  If you happen to also operate a local business that wants to be included, check this out.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}