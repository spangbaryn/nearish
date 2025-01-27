Add high-performance video to your Next.js application
Use our API and components to handle embedding, storing, and streaming video in your Next.js application

Mux is now available as a native integration through the Vercel Marketplace. Visit the Vercel documentation for specific guidance related to getting up and running with Mux on Vercel.

When should you use Mux with Next.js?
When adding video to your Next.js app, you'll encounter some common hurdles. First, videos are large. Storing them in your public directory can lead to excessive bandwidth consumption and poor Git repository performance. Next, it's important to compress and optimize your videos for the web. Then, as network conditions change, you might want to adapt the quality of your video to ensure a smooth playback experience for your users. Finally, you may want to integrate additional features like captions, thumbnails, and analytics.

You might consider using Mux's APIs and components to handle these challenges, and more.

Quickly drop in a video with next-video
next-video is a React component, maintained by Mux, for adding video to your Next.js application. It extends both the <video> element and your Next app with features to simplify video uploading, storage, and playback.

To get started...

Run the install script: npx -y next-video init. This will install the next-video package, update your next.config.js and TypeScript configuration, and create a /videos folder in your project.
Add a video to your /videos folder. Mux will upload, store, and optimize it for you.
Add the component to your app:
copy
import Video from 'next-video';
import myVideo from '/videos/my-video.mp4'; 
 
export default function Page() { 
 return <Video src={myVideo} />;
}
Check out the next-video docs to learn more.

Use the API and our components for full control
If you're looking to build your own video workflow that enables uploading, playback, and more in your application, you can use the Mux API and components like Mux Player and Mux Uploader.

Example: allowing users to upload video to your app
One reason you might want to build your own video workflow is when you want to allow users to upload video to your app.

Let's start by adding a new page where users can upload videos. This will involve using the Mux Uploader component, which will upload videos to a Mux 
Direct Uploads URL
API
.

In the code sample below, we'll create an upload URL using the Mux Node SDK and the Direct Uploads URL API. We'll pass that URL to the Mux Uploader component, which will handle uploading for us.

App Directory (.js)
Pages Directory (.js)
App Directory (.ts)
Pages Directory (.ts)
app/upload/page.jsx
copy
import Mux from '@mux/mux-node';
import MuxUploader from '@mux/mux-uploader-react';

const client = new Mux({
  tokenId: process.env['MUX_TOKEN_ID'],
  tokenSecret: process.env['MUX_TOKEN_SECRET'],
});

export default async function Page() {
  const directUpload = await client.video.uploads.create({
    cors_origin: '*',
    new_asset_settings: {
      playback_policy: ['public'],
    },
  });

  return <MuxUploader endpoint={directUpload.url} />;
}
In production, you'll want to apply additional security measures to your upload URL. Consider protecting the route with authentication to prevent unauthorized users from uploading videos. Also, use cors_origin and consider playback_policy to further restrict where uploads can be performed and who can view uploaded videos.

Next, we'll create an API endpoint that will listen for Mux webhooks. When we receive the notification that the video has finished uploading and is ready for playback, we'll add the video's metadata to our database.

App Directory (.js)
Pages Directory (.js)
App Directory (.ts)
Pages Directory (.ts)
app/mux-webhook/route.js
copy
export async function POST(request) {
  const body = await request.json();
  const { type, data } = body

  if (type === 'video.asset.ready') {
    await saveAssetToDatabase(data);
  } else {
    /* handle other event types */
  }
  return Response.json({ message: 'ok' });
}
Finally, let's make a playback page. We retrieve the video metadata from our database, and play it by passing its playbackId to Mux Player:

App Directory (.js)
Pages Directory (.js)
App Directory (.ts)
Pages Directory (.ts)
app/watch/[id]/page.jsx
copy
'use client';

import MuxPlayer from '@mux/mux-player-react';

export default async function Page({ params }) {
  const asset = getAssetFromDatabase(params.id);
  return <MuxPlayer streamType="on-demand" playbackId={asset.id} accentColor="#ac39f2" />;
}
And we've got upload and playback. Nice!