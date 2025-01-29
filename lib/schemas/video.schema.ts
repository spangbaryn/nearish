import * as z from "zod"

export const videoEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  video_playback_id: z.string().optional(),
  description: z.string().optional(),
})

export const videoStateSchema = z.object({
  isVideoEnded: z.boolean(),
  isTransitioning: z.boolean(),
  currentIndex: z.number(),
  events: z.array(videoEventSchema),
})

export type VideoEvent = z.infer<typeof videoEventSchema>
export type VideoState = z.infer<typeof videoStateSchema> 