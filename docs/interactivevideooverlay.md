Below is a proposed plan for creating a unified overlay template that sits on top of the video player on both the business team intro and the timeline screens. This overlay will act as a central layer providing interactive, dynamic functionality similar to what you see on TikTok, Facebook, or Instagram.
---
Proposed Plan
1. Create a New Overlay Component
Create a new component (e.g. VideoInteractiveOverlay) under the shared UI folder (for example: app/components/ui/VideoInteractiveOverlay.tsx).
This component will be responsible for rendering the overlay content on top of the video player.
Define the Component Interface & Props
The component should accept props for:
Playback and State Data: Information such as current video time, total duration, paused state.
Interaction Handlers: Callbacks such as onMuteToggle, onPlayPauseToggle, onNext, and onPrev.
Video Info: Data about who is posting (e.g. username, avatar), captions, share URL, and any descriptive info.
Display Configuration: Flags for whether to show captions, whether the video is horizontal (to trigger a blurred top/bottom effect), etc.
Overlay UI Layout
Top Region:
Display the poster’s details (avatar, username, etc.).
A share button that can invoke the system’s share interface or copy a shareable URL.
Center Overlay:
Capture tap-to-pause or resume events for quick control.
(Optional) Include an element hinting “tap to pause” on first interaction.
Bottom Region:
Display captions (if any) and detailed information.
A progress bar that visually indicates how much of the video is left.
Side Navigation:
Left and right arrows for navigating to the previous or next video in the group.
Playback Controls:
A mute/unmute button that toggles the audio.
Use an interactive icon that updates based on the mute state.
Horizontal Video Adaptation:
For wide (horizontal) videos, implement a CSS blur (using Tailwind’s blur utilities) at the top and bottom to focus attention on the video in the center.
4. Interaction Patterns
Tap to Pause/Play:
The overlay container (or a dedicated clickable area) should listen for tap events and toggle video playback.
Mute and Share Controls:
These should be on visible buttons that call the provided callbacks.
Video Progress:
Listen to the video’s time update events (or use an existing hook like useVideoState from your codebase) to update a progress indicator.
Navigation Arrows:
Clicking the left/right arrows should trigger navigation to the previous or next video by calling their respective callback functions.
Integration & Replacement
Replace the existing StaffIntroOverlay and TimelineEventOverlay by wrapping the underlying MuxVideoPlayer with this unified overlay.
The video page/container should include the new overlay as an absolutely positioned child, which ensures it covers the entire video area.
Use conditional props to display extra information (such as posters’ data or captions) based on context (i.e. whether it’s a team intro video or a timeline event).
6. Styling & TailwindCSS
Use TailwindCSS to position and style each part of the overlay with responsiveness in mind.
Avoid inline styles (unless computed) and leverage custom design tokens defined in your project.
For horizontal videos, use utility classes (like blur-md) to create a top and bottom gradient or blurred effect.
Event Handling and Error Management
Ensure all handlers (e.g. for toggling mute or play) catch any potential errors and provide user feedback (possibly using your toast notifications and centralized error handling patterns).
For example, wrappers around asynchronous actions should use handleErrorWithToast and centralized AppError classes as needed.
Future Extensibility
This overlay can later include additional share options, caption styling, or even animations/transitions if desired.
Leverage your established React Query patterns for any asynchronous data (like updated share counts or caption updates).
---
Example Component Structure
Below is an example skeleton for the new overlay component:
}
---
Next Steps for Integration
Update Video Pages:
On both the business profile team video view and the timeline event view, replace the old overlays with the new VideoInteractiveOverlay component.
Wrap the MuxVideoPlayer component in a container that positions the overlay as an absolute layer.
2. Data and State Handling:
Use existing hooks or component state to track currentTime, duration, isMuted, and isPaused inside your video player.
Pass these states as props to the overlay.
Wire up the callbacks (onToggleMute, onTogglePlay, etc.) to interact with the underlying video player methods.
Testing and Refinement:
Test on multiple viewports (desktop vs. mobile) ensuring the overlay remains accessible and responsive.
Verify transitions and interaction patterns (tap-to-pause, navigation) work smoothly.
Use consistent error handling and toast notifications where needed.
Documentation Update:
Update your project README and component-level documentation to reflect the new overlay component, including usage examples and styling guidelines (as documented in your best practices).
This plan leverages your existing coding patterns, follows naming and styling conventions, and integrates with your current state management, query patterns, and error handling systems. It aims to deliver a consistent, interactive video experience situating all the newly required affordances in one unified overlay.