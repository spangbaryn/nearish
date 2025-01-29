import type { MuxPlayerProps } from "@mux/mux-player-react"

export class MuxService {
  static getPlayerConfig(playbackId: string): Partial<MuxPlayerProps> {
    return {
      streamType: "on-demand",
      playbackId,
      metadata: {
        video_title: "Timeline Event Video",
      },
      style: {
        height: "100%",
        width: "100%",
        objectFit: "cover",
      }
    }
  }

  static setPlayerStyles(player: HTMLElement) {
    player.style.setProperty('--mediaObjectFit', 'cover')
    player.style.setProperty('--controls-backdrop-color', 'rgba(0, 0, 0, 0.4)')
    player.style.setProperty('--bottom-controls-margin', '1.5rem')
  }
} 