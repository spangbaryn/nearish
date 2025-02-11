import type { MuxPlayerProps } from "@mux/mux-player-react"
import type { HlsConfig } from "hls.js"

interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  type: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

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

  static getInitialQuality(): { targetHeight: number; targetBitrate: number } {
    const connection = (navigator as NavigatorWithConnection).connection;
    
    // Default to 720p for unknown connections
    if (!connection?.downlink) {
      return { targetHeight: 720, targetBitrate: 2000000 }; // 2Mbps
    }

    const mbps = connection.downlink;
    
    if (mbps < 1.5) {
      return { targetHeight: 480, targetBitrate: 800000 }; // 800kbps
    }
    if (mbps < 3) {
      return { targetHeight: 720, targetBitrate: 2000000 }; // 2Mbps
    }
    return { targetHeight: 1080, targetBitrate: 4000000 }; // 4Mbps
  }

  static getHlsConfig(): Partial<HlsConfig> {
    const { targetBitrate } = this.getInitialQuality();

    return {
      enableWorker: true,
      startLevel: -1, // Let HLS.js choose initial quality
      autoStartLoad: true,
      maxBufferLength: 15,
      maxMaxBufferLength: 45,
      maxBufferSize: 30 * 1000 * 1000, // 30MB
      maxBufferHole: 0.3,
      lowLatencyMode: false,
      abrEwmaDefaultEstimate: targetBitrate,
      manifestLoadingMaxRetry: 2,
      levelLoadingMaxRetry: 2,
      fragLoadingMaxRetry: 2,
      backBufferLength: 30
    }
  }

  static setPlayerStyles(player: HTMLElement) {
    player.style.setProperty('--mediaObjectFit', 'cover')
    player.style.setProperty('--controls-backdrop-color', 'transparent')
    player.style.setProperty('--bottom-controls-margin', '1.5rem')
    player.style.setProperty('--play-button', 'none')
    player.style.setProperty('--media-play-button-display', 'none')
    player.style.setProperty('--media-background', 'transparent')
    player.style.setProperty('--media-background-color', 'transparent')
    player.style.setProperty('--controls-backdrop-color', 'transparent')
    player.style.setProperty('--poster-background', 'transparent')
    player.style.setProperty('--media-poster-display', 'none')
  }
} 