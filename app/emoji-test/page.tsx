"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function EmojiTest() {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Emoji Picker Test</h1>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 px-3 rounded-md border flex items-center min-w-[4rem] bg-background">
            {selectedEmoji || "No emoji"}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                className="h-10 w-10"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="p-0 w-[352px] border-none" 
              side="right" 
              align="start"
              sideOffset={5}
            >
              <Picker
                data={data}
                onEmojiSelect={(data: any) => {
                  console.log('Selected:', data);
                  setSelectedEmoji(data.native);
                }}
                theme="light"
                set="native"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-8">
          <p>Selected emoji: {selectedEmoji || "None"}</p>
          <pre className="mt-2 p-4 bg-muted rounded-md">
            {JSON.stringify({ selectedEmoji }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 