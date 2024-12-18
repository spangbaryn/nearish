"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { replaceEmailTags } from "@/lib/email-utils"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"

interface EmailPreviewProps {
  subject?: string;
  content?: string;
  collectionId?: string;
}

export function EmailPreview({ subject, content, collectionId }: EmailPreviewProps) {
  const [processedContent, setProcessedContent] = useState(content)

  useEffect(() => {
    async function processContent() {
      if (content && collectionId) {
        const processed = await replaceEmailTags(content, collectionId)
        setProcessedContent(processed)
      } else {
        setProcessedContent(content)
      }
    }

    processContent()
  }, [content, collectionId])

  return (
    <div className="bg-white rounded-lg border border-border">
      {/* Email Header */}
      {subject && (
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground">
            Subject: {subject}
          </h2>
        </div>
      )}
      
      {/* Email Content */}
      <div className="p-8">
        {processedContent ? (
          <div 
            className="email-preview max-w-[600px] mx-auto"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        ) : (
          <p className="text-muted-foreground text-center">
            Select a template to preview content
          </p>
        )}
      </div>
    </div>
  )
} 