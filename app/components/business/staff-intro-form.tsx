import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MuxVideoPlayer } from "../../components/ui/mux-video-player"

const staffIntroSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  role: z.string().min(1, "Role is required"),
  favorite_spot: z.string().optional(),
})

type StaffIntroFormValues = z.infer<typeof staffIntroSchema> & {
  video: {
    assetId: string;
    playbackId: string;
    thumbnailUrl: string;
  }
};

interface StaffIntroFormProps {
  initialData: {
    first_name: string;
    role: string;
    favorite_spot?: string;
  };
  thumbnailUrl: string;
  videoData: {
    assetId: string;
    playbackId: string;
    thumbnailUrl: string;
  };
  onSubmit: (data: StaffIntroFormValues) => void;
  mode?: 'create' | 'edit';
}

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function StaffIntroForm({ initialData, videoData, thumbnailUrl, onSubmit }: StaffIntroFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof staffIntroSchema>>({
    resolver: zodResolver(staffIntroSchema),
    defaultValues: {
      first_name: initialData.first_name || "",
      role: initialData.role ? toTitleCase(initialData.role) : "",
      favorite_spot: initialData.favorite_spot || "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof staffIntroSchema>) => {
    try {
      setIsSubmitting(true)
      await onSubmit({
        ...values,
        video: {
          ...videoData,
          thumbnailUrl
        }
      })
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="w-full max-w-[280px] mx-auto">
          <MuxVideoPlayer 
            playbackId={videoData.playbackId}
            className="rounded-lg"
          />
        </div>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="favorite_spot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Spot</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  )
} 