Skip to Content
Mux Docs: Home
Mux Logo
Docs

 LightDarkAutoServer
 
Log in
Sign Up

API reference
Home
System API
Signing Keys
Video API
Assets
Live Streams
Playback ID
URL Signing Keys
Direct Uploads
Delivery Usage
Playback Restrictions
DRM Configurations
Transcription Vocabularies
Web Inputs
Data API
Video Views
Errors
Filters
Exports
Metrics
Monitoring
Real-Time
Dimensions
Incidents
;
Contact Support
API Reference
Signing Keys
Signing keys are used to sign JSON Web Tokens (JWTs) for securing certain requests, such as secure playback URLs and access to real-time viewer counts in Mux Data. One signing key can be used to sign multiple requests - you probably only need one active at a time. However, you can create multiple signing keys to enable key rotation, creating a new key and deleting the old only after any existing signed requests have expired.

Create a signing key
post
Creates a new signing key pair. When creating a new signing key, the API will generate a 2048-bit RSA key-pair and return the private key and a generated key-id; the public key will be stored at Mux to validate signed tokens.

post
201
/system/v1/signing-keys
Response
(application/json)
copy
{
  "data": {
    "private_key": "abcd123=",
    "id": "vI5KTQ78ohYriuvWKHY6COtZWXexHGLllxksOdZuya8",
    "created_at": "1610108345"
  }
}
List signing keys
get
Returns a list of signing keys.

Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

get
200
/system/v1/signing-keys
Response
(application/json)
copy
{
  "data": [
    {
      "id": "vI5KTQ78ohYriuvWKHY6COtZWXexHGLllxksOdZuya8",
      "created_at": "1610108345"
    },
    {
      "id": "jc6lJiCLMjyC202EXtRQ644sShzDv6x5tWJrbvUFpvmo",
      "created_at": "1608632647"
    }
  ]
}
Retrieve a signing key
get
Retrieves the details of a signing key that has previously been created. Supply the unique signing key ID that was returned from your previous request, and Mux will return the corresponding signing key information. The private key is not returned in this response.

Request path & query params
SIGNING_KEY_ID
string
The ID of the signing key.

get
200
/system/v1/signing-keys/{SIGNING_KEY_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "jc6lJiCLMjyC202EXtRQ644sShzDv6x5tWJrbvUFpvmo",
    "created_at": "1608632647"
  }
}
Delete a signing key
del
Deletes an existing signing key. Use with caution, as this will invalidate any existing signatures and no JWTs can be signed using the key again.

Request path & query params
SIGNING_KEY_ID
string
The ID of the signing key.

del
204
/system/v1/signing-keys/{SIGNING_KEY_ID}
Assets
An asset refers to a piece of media content that is stored or is being live streamed through the Mux system. An asset always has a duration and one or more tracks (audio, video, and text data).

The media content of an asset cannot be updated once created, however an asset can be used to create another asset, and can be modified within that process.


Properties
id
string
Unique identifier for the Asset. Max 255 characters.

created_at
string
Time the Asset was created, defined as a Unix timestamp (seconds since epoch).

status
string
Possible values:
"preparing"
"ready"
"errored"
The status of the asset.

duration
number
The duration of the asset in seconds (max duration for a single asset is 12 hours).

max_stored_resolutionDeprecated
string
Possible values:
"Audio only"
"SD"
"HD"
"FHD"
"UHD"
This field is deprecated. Please use resolution_tier instead. The maximum resolution that has been stored for the asset. The asset may be delivered at lower resolutions depending on the device and bandwidth, however it cannot be delivered at a higher value than is stored.

resolution_tier
string
Possible values:
"audio-only"
"720p"
"1080p"
"1440p"
"2160p"
The resolution tier that the asset was ingested at, affecting billing for ingest & storage. This field also represents the highest resolution tier that the content can be delivered at, however the actual resolution may be lower depending on the device, bandwidth, and exact resolution of the uploaded asset.

max_resolution_tier
string
Possible values:
"1080p"
"1440p"
"2160p"
Max resolution tier can be used to control the maximum resolution_tier your asset is encoded, stored, and streamed at. If not set, this defaults to 1080p.

encoding_tierDeprecated
string
Possible values:
"smart"
"baseline"
"premium"
This field is deprecated. Please use video_quality instead. The encoding tier informs the cost, quality, and available platform features for the asset. The default encoding tier for an account can be set in the Mux Dashboard. See the video quality guide for more details.

video_quality
string
Possible values:
"basic"
"plus"
"premium"
The video quality controls the cost, quality, and available platform features for the asset. The default video quality for an account can be set in the Mux Dashboard. This field replaces the deprecated encoding_tier value. See the video quality guide for more details.

max_stored_frame_rate
number
The maximum frame rate that has been stored for the asset. The asset may be delivered at lower frame rates depending on the device and bandwidth, however it cannot be delivered at a higher value than is stored. This field may return -1 if the frame rate of the input cannot be reliably determined.

aspect_ratio
string
The aspect ratio of the asset in the form of width:height, for example 16:9.

playback_ids
array
An array of Playback ID objects. Use these to create HLS playback URLs. See Play your videos for more details.

playback_ids[].id
string
Unique identifier for the PlaybackID

playback_ids[].policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

playback_ids[].drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

tracks
array
The individual media tracks that make up an asset.

tracks[].id
string
Unique identifier for the Track

tracks[].type
string
Possible values:
"video"
"audio"
"text"
The type of track

tracks[].duration
number
The duration in seconds of the track media. This parameter is not set for text type tracks. This field is optional and may not be set. The top level duration field of an asset will always be set.

tracks[].max_width
integer
The maximum width in pixels available for the track. Only set for the video type track.

tracks[].max_height
integer
The maximum height in pixels available for the track. Only set for the video type track.

tracks[].max_frame_rate
number
The maximum frame rate available for the track. Only set for the video type track. This field may return -1 if the frame rate of the input cannot be reliably determined.

tracks[].max_channels
integer
The maximum number of audio channels the track supports. Only set for the audio type track.

tracks[].max_channel_layoutDeprecated
string
Only set for the audio type track.

tracks[].text_type
string
Possible values:
"subtitles"
This parameter is only set for text type tracks.

tracks[].text_source
string
Possible values:
"uploaded"
"embedded"
"generated_live"
"generated_live_final"
"generated_vod"
The source of the text contained in a Track of type text. Valid text_source values are listed below.

uploaded: Tracks uploaded to Mux as caption or subtitle files using the Create Asset Track API.
embedded: Tracks extracted from an embedded stream of CEA-608 closed captions.
generated_vod: Tracks generated by automatic speech recognition on an on-demand asset.
generated_live: Tracks generated by automatic speech recognition on a live stream configured with generated_subtitles. If an Asset has both generated_live and generated_live_final tracks that are ready, then only the generated_live_final track will be included during playback.
generated_live_final: Tracks generated by automatic speech recognition on a live stream using generated_subtitles. The accuracy, timing, and formatting of these subtitles is improved compared to the corresponding generated_live tracks. However, generated_live_final tracks will not be available in ready status until the live stream ends. If an Asset has both generated_live and generated_live_final tracks that are ready, then only the generated_live_final track will be included during playback.
tracks[].language_code
string
The language code value represents BCP 47 specification compliant value. For example, en for English or en-US for the US version of English. This parameter is only set for text and audio track types.

tracks[].name
string
The name of the track containing a human-readable description. The HLS manifest will associate a subtitle text or audio track with this value. For example, the value should be "English" for a subtitle text track for the language_code value of en-US. This parameter is only set for text and audio track types.

tracks[].closed_captions
boolean
Indicates the track provides Subtitles for the Deaf or Hard-of-hearing (SDH). This parameter is only set tracks where type is text and text_type is subtitles.

tracks[].passthrough
string
Arbitrary user-supplied metadata set for the track either when creating the asset or track. This parameter is only set for text type tracks. Max 255 characters.

tracks[].status
string
Possible values:
"preparing"
"ready"
"errored"
"deleted"
The status of the track. This parameter is only set for text type tracks.

tracks[].primary
boolean
For an audio track, indicates that this is the primary audio track, ingested from the main input for this asset. The primary audio track cannot be deleted.

errors
object
Object that describes any errors that happened when processing this asset.

errors.type
string
The type of error that occurred for this asset.

errors.messages
array
Error messages with more details.

upload_id
string
Unique identifier for the Direct Upload. This is an optional parameter added when the asset is created from a direct upload.

is_live
boolean
Indicates whether the live stream that created this asset is currently active and not in idle state. This is an optional parameter added when the asset is created from a live stream.

passthrough
string
Arbitrary user-supplied metadata set for the asset. Max 255 characters.

live_stream_id
string
Unique identifier for the live stream. This is an optional parameter added when the asset is created from a live stream.

master
object
An object containing the current status of Master Access and the link to the Master MP4 file when ready. This object does not exist if master_access is set to none and when the temporary URL expires.

master.status
string
Possible values:
"ready"
"preparing"
"errored"
master.url
string
The temporary URL to the master version of the video, as an MP4 file. This URL will expire after 24 hours.

master_access
string (default: none)
Possible values:
"temporary"
"none"
mp4_support
string (default: none)
Possible values:
"none"
"capped-1080p"
"audio-only"
"audio-only,capped-1080p"
"standard" (Deprecated)
source_asset_id
string
Asset Identifier of the video used as the source for creating the clip.

normalize_audio
boolean (default: false)
Normalize the audio track loudness level. This parameter is only applicable to on-demand (not live) assets.

static_renditions
object
An object containing the current status of any static renditions (mp4s). The object does not exist if no static renditions have been requested. See Download your videos for more information.

static_renditions.status
string (default: disabled)
Possible values:
"ready"
"preparing"
"disabled"
"errored"
Indicates the status of downloadable MP4 versions of this asset.

static_renditions.files
array
Array of file objects.

static_renditions.files[].name
string
Possible values:
"low.mp4"
"medium.mp4"
"high.mp4"
"audio.m4a"
"capped-1080p.mp4"
static_renditions.files[].ext
string
Possible values:
"mp4"
"m4a"
Extension of the static rendition file

static_renditions.files[].height
integer
The height of the static rendition's file in pixels

static_renditions.files[].width
integer
The width of the static rendition's file in pixels

static_renditions.files[].bitrate
integer
The bitrate in bits per second

static_renditions.files[].filesize
string
The file size in bytes

recording_times
array
An array of individual live stream recording sessions. A recording session is created on each encoder connection during the live stream. Additionally any time slate media is inserted during brief interruptions in the live stream media or times when the live streaming software disconnects, a recording session representing the slate media will be added with a "slate" type.

recording_times[].started_at
string
The time at which the recording for the live stream started. The time value is Unix epoch time represented in ISO 8601 format.

recording_times[].duration
number
The duration of the live stream recorded. The time value is in seconds.

recording_times[].type
string
Possible values:
"content"
"slate"
The type of media represented by the recording session, either content for normal stream content or slate for slate media inserted during stream interruptions.

non_standard_input_reasons
object
An object containing one or more reasons the input file is non-standard. See the guide on minimizing processing time for more information on what a standard input is defined as. This object only exists on on-demand assets that have non-standard inputs, so if missing you can assume the input qualifies as standard.

non_standard_input_reasons.video_codec
string
The video codec used on the input file. For example, the input file encoded with hevc video codec is non-standard and the value of this parameter is hevc.

non_standard_input_reasons.audio_codec
string
The audio codec used on the input file. Non-AAC audio codecs are non-standard.

non_standard_input_reasons.video_gop_size
string
Possible values:
"high"
The video key frame Interval (also called as Group of Picture or GOP) of the input file is high. This parameter is present when the gop is greater than 20 seconds.

non_standard_input_reasons.video_frame_rate
string
The video frame rate of the input file. Video with average frames per second (fps) less than 5 or greater than 120 is non-standard. A -1 frame rate value indicates Mux could not determine the frame rate of the video track.

non_standard_input_reasons.video_resolution
string
The video resolution of the input file. Video resolution higher than 2048 pixels on any one dimension (height or width) is considered non-standard, The resolution value is presented as width x height in pixels.

non_standard_input_reasons.video_bitrate
string
Possible values:
"high"
The video bitrate of the input file is high. This parameter is present when the average bitrate of any key frame interval (also known as Group of Pictures or GOP) is higher than what's considered standard which typically is 16 Mbps.

non_standard_input_reasons.pixel_aspect_ratio
string
The video pixel aspect ratio of the input file.

non_standard_input_reasons.video_edit_list
string
Possible values:
"non-standard"
Video Edit List reason indicates that the input file's video track contains a complex Edit Decision List.

non_standard_input_reasons.audio_edit_list
string
Possible values:
"non-standard"
Audio Edit List reason indicates that the input file's audio track contains a complex Edit Decision List.

non_standard_input_reasons.unexpected_media_file_parameters
string
Possible values:
"non-standard"
A catch-all reason when the input file in created with non-standard encoding parameters.

non_standard_input_reasons.unsupported_pixel_format
string
The video pixel format, as a string, returned by libav. Considered non-standard if not one of yuv420p or yuvj420p.

test
boolean
True means this live stream is a test asset. A test asset can help evaluate the Mux Video APIs without incurring any cost. There is no limit on number of test assets created. Test assets are watermarked with the Mux logo, limited to 10 seconds, and deleted after 24 hrs.

ingest_type
string
Possible values:
"on_demand_url"
"on_demand_direct_upload"
"on_demand_clip"
"live_rtmp"
"live_srt"
The type of ingest used to create the asset.

Create an asset
post
Create a new Mux Video asset.

copy
curl https://api.mux.com/video/v1/assets \
  -X POST \
  -d '{ "input": "https://muxed.s3.amazonaws.com/leds.mp4", "playback_policy": ["public"], "video_quality": "basic" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params

input
array
An array of objects that each describe an input file to be used to create the asset. As a shortcut, input can also be a string URL for a file when only one input file is used. See input[].url for requirements.

input[].url
string
The URL of the file that Mux should download and use.

For the main input file, this should be the URL to the muxed file for Mux to download, for example an MP4, MOV, MKV, or TS file. Mux supports most audio/video file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For audio tracks, the URL is the location of the audio file for Mux to download, for example an M4A, WAV, or MP3 file. Mux supports most audio file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For text tracks, the URL is the location of subtitle/captions file. Mux supports SubRip Text (SRT) and Web Video Text Tracks formats for ingesting Subtitles and Closed Captions.
For Watermarking or Overlay, the URL is the location of the watermark image. The maximum size is 4096x4096.
When creating clips from existing Mux assets, the URL is defined with mux://assets/{asset_id} template where asset_id is the Asset Identifier for creating the clip from.
The url property may be omitted on the first input object when providing asset settings for LiveStream and Upload objects, in order to configure settings related to the primary (live stream or direct upload) input.

input[].overlay_settings
object
An object that describes how the image file referenced in URL should be placed over the video (i.e. watermarking). Ensure that the URL is active and persists the entire lifespan of the video object.

input[].overlay_settings.vertical_align
string
Possible values:
"top"
"middle"
"bottom"
Where the vertical positioning of the overlay/watermark should begin from. Defaults to "top"

input[].overlay_settings.vertical_margin
string
The distance from the vertical_align starting point and the image's closest edge. Can be expressed as a percent ("10%") or as a pixel value ("100px"). Negative values will move the overlay offscreen. In the case of 'middle', a positive value will shift the overlay towards the bottom and and a negative value will shift it towards the top.

input[].overlay_settings.horizontal_align
string
Possible values:
"left"
"center"
"right"
Where the horizontal positioning of the overlay/watermark should begin from.

input[].overlay_settings.horizontal_margin
string
The distance from the horizontal_align starting point and the image's closest edge. Can be expressed as a percent ("10%") or as a pixel value ("100px"). Negative values will move the overlay offscreen. In the case of 'center', a positive value will shift the image towards the right and and a negative value will shift it towards the left.

input[].overlay_settings.width
string
How wide the overlay should appear. Can be expressed as a percent ("10%") or as a pixel value ("100px"). If both width and height are left blank the width will be the true pixels of the image, applied as if the video has been scaled to fit a 1920x1080 frame. If height is supplied with no width, the width will scale proportionally to the height.

input[].overlay_settings.height
string
How tall the overlay should appear. Can be expressed as a percent ("10%") or as a pixel value ("100px"). If both width and height are left blank the height will be the true pixels of the image, applied as if the video has been scaled to fit a 1920x1080 frame. If width is supplied with no height, the height will scale proportionally to the width.

input[].overlay_settings.opacity
string
How opaque the overlay should appear, expressed as a percent. (Default 100%)


input[].generated_subtitles
array
Generate subtitle tracks using automatic speech recognition with this configuration. This may only be provided for the first input object (the main input file). For direct uploads, this first input should omit the url parameter, as the main input file is provided via the direct upload. This will create subtitles based on the audio track ingested from that main input file. Note that subtitle generation happens after initial ingest, so the generated tracks will be in the preparing state when the asset transitions to ready.

input[].generated_subtitles[].name
string
A name for this subtitle track.

input[].generated_subtitles[].passthrough
string
Arbitrary metadata set for the subtitle track. Max 255 characters.

input[].generated_subtitles[].language_code
string
(default: en)
Possible values:
"en"
"es"
"it"
"pt"
"de"
"fr"
"pl"
"ru"
"nl"
"ca"
"tr"
"sv"
"uk"
"no"
"fi"
"sk"
"el"
"cs"
"hr"
"da"
"ro"
"bg"
The language to generate subtitles in.

input[].start_time
number
The time offset in seconds from the beginning of the video indicating the clip's starting marker. The default value is 0 when not included. This parameter is only applicable for creating clips when input.url has mux://assets/{asset_id} format.

input[].end_time
number
The time offset in seconds from the beginning of the video, indicating the clip's ending marker. The default value is the duration of the video when not included. This parameter is only applicable for creating clips when input.url has mux://assets/{asset_id} format.

input[].type
string
Possible values:
"video"
"audio"
"text"
This parameter is required for text type tracks.

input[].text_type
string
Possible values:
"subtitles"
Type of text track. This parameter only supports subtitles value. For more information on Subtitles / Closed Captions, see this blog post. This parameter is required for text type tracks.

input[].language_code
string
The language code value must be a valid BCP 47 specification compliant value. For example, en for English or en-US for the US version of English. This parameter is required for text and audio track types.

input[].name
string
The name of the track containing a human-readable description. This value must be unique within each group of text or audio track types. The HLS manifest will associate a subtitle text track with this value. For example, the value should be "English" for a subtitle text track with language_code set to en. This optional parameter should be used only for text and audio type tracks. This parameter can be optionally provided for the first video input to denote the name of the muxed audio track if present. If this parameter is not included, Mux will auto-populate based on the input[].language_code value.

input[].closed_captions
boolean
Indicates the track provides Subtitles for the Deaf or Hard-of-hearing (SDH). This optional parameter should be used for tracks with type of text and text_type set to subtitles.

input[].passthrough
string
This optional parameter should be used tracks with type of text and text_type set to subtitles.

playback_policy
array
An array of playback policy names that you want applied to this asset and available through playback_ids. Options include:

"public" (anyone with the playback URL can stream the asset).
"signed" (an additional access token is required to play the asset).
If no playback_policy is set, the asset will have no playback IDs and will therefore not be playable. For simplicity, a single string name can be used in place of the array in the case of only one playback policy.

Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.


advanced_playback_policies
array
An array of playback policy objects that you want applied to this asset and available through playback_ids. advanced_playback_policies must be used instead of playback_policy when creating a DRM playback ID.

advanced_playback_policies[].policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

advanced_playback_policies[].drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

passthrough
string
Arbitrary user-supplied metadata that will be included in the asset details and related webhooks. Can be used to store your own ID for a video along with the asset. Max: 255 characters.

mp4_support
string
Possible values:
"none"
"capped-1080p"
"audio-only"
"audio-only,capped-1080p"
"standard" (Deprecated)
Specify what level of support for mp4 playback.

The capped-1080p option produces a single MP4 file, called capped-1080p.mp4, with the video resolution capped at 1080p. This option produces an audio.m4a file for an audio-only asset.
The audio-only option produces a single M4A file, called audio.m4a for a video or an audio-only asset. MP4 generation will error when this option is specified for a video-only asset.
The audio-only,capped-1080p option produces both the audio.m4a and capped-1080p.mp4 files. Only the capped-1080p.mp4 file is produced for a video-only asset, while only the audio.m4a file is produced for an audio-only asset.
The standard(deprecated) option produces up to three MP4 files with different levels of resolution (high.mp4, medium.mp4, low.mp4, or audio.m4a for an audio-only asset).

MP4 files are not produced for none (default).

In most cases you should use our default HLS-based streaming playback ({playback_id}.m3u8) which can automatically adjust to viewers' connection speeds, but an mp4 can be useful for some legacy devices or downloading for offline playback. See the Download your videos guide for more information.

normalize_audio
boolean
(default: false)
Normalize the audio track loudness level. This parameter is only applicable to on-demand (not live) assets.

master_access
string
Possible values:
"none"
"temporary"
Specify what level (if any) of support for master access. Master access can be enabled temporarily for your asset to be downloaded. See the Download your videos guide for more information.

test
boolean
Marks the asset as a test asset when the value is set to true. A Test asset can help evaluate the Mux Video APIs without incurring any cost. There is no limit on number of test assets created. Test asset are watermarked with the Mux logo, limited to 10 seconds, deleted after 24 hrs.

max_resolution_tier
string
Possible values:
"1080p"
"1440p"
"2160p"
Max resolution tier can be used to control the maximum resolution_tier your asset is encoded, stored, and streamed at. If not set, this defaults to 1080p.

encoding_tier
string
Deprecated
Possible values:
"smart"
"baseline"
"premium"
This field is deprecated. Please use video_quality instead. The encoding tier informs the cost, quality, and available platform features for the asset. The default encoding tier for an account can be set in the Mux Dashboard. See the video quality guide for more details.

video_quality
string
Possible values:
"basic"
"plus"
"premium"
The video quality controls the cost, quality, and available platform features for the asset. The default video quality for an account can be set in the Mux Dashboard. This field replaces the deprecated encoding_tier value. See the video quality guide for more details.

post
201
/video/v1/assets
Request
(application/json)
copy
{
  "input": [
    {
      "url": "https://muxed.s3.amazonaws.com/leds.mp4"
    }
  ],
  "playback_policy": [
    "public"
  ],
  "video_quality": "basic"
}
Response
(application/json)
copy
{
  "data": {
    "status": "preparing",
    "playback_ids": [
      {
        "policy": "public",
        "id": "uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW"
      }
    ],
    "mp4_support": "none",
    "master_access": "none",
    "id": "SqQnqz6s5MBuXGvJaUWdXuXM93J9Q2yv",
    "encoding_tier": "baseline",
    "video_quality": "basic",
    "created_at": "1607452572"
  }
}
List assets
get
List all Mux assets.

copy
curl https://api.mux.com/video/v1/assets \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

live_stream_id
string
Filter response to return all the assets for this live stream only

upload_id
string
Filter response to return an asset created from this direct upload only

get
200
/video/v1/assets
Response
(application/json)
copy
{
  "data": [
    {
      "tracks": [
        {
          "type": "video",
          "max_width": 1920,
          "max_height": 800,
          "max_frame_rate": 24,
          "id": "HK01Bq7FrEQmIu3QpRiZZ98HQOOZjm6BYyg17eEunlyo",
          "duration": 734.166667
        },
        {
          "type": "audio",
          "max_channels": 2,
          "id": "nNKHJqw2G9cE019AoK16CJr3O27gGnbtW4w525hJWqWw",
          "duration": 734.143991
        }
      ],
      "status": "ready",
      "playback_ids": [
        {
          "policy": "public",
          "id": "85g23gYz7NmQu02YsY81ihuod6cZMxCp017ZrfglyLCKc"
        }
      ],
      "mp4_support": "none",
      "max_stored_resolution": "HD",
      "resolution_tier": "1080p",
      "max_stored_frame_rate": 24,
      "master_access": "none",
      "id": "8jd7M77xQgf2NzuocJRPYdSdEfY5dLlcRwFARtgQqU4",
      "encoding_tier": "baseline",
      "video_quality": "basic",
      "duration": 734.25,
      "created_at": "1609869152",
      "aspect_ratio": "12:5"
    },
    {
      "tracks": [
        {
          "type": "video",
          "max_width": 1920,
          "max_height": 1080,
          "max_frame_rate": 29.97,
          "id": "RiyQPM31a1SPtfI802bEP2zD02F5FQVNL801FRHeE5t01G4",
          "duration": 23.8238
        },
        {
          "type": "audio",
          "max_channels": 2,
          "id": "LvINTciHVoC017knMCH01y9pSi5OrDLCRaBPNDAoNJcmg",
          "duration": 23.823792
        }
      ],
      "status": "ready",
      "playback_ids": [
        {
          "policy": "public",
          "id": "vAFLI2eKFFicXX00iHBS2vqt5JjJGg5HV6fQ4Xijgt1I"
        }
      ],
      "mp4_support": "none",
      "max_stored_resolution": "HD",
      "resolution_tier": "1080p",
      "max_stored_frame_rate": 29.97,
      "master_access": "none",
      "id": "lJ4bGGsp7ZlPf02nMg015W02iHQLN9XnuuLRBsPS00xqd68",
      "encoding_tier": "smart",
      "video_quality": "plus",
      "duration": 23.857167,
      "created_at": "1609868768",
      "aspect_ratio": "16:9"
    }
  ]
}
Retrieve an asset
get
Retrieves the details of an asset that has previously been created. Supply the unique asset ID that was returned from your previous request, and Mux will return the corresponding asset information. The same information is returned when creating an asset.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID} \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
ASSET_ID
string
The asset ID.

get
200
/video/v1/assets/{ASSET_ID}
Response
(application/json)
copy
{
  "data": {
    "tracks": [
      {
        "type": "video",
        "max_width": 1920,
        "max_height": 1080,
        "max_frame_rate": 29.97,
        "id": "RiyQPM31a1SPtfI802bEP2zD02F5FQVNL801FRHeE5t01G4",
        "duration": 23.8238
      },
      {
        "type": "audio",
        "max_channels": 2,
        "id": "LvINTciHVoC017knMCH01y9pSi5OrDLCRaBPNDAoNJcmg",
        "duration": 23.823792
      }
    ],
    "status": "ready",
    "resolution_tier": "1080p",
    "playback_ids": [
      {
        "policy": "public",
        "id": "vAFLI2eKFFicXX00iHBS2vqt5JjJGg5HV6fQ4Xijgt1I"
      }
    ],
    "passthrough": "example",
    "mp4_support": "none",
    "max_stored_resolution": "HD",
    "max_stored_frame_rate": 29.97,
    "max_resolution_tier": "1080p",
    "master_access": "none",
    "id": "lJ4bGGsp7ZlPf02nMg015W02iHQLN9XnuuLRBsPS00xqd68",
    "encoding_tier": "baseline",
    "video_quality": "basic",
    "duration": 23.857167,
    "created_at": "1609868768",
    "aspect_ratio": "16:9"
  }
}
Delete an asset
del
Deletes a video asset and all its data.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
ASSET_ID
string
The asset ID.

del
204
/video/v1/assets/{ASSET_ID}
Update an asset
patch
Updates the details of an already-created Asset with the provided Asset ID. This currently supports only the passthrough field.

Request body params
passthrough
string
Arbitrary metadata set for the Asset. Max 255 characters. In order to clear this value, the field should be included with an empty string value.

Request path & query params
ASSET_ID
string
The asset ID.

patch
200
/video/v1/assets/{ASSET_ID}
Request
(application/json)
copy
{
  "passthrough": "Example"
}
Response
(application/json)
copy
{
  "data": {
    "tracks": [
      {
        "type": "video",
        "max_width": 1920,
        "max_height": 1080,
        "max_frame_rate": 29.97,
        "id": "RiyQPM31a1SPtfI802bEP2zD02F5FQVNL801FRHeE5t01G4",
        "duration": 23.8238
      },
      {
        "type": "audio",
        "max_channels": 2,
        "id": "LvINTciHVoC017knMCH01y9pSi5OrDLCRaBPNDAoNJcmg",
        "duration": 23.823792
      }
    ],
    "status": "ready",
    "playback_ids": [
      {
        "policy": "public",
        "id": "vAFLI2eKFFicXX00iHBS2vqt5JjJGg5HV6fQ4Xijgt1I"
      }
    ],
    "mp4_support": "none",
    "max_stored_resolution": "HD",
    "resolution_tier": "1080p",
    "max_stored_frame_rate": 29.97,
    "master_access": "none",
    "id": "lJ4bGGsp7ZlPf02nMg015W02iHQLN9XnuuLRBsPS00xqd68",
    "encoding_tier": "baseline",
    "video_quality": "basic",
    "duration": 23.857167,
    "created_at": "1609868768",
    "updated_at": "1609869000",
    "aspect_ratio": "16:9",
    "passthrough": "Example"
  }
}
Retrieve asset input info
get
Returns a list of the input objects that were used to create the asset along with any settings that were applied to each input.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/input-info \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
ASSET_ID
string
The asset ID.

get
200
/video/v1/assets/{ASSET_ID}/input-info
Response
(application/json)
copy
{
  "data": [
    {
      "settings": {
        "url": "https://muxed.s3.amazonaws.com/leds.mp4"
      },
      "file": {
        "container_format": "mp4",
        "tracks": [
          {
            "type": "video",
            "duration": 120,
            "width": 1280,
            "height": 720,
            "frame_rate": 30,
            "encoding": "h.264"
          },
          {
            "type": "audio",
            "duration": 120,
            "sample_rate": 16000,
            "sample_size": 24,
            "encoding": "aac"
          }
        ]
      }
    },
    {
      "settings": {
        "url": "https://example.com/myVideo_en.srt"
      },
      "file": {
        "container_format": "srt"
      }
    }
  ]
}
Create a playback ID
post
Creates a playback ID that can be used to stream the asset to a viewer.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/playback-ids \
  -X POST \
  -d '{ "policy": "public" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

Request path & query params
ASSET_ID
string
The asset ID.

post
201
/video/v1/assets/{ASSET_ID}/playback-ids
Request
(application/json)
copy
{
  "policy": "public"
}
Response
(application/json)
copy
{
  "data": {
    "policy": "public",
    "id": "Lj02VZDorh9hCV00flNqPli8fmwf6KEppug01w8zDEYVlQ"
  }
}
Retrieve a playback ID
get
Retrieves information about the specified playback ID.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/playback-ids/${PLAYBACK_ID} \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
ASSET_ID
string
The asset ID.

PLAYBACK_ID
string
The asset or live stream's playback ID.

get
200
/video/v1/assets/{ASSET_ID}/playback-ids/{PLAYBACK_ID}
Response
(application/json)
copy
{
  "data": {
    "policy": "public",
    "id": "vAFLI2eKFFicXX00iHBS2vqt5JjJGg5HV6fQ4Xijgt1I"
  }
}
Delete a playback ID
del
Deletes a playback ID, rendering it nonfunctional for viewing an asset's video content. Please note that deleting the playback ID removes access to the underlying asset; a viewer who started playback before the playback ID was deleted may be able to watch the entire video for a limited duration.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/playback-ids/${PLAYBACK_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
ASSET_ID
string
The asset ID.

PLAYBACK_ID
string
The asset or live stream's playback ID.

del
204
/video/v1/assets/{ASSET_ID}/playback-ids/{PLAYBACK_ID}
Update MP4 support
put
Allows you to add or remove mp4 support for assets that were created without it. The values supported are capped-1080p, audio-only, audio-only,capped-1080p, standard(deprecated), and none. none means that an asset does not have mp4 support, so submitting a request with mp4_support set to none will delete the mp4 assets from the asset in question.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/mp4-support \
  -X PUT \
  -d '{ "mp4_support": "standard" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
mp4_support
string
Possible values:
"none"
"capped-1080p"
"audio-only"
"audio-only,capped-1080p"
"standard" (Deprecated)
Specify what level of support for mp4 playback.

The capped-1080p option produces a single MP4 file, called capped-1080p.mp4, with the video resolution capped at 1080p. This option produces an audio.m4a file for an audio-only asset.
The audio-only option produces a single M4A file, called audio.m4a for a video or an audio-only asset. MP4 generation will error when this option is specified for a video-only asset.
The audio-only,capped-1080p option produces both the audio.m4a and capped-1080p.mp4 files. Only the capped-1080p.mp4 file is produced for a video-only asset, while only the audio.m4a file is produced for an audio-only asset.
The standard(deprecated) option produces up to three MP4 files with different levels of resolution (high.mp4, medium.mp4, low.mp4, or audio.m4a for an audio-only asset).

none will delete the MP4s from the asset in question.

Request path & query params
ASSET_ID
string
The asset ID.

put
200
/video/v1/assets/{ASSET_ID}/mp4-support
Request
(application/json)
copy
{
  "mp4_support": "capped-1080p"
}
Response
(application/json)
copy
{
  "data": {
    "tracks": [
      {
        "type": "video",
        "max_width": 1920,
        "max_height": 1080,
        "max_frame_rate": 29.97,
        "id": "RiyQPM31a1SPtfI802bEP2zD02F5FQVNL801FRHeE5t01G4",
        "duration": 23.8238
      },
      {
        "type": "audio",
        "max_channels": 2,
        "id": "LvINTciHVoC017knMCH01y9pSi5OrDLCRaBPNDAoNJcmg",
        "duration": 23.823792
      }
    ],
    "status": "ready",
    "static_renditions": {
      "status": "preparing"
    },
    "playback_ids": [
      {
        "policy": "public",
        "id": "Lj02VZDorh9hCV00flNqPli8fmwf6KEppug01w8zDEYVlQ"
      }
    ],
    "mp4_support": "capped-1080p",
    "max_stored_resolution": "HD",
    "resolution_tier": "1080p",
    "max_stored_frame_rate": 29.97,
    "master_access": "none",
    "id": "lJ4bGGsp7ZlPf02nMg015W02iHQLN9XnuuLRBsPS00xqd68",
    "encoding_tier": "smart",
    "video_quality": "plus",
    "duration": 23.857167,
    "created_at": "1609868768",
    "aspect_ratio": "16:9"
  }
}
Update master access
put
Allows you to add temporary access to the master (highest-quality) version of the asset in MP4 format. A URL will be created that can be used to download the master version for 24 hours. After 24 hours Master Access will revert to "none". This master version is not optimized for web and not meant to be streamed, only downloaded for purposes like archiving or editing the video offline.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/master-access \
  -X PUT \
  -d '{ "master_access": "temporary" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
master_access
string
Possible values:
"temporary"
"none"
Add or remove access to the master version of the video.

Request path & query params
ASSET_ID
string
The asset ID.

put
200
/video/v1/assets/{ASSET_ID}/master-access
Request
(application/json)
copy
{
  "master_access": "temporary"
}
Response
(application/json)
copy
{
  "data": {
    "tracks": [
      {
        "type": "video",
        "max_width": 1920,
        "max_height": 1080,
        "max_frame_rate": 29.97,
        "id": "RiyQPM31a1SPtfI802bEP2zD02F5FQVNL801FRHeE5t01G4",
        "duration": 23.8238
      },
      {
        "type": "audio",
        "max_channels": 2,
        "id": "LvINTciHVoC017knMCH01y9pSi5OrDLCRaBPNDAoNJcmg",
        "duration": 23.823792
      }
    ],
    "status": "ready",
    "playback_ids": [
      {
        "policy": "public",
        "id": "Lj02VZDorh9hCV00flNqPli8fmwf6KEppug01w8zDEYVlQ"
      }
    ],
    "mp4_support": "none",
    "max_stored_resolution": "HD",
    "resolution_tier": "1080p",
    "max_stored_frame_rate": 29.97,
    "master_access": "temporary",
    "master": {
      "status": "preparing"
    },
    "id": "lJ4bGGsp7ZlPf02nMg015W02iHQLN9XnuuLRBsPS00xqd68",
    "encoding_tier": "baseline",
    "video_quality": "basic",
    "duration": 23.857167,
    "created_at": "1609868768",
    "aspect_ratio": "16:9"
  }
}
Create an asset track
post
Adds an asset track (for example, subtitles, or an alternate audio track) to an asset.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/tracks \
  -X POST \
  -d '{ "url": "https://example.com/myVIdeo_en.srt", "type": "text", "text_type": "subtitles", "closed_captions": true, "language_code": "en-US", "name": "English",  "passthrough": "English" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
url
string
The URL of the file that Mux should download and use.

For audio tracks, the URL is the location of the audio file for Mux to download, for example an M4A, WAV, or MP3 file. Mux supports most audio file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For text tracks, the URL is the location of subtitle/captions file. Mux supports SubRip Text (SRT) and Web Video Text Tracks formats for ingesting Subtitles and Closed Captions.
type
string
Possible values:
"text"
"audio"
text_type
string
Possible values:
"subtitles"
language_code
string
The language code value must be a valid BCP 47 specification compliant value. For example, en for English or en-US for the US version of English.

name
string
The name of the track containing a human-readable description. This value must be unique within each group of text or audio track types. The HLS manifest will associate the text or audio track with this value. For example, set the value to "English" for subtitles text track with language_code as en-US. If this parameter is not included, Mux will auto-populate a value based on the language_code value.

closed_captions
boolean
Indicates the track provides Subtitles for the Deaf or Hard-of-hearing (SDH).

passthrough
string
Arbitrary user-supplied metadata set for the track either when creating the asset or track.

Request path & query params
ASSET_ID
string
The asset ID.

post
201
/video/v1/assets/{ASSET_ID}/tracks
Request
(application/json)
copy
{
  "url": "https://example.com/myVideo_en.srt",
  "type": "text",
  "text_type": "subtitles",
  "language_code": "en-US",
  "name": "English",
  "closed_captions": true,
  "passthrough": "English"
}
Response
(application/json)
copy
{
  "data": {
    "type": "text",
    "text_type": "subtitles",
    "status": "preparing",
    "passthrough": "English",
    "name": "English",
    "language_code": "en-US",
    "id": "xBe7u01029ipxBLQhYzZCJ1cke01zCkuUsgnYtH0017nNzbpv2YcsoMDmw",
    "closed_captions": true
  }
}
Delete an asset track
del
Removes a text track from an asset. Audio and video tracks on assets cannot be removed.

copy
curl https://api.mux.com/video/v1/assets/${ASSET_ID}/tracks/${TRACK_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
ASSET_ID
string
The asset ID.

TRACK_ID
string
The track ID.

del
204
/video/v1/assets/{ASSET_ID}/tracks/{TRACK_ID}
Generate track subtitles
post
Generates subtitles (captions) for a given audio track. This API can be used for up to 7 days after an asset is created.

Request body params

generated_subtitles
array
Generate subtitle tracks using automatic speech recognition with this configuration.

generated_subtitles[].name
string
A name for this subtitle track.

generated_subtitles[].passthrough
string
Arbitrary metadata set for the subtitle track. Max 255 characters.

generated_subtitles[].language_code
string
(default: en)
Possible values:
"en"
"es"
"it"
"pt"
"de"
"fr"
"pl"
"ru"
"nl"
"ca"
"tr"
"sv"
"uk"
"no"
"fi"
"sk"
"el"
"cs"
"hr"
"da"
"ro"
"bg"
The language to generate subtitles in.

Request path & query params
ASSET_ID
string
The asset ID.

TRACK_ID
string
The track ID.

post
201
/video/v1/assets/{ASSET_ID}/tracks/{TRACK_ID}/generate-subtitles
Request
(application/json)
copy
{
  "generated_subtitles": [
    {
      "language_code": "en",
      "name": "English (generated)",
      "passthrough": "English (generated)"
    }
  ]
}
Response
(application/json)
copy
{
  "data": [
    {
      "type": "text",
      "text_type": "subtitles",
      "status": "preparing",
      "passthrough": "English (generated)",
      "name": "English (generated)",
      "language_code": "en",
      "id": "hXhnqUq0054k9SBFB5aczHhj6xMbOTlriTG7gqRn8kikv101lkFUgKNw"
    }
  ]
}
Live Streams
A Live Stream represents a unique live stream of video being pushed to Mux. It includes configuration details (a Stream Key) for live broadcasting software/hardware and a Playback ID for playing the stream anywhere. Currently, RTMP is the only supported method of ingesting video. Use rtmp://global-live.mux.com:5222/app with the Live Stream's Stream Key for getting the video into Mux, and use https://stream.mux.com with the Live Stream's Playback ID for playback.

A Live Stream can be used once for a specific event, or re-used forever. If you're building an application like Facebook Live or Twitch, you could create one Live Stream per user. This allows them to configure their broadcasting software once, and the Live Stream Playback ID will always show their latest stream.

Each RTMP session creates a new video asset automatically. You can set up a webhook to be notified each time a broadcast (or Live Stream RTMP session) begins or ends with the video.live_stream.active and video.live_stream.idle events respectively. Assets that are created from a Live Stream have the same behavior as other Assets you create.

Learn more about how to go live in our guides.


Properties
id
string
Unique identifier for the Live Stream. Max 255 characters.

created_at
string
Time the Live Stream was created, defined as a Unix timestamp (seconds since epoch).

stream_key
string
Unique key used for streaming to a Mux RTMP endpoint. This should be considered as sensitive as credentials, anyone with this stream key can begin streaming.

active_asset_id
string
The Asset that is currently being created if there is an active broadcast.

recent_asset_ids
array
An array of strings with the most recent Asset IDs that were created from this Live Stream. The most recently generated Asset ID is the last entry in the list.

status
string
Possible values:
"active"
"idle"
"disabled"
idle indicates that there is no active broadcast. active indicates that there is an active broadcast and disabled status indicates that no future RTMP streams can be published.

playback_ids
array
An array of Playback ID objects. Use these to create HLS playback URLs. See Play your videos for more details.

playback_ids[].id
string
Unique identifier for the PlaybackID

playback_ids[].policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

playback_ids[].drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

new_asset_settings
object
The settings to be used when creating a new asset. You can use any of the usual settings when creating an asset normally, with the exception to not include file url for creating the asset in input. You could optionally add overlay_setting and input urls to add Subtitles / Captions.

passthrough
string
Arbitrary user-supplied metadata set for the asset. Max 255 characters.

audio_only
boolean
The live stream only processes the audio track if the value is set to true. Mux drops the video track if broadcasted.

embedded_subtitles
array
Describes the embedded closed caption configuration of the incoming live stream.

embedded_subtitles[].name
string
A name for this live stream closed caption track.

embedded_subtitles[].passthrough
string
Arbitrary user-supplied metadata set for the live stream closed caption track. Max 255 characters.

embedded_subtitles[].language_code
string (default: en)
The language of the closed caption stream. Value must be BCP 47 compliant.

embedded_subtitles[].language_channel
string (default: cc1)
Possible values:
"cc1"
"cc2"
"cc3"
"cc4"
CEA-608 caption channel to read data from.

generated_subtitles
array
Configure the incoming live stream to include subtitles created with automatic speech recognition. Each Asset created from a live stream with generated_subtitles configured will automatically receive two text tracks. The first of these will have a text_source value of generated_live, and will be available with ready status as soon as the stream is live. The second text track will have a text_source value of generated_live_final and will contain subtitles with improved accuracy, timing, and formatting. However, generated_live_final tracks will not be available in ready status until the live stream ends. If an Asset has both generated_live and generated_live_final tracks that are ready, then only the generated_live_final track will be included during playback.

generated_subtitles[].name
string
A name for this live stream subtitle track.

generated_subtitles[].passthrough
string
Arbitrary metadata set for the live stream subtitle track. Max 255 characters.

generated_subtitles[].language_code
string (default: en)
Possible values:
"en"
"en-US"
The language to generate subtitles in.

generated_subtitles[].transcription_vocabulary_ids
array
Unique identifiers for existing Transcription Vocabularies to use while generating subtitles for the live stream. If the Transcription Vocabularies provided collectively have more than 1000 phrases, only the first 1000 phrases will be included.

reconnect_window
number (default: 60, minimum: 0, maximum: 1800)
When live streaming software disconnects from Mux, either intentionally or due to a drop in the network, the Reconnect Window is the time in seconds that Mux should wait for the streaming software to reconnect before considering the live stream finished and completing the recorded asset. Max: 1800s (30 minutes).

If not specified directly, Standard Latency streams have a Reconnect Window of 60 seconds; Reduced and Low Latency streams have a default of 0 seconds, or no Reconnect Window. For that reason, we suggest specifying a value other than zero for Reduced and Low Latency streams.

Reduced and Low Latency streams with a Reconnect Window greater than zero will insert slate media into the recorded asset while waiting for the streaming software to reconnect or when there are brief interruptions in the live stream media. When using a Reconnect Window setting higher than 60 seconds with a Standard Latency stream, we highly recommend enabling slate with the use_slate_for_standard_latency option.

use_slate_for_standard_latency
boolean (default: false)
By default, Standard Latency live streams do not have slate media inserted while waiting for live streaming software to reconnect to Mux. Setting this to true enables slate insertion on a Standard Latency stream.

reconnect_slate_url
string
The URL of the image file that Mux should download and use as slate media during interruptions of the live stream media. This file will be downloaded each time a new recorded asset is created from the live stream. If this is not set, the default slate media will be used.

simulcast_targets
array
Each Simulcast Target contains configuration details to broadcast (or "restream") a live stream to a third-party streaming service. See the Stream live to 3rd party platforms guide.

simulcast_targets[].id
string
ID of the Simulcast Target

simulcast_targets[].passthrough
string
Arbitrary user-supplied metadata set when creating a simulcast target.

simulcast_targets[].status
string
Possible values:
"idle"
"starting"
"broadcasting"
"errored"
The current status of the simulcast target. See Statuses below for detailed description.

idle: Default status. When the parent live stream is in disconnected status, simulcast targets will be idle state.
starting: The simulcast target transitions into this state when the parent live stream transition into connected state.
broadcasting: The simulcast target has successfully connected to the third party live streaming service and is pushing video to that service.
errored: The simulcast target encountered an error either while attempting to connect to the third party live streaming service, or mid-broadcasting. When a simulcast target has this status it will have an error_severity field with more details about the error.
simulcast_targets[].stream_key
string
Stream Key represents a stream identifier on the third party live streaming service to send the parent live stream to. Only used for RTMP(s) simulcast destinations.

simulcast_targets[].url
string
The RTMP(s) or SRT endpoint for a simulcast destination.

For RTMP(s) destinations, this should include the application name for the third party live streaming service, for example: rtmp://live.example.com/app.
For SRT destinations, this should be a fully formed SRT connection string, for example: srt://srt-live.example.com:1234?streamid={stream_key}&passphrase={srt_passphrase}.
Note: SRT simulcast targets can only be used when an source is connected over SRT.

simulcast_targets[].error_severity
string
Possible values:
"normal"
"fatal"
The severity of the error encountered by the simulcast target. This field is only set when the simulcast target is in the errored status. See the values of severities below and their descriptions.

normal: The simulcast target encountered an error either while attempting to connect to the third party live streaming service, or mid-broadcasting. A simulcast may transition back into the broadcasting state if a connection with the service can be re-established.
fatal: The simulcast target is incompatible with the current input to the parent live stream. No further attempts to this simulcast target will be made for the current live stream asset.
latency_mode
string
Possible values:
"low"
"reduced"
"standard"
Latency is the time from when the streamer transmits a frame of video to when you see it in the player. Set this as an alternative to setting low latency or reduced latency flags.

test
boolean
True means this live stream is a test live stream. Test live streams can be used to help evaluate the Mux Video APIs for free. There is no limit on the number of test live streams, but they are watermarked with the Mux logo, and limited to 5 minutes. The test live stream is disabled after the stream is active for 5 mins and the recorded asset also deleted after 24 hours.

max_continuous_duration
integer (default: 43200, minimum: 60, maximum: 43200)
The time in seconds a live stream may be continuously active before being disconnected. Defaults to 12 hours.

srt_passphrase
string
Unique key used for encrypting a stream to a Mux SRT endpoint.

active_ingest_protocol
string
Possible values:
"rtmp"
"srt"
The protocol used for the active ingest stream. This is only set when the live stream is active.

Create a live stream
post
Creates a new live stream. Once created, an encoder can connect to Mux via the specified stream key and begin streaming to an audience.

copy
curl https://api.mux.com/video/v1/live-streams \
  -X POST \
  -d '{ "playback_policy": "public", "new_asset_settings": { "playback_policy": "public" } }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
playback_policy
array
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.


advanced_playback_policies
array
An array of playback policy objects that you want applied to this asset and available through playback_ids. advanced_playback_policies must be used instead of playback_policy when creating a DRM playback ID.

advanced_playback_policies[].policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

advanced_playback_policies[].drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.


new_asset_settings
object

new_asset_settings.input
array
An array of objects that each describe an input file to be used to create the asset. As a shortcut, input can also be a string URL for a file when only one input file is used. See input[].url for requirements.

new_asset_settings.input[].url
string
The URL of the file that Mux should download and use.

For the main input file, this should be the URL to the muxed file for Mux to download, for example an MP4, MOV, MKV, or TS file. Mux supports most audio/video file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For audio tracks, the URL is the location of the audio file for Mux to download, for example an M4A, WAV, or MP3 file. Mux supports most audio file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For text tracks, the URL is the location of subtitle/captions file. Mux supports SubRip Text (SRT) and Web Video Text Tracks formats for ingesting Subtitles and Closed Captions.
For Watermarking or Overlay, the URL is the location of the watermark image. The maximum size is 4096x4096.
When creating clips from existing Mux assets, the URL is defined with mux://assets/{asset_id} template where asset_id is the Asset Identifier for creating the clip from.
The url property may be omitted on the first input object when providing asset settings for LiveStream and Upload objects, in order to configure settings related to the primary (live stream or direct upload) input.

new_asset_settings.input[].overlay_settings
object
An object that describes how the image file referenced in URL should be placed over the video (i.e. watermarking). Ensure that the URL is active and persists the entire lifespan of the video object.

new_asset_settings.input[].overlay_settings.vertical_align
string
Possible values:
"top"
"middle"
"bottom"
Where the vertical positioning of the overlay/watermark should begin from. Defaults to "top"

new_asset_settings.input[].overlay_settings.vertical_margin
string
The distance from the vertical_align starting point and the image's closest edge. Can be expressed as a percent ("10%") or as a pixel value ("100px"). Negative values will move the overlay offscreen. In the case of 'middle', a positive value will shift the overlay towards the bottom and and a negative value will shift it towards the top.

new_asset_settings.input[].overlay_settings.horizontal_align
string
Possible values:
"left"
"center"
"right"
Where the horizontal positioning of the overlay/watermark should begin from.

new_asset_settings.input[].overlay_settings.horizontal_margin
string
The distance from the horizontal_align starting point and the image's closest edge. Can be expressed as a percent ("10%") or as a pixel value ("100px"). Negative values will move the overlay offscreen. In the case of 'center', a positive value will shift the image towards the right and and a negative value will shift it towards the left.

new_asset_settings.input[].overlay_settings.width
string
How wide the overlay should appear. Can be expressed as a percent ("10%") or as a pixel value ("100px"). If both width and height are left blank the width will be the true pixels of the image, applied as if the video has been scaled to fit a 1920x1080 frame. If height is supplied with no width, the width will scale proportionally to the height.

new_asset_settings.input[].overlay_settings.height
string
How tall the overlay should appear. Can be expressed as a percent ("10%") or as a pixel value ("100px"). If both width and height are left blank the height will be the true pixels of the image, applied as if the video has been scaled to fit a 1920x1080 frame. If width is supplied with no height, the height will scale proportionally to the width.

new_asset_settings.input[].overlay_settings.opacity
string
How opaque the overlay should appear, expressed as a percent. (Default 100%)


new_asset_settings.input[].generated_subtitles
array
Generate subtitle tracks using automatic speech recognition with this configuration. This may only be provided for the first input object (the main input file). For direct uploads, this first input should omit the url parameter, as the main input file is provided via the direct upload. This will create subtitles based on the audio track ingested from that main input file. Note that subtitle generation happens after initial ingest, so the generated tracks will be in the preparing state when the asset transitions to ready.

new_asset_settings.input[].generated_subtitles[].name
string
A name for this subtitle track.

new_asset_settings.input[].generated_subtitles[].passthrough
string
Arbitrary metadata set for the subtitle track. Max 255 characters.

new_asset_settings.input[].generated_subtitles[].language_code
string
(default: en)
Possible values:
"en"
"es"
"it"
"pt"
"de"
"fr"
"pl"
"ru"
"nl"
"ca"
"tr"
"sv"
"uk"
"no"
"fi"
"sk"
"el"
"cs"
"hr"
"da"
"ro"
"bg"
The language to generate subtitles in.

new_asset_settings.input[].start_time
number
The time offset in seconds from the beginning of the video indicating the clip's starting marker. The default value is 0 when not included. This parameter is only applicable for creating clips when input.url has mux://assets/{asset_id} format.

new_asset_settings.input[].end_time
number
The time offset in seconds from the beginning of the video, indicating the clip's ending marker. The default value is the duration of the video when not included. This parameter is only applicable for creating clips when input.url has mux://assets/{asset_id} format.

new_asset_settings.input[].type
string
Possible values:
"video"
"audio"
"text"
This parameter is required for text type tracks.

new_asset_settings.input[].text_type
string
Possible values:
"subtitles"
Type of text track. This parameter only supports subtitles value. For more information on Subtitles / Closed Captions, see this blog post. This parameter is required for text type tracks.

new_asset_settings.input[].language_code
string
The language code value must be a valid BCP 47 specification compliant value. For example, en for English or en-US for the US version of English. This parameter is required for text and audio track types.

new_asset_settings.input[].name
string
The name of the track containing a human-readable description. This value must be unique within each group of text or audio track types. The HLS manifest will associate a subtitle text track with this value. For example, the value should be "English" for a subtitle text track with language_code set to en. This optional parameter should be used only for text and audio type tracks. This parameter can be optionally provided for the first video input to denote the name of the muxed audio track if present. If this parameter is not included, Mux will auto-populate based on the input[].language_code value.

new_asset_settings.input[].closed_captions
boolean
Indicates the track provides Subtitles for the Deaf or Hard-of-hearing (SDH). This optional parameter should be used for tracks with type of text and text_type set to subtitles.

new_asset_settings.input[].passthrough
string
This optional parameter should be used tracks with type of text and text_type set to subtitles.

new_asset_settings.playback_policy
array
An array of playback policy names that you want applied to this asset and available through playback_ids. Options include:

"public" (anyone with the playback URL can stream the asset).
"signed" (an additional access token is required to play the asset).
If no playback_policy is set, the asset will have no playback IDs and will therefore not be playable. For simplicity, a single string name can be used in place of the array in the case of only one playback policy.

Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.


new_asset_settings.advanced_playback_policies
array
An array of playback policy objects that you want applied to this asset and available through playback_ids. advanced_playback_policies must be used instead of playback_policy when creating a DRM playback ID.

new_asset_settings.advanced_playback_policies[].policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

new_asset_settings.advanced_playback_policies[].drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

new_asset_settings.passthrough
string
Arbitrary user-supplied metadata that will be included in the asset details and related webhooks. Can be used to store your own ID for a video along with the asset. Max: 255 characters.

new_asset_settings.mp4_support
string
Possible values:
"none"
"capped-1080p"
"audio-only"
"audio-only,capped-1080p"
"standard" (Deprecated)
Specify what level of support for mp4 playback.

The capped-1080p option produces a single MP4 file, called capped-1080p.mp4, with the video resolution capped at 1080p. This option produces an audio.m4a file for an audio-only asset.
The audio-only option produces a single M4A file, called audio.m4a for a video or an audio-only asset. MP4 generation will error when this option is specified for a video-only asset.
The audio-only,capped-1080p option produces both the audio.m4a and capped-1080p.mp4 files. Only the capped-1080p.mp4 file is produced for a video-only asset, while only the audio.m4a file is produced for an audio-only asset.
The standard(deprecated) option produces up to three MP4 files with different levels of resolution (high.mp4, medium.mp4, low.mp4, or audio.m4a for an audio-only asset).

MP4 files are not produced for none (default).

In most cases you should use our default HLS-based streaming playback ({playback_id}.m3u8) which can automatically adjust to viewers' connection speeds, but an mp4 can be useful for some legacy devices or downloading for offline playback. See the Download your videos guide for more information.

new_asset_settings.normalize_audio
boolean
(default: false)
Normalize the audio track loudness level. This parameter is only applicable to on-demand (not live) assets.

new_asset_settings.master_access
string
Possible values:
"none"
"temporary"
Specify what level (if any) of support for master access. Master access can be enabled temporarily for your asset to be downloaded. See the Download your videos guide for more information.

new_asset_settings.test
boolean
Marks the asset as a test asset when the value is set to true. A Test asset can help evaluate the Mux Video APIs without incurring any cost. There is no limit on number of test assets created. Test asset are watermarked with the Mux logo, limited to 10 seconds, deleted after 24 hrs.

new_asset_settings.max_resolution_tier
string
Possible values:
"1080p"
"1440p"
"2160p"
Max resolution tier can be used to control the maximum resolution_tier your asset is encoded, stored, and streamed at. If not set, this defaults to 1080p.

new_asset_settings.encoding_tier
string
Deprecated
Possible values:
"smart"
"baseline"
"premium"
This field is deprecated. Please use video_quality instead. The encoding tier informs the cost, quality, and available platform features for the asset. The default encoding tier for an account can be set in the Mux Dashboard. See the video quality guide for more details.

new_asset_settings.video_quality
string
Possible values:
"basic"
"plus"
"premium"
The video quality controls the cost, quality, and available platform features for the asset. The default video quality for an account can be set in the Mux Dashboard. This field replaces the deprecated encoding_tier value. See the video quality guide for more details.

reconnect_window
number
(default: 60, min: 0, max: 1800)
When live streaming software disconnects from Mux, either intentionally or due to a drop in the network, the Reconnect Window is the time in seconds that Mux should wait for the streaming software to reconnect before considering the live stream finished and completing the recorded asset. Defaults to 60 seconds on the API if not specified.

If not specified directly, Standard Latency streams have a Reconnect Window of 60 seconds; Reduced and Low Latency streams have a default of 0 seconds, or no Reconnect Window. For that reason, we suggest specifying a value other than zero for Reduced and Low Latency streams.

Reduced and Low Latency streams with a Reconnect Window greater than zero will insert slate media into the recorded asset while waiting for the streaming software to reconnect or when there are brief interruptions in the live stream media. When using a Reconnect Window setting higher than 60 seconds with a Standard Latency stream, we highly recommend enabling slate with the use_slate_for_standard_latency option.

use_slate_for_standard_latency
boolean
(default: false)
By default, Standard Latency live streams do not have slate media inserted while waiting for live streaming software to reconnect to Mux. Setting this to true enables slate insertion on a Standard Latency stream.

reconnect_slate_url
string
The URL of the image file that Mux should download and use as slate media during interruptions of the live stream media. This file will be downloaded each time a new recorded asset is created from the live stream. If this is not set, the default slate media will be used.

passthrough
string
audio_only
boolean
Force the live stream to only process the audio track when the value is set to true. Mux drops the video track if broadcasted.


embedded_subtitles
array
Describe the embedded closed caption contents of the incoming live stream.

embedded_subtitles[].name
string
A name for this live stream closed caption track.

embedded_subtitles[].passthrough
string
Arbitrary user-supplied metadata set for the live stream closed caption track. Max 255 characters.

embedded_subtitles[].language_code
string
(default: en)
The language of the closed caption stream. Value must be BCP 47 compliant.

embedded_subtitles[].language_channel
string
(default: cc1)
Possible values:
"cc1"
"cc2"
"cc3"
"cc4"
CEA-608 caption channel to read data from.


generated_subtitles
array
Configure the incoming live stream to include subtitles created with automatic speech recognition. Each Asset created from a live stream with generated_subtitles configured will automatically receive two text tracks. The first of these will have a text_source value of generated_live, and will be available with ready status as soon as the stream is live. The second text track will have a text_source value of generated_live_final and will contain subtitles with improved accuracy, timing, and formatting. However, generated_live_final tracks will not be available in ready status until the live stream ends. If an Asset has both generated_live and generated_live_final tracks that are ready, then only the generated_live_final track will be included during playback.

generated_subtitles[].name
string
A name for this live stream subtitle track.

generated_subtitles[].passthrough
string
Arbitrary metadata set for the live stream subtitle track. Max 255 characters.

generated_subtitles[].language_code
string
(default: en)
Possible values:
"en"
"en-US"
The language to generate subtitles in.

generated_subtitles[].transcription_vocabulary_ids
array
Unique identifiers for existing Transcription Vocabularies to use while generating subtitles for the live stream. If the Transcription Vocabularies provided collectively have more than 1000 phrases, only the first 1000 phrases will be included.

latency_mode
string
Possible values:
"low"
"reduced"
"standard"
Latency is the time from when the streamer transmits a frame of video to when you see it in the player. Set this as an alternative to setting low latency or reduced latency flags.

test
boolean
Marks the live stream as a test live stream when the value is set to true. A test live stream can help evaluate the Mux Video APIs without incurring any cost. There is no limit on number of test live streams created. Test live streams are watermarked with the Mux logo and limited to 5 minutes. The test live stream is disabled after the stream is active for 5 mins and the recorded asset also deleted after 24 hours.


simulcast_targets
array
simulcast_targets[].passthrough
string
Arbitrary user-supplied metadata set by you when creating a simulcast target.

simulcast_targets[].stream_key
string
Stream Key represents a stream identifier on the third party live streaming service to send the parent live stream to. Only used for RTMP(s) simulcast destinations.

simulcast_targets[].url
string
The RTMP(s) or SRT endpoint for a simulcast destination.

For RTMP(s) destinations, this should include the application name for the third party live streaming service, for example: rtmp://live.example.com/app.
For SRT destinations, this should be a fully formed SRT connection string, for example: srt://srt-live.example.com:1234?streamid={stream_key}&passphrase={srt_passphrase}.
Note: SRT simulcast targets can only be used when an source is connected over SRT.

max_continuous_duration
integer
(default: 43200, min: 60, max: 43200)
The time in seconds a live stream may be continuously active before being disconnected. Defaults to 12 hours.

post
201
/video/v1/live-streams
Request
(application/json)
copy
{
  "playback_policy": [
    "public"
  ],
  "new_asset_settings": {
    "playback_policy": [
      "public"
    ]
  }
}
Response
(application/json)
copy
{
  "data": {
    "stream_key": "abcdefgh",
    "status": "idle",
    "reconnect_window": 60,
    "playback_ids": [
      {
        "policy": "public",
        "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
      }
    ],
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ]
    },
    "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "created_at": "1609937654",
    "latency_mode": "standard",
    "max_continuous_duration": 43200
  }
}
List live streams
get
Lists the live streams that currently exist in the current environment.

copy
curl https://api.mux.com/video/v1/live-streams \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

stream_key
string
Filter response to return live stream for this stream key only

status
string
Possible values:
"active"
"idle"
"disabled"
Filter response to return live streams with the specified status only. idle indicates that there is no active broadcast. active indicates that there is an active broadcast and disabled status indicates that no future RTMP streams can be published.

get
200
/video/v1/live-streams
Response
(application/json)
copy
{
  "data": [
    {
      "stream_key": "831b5bde-cd8a-5bc4-115d-4ba34b19f481",
      "status": "idle",
      "reconnect_window": 60,
      "playback_ids": [
        {
          "policy": "public",
          "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
        }
      ],
      "new_asset_settings": {
        "playback_policies": [
          "public"
        ]
      },
      "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
      "created_at": "1609937654",
      "latency_mode": "standard",
      "max_continuous_duration": 43200
    },
    {
      "stream_key": "d273c65e-1fc8-27dc-e9ef-56144cbceb3a",
      "status": "idle",
      "reconnect_window": 60,
      "recent_asset_ids": [
        "SZs02xxHgYdkHp00OSCjJiHUHqzVQZNU332XPXRxe341o",
        "e4J9cwb5tjVxMeeV8201dC00i800ThPKKGT2SEN002dHH2s"
      ],
      "playback_ids": [
        {
          "policy": "public",
          "id": "00zOcribkUmXqXHzBTpflk2771BRTcKATqPjWf7JHpuM"
        }
      ],
      "new_asset_settings": {
        "playback_policies": [
          "public"
        ]
      },
      "id": "B65hEUWW01ErVKDDGImKcBquYhwEAkjW6Ic3lPY0299Cc",
      "created_at": "1607587513",
      "latency_mode": "standard",
      "max_continuous_duration": 43200
    }
  ]
}
Retrieve a live stream
get
Retrieves the details of a live stream that has previously been created. Supply the unique live stream ID that was returned from your previous request, and Mux will return the corresponding live stream information. The same information is returned when creating a live stream.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID} \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

get
200
/video/v1/live-streams/{LIVE_STREAM_ID}
Response
(application/json)
copy
{
  "data": {
    "stream_key": "831b5bde-cd8a-5bc4-115d-4ba34b19f481",
    "status": "idle",
    "reconnect_window": 60,
    "playback_ids": [
      {
        "policy": "public",
        "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
      }
    ],
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ]
    },
    "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "created_at": "1609937654",
    "latency_mode": "standard",
    "max_continuous_duration": 43200
  }
}
Delete a live stream
del
Deletes a live stream from the current environment. If the live stream is currently active and being streamed to, ingest will be terminated and the encoder will be disconnected.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

del
204
/video/v1/live-streams/{LIVE_STREAM_ID}
Update a live stream
patch
Updates the parameters of a previously-created live stream. This currently supports a subset of variables. Supply the live stream ID and the updated parameters and Mux will return the corresponding live stream information. The information returned will be the same after update as for subsequent get live stream requests.

Request body params
passthrough
string
Arbitrary user-supplied metadata set for the live stream. Max 255 characters. In order to clear this value, the field should be included with an empty-string value.

latency_mode
string
Possible values:
"low"
"reduced"
"standard"
Latency is the time from when the streamer transmits a frame of video to when you see it in the player. Set this as an alternative to setting low latency or reduced latency flags.

reconnect_window
number
(default: 60, min: 0, max: 1800)
When live streaming software disconnects from Mux, either intentionally or due to a drop in the network, the Reconnect Window is the time in seconds that Mux should wait for the streaming software to reconnect before considering the live stream finished and completing the recorded asset.

If not specified directly, Standard Latency streams have a Reconnect Window of 60 seconds; Reduced and Low Latency streams have a default of 0 seconds, or no Reconnect Window. For that reason, we suggest specifying a value other than zero for Reduced and Low Latency streams.

Reduced and Low Latency streams with a Reconnect Window greater than zero will insert slate media into the recorded asset while waiting for the streaming software to reconnect or when there are brief interruptions in the live stream media. When using a Reconnect Window setting higher than 60 seconds with a Standard Latency stream, we highly recommend enabling slate with the use_slate_for_standard_latency option.

use_slate_for_standard_latency
boolean
(default: false)
By default, Standard Latency live streams do not have slate media inserted while waiting for live streaming software to reconnect to Mux. Setting this to true enables slate insertion on a Standard Latency stream.

reconnect_slate_url
string
The URL of the image file that Mux should download and use as slate media during interruptions of the live stream media. This file will be downloaded each time a new recorded asset is created from the live stream. Set this to a blank string to clear the value so that the default slate media will be used.

max_continuous_duration
integer
(default: 43200, min: 60, max: 43200)
The time in seconds a live stream may be continuously active before being disconnected. Defaults to 12 hours.


new_asset_settings
object
Updates the new asset settings to use to generate a new asset for this live stream. Only the mp4_support, master_access, and video_quality settings may be updated.

new_asset_settings.mp4_support
string
Possible values:
"none"
"capped-1080p"
"audio-only"
"audio-only,capped-1080p"
"standard" (Deprecated)
Specify what level of support for mp4 playback should be added to new assets generated from this live stream.

The none option disables MP4 support for new assets. MP4 files will not be produced for an asset generated from this live stream.
The capped-1080p option produces a single MP4 file, called capped-1080p.mp4, with the video resolution capped at 1080p. This option produces an audio.m4a file for an audio-only asset.
The audio-only option produces a single M4A file, called audio.m4a for a video or an audio-only asset. MP4 generation will error when this option is specified for a video-only asset.
The audio-only,capped-1080p option produces both the audio.m4a and capped-1080p.mp4 files. Only the capped-1080p.mp4 file is produced for a video-only asset, while only the audio.m4a file is produced for an audio-only asset.
The standard(deprecated) option produces up to three MP4 files with different levels of resolution (high.mp4, medium.mp4, low.mp4, or audio.m4a for an audio-only asset).
new_asset_settings.master_access
string
Possible values:
"temporary"
"none"
Add or remove access to the master version of the video.

new_asset_settings.video_quality
string
Possible values:
"plus"
"premium"
The video quality controls the cost, quality, and available platform features for the asset. See the video quality guide for more details.

Request path & query params
LIVE_STREAM_ID
string
The live stream ID

patch
200
/video/v1/live-streams/{LIVE_STREAM_ID}
Request
(application/json)
copy
{
  "latency_mode": "standard",
  "reconnect_window": 30,
  "max_continuous_duration": 1200
}
Response
(application/json)
copy
{
  "data": {
    "stream_key": "831b5bde-cd8a-5bc4-115d-4ba34b19f481",
    "status": "idle",
    "reconnect_window": 30,
    "playback_ids": [
      {
        "policy": "public",
        "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
      }
    ],
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ]
    },
    "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "created_at": "1609937654",
    "latency_mode": "standard",
    "max_continuous_duration": 1200
  }
}
Create a live stream playback ID
post
Create a new playback ID for this live stream, through which a viewer can watch the streamed content of the live stream.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/playback-ids \
  -X POST \
  -d '{ "policy": "public" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

Request path & query params
LIVE_STREAM_ID
string
The live stream ID

post
201
/video/v1/live-streams/{LIVE_STREAM_ID}/playback-ids
Request
(application/json)
copy
{
  "policy": "signed"
}
Response
(application/json)
copy
{
  "data": {
    "policy": "public",
    "id": "4O902oOPU100s7XIQgOeY01U7dHzYlBe26zi3Sq01EJqnxw"
  }
}
Retrieve a live stream playback ID
get
Fetches information about a live stream's playback ID, through which a viewer can watch the streamed content from this live stream.

Request path & query params
LIVE_STREAM_ID
string
The live stream ID

PLAYBACK_ID
string
The asset or live stream's playback ID.

get
200
/video/v1/live-streams/{LIVE_STREAM_ID}/playback-ids/{PLAYBACK_ID}
Response
(application/json)
copy
{
  "data": {
    "policy": "public",
    "id": "4O902oOPU100s7XIQgOeY01U7dHzYlBe26zi3Sq01EJqnxw"
  }
}
Delete a live stream playback ID
del
Deletes the playback ID for the live stream. This will not disable ingest (as the live stream still exists). New attempts to play back the live stream will fail immediately. However, current viewers will be able to continue watching the stream for some period of time.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/playback-ids/${PLAYBACK_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

PLAYBACK_ID
string
The asset or live stream's playback ID.

del
204
/video/v1/live-streams/{LIVE_STREAM_ID}/playback-ids/{PLAYBACK_ID}
Reset a live stream's stream key
post
Reset a live stream key if you want to immediately stop the current stream key from working and create a new stream key that can be used for future broadcasts.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/reset-stream-key \
  -X POST \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

post
201
/video/v1/live-streams/{LIVE_STREAM_ID}/reset-stream-key
Response
(application/json)
copy
{
  "data": {
    "stream_key": "acaf2ca1-ba9c-5ffe-8c9c-a02bbf0009a6",
    "status": "idle",
    "reconnect_window": 60,
    "playback_ids": [
      {
        "policy": "public",
        "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
      },
      {
        "policy": "public",
        "id": "4O902oOPU100s7XIQgOeY01U7dHzYlBe26zi3Sq01EJqnxw"
      }
    ],
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ]
    },
    "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "created_at": "1609937654",
    "latency_mode": "standard",
    "max_continuous_duration": 43200
  }
}
Signal a live stream is finished
put
(Optional) End the live stream recording immediately instead of waiting for the reconnect_window. EXT-X-ENDLIST tag is added to the HLS manifest which notifies the player that this live stream is over.

Mux does not close the encoder connection immediately. Encoders are often configured to re-establish connections immediately which would result in a new recorded asset. For this reason, Mux waits for 60s before closing the connection with the encoder. This 60s timeframe is meant to give encoder operators a chance to disconnect from their end.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/complete \
  -X PUT \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

put
200
/video/v1/live-streams/{LIVE_STREAM_ID}/complete
Response
(application/json)
copy
{
  "data": {}
}
Disable a live stream
put
Disables a live stream, making it reject incoming RTMP streams until re-enabled. The API also ends the live stream recording immediately when active. Ending the live stream recording adds the EXT-X-ENDLIST tag to the HLS manifest which notifies the player that this live stream is over.

Mux also closes the encoder connection immediately. Any attempt from the encoder to re-establish connection will fail till the live stream is re-enabled.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/disable \
  -X PUT \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

put
200
/video/v1/live-streams/{LIVE_STREAM_ID}/disable
Response
(application/json)
copy
{
  "data": {}
}
Enable a live stream
put
Enables a live stream, allowing it to accept an incoming RTMP stream.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/enable \
  -X PUT \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

put
200
/video/v1/live-streams/{LIVE_STREAM_ID}/enable
Response
(application/json)
copy
{
  "data": {}
}
Update a live stream's embedded subtitles
put
Configures a live stream to receive embedded closed captions. The resulting Asset's subtitle text track will have closed_captions: true set.

Request body params

embedded_subtitles
array
Describe the embedded closed caption contents of the incoming live stream.

embedded_subtitles[].name
string
A name for this live stream closed caption track.

embedded_subtitles[].passthrough
string
Arbitrary user-supplied metadata set for the live stream closed caption track. Max 255 characters.

embedded_subtitles[].language_code
string
(default: en)
The language of the closed caption stream. Value must be BCP 47 compliant.

embedded_subtitles[].language_channel
string
(default: cc1)
Possible values:
"cc1"
"cc2"
"cc3"
"cc4"
CEA-608 caption channel to read data from.

Request path & query params
LIVE_STREAM_ID
string
The live stream ID

put
200
/video/v1/live-streams/{LIVE_STREAM_ID}/embedded-subtitles
Request
(application/json)
copy
{
  "embedded_subtitles": [
    {
      "passthrough": "Example"
    }
  ]
}
Response
(application/json)
copy
{
  "data": {
    "stream_key": "acaf2ca1-ba9c-5ffe-8c9c-a02bbf0009a6",
    "status": "idle",
    "reconnect_window": 60,
    "playback_ids": [
      {
        "policy": "public",
        "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
      },
      {
        "policy": "public",
        "id": "4O902oOPU100s7XIQgOeY01U7dHzYlBe26zi3Sq01EJqnxw"
      }
    ],
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ]
    },
    "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "created_at": "1609937654",
    "embedded_subtitles": [
      {
        "name": "English CC",
        "language_code": "en",
        "language_channel": "cc1",
        "passthrough": "Example"
      }
    ],
    "latency_mode": "standard",
    "max_continuous_duration": 43200
  }
}
Update a live stream's generated subtitles
put
Updates a live stream's automatic-speech-recognition-generated subtitle configuration. Automatic speech recognition subtitles can be removed by sending an empty array in the request payload.

Request body params

generated_subtitles
array
Update automated speech recognition subtitle configuration for a live stream. At most one subtitle track is allowed.

generated_subtitles[].name
string
A name for this live stream subtitle track.

generated_subtitles[].passthrough
string
Arbitrary metadata set for the live stream subtitle track. Max 255 characters.

generated_subtitles[].language_code
string
(default: en)
Possible values:
"en"
"en-US"
The language to generate subtitles in.

generated_subtitles[].transcription_vocabulary_ids
array
Unique identifiers for existing Transcription Vocabularies to use while generating subtitles for the live stream. If the Transcription Vocabularies provided collectively have more than 1000 phrases, only the first 1000 phrases will be included.

Request path & query params
LIVE_STREAM_ID
string
The live stream ID

put
200
/video/v1/live-streams/{LIVE_STREAM_ID}/generated-subtitles
Request
(application/json)
copy
{
  "generated_subtitles": [
    {
      "name": "English CC (ASR)",
      "language_code": "en",
      "passthrough": "Example"
    }
  ]
}
Response
(application/json)
copy
{
  "data": {
    "stream_key": "acaf2ca1-ba9c-5ffe-8c9c-a02bbf0009a6",
    "status": "idle",
    "reconnect_window": 60,
    "playback_ids": [
      {
        "policy": "public",
        "id": "HNRDuwff3K2VjTZZAPuvd2Kx6D01XUQFv02GFBHPUka018"
      },
      {
        "policy": "public",
        "id": "4O902oOPU100s7XIQgOeY01U7dHzYlBe26zi3Sq01EJqnxw"
      }
    ],
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ]
    },
    "id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "created_at": "1609937654",
    "generated_subtitles": [
      {
        "name": "English CC (ASR)",
        "language_code": "en",
        "passthrough": "Example"
      }
    ]
  }
}
Create a live stream simulcast target
post
Create a simulcast target for the parent live stream. Simulcast target can only be created when the parent live stream is in idle state. Only one simulcast target can be created at a time with this API.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/simulcast-targets \
  -X POST \
  -d '{"url": "rtmp://live.example.com/app", "stream_key": "abcdefgh", "passthrough":"Example"}' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
passthrough
string
Arbitrary user-supplied metadata set by you when creating a simulcast target.

stream_key
string
Stream Key represents a stream identifier on the third party live streaming service to send the parent live stream to. Only used for RTMP(s) simulcast destinations.

url
string
The RTMP(s) or SRT endpoint for a simulcast destination.

For RTMP(s) destinations, this should include the application name for the third party live streaming service, for example: rtmp://live.example.com/app.
For SRT destinations, this should be a fully formed SRT connection string, for example: srt://srt-live.example.com:1234?streamid={stream_key}&passphrase={srt_passphrase}.
Note: SRT simulcast targets can only be used when an source is connected over SRT.

Request path & query params
LIVE_STREAM_ID
string
The live stream ID

post
201
/video/v1/live-streams/{LIVE_STREAM_ID}/simulcast-targets
Request
(application/json)
copy
{
  "url": "rtmp://live.example.com/app",
  "stream_key": "abcdefgh",
  "passthrough": "Example"
}
Response
(application/json)
copy
{
  "data": {
    "url": "rtmp://live.example.com/app",
    "stream_key": "abcdefgh",
    "status": "idle",
    "passthrough": "Example",
    "id": "le1axfGDc9ETqh6trHNTxGQ9XEhj02fOnX0200aAh24fwlmwzqKCYNJgw"
  }
}
Delete a live stream simulcast target
del
Delete the simulcast target using the simulcast target ID returned when creating the simulcast target. Simulcast Target can only be deleted when the parent live stream is in idle state.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/simulcast-targets/${SIMULCAST_TARGET_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

SIMULCAST_TARGET_ID
string
The ID of the simulcast target.

del
204
/video/v1/live-streams/{LIVE_STREAM_ID}/simulcast-targets/{SIMULCAST_TARGET_ID}
Retrieve a live stream simulcast target
get
Retrieves the details of the simulcast target created for the parent live stream. Supply the unique live stream ID and simulcast target ID that was returned in the response of create simulcast target request, and Mux will return the corresponding information.

copy
curl https://api.mux.com/video/v1/live-streams/${LIVE_STREAM_ID}/simulcast-targets/${SIMULCAST_TARGET_ID} \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
LIVE_STREAM_ID
string
The live stream ID

SIMULCAST_TARGET_ID
string
The ID of the simulcast target.

get
200
/video/v1/live-streams/{LIVE_STREAM_ID}/simulcast-targets/{SIMULCAST_TARGET_ID}
Response
(application/json)
copy
{
  "data": {
    "url": "rtmp://live.example.com/app",
    "stream_key": "abcdefgh",
    "status": "idle",
    "passthrough": "Example",
    "id": "02FU00rPq00fC9S6kygrqlxygGMdpW1lk00BkFpCfc2kGregEIr7brt7CQ"
  }
}
Playback ID
Operations related to the manipulation of playback IDs, through which users are able to stream videos and live streams from Mux.


Properties
id
string
Unique identifier for the PlaybackID

policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

Retrieve an asset or live stream ID
get
Retrieves the Identifier of the Asset or Live Stream associated with the Playback ID.

Request path & query params
PLAYBACK_ID
string
The asset or live stream's playback ID.

get
200
/video/v1/playback-ids/{PLAYBACK_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "a1B2c3D4e5F6g7H8i9",
    "policy": "public",
    "object": {
      "type": "asset",
      "id": "123456789012345678"
    }
  }
}
URL Signing Keys
A URL signing key is used as the secret when signing any Mux URL. Mux requires a JSON Web Token as the value of the token query parameter. The token query parameter must be set for URLs that reference a playback ID with a signed playback policy.


Properties
id
string
Unique identifier for the Signing Key.

created_at
string
Time at which the object was created. Measured in seconds since the Unix epoch.

private_key
string
A Base64 encoded private key that can be used with the RS256 algorithm when creating a JWT. Note that this value is only returned once when creating a URL signing key.

Create a URL signing key
post
Deprecated
This route is now deprecated, please use the Signing Keys API. Creates a new signing key pair. When creating a new signing key, the API will generate a 2048-bit RSA key-pair and return the private key and a generated key-id; the public key will be stored at Mux to validate signed tokens.

Note: Any new access tokens authenticating this route will be required to have System level permissions.

copy
curl https://api.mux.com/video/v1/signing-keys \
  -X POST \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
post
201
/video/v1/signing-keys
Response
(application/json)
copy
{
  "data": {
    "private_key": "abcd123=",
    "id": "vI5KTQ78ohYriuvWKHY6COtZWXexHGLllxksOdZuya8",
    "created_at": "1610108345"
  }
}
List URL signing keys
get
Deprecated
This route is now deprecated, please use the Signing Keys API. Returns a list of URL signing keys.

Note: Any new access tokens authenticating this route will be required to have System level permissions.

copy
curl https://api.mux.com/video/v1/signing-keys \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

get
200
/video/v1/signing-keys
Response
(application/json)
copy
{
  "data": [
    {
      "id": "vI5KTQ78ohYriuvWKHY6COtZWXexHGLllxksOdZuya8",
      "created_at": "1610108345"
    },
    {
      "id": "jc6lJiCLMjyC202EXtRQ644sShzDv6x5tWJrbvUFpvmo",
      "created_at": "1608632647"
    }
  ]
}
Retrieve a URL signing key
get
Deprecated
This route is now deprecated, please use the Signing Keys API. Retrieves the details of a URL signing key that has previously been created. Supply the unique signing key ID that was returned from your previous request, and Mux will return the corresponding signing key information. The private key is not returned in this response.

Note: Any new access tokens authenticating this route will be required to have System level permissions.

copy
curl https://api.mux.com/video/v1/signing-keys/${SIGNING_KEY_ID} \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
SIGNING_KEY_ID
string
The ID of the signing key.

get
200
/video/v1/signing-keys/{SIGNING_KEY_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "jc6lJiCLMjyC202EXtRQ644sShzDv6x5tWJrbvUFpvmo",
    "created_at": "1608632647"
  }
}
Delete a URL signing key
del
Deprecated
This route is now deprecated, please use the Signing Keys API. Deletes an existing signing key. Use with caution, as this will invalidate any existing signatures and no URLs can be signed using the key again.

Note: Any new access tokens authenticating this route will be required to have System level permissions.

copy
url https://api.mux.com/video/v1/signing-keys/${SIGNING_KEY_ID} \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
SIGNING_KEY_ID
string
The ID of the signing key.

del
204
/video/v1/signing-keys/{SIGNING_KEY_ID}
Direct Uploads
Direct upload allows you to push assets directly to Mux storage instead of needing to go through your own first. When you create a new direct upload, we'll give you back a signed URL for a Google Cloud Storage bucket. Their storage API is S3 compatible, so whatever tool you use to upload to either GCS or S3 should work, just remember you're probably uploading large video files and should take advantage of things like resumable or multipart uploads.

Particularly for customers that deal with a lot of user-generated content, it's common to expect quite a few abandoned uploads. To keep those abandoned uploads from cluttering up your asset lists, we don't create an asset for you until the upload is complete. Once that asset is created, you can expect all of the normal asset-related webhooks.


Properties
id
string
Unique identifier for the Direct Upload.

timeout
integer (default: 3600, minimum: 60, maximum: 604800)
Max time in seconds for the signed upload URL to be valid. If a successful upload has not occurred before the timeout limit, the direct upload is marked timed_out

status
string
Possible values:
"waiting"
"asset_created"
"errored"
"cancelled"
"timed_out"
new_asset_settings
object
The settings to be used when creating a new asset. You can use any of the usual settings when creating an asset normally, with the exception to not include file url for creating the asset in input. You could optionally add overlay_setting and input urls to add Subtitles / Captions.

asset_id
string
Only set once the upload is in the asset_created state.

error
object
Only set if an error occurred during asset creation.

error.type
string
Label for the specific error

error.message
string
Human readable error message

cors_origin
string
If the upload URL will be used in a browser, you must specify the origin in order for the signed URL to have the correct CORS headers.

url
string
The URL to upload the associated source media to.

test
boolean
Indicates if this is a test Direct Upload, in which case the Asset that gets created will be a test Asset.

Create a new direct upload URL
post
Creates a new direct upload, through which video content can be uploaded for ingest to Mux.

copy
curl https://api.mux.com/video/v1/uploads \
  -X POST \
  -d '{ "cors_origin": "*", "new_asset_settings": { "playback_policy": ["public"], "video_quality": "basic" } }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
timeout
integer
(default: 3600, min: 60, max: 604800)
Max time in seconds for the signed upload URL to be valid. If a successful upload has not occurred before the timeout limit, the direct upload is marked timed_out

cors_origin
string
If the upload URL will be used in a browser, you must specify the origin in order for the signed URL to have the correct CORS headers.


new_asset_settings
object

new_asset_settings.input
array
An array of objects that each describe an input file to be used to create the asset. As a shortcut, input can also be a string URL for a file when only one input file is used. See input[].url for requirements.

new_asset_settings.input[].url
string
The URL of the file that Mux should download and use.

For the main input file, this should be the URL to the muxed file for Mux to download, for example an MP4, MOV, MKV, or TS file. Mux supports most audio/video file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For audio tracks, the URL is the location of the audio file for Mux to download, for example an M4A, WAV, or MP3 file. Mux supports most audio file formats and codecs, but for fastest processing, you should use standard inputs wherever possible.
For text tracks, the URL is the location of subtitle/captions file. Mux supports SubRip Text (SRT) and Web Video Text Tracks formats for ingesting Subtitles and Closed Captions.
For Watermarking or Overlay, the URL is the location of the watermark image. The maximum size is 4096x4096.
When creating clips from existing Mux assets, the URL is defined with mux://assets/{asset_id} template where asset_id is the Asset Identifier for creating the clip from.
The url property may be omitted on the first input object when providing asset settings for LiveStream and Upload objects, in order to configure settings related to the primary (live stream or direct upload) input.

new_asset_settings.input[].overlay_settings
object
An object that describes how the image file referenced in URL should be placed over the video (i.e. watermarking). Ensure that the URL is active and persists the entire lifespan of the video object.

new_asset_settings.input[].overlay_settings.vertical_align
string
Possible values:
"top"
"middle"
"bottom"
Where the vertical positioning of the overlay/watermark should begin from. Defaults to "top"

new_asset_settings.input[].overlay_settings.vertical_margin
string
The distance from the vertical_align starting point and the image's closest edge. Can be expressed as a percent ("10%") or as a pixel value ("100px"). Negative values will move the overlay offscreen. In the case of 'middle', a positive value will shift the overlay towards the bottom and and a negative value will shift it towards the top.

new_asset_settings.input[].overlay_settings.horizontal_align
string
Possible values:
"left"
"center"
"right"
Where the horizontal positioning of the overlay/watermark should begin from.

new_asset_settings.input[].overlay_settings.horizontal_margin
string
The distance from the horizontal_align starting point and the image's closest edge. Can be expressed as a percent ("10%") or as a pixel value ("100px"). Negative values will move the overlay offscreen. In the case of 'center', a positive value will shift the image towards the right and and a negative value will shift it towards the left.

new_asset_settings.input[].overlay_settings.width
string
How wide the overlay should appear. Can be expressed as a percent ("10%") or as a pixel value ("100px"). If both width and height are left blank the width will be the true pixels of the image, applied as if the video has been scaled to fit a 1920x1080 frame. If height is supplied with no width, the width will scale proportionally to the height.

new_asset_settings.input[].overlay_settings.height
string
How tall the overlay should appear. Can be expressed as a percent ("10%") or as a pixel value ("100px"). If both width and height are left blank the height will be the true pixels of the image, applied as if the video has been scaled to fit a 1920x1080 frame. If width is supplied with no height, the height will scale proportionally to the width.

new_asset_settings.input[].overlay_settings.opacity
string
How opaque the overlay should appear, expressed as a percent. (Default 100%)


new_asset_settings.input[].generated_subtitles
array
Generate subtitle tracks using automatic speech recognition with this configuration. This may only be provided for the first input object (the main input file). For direct uploads, this first input should omit the url parameter, as the main input file is provided via the direct upload. This will create subtitles based on the audio track ingested from that main input file. Note that subtitle generation happens after initial ingest, so the generated tracks will be in the preparing state when the asset transitions to ready.

new_asset_settings.input[].generated_subtitles[].name
string
A name for this subtitle track.

new_asset_settings.input[].generated_subtitles[].passthrough
string
Arbitrary metadata set for the subtitle track. Max 255 characters.

new_asset_settings.input[].generated_subtitles[].language_code
string
(default: en)
Possible values:
"en"
"es"
"it"
"pt"
"de"
"fr"
"pl"
"ru"
"nl"
"ca"
"tr"
"sv"
"uk"
"no"
"fi"
"sk"
"el"
"cs"
"hr"
"da"
"ro"
"bg"
The language to generate subtitles in.

new_asset_settings.input[].start_time
number
The time offset in seconds from the beginning of the video indicating the clip's starting marker. The default value is 0 when not included. This parameter is only applicable for creating clips when input.url has mux://assets/{asset_id} format.

new_asset_settings.input[].end_time
number
The time offset in seconds from the beginning of the video, indicating the clip's ending marker. The default value is the duration of the video when not included. This parameter is only applicable for creating clips when input.url has mux://assets/{asset_id} format.

new_asset_settings.input[].type
string
Possible values:
"video"
"audio"
"text"
This parameter is required for text type tracks.

new_asset_settings.input[].text_type
string
Possible values:
"subtitles"
Type of text track. This parameter only supports subtitles value. For more information on Subtitles / Closed Captions, see this blog post. This parameter is required for text type tracks.

new_asset_settings.input[].language_code
string
The language code value must be a valid BCP 47 specification compliant value. For example, en for English or en-US for the US version of English. This parameter is required for text and audio track types.

new_asset_settings.input[].name
string
The name of the track containing a human-readable description. This value must be unique within each group of text or audio track types. The HLS manifest will associate a subtitle text track with this value. For example, the value should be "English" for a subtitle text track with language_code set to en. This optional parameter should be used only for text and audio type tracks. This parameter can be optionally provided for the first video input to denote the name of the muxed audio track if present. If this parameter is not included, Mux will auto-populate based on the input[].language_code value.

new_asset_settings.input[].closed_captions
boolean
Indicates the track provides Subtitles for the Deaf or Hard-of-hearing (SDH). This optional parameter should be used for tracks with type of text and text_type set to subtitles.

new_asset_settings.input[].passthrough
string
This optional parameter should be used tracks with type of text and text_type set to subtitles.

new_asset_settings.playback_policy
array
An array of playback policy names that you want applied to this asset and available through playback_ids. Options include:

"public" (anyone with the playback URL can stream the asset).
"signed" (an additional access token is required to play the asset).
If no playback_policy is set, the asset will have no playback IDs and will therefore not be playable. For simplicity, a single string name can be used in place of the array in the case of only one playback policy.

Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.


new_asset_settings.advanced_playback_policies
array
An array of playback policy objects that you want applied to this asset and available through playback_ids. advanced_playback_policies must be used instead of playback_policy when creating a DRM playback ID.

new_asset_settings.advanced_playback_policies[].policy
string
Possible values:
"public"
"signed"
"drm"
public playback IDs are accessible by constructing an HLS URL like https://stream.mux.com/${PLAYBACK_ID}

signed playback IDs should be used with tokens https://stream.mux.com/${PLAYBACK_ID}?token={TOKEN}. See Secure video playback for details about creating tokens.

drm playback IDs are protected with DRM technologies. See DRM documentation for more details.

new_asset_settings.advanced_playback_policies[].drm_configuration_id
string
The DRM configuration used by this playback ID. Must only be set when policy is set to drm.

new_asset_settings.passthrough
string
Arbitrary user-supplied metadata that will be included in the asset details and related webhooks. Can be used to store your own ID for a video along with the asset. Max: 255 characters.

new_asset_settings.mp4_support
string
Possible values:
"none"
"capped-1080p"
"audio-only"
"audio-only,capped-1080p"
"standard" (Deprecated)
Specify what level of support for mp4 playback.

The capped-1080p option produces a single MP4 file, called capped-1080p.mp4, with the video resolution capped at 1080p. This option produces an audio.m4a file for an audio-only asset.
The audio-only option produces a single M4A file, called audio.m4a for a video or an audio-only asset. MP4 generation will error when this option is specified for a video-only asset.
The audio-only,capped-1080p option produces both the audio.m4a and capped-1080p.mp4 files. Only the capped-1080p.mp4 file is produced for a video-only asset, while only the audio.m4a file is produced for an audio-only asset.
The standard(deprecated) option produces up to three MP4 files with different levels of resolution (high.mp4, medium.mp4, low.mp4, or audio.m4a for an audio-only asset).

MP4 files are not produced for none (default).

In most cases you should use our default HLS-based streaming playback ({playback_id}.m3u8) which can automatically adjust to viewers' connection speeds, but an mp4 can be useful for some legacy devices or downloading for offline playback. See the Download your videos guide for more information.

new_asset_settings.normalize_audio
boolean
(default: false)
Normalize the audio track loudness level. This parameter is only applicable to on-demand (not live) assets.

new_asset_settings.master_access
string
Possible values:
"none"
"temporary"
Specify what level (if any) of support for master access. Master access can be enabled temporarily for your asset to be downloaded. See the Download your videos guide for more information.

new_asset_settings.test
boolean
Marks the asset as a test asset when the value is set to true. A Test asset can help evaluate the Mux Video APIs without incurring any cost. There is no limit on number of test assets created. Test asset are watermarked with the Mux logo, limited to 10 seconds, deleted after 24 hrs.

new_asset_settings.max_resolution_tier
string
Possible values:
"1080p"
"1440p"
"2160p"
Max resolution tier can be used to control the maximum resolution_tier your asset is encoded, stored, and streamed at. If not set, this defaults to 1080p.

new_asset_settings.encoding_tier
string
Deprecated
Possible values:
"smart"
"baseline"
"premium"
This field is deprecated. Please use video_quality instead. The encoding tier informs the cost, quality, and available platform features for the asset. The default encoding tier for an account can be set in the Mux Dashboard. See the video quality guide for more details.

new_asset_settings.video_quality
string
Possible values:
"basic"
"plus"
"premium"
The video quality controls the cost, quality, and available platform features for the asset. The default video quality for an account can be set in the Mux Dashboard. This field replaces the deprecated encoding_tier value. See the video quality guide for more details.

test
boolean
Indicates if this is a test Direct Upload, in which case the Asset that gets created will be a test Asset.

post
201
/video/v1/uploads
Request
(application/json)
copy
{
  "cors_origin": "https://example.com/",
  "new_asset_settings": {
    "playback_policy": [
      "public"
    ]
  }
}
Response
(application/json)
copy
{
  "data": {
    "url": "https://storage.googleapis.com/video-storage-us-east1-uploads/zd01Pe2bNpYhxbrwYABgFE01twZdtv4M00kts2i02GhbGjc?Expires=1610112458&GoogleAccessId=mux-direct-upload%40mux-cloud.iam.gserviceaccount.com&Signature=LCu4PMoKUo%2BJkWQAUwB9WU4bWVVfW3K5bZxSxEptBz3DrjbFxNyGvs0sriyJupZh9Jdb6FxKWFIRbxEetfnAAiesOvSPH%2F1GlIichmGg3YfebfxiX77%2B6ToFF6FMkJucBo284PD90AVLHhKagOea2VsbdO0fh78MAxGH9sEspyQ2uJEfYWjHFqYQ9smJyIuM3CYOmN5HKPgRWy2yUqzV7OTMe%2FivPO4%2FX6XiiN2J4nTmy83252CJUsHIvbiGctfKxcNI6b23UVN4B1tJTVgyxTOZiBQCkMLkD%2FEe5OhoAkvJgkqENRr0q3swO0IChDDWjrh7OTMwqvWGwAoVXEGiHg%3D%3D&upload_id=ABg5-UznTdib1HhOAMjdHhWIYqBbwmSYM6dVKyPe3v33uTeEE8gkN5QzvR3cei6uSZOSrjPn7bdvvDH3nhsrLBq8AjWY2qE4UQ",
    "timeout": 3600,
    "status": "waiting",
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ],
      "video_quality": "basic"
    },
    "id": "zd01Pe2bNpYhxbrwYABgFE01twZdtv4M00kts2i02GhbGjc",
    "cors_origin": "https://example.com/"
  }
}
List direct uploads
get
Lists direct uploads in the current environment.

copy
curl https://api.mux.com/video/v1/uploads \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

get
200
/video/v1/uploads
Response
(application/json)
copy
{
  "data": [
    {
      "url": "https://storage.googleapis.com/video-storage-us-east1-uploads/zd01Pe2bNpYhxbrwYABgFE01twZdtv4M00kts2i02GhbGjc?Expires=1610112458&GoogleAccessId=mux-direct-upload%40mux-cloud.iam.gserviceaccount.com&Signature=LCu4PMoKUo%2BJkWQAUwB9WU4bWVVfW3K5bZxSxEptBz3DrjbFxNyGvs0sriyJupZh9Jdb6FxKWFIRbxEetfnAAiesOvSPH%2F1GlIichmGg3YfebfxiX77%2B6ToFF6FMkJucBo284PD90AVLHhKagOea2VsbdO0fh78MAxGH9sEspyQ2uJEfYWjHFqYQ9smJyIuM3CYOmN5HKPgRWy2yUqzV7OTMe%2FivPO4%2FX6XiiN2J4nTmy83252CJUsHIvbiGctfKxcNI6b23UVN4B1tJTVgyxTOZiBQCkMLkD%2FEe5OhoAkvJgkqENRr0q3swO0IChDDWjrh7OTMwqvWGwAoVXEGiHg%3D%3D&upload_id=ABg5-UznTdib1HhOAMjdHhWIYqBbwmSYM6dVKyPe3v33uTeEE8gkN5QzvR3cei6uSZOSrjPn7bdvvDH3nhsrLBq8AjWY2qE4UQ",
      "timeout": 3600,
      "status": "waiting",
      "new_asset_settings": {
        "playback_policies": [
          "public"
        ],
        "video_quality": "basic"
      },
      "id": "zd01Pe2bNpYhxbrwYABgFE01twZdtv4M00kts2i02GhbGjc",
      "cors_origin": "https://example.com/"
    },
    {
      "timeout": 3600,
      "status": "asset_created",
      "new_asset_settings": {
        "playback_policies": [
          "public"
        ],
        "video_quality": "basic"
      },
      "id": "YzoCL01HHOtAVYq4Ds9zekdHJ2XqL9e8ukPWbr01KhtvM",
      "asset_id": "AnFVqAVXfb7vVL3ypSQDMnJZunnb8nkwe02O00p2gK8P00"
    },
    {
      "timeout": 10800,
      "status": "cancelled",
      "new_asset_settings": {
        "playback_policies": [
          "public"
        ],
        "video_quality": "basic"
      },
      "id": "AZcWu0201SqVW01LMdmVxE00m3gEWUFZPItvni1sTqF800dQ"
    }
  ]
}
Retrieve a single direct upload's info
get
Fetches information about a single direct upload in the current environment.

copy
curl https://api.mux.com/video/v1/uploads/${UPLOAD_ID} \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
UPLOAD_ID
string
ID of the Upload

get
200
/video/v1/uploads/{UPLOAD_ID}
Response
(application/json)
copy
{
  "data": {
    "timeout": 3600,
    "status": "asset_created",
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ],
      "video_quality": "basic"
    },
    "id": "YzoCL01HHOtAVYq4Ds9zekdHJ2XqL9e8ukPWbr01KhtvM",
    "asset_id": "AnFVqAVXfb7vVL3ypSQDMnJZunnb8nkwe02O00p2gK8P00"
  }
}
Cancel a direct upload
put
Cancels a direct upload and marks it as cancelled. If a pending upload finishes after this request, no asset will be created. This request will only succeed if the upload is still in the waiting state.

copy
curl https://api.mux.com/video/v1/uploads/${UPLOAD_ID}/cancel \
  -X PUT \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
UPLOAD_ID
string
ID of the Upload

put
200
/video/v1/uploads/{UPLOAD_ID}/cancel
Response
(application/json)
copy
{
  "data": {
    "timeout": 3600,
    "status": "cancelled",
    "new_asset_settings": {
      "playback_policies": [
        "public"
      ],
      "video_quality": "basic"
    },
    "id": "zd01Pe2bNpYhxbrwYABgFE01twZdtv4M00kts2i02GhbGjc",
    "cors_origin": "https://example.com/"
  }
}
Delivery Usage
The Delivery Usage API allows you to get delivery/streaming usage details for each asset and across all assets. Delivery usage details are aggregated every hour at the top of the hour and can be requested for a specified time window within the last 90 days starting at 12 hours prior to when the request is made.

Assets are ordered by delivery usage starting with the one with the highest usage. Only assets with delivery usage greater than 0 seconds are returned in the response.


Properties
live_stream_id
string
Unique identifier for the live stream that created the asset.

asset_id
string
Unique identifier for the asset.

passthrough
string
The passthrough value for the asset.

created_at
string
Time at which the asset was created. Measured in seconds since the Unix epoch.

deleted_at
string
If exists, time at which the asset was deleted. Measured in seconds since the Unix epoch.

asset_state
string
Possible values:
"ready"
"errored"
"deleted"
The state of the asset.

asset_duration
number
The duration of the asset in seconds.

asset_resolution_tier
string
Possible values:
"audio-only"
"720p"
"1080p"
"1440p"
"2160p"
The resolution tier that the asset was ingested at, affecting billing for ingest & storage

asset_encoding_tierDeprecated
string
Possible values:
"smart"
"baseline"
"premium"
This field is deprecated. Please use asset_video_quality instead. The encoding tier that the asset was ingested at. See the video quality guide for more details.

asset_video_quality
string
Possible values:
"basic"
"plus"
"premium"
The video quality that the asset was ingested at. This field replaces asset_encoding_tier. See the video quality guide for more details.

delivered_seconds
number
Total number of delivered seconds during this time window.

delivered_seconds_by_resolution
object
Seconds delivered broken into resolution tiers. Each tier will only be displayed if there was content delivered in the tier.

delivered_seconds_by_resolution.tier_2160p
number
Total number of delivered seconds during this time window that had a resolution larger than the 1440p tier (over 4,194,304 pixels total).

delivered_seconds_by_resolution.tier_1440p
number
Total number of delivered seconds during this time window that had a resolution larger than the 1080p tier but less than or equal to the 2160p tier (over 2,073,600 and <= 4,194,304 pixels total).

delivered_seconds_by_resolution.tier_1080p
number
Total number of delivered seconds during this time window that had a resolution larger than the 720p tier but less than or equal to the 1440p tier (over 921,600 and <= 2,073,600 pixels total).

delivered_seconds_by_resolution.tier_720p
number
Total number of delivered seconds during this time window that had a resolution within the 720p tier (up to 921,600 pixels total, based on typical 1280x720).

delivered_seconds_by_resolution.tier_audio_only
number
Total number of delivered seconds during this time window that had a resolution of audio only.

List Usage
get
Returns a list of delivery usage records and their associated Asset IDs or Live Stream IDs.

copy
curl 'https://api.mux.com/video/v1/delivery-usage?timeframe[]=${START_TIME}&timeframe[]=${END_TIME}'   -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
page
integer
(default: 1)
Offset by this many pages, of the size of limit

limit
integer
(default: 100)
Number of items to include in the response

asset_id
string
Filter response to return delivery usage for this asset only. You cannot specify both the asset_id and live_stream_id parameters together.

live_stream_id
string
Filter response to return delivery usage for assets for this live stream. You cannot specify both the asset_id and live_stream_id parameters together.

timeframe[]
array
Time window to get delivery usage information. timeframe[0] indicates the start time, timeframe[1] indicates the end time in seconds since the Unix epoch. Default time window is 1 hour representing usage from 13th to 12th hour from when the request is made.

get
200
/video/v1/delivery-usage
Response
(application/json)
copy
{
  "total_row_count": 2,
  "timeframe": [
    1607817600,
    1607990400
  ],
  "page": 1,
  "limit": 100,
  "data": [
    {
      "live_stream_id": "B65hEUWW01ErVKDDGImKcBquYhwEAkjW6Ic3lPY0299Cc",
      "delivered_seconds": 206.366667,
      "delivered_seconds_by_resolution": {
        "tier_1080p": 100,
        "tier_720p": 100,
        "tier_audio_only": 6.366667
      },
      "deleted_at": "1607945257",
      "created_at": "1607939184",
      "asset_state": "deleted",
      "asset_id": "Ww4v2q2H4MNbHIAM2wApKb3cmrh7eHjGLUjdKohR5wM",
      "asset_duration": 154.366667,
      "asset_resolution_tier": "1080p",
      "asset_encoding_tier": "baseline",
      "asset_video_quality": "basic"
    },
    {
      "delivered_seconds": 30,
      "delivered_seconds_by_resolution": {
        "tier_1080p": 10,
        "tier_720p": 10,
        "tier_audio_only": 10
      },
      "deleted_at": "1607935288",
      "created_at": "1607617107",
      "asset_state": "deleted",
      "asset_id": "Qlb007on1TwN43XLIG027QJlUxm3jd01v5PRi1aXhnyFZY",
      "asset_duration": 98.773667,
      "asset_resolution_tier": "1080p",
      "asset_encoding_tier": "smart",
      "asset_video_quality": "plus"
    }
  ]
}
Playback Restrictions
Playback Restrictions allows you to set additional rules for playing videos. You can set the domains/hostnames allowed to play your videos. For instance, viewers can play videos embedded on the https://example.com website when you set the Playback Restrictions with example.com as an allowed domain. Any Video requests from other websites are denied. Additionally, you can set rules for what user agents to allow. Please see Using User-Agent HTTP header for validation for more details on this feature.


Properties
data
object
data.id
string
Unique identifier for the Playback Restriction. Max 255 characters.

data.created_at
string
Time the Playback Restriction was created, defined as a Unix timestamp (seconds since epoch).

data.updated_at
string
Time the Playback Restriction was last updated, defined as a Unix timestamp (seconds since epoch).

data.referrer
object
A list of domains allowed to play your videos.

data.referrer.allowed_domains
array
List of domains allowed to play videos. Possible values are

[] Empty Array indicates deny video playback requests for all domains
["*"] A Single Wildcard * entry means allow video playback requests from any domain
["*.example.com", "foo.com"] A list of up to 10 domains or valid dns-style wildcards
data.referrer.allow_no_referrer
boolean (default: false)
A boolean to determine whether to allow or deny HTTP requests without Referer HTTP request header. Playback requests coming from non-web/native applications like iOS, Android or smart TVs will not have a Referer HTTP header. Set this value to true to allow these playback requests.

data.user_agent
object
Rules that control what user agents are allowed to play your videos. Please see Using User-Agent HTTP header for validation for more details on this feature.

data.user_agent.allow_no_user_agent
boolean (default: true)
Whether or not to allow views without a User-Agent HTTP request header.

data.user_agent.allow_high_risk_user_agent
boolean (default: true)
Whether or not to allow high risk user agents. The high risk user agents are defined by Mux.

Create a Playback Restriction
post
Create a new Playback Restriction.

copy
curl 'https://api.mux.com/video/v1/playback-restrictions' \
  -X POST \
  -d '{ "referrer": { "allowed_domains": ["*.example.com"], "allow_no_referrer": true } }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params

referrer
object
A list of domains allowed to play your videos.

referrer.allowed_domains
array
List of domains allowed to play videos. Possible values are

[] Empty Array indicates deny video playback requests for all domains
["*"] A Single Wildcard * entry means allow video playback requests from any domain
["*.example.com", "foo.com"] A list of up to 10 domains or valid dns-style wildcards
referrer.allow_no_referrer
boolean
(default: false)
A boolean to determine whether to allow or deny HTTP requests without Referer HTTP request header. Playback requests coming from non-web/native applications like iOS, Android or smart TVs will not have a Referer HTTP header. Set this value to true to allow these playback requests.


user_agent
object
Rules that control what user agents are allowed to play your videos. Please see Using User-Agent HTTP header for validation for more details on this feature.

user_agent.allow_no_user_agent
boolean
(default: true)
Whether or not to allow views without a User-Agent HTTP request header.

user_agent.allow_high_risk_user_agent
boolean
(default: true)
Whether or not to allow high risk user agents. The high risk user agents are defined by Mux.

post
201
/video/v1/playback-restrictions
Request
(application/json)
copy
{
  "referrer": {
    "allowed_domains": [
      "*.example.com"
    ],
    "allow_no_referrer": true
  },
  "user_agent": {
    "allow_no_user_agent": false,
    "allow_high_risk_user_agent": false
  }
}
Response
(application/json)
copy
{
  "data": {
    "id": "9dbEg8o00uqQzZbzJT6NXdqNA00SdnSo8O",
    "updated_at": "1607945257",
    "created_at": "1607945257",
    "referrer": {
      "allowed_domains": [
        "*.example.com"
      ],
      "allow_no_referrer": true
    },
    "user_agent": {
      "allow_no_user_agent": false,
      "allow_high_risk_user_agent": false
    }
  }
}
List Playback Restrictions
get
Returns a list of all Playback Restrictions.

copy
curl 'https://api.mux.com/video/v1/playback-restrictions' \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
page
integer
(default: 1)
Offset by this many pages, of the size of limit

limit
integer
(default: 25)
Number of items to include in the response

get
200
/video/v1/playback-restrictions
Response
(application/json)
copy
{
  "total_row_count": 2,
  "page": 1,
  "limit": 100,
  "data": [
    {
      "id": "9dbEg8o00uqQzZbzJT6NXdqNA00SdnSo8O",
      "updated_at": "1607945257",
      "created_at": "1607939184",
      "referrer": {
        "allowed_domains": [
          "*.example.com"
        ],
        "allow_no_referrer": false
      },
      "user_agent": {
        "allow_no_user_agent": false,
        "allow_high_risk_user_agent": false
      }
    },
    {
      "id": "012uTQqPygDYWz3jey8cyOX9n01Bd5SDH1",
      "updated_at": "1607945980",
      "created_at": "1607939188",
      "referrer": {
        "allowed_domains": [
          "a.example.com",
          "b.example.com"
        ],
        "allow_no_referrer": true
      },
      "user_agent": {
        "allow_no_user_agent": false,
        "allow_high_risk_user_agent": false
      }
    }
  ]
}
Delete a Playback Restriction
del
Deletes a single Playback Restriction.

copy
curl 'https://api.mux.com/video/v1/playback-restrictions/${PLAYBACK_RESTRICTION_ID}' \
  -X DELETE \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
PLAYBACK_RESTRICTION_ID
string
ID of the Playback Restriction.

del
204
/video/v1/playback-restrictions/{PLAYBACK_RESTRICTION_ID}
Retrieve a Playback Restriction
get
Retrieves a Playback Restriction associated with the unique identifier.

copy
curl 'https://api.mux.com/video/v1/playback-restrictions/${PLAYBACK_RESTRICTION_ID}' \
  -X GET \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
PLAYBACK_RESTRICTION_ID
string
ID of the Playback Restriction.

get
200
/video/v1/playback-restrictions/{PLAYBACK_RESTRICTION_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "9dbEg8o00uqQzZbzJT6NXdqNA00SdnSo8O",
    "updated_at": "1607945257",
    "created_at": "1607939184",
    "referrer": {
      "allowed_domains": [
        "*.example.com"
      ],
      "allow_no_referrer": false
    },
    "user_agent": {
      "allow_no_user_agent": false,
      "allow_high_risk_user_agent": false
    }
  }
}
Update the Referrer Playback Restriction
put
Allows you to modify the list of domains or change how Mux validates playback requests without the Referer HTTP header. The Referrer restriction fully replaces the old list with this new list of domains.

copy
curl 'https://api.mux.com/video/v1/playback-restrictions/${PLAYBACK_RESTRICTION_ID}/referrer' \
  -X PUT \
  -d '{ "allowed_domains": ["*.example.com"], "allow_no_referrer": true }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request body params
allowed_domains
array
List of domains allowed to play videos. Possible values are

[] Empty Array indicates deny video playback requests for all domains
["*"] A Single Wildcard * entry means allow video playback requests from any domain
["*.example.com", "foo.com"] A list of up to 10 domains or valid dns-style wildcards
allow_no_referrer
boolean
(default: false)
A boolean to determine whether to allow or deny HTTP requests without Referer HTTP request header. Playback requests coming from non-web/native applications like iOS, Android or smart TVs will not have a Referer HTTP header. Set this value to true to allow these playback requests.

Request path & query params
PLAYBACK_RESTRICTION_ID
string
ID of the Playback Restriction.

put
200
/video/v1/playback-restrictions/{PLAYBACK_RESTRICTION_ID}/referrer
Request
(application/json)
copy
{
  "allowed_domains": [
    "*.example.com"
  ],
  "allow_no_referrer": true
}
Response
(application/json)
copy
{
  "data": {
    "id": "9dbEg8o00uqQzZbzJT6NXdqNA00SdnSo8O",
    "updated_at": "1607945257",
    "created_at": "1607939184",
    "referrer": {
      "allowed_domains": [
        "*.example.com"
      ],
      "allow_no_referrer": true
    },
    "user_agent": {
      "allow_no_user_agent": false,
      "allow_high_risk_user_agent": false
    }
  }
}
Update the User Agent Restriction
put
Allows you to modify how Mux validates playback requests with different user agents. Please see Using User-Agent HTTP header for validation for more details on this feature.

Request body params
allow_no_user_agent
boolean
(default: true)
Whether or not to allow views without a User-Agent HTTP request header.

allow_high_risk_user_agent
boolean
(default: true)
Whether or not to allow high risk user agents. The high risk user agents are defined by Mux.

Request path & query params
PLAYBACK_RESTRICTION_ID
string
ID of the Playback Restriction.

put
200
/video/v1/playback-restrictions/{PLAYBACK_RESTRICTION_ID}/user_agent
Request
(application/json)
copy
{
  "allow_no_user_agent": false,
  "allow_high_risk_user_agent": false
}
Response
(application/json)
copy
{
  "data": {
    "id": "9dbEg8o00uqQzZbzJT6NXdqNA00SdnSo8O",
    "updated_at": "1607945257",
    "created_at": "1607939184",
    "referrer": {
      "allowed_domains": [
        "*.example.com"
      ],
      "allow_no_referrer": true
    },
    "user_agent": {
      "allow_no_user_agent": false,
      "allow_high_risk_user_agent": false
    }
  }
}
DRM Configurations
DRM Configurations allow you to adjust the security level of content delivered through Mux Video's Digital Rights Management (DRM) feature.


Properties
id
string
Unique identifier for the DRM Configuration. Max 255 characters.

List DRM Configurations
get
Returns a list of DRM Configurations

Request path & query params
page
integer
(default: 1)
Offset by this many pages, of the size of limit

limit
integer
(default: 25)
Number of items to include in the response

get
200
/video/v1/drm-configurations
Response
(application/json)
copy
{
  "total_row_count": 2,
  "page": 1,
  "limit": 100,
  "data": [
    {
      "id": "9dbEg8o00uqQzZbzJT6NXdqNA00SdnSo8O"
    },
    {
      "id": "012uTQqPygDYWz3jey8cyOX9n01Bd5SDH1"
    }
  ]
}
Retrieve a DRM Configuration
get
Retrieves a single DRM Configuration.

Request path & query params
DRM_CONFIGURATION_ID
string
The DRM Configuration ID.

get
200
/video/v1/drm-configurations/{DRM_CONFIGURATION_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "lJ4bGGsp7ZlPf02nMg015W02iHQLN9XnuuLRBsPS00xqd68"
  }
}
Transcription Vocabularies
Transcription Vocabularies allows you to provide collections of phrases like proper nouns, technical jargon, and uncommon words as part of captioning workflows. When using Auto-Generated Captions, Transcription Vocabularies increase the likelihood of correct speech recognition for these words and phrases.


Properties
id
string
Unique identifier for the Transcription Vocabulary

name
string
The user-supplied name of the Transcription Vocabulary.

phrases
array
Phrases, individual words, or proper names to include in the Transcription Vocabulary. When the Transcription Vocabulary is attached to a live stream's generated_subtitles configuration, the probability of successful speech recognition for these words or phrases is boosted.

passthrough
string
Arbitrary user-supplied metadata set for the Transcription Vocabulary. Max 255 characters.

created_at
string
Time the Transcription Vocabulary was created, defined as a Unix timestamp (seconds since epoch).

updated_at
string
Time the Transcription Vocabulary was updated, defined as a Unix timestamp (seconds since epoch).

Create a Transcription Vocabulary
post
Create a new Transcription Vocabulary.

Request body params
name
string
The user-supplied name of the Transcription Vocabulary.

phrases
array
Phrases, individual words, or proper names to include in the Transcription Vocabulary. When the Transcription Vocabulary is attached to a live stream's generated_subtitles, the probability of successful speech recognition for these words or phrases is boosted.

passthrough
string
Arbitrary user-supplied metadata set for the Transcription Vocabulary. Max 255 characters.

post
201
/video/v1/transcription-vocabularies
Request
(application/json)
copy
{
  "name": "Mux API Vocabulary",
  "phrases": [
    "Mux",
    "Live Stream",
    "Playback ID",
    "video encoding"
  ]
}
Response
(application/json)
copy
{
  "data": {
    "id": "VDm3npt2eaEDvz9emzun8Q",
    "name": "Mux API Vocabulary",
    "phrases": [
      "Mux",
      "Live Stream",
      "Playback ID",
      "video encoding"
    ],
    "created_at": "1609869152",
    "updated_at": "1609869152"
  }
}
List Transcription Vocabularies
get
List all Transcription Vocabularies.

Request path & query params
limit
integer
(default: 10, max: 10)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

get
200
/video/v1/transcription-vocabularies
Response
(application/json)
copy
{
  "data": [
    {
      "id": "VDm3npt2eaEDvz9emzun8Q",
      "name": "Mux API Vocabulary",
      "phrases": [
        "Mux",
        "Live Stream",
        "Playback ID",
        "video encoding"
      ],
      "created_at": "1609869152",
      "updated_at": "1609870000"
    },
    {
      "id": "M1lDlzSP102NgukTnyQyLqw",
      "name": "Video Codecs",
      "phrases": [
        "h.264",
        "HEVC",
        "AV1"
      ],
      "created_at": "1609869152",
      "updated_at": "1609870000"
    }
  ]
}
Retrieve a Transcription Vocabulary
get
Retrieves the details of a Transcription Vocabulary that has previously been created. Supply the unique Transcription Vocabulary ID and Mux will return the corresponding Transcription Vocabulary information. The same information is returned when creating a Transcription Vocabulary.

Request path & query params
TRANSCRIPTION_VOCABULARY_ID
string
The ID of the Transcription Vocabulary.

get
200
/video/v1/transcription-vocabularies/{TRANSCRIPTION_VOCABULARY_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "VDm3npt2eaEDvz9emzun8Q",
    "name": "Mux API Vocabulary",
    "phrases": [
      "Mux",
      "Live Stream",
      "Playback ID",
      "video encoding"
    ],
    "created_at": "1609869152",
    "updated_at": "1609870000"
  }
}
Delete a Transcription Vocabulary
del
Deletes a Transcription Vocabulary. The Transcription Vocabulary's ID will be disassociated from any live streams using it. Transcription Vocabularies can be deleted while associated live streams are active. However, the words and phrases in the deleted Transcription Vocabulary will remain attached to those streams while they are active.

Request path & query params
TRANSCRIPTION_VOCABULARY_ID
string
The ID of the Transcription Vocabulary.

del
204
/video/v1/transcription-vocabularies/{TRANSCRIPTION_VOCABULARY_ID}
Update a Transcription Vocabulary
put
Updates the details of a previously-created Transcription Vocabulary. Updates to Transcription Vocabularies are allowed while associated live streams are active. However, updates will not be applied to those streams while they are active.

Request body params
name
string
The user-supplied name of the Transcription Vocabulary.

phrases
array
Phrases, individual words, or proper names to include in the Transcription Vocabulary. When the Transcription Vocabulary is attached to a live stream's generated_subtitles, the probability of successful speech recognition for these words or phrases is boosted.

passthrough
string
Arbitrary user-supplied metadata set for the Transcription Vocabulary. Max 255 characters.

Request path & query params
TRANSCRIPTION_VOCABULARY_ID
string
The ID of the Transcription Vocabulary.

put
200
/video/v1/transcription-vocabularies/{TRANSCRIPTION_VOCABULARY_ID}
Request
(application/json)
copy
{
  "name": "Mux API Vocabulary - Updated",
  "phrases": [
    "Mux",
    "Live Stream",
    "RTMP",
    "Stream Key"
  ]
}
Response
(application/json)
copy
{
  "data": {
    "id": "VDm3npt2eaEDvz9emzun8Q",
    "name": "Mux API Vocabulary - Updated",
    "phrases": [
      "Mux",
      "Live Stream",
      "RTMP",
      "Stream Key"
    ],
    "created_at": "1609869152",
    "updated_at": "1609870000"
  }
}
Web Inputs
Note: Web Inputs are currently in beta. Please reach out to us if you're interested in using them.

Web Inputs are Mux-managed web browsers that you can use to broadcast visually compelling live streams from any web page you build.


Properties
id
string
Unique identifier for the Web Input.

created_at
string
Time the Web Input was created, defined as a Unix timestamp (seconds since epoch).

url
string
The URL for the Web Input to load.

auto_launch
boolean
When set to true the Web Input will automatically launch and start streaming immediately after creation

live_stream_id
string
The Live Stream ID to broadcast this Web Input to

status
string
Possible values:
"idle"
"launching"
"streaming"
passthrough
string
Arbitrary metadata that will be included in the Web Input details and related webhooks. Can be used to store your own ID for the Web Input. Max: 255 characters.

resolution
string (default: 1920x1080)
Possible values:
"1920x1080"
"1280x720"
"1080x1920"
"720x1280"
"1080x1080"
"720x720"
The resolution of the viewport of the Web Input's browser instance. Defaults to 1920x1080 if not set.

timeout
integer (default: 3600)
The number of seconds that the Web Input should stream for before automatically shutting down.

Create a new Web Input
post
Create a new Web Input

Request body params
id
string
Unique identifier for the Web Input.

created_at
string
Time the Web Input was created, defined as a Unix timestamp (seconds since epoch).

url
string
The URL for the Web Input to load.

auto_launch
boolean
When set to true the Web Input will automatically launch and start streaming immediately after creation

live_stream_id
string
The Live Stream ID to broadcast this Web Input to

status
string
Possible values:
"idle"
"launching"
"streaming"
passthrough
string
Arbitrary metadata that will be included in the Web Input details and related webhooks. Can be used to store your own ID for the Web Input. Max: 255 characters.

resolution
string
(default: 1920x1080)
Possible values:
"1920x1080"
"1280x720"
"1080x1920"
"720x1280"
"1080x1080"
"720x720"
The resolution of the viewport of the Web Input's browser instance. Defaults to 1920x1080 if not set.

timeout
integer
(default: 3600)
The number of seconds that the Web Input should stream for before automatically shutting down.

post
201
/video/v1/web-inputs
Request
(application/json)
copy
{
  "url": "https://example.com/hello.html",
  "live_stream_id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag"
}
Response
(application/json)
copy
{
  "data": {
    "id": "S3Jlx7KABs1EfhscCGEM02G5RYpgwb02nn",
    "created_at": "1609868768",
    "url": "https://example.com/hello.html",
    "live_stream_id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "status": "idle",
    "resolution": "1920x1080",
    "timeout": 3600
  }
}
List Web Inputs
get
List Web Inputs

Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

get
200
/video/v1/web-inputs
Response
(application/json)
copy
{
  "data": [
    {
      "id": "S3Jlx7KABs1EfhscCGEM02G5RYpgwb02nn",
      "created_at": "1609868768",
      "url": "https://example.com/hello.html",
      "live_stream_id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
      "status": "idle",
      "resolution": "1920x1080",
      "timeout": 3600
    },
    {
      "id": "eMSK5cBGHTz3DLVjGy02BnrKvCLPN2QdF",
      "created_at": "1609868768",
      "url": "https://example.com/hello-there.html",
      "live_stream_id": "RlWPQAZ1PdGuL2eZYmZ50202XUlc7Cn1AM",
      "status": "idle",
      "resolution": "720x720",
      "timeout": 3600
    }
  ]
}
Retrieve a Web Input
get
Retrieve a single Web Input's info

Request path & query params
WEB_INPUT_ID
string
The Web Input ID

get
200
/video/v1/web-inputs/{WEB_INPUT_ID}
Response
(application/json)
copy
{
  "data": {
    "id": "S3Jlx7KABs1EfhscCGEM02G5RYpgwb02nn",
    "created_at": "1609868768",
    "url": "https://example.com/hello.html",
    "live_stream_id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "status": "idle",
    "resolution": "1920x1080",
    "timeout": 3600
  }
}
Delete a Web Input
del
Deletes a Web Input and all its data

Request path & query params
WEB_INPUT_ID
string
The Web Input ID

del
204
/video/v1/web-inputs/{WEB_INPUT_ID}
Launch a Web Input
put
Launches the browsers instance, loads the URL specified, and then starts streaming to the specified Live Stream.

Request path & query params
WEB_INPUT_ID
string
The Web Input ID

put
200
/video/v1/web-inputs/{WEB_INPUT_ID}/launch
Response
(application/json)
copy
{
  "data": {}
}
Shut down a Web Input
put
Ends streaming to the specified Live Stream, and then shuts down the Web Input browser instance.

Request path & query params
WEB_INPUT_ID
string
The Web Input ID

put
200
/video/v1/web-inputs/{WEB_INPUT_ID}/shutdown
Response
(application/json)
copy
{
  "data": {}
}
Reload a Web Input
put
Reloads the page that a Web Input is displaying.

Note: Using this when the Web Input is streaming will display the page reloading.

Request path & query params
WEB_INPUT_ID
string
The Web Input ID

put
200
/video/v1/web-inputs/{WEB_INPUT_ID}/reload
Response
(application/json)
copy
{
  "data": {}
}
Update Web Input URL
put
Changes the URL that a Web Input loads when it launches.

Note: This can only be called when the Web Input is idle.

Request body params
url
string
The URL for the Web Input to load.

Request path & query params
WEB_INPUT_ID
string
The Web Input ID

put
200
/video/v1/web-inputs/{WEB_INPUT_ID}/url
Request
(application/json)
copy
{
  "url": "https://example.com/hello-there.html"
}
Response
(application/json)
copy
{
  "data": {
    "id": "S3Jlx7KABs1EfhscCGEM02G5RYpgwb02nn",
    "created_at": "1609868768",
    "url": "https://example.com/hello-there.html",
    "live_stream_id": "ZEBrNTpHC02iUah025KM3te6ylM7W4S4silsrFtUkn3Ag",
    "status": "idle",
    "resolution": "1920x1080",
    "timeout": 3600
  }
}
Video Views
An individual video view tracked by Mux Data. For the full list of properties for each view please refer to the table of data fields in the Export raw video view data guide.

List Video Views
get
Returns a list of video views which match the filters and have a view_end within the specified timeframe.

copy
curl https://api.mux.com/data/v1/video-views?timeframe[]=7:days \
  -X GET \
  -d '{ "limit": 5 }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

viewer_id
string
Viewer ID to filter results by. This value may be provided by the integration, or may be created by Mux.

error_id
integer
Filter video views by the provided error ID (as returned in the error_type_id field in the list video views endpoint). If you provide any as the error ID, this will filter the results to those with any error.

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
get
200
/data/v1/video-views
Response
(application/json)
copy
{
  "total_row_count": 4,
  "timeframe": [
    1610025789,
    1610112189
  ],
  "data": [
    {
      "viewer_os_family": "OS X",
      "viewer_application_name": "Chrome",
      "view_start": "2021-01-07T20:34:06Z",
      "view_end": "2021-01-07T20:46:04Z",
      "video_title": "my-title",
      "total_row_count": 4,
      "player_error_message": null,
      "player_error_code": null,
      "id": "JpA81zBfGaGZ85C6aGF3bptyD4CKwpdNgamr",
      "error_type_id": 1,
      "country_code": "US",
      "viewer_experience_score": 0.8,
      "watch_time": 1000,
      "playback_failure": false
    },
    {
      "viewer_os_family": "OS X",
      "viewer_application_name": "Chrome",
      "view_start": "2021-01-07T20:21:53Z",
      "view_end": "2021-01-07T20:34:03Z",
      "video_title": "",
      "total_row_count": 4,
      "player_error_message": null,
      "player_error_code": null,
      "id": "jPVLR5giYMrLYbHM88Tkn3cM3qCRDk0jL114",
      "error_type_id": 1,
      "country_code": "US",
      "viewer_experience_score": 0.8,
      "watch_time": 1000,
      "playback_failure": false
    },
    {
      "viewer_os_family": "OS X",
      "viewer_application_name": "Chrome",
      "view_start": "2021-01-07T15:16:06Z",
      "view_end": "2021-01-07T15:17:06Z",
      "video_title": "Video Test Title 12.14.20",
      "total_row_count": 4,
      "player_error_message": "this is an error message from the player",
      "player_error_code": "1001",
      "id": "pdLDVKBuPZJJ9YsPVmtmB9FG9gsWBWMmYar4",
      "error_type_id": 1,
      "country_code": "US",
      "viewer_experience_score": 0.8,
      "watch_time": 1000,
      "playback_failure": true
    },
    {
      "viewer_os_family": "OS X",
      "viewer_application_name": "Chrome",
      "view_start": "2021-01-07T15:15:09Z",
      "view_end": "2021-01-07T15:15:17Z",
      "video_title": "Video Test Title 12.14.20",
      "total_row_count": 4,
      "player_error_message": null,
      "player_error_code": null,
      "id": "zbZPowWtD3z54jcGMLCJJpF79zCjB03bV7o8",
      "error_type_id": 1,
      "country_code": "US",
      "viewer_experience_score": 0.8,
      "watch_time": 1000,
      "playback_failure": false
    }
  ]
}
Get a Video View
get
Returns the details of a video view.

Request path & query params
VIDEO_VIEW_ID
string
ID of the Video View

get
200
/data/v1/video-views/{VIDEO_VIEW_ID}
Response
(application/json)
copy
{
  "total_row_count": null,
  "timeframe": [
    1643133378,
    1643219778
  ],
  "data": {
    "view_end": "2022-01-26T17:56:12Z",
    "viewer_device_model": "iPhone10,4",
    "viewer_os_version": "15.1",
    "video_id": "rmp7fvw5lPD01l8PZ2aN74js84XrTWxHy",
    "view_playing_time": "58134",
    "exit_before_video_start": false,
    "player_mux_plugin_name": "apple-mux",
    "view_max_downscale_percentage": "0.32222223",
    "country_name": "United States",
    "view_id": "8d00a0ca-8456-4e55-9ff8-dc501814a6b1",
    "view_start": "2022-01-26T17:08:18Z",
    "view_max_playhead_position": "41126",
    "player_source_host_name": "stream.mux.com",
    "player_error_code": "1001",
    "player_error_message": "error from player",
    "player_error_context": "error context",
    "player_source_url": "https://stream.mux.com/ax9qwyTIaUDLdmhesYDKir5kfE4Ve215.m3u8",
    "city": "Austin",
    "view_max_upscale_percentage": "0",
    "asset_id": "rmp7fvw5lPD01l8PZ2aN74js84XrTWxHy",
    "events": [
      {
        "viewer_time": 1643216891851,
        "playback_time": 0,
        "name": "playerready",
        "event_time": 1643216898061
      },
      {
        "viewer_time": 1643216891853,
        "playback_time": 0,
        "name": "viewstart",
        "event_time": 1643216898101
      }
    ],
    "view_total_content_playback_time": 37521,
    "asn": 11427,
    "weighted_average_bitrate": 697078,
    "playback_failure": false,
    "view_dropped": false
  }
}
Errors
Playback errors are tracked and aggregated by Mux Data. Errors can be listed by the API, which contains data about the error code, message, and how often the error occurred.


Properties
id
integer
A unique identifier for this error.

percentage
number
The percentage of views that experienced this error.

notes
string
Notes that are attached to this error.

message
string
The error message.

last_seen
string
The last time this error was seen (ISO 8601 timestamp).

description
string
Description of the error.

count
integer
The total number of views that experienced this error.

code
integer
The error code

player_error_code
string
The string version of the error code

List Errors
get
Returns a list of errors.

Request path & query params
filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
get
200
/data/v1/errors
Response
(application/json)
copy
{
  "total_row_count": 1,
  "timeframe": [
    1610027061,
    1610113461
  ],
  "data": [
    {
      "percentage": 30,
      "notes": "a helpful note",
      "message": "an error message",
      "last_seen": "2021-01-08T13:42:39Z",
      "id": 1,
      "description": "a description for this error",
      "count": 1,
      "code": 100,
      "player_error_code": "100"
    }
  ]
}
Filters
Deprecated, please refer to the Dimensions APIs.

List Filters
get
Deprecated
The API has been replaced by the list-dimensions API call.

Lists all the filters broken out into basic and advanced.

get
200
/data/v1/filters
Response
(application/json)
copy
{
  "total_row_count": 1,
  "timeframe": [
    1610027251,
    1610113651
  ],
  "data": {
    "basic": [
      "browser",
      "operating_system",
      "player_remote_played",
      "player_software",
      "player_software_version",
      "player_mux_plugin_name",
      "player_mux_plugin_version",
      "player_autoplay",
      "player_preload",
      "video_title",
      "video_id",
      "stream_type",
      "source_type",
      "source_hostname",
      "continent_code",
      "country",
      "player_error_code",
      "asset_id",
      "live_stream_id",
      "playback_id",
      "video_content_type",
      "page_type",
      "view_drm_type",
      "view_has_ad",
      "custom_1",
      "custom_2",
      "custom_3",
      "custom_4",
      "custom_5",
      "custom_6",
      "custom_7",
      "custom_8",
      "custom_9",
      "custom_10",
      "view_dropped"
    ],
    "advanced": [
      "browser_version",
      "operating_system_version",
      "viewer_device_name",
      "viewer_device_model",
      "viewer_device_category",
      "viewer_device_manufacturer",
      "player_name",
      "player_version",
      "video_series",
      "video_encoding_variant",
      "experiment_name",
      "sub_property_id",
      "asn",
      "cdn",
      "viewer_connection_type",
      "view_session_id",
      "region",
      "viewer_user_id",
      "exit_before_video_start",
      "video_startup_failure",
      "playback_failure",
      "preroll_ad_asset_hostname",
      "preroll_ad_tag_hostname",
      "preroll_played",
      "preroll_requested",
      "playback_business_exception",
      "video_startup_business_exception",
      "ad_playback_failure",
      "content_playback_failure"
    ]
  }
}
Lists values for a specific filter
get
Deprecated
The API has been replaced by the list-dimension-values API call.

Lists the values for a filter along with a total count of related views.

Request path & query params
FILTER_ID
string
ID of the Filter

limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
get
200
/data/v1/filters/{FILTER_ID}
Response
(application/json)
copy
{
  "total_row_count": 1,
  "timeframe": [
    1610028123,
    1610114523
  ],
  "data": [
    {
      "value": "Chrome",
      "total_count": 5
    }
  ]
}
Exports
Exports allow you to download the daily CSV files that are generated from the video views that occurred in the previous day. Please contact support for information about enabling exports for your organization.

List property video view export links
get
Deprecated
The API has been replaced by the list-exports-views API call.

Lists the available video view exports along with URLs to retrieve them.

get
200
/data/v1/exports
Response
(application/json)
copy
{
  "total_row_count": 10,
  "timeframe": [
    1610024528,
    1610110928
  ],
  "data": [
    "https://s3.amazonaws.com/mux-data-exports/1/2021_01_01.csv.gz?...signature...",
    "https://s3.amazonaws.com/mux-data-exports/1/2021_01_02.csv.gz?...signature...",
    "https://s3.amazonaws.com/mux-data-exports/1/2021_01_03.csv.gz?...signature..."
  ]
}
List available property view exports
get
Lists the available video view exports along with URLs to retrieve them.

get
200
/data/v1/exports/views
Response
(application/json)
copy
{
  "total_row_count": 7,
  "timeframe": [
    1626296941,
    1626383341
  ],
  "data": [
    {
      "files": [
        {
          "version": 2,
          "type": "csv",
          "path": "https://s3.amazonaws.com/mux-data-exports/1/2021_01_03.csv.gz?...signature..."
        }
      ],
      "export_date": "2021-01-03"
    },
    {
      "files": [
        {
          "version": 2,
          "type": "csv",
          "path": "https://s3.amazonaws.com/mux-data-exports/1/2021_01_02.csv.gz?...signature..."
        }
      ],
      "export_date": "2021-01-02"
    },
    {
      "files": [
        {
          "version": 2,
          "type": "csv",
          "path": "https://s3.amazonaws.com/mux-data-exports/1/2021_01_01.csv.gz?...signature..."
        }
      ],
      "export_date": "2021-01-01"
    }
  ]
}
Metrics
Historical metrics are used for tracking KPIs, diagnosing issues, and measuring viewers' quality of experience. Metrics are calculated using the video views that have been completed and are bucketed on the view end time for quality of experience metrics and view start time for engagement metrics. Historical metrics provide a large collection of dimensions that can be used to aggregate quality of experience based on view metadata. You can also easily compare experiences across viewer populations to, for example, find issues with specific devices or geographies.

Historical metrics are similar but not directly comparable to the real-time metrics in the Real-time APIs. These metrics are aggregated for long-term storage historical reporting and are generated using different viewer populations.

List breakdown values
get
List the breakdown values for a specific metric.

Request path & query params
METRIC_ID
string
Possible values:
"aggregate_startup_time"
"downscale_percentage"
"exits_before_video_start"
"live_stream_latency"
"max_downscale_percentage"
"max_request_latency"
"max_upscale_percentage"
"page_load_time"
"playback_failure_percentage"
"playback_success_score"
"player_startup_time"
"playing_time"
"rebuffer_count"
"rebuffer_duration"
"rebuffer_frequency"
"rebuffer_percentage"
"request_latency"
"request_throughput"
"rebuffer_score"
"requests_for_first_preroll"
"seek_latency"
"startup_time_score"
"unique_viewers"
"upscale_percentage"
"video_quality_score"
"video_startup_preroll_load_time"
"video_startup_preroll_request_time"
"video_startup_time"
"viewer_experience_score"
"views"
"weighted_average_bitrate"
"video_startup_failure_percentage"
"ad_attempt_count"
"ad_break_count"
"ad_break_error_count"
"ad_break_error_percentage"
"ad_error_count"
"ad_error_percentage"
"ad_exit_before_start_count"
"ad_exit_before_start_percentage"
"ad_impression_count"
"ad_startup_error_count"
"ad_startup_error_percentage"
"playback_business_exception_percentage"
"video_startup_business_exception_percentage"
"view_content_startup_time"
"ad_preroll_startup_time"
"view_dropped_percentage"
ID of the Metric

group_by
string
Possible values:
"asn"
"asset_id"
"browser"
"browser_version"
"cdn"
"continent_code"
"country"
"custom_1"
"custom_2"
"custom_3"
"custom_4"
"custom_5"
"custom_6"
"custom_7"
"custom_8"
"custom_9"
"custom_10"
"exit_before_video_start"
"experiment_name"
"live_stream_id"
"operating_system"
"operating_system_version"
"page_type"
"playback_failure"
"playback_business_exception"
"playback_id"
"player_autoplay"
"player_error_code"
"player_mux_plugin_name"
"player_mux_plugin_version"
"player_name"
"player_preload"
"player_remote_played"
"player_software"
"player_software_version"
"player_version"
"preroll_ad_asset_hostname"
"preroll_ad_tag_hostname"
"preroll_played"
"preroll_requested"
"region"
"source_hostname"
"source_type"
"stream_type"
"sub_property_id"
"video_content_type"
"video_encoding_variant"
"video_id"
"video_series"
"video_startup_business_exception"
"video_startup_failure"
"video_title"
"view_drm_type"
"view_has_ad"
"view_session_id"
"viewer_connection_type"
"viewer_device_category"
"viewer_device_manufacturer"
"viewer_device_model"
"viewer_device_name"
"viewer_user_id"
"ad_playback_failure"
"content_playback_failure"
"view_dropped"
Breakdown value to group the results by

measurement
string
Possible values:
"95th"
"median"
"avg"
"count"
"sum"
Measurement for the provided metric. If omitted, the default for the metric will be used.
The default measurement for each metric is:
"sum" : ad_attempt_count, ad_break_count, ad_break_error_count, ad_error_count, ad_impression_count, playing_time
"median" : ad_preroll_startup_time, aggregate_startup_time, content_startup_time, max_downscale_percentage, max_upscale_percentage, page_load_time, player_average_live_latency, player_startup_time, rebuffer_count, rebuffer_duration, requests_for_first_preroll, video_startup_preroll_load_time, video_startup_preroll_request_time, video_startup_time, view_average_request_latency, view_average_request_throughput, view_max_request_latency, weighted_average_bitrate
"avg" : ad_break_error_percentage, ad_error_percentage, ad_exit_before_start_count, ad_exit_before_start_percentage, ad_playback_failure_percentage, ad_startup_error_count, ad_startup_error_percentage, content_playback_failure_percentage, downscale_percentage, exits_before_video_start, playback_business_exception_percentage, playback_failure_percentage, playback_success_score, rebuffer_frequency, rebuffer_percentage, seek_latency, smoothness_score, startup_time_score, upscale_percentage, video_quality_score, video_startup_business_exception_percentage, video_startup_failure_percentage, view_dropped_percentage, viewer_experience_score
"count" : started_views, unique_viewers

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

order_by
string
Possible values:
"negative_impact"
"value"
"views"
"field"
Value to order the results by

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
get
200
/data/v1/metrics/{METRIC_ID}/breakdown
Response
(application/json)
copy
{
  "total_row_count": 1,
  "timeframe": [
    1610028298,
    1610114698
  ],
  "meta": {
    "aggregation": "view_end"
  },
  "data": [
    {
      "views": 5,
      "value": 4,
      "total_watch_time": 513934,
      "total_playing_time": 413934,
      "negative_impact": 1,
      "field": "US"
    }
  ]
}
Get Overall values
get
Returns the overall value for a specific metric, as well as the total view count, watch time, and the Mux Global metric value for the metric.

Request path & query params
METRIC_ID
string
Possible values:
"aggregate_startup_time"
"downscale_percentage"
"exits_before_video_start"
"live_stream_latency"
"max_downscale_percentage"
"max_request_latency"
"max_upscale_percentage"
"page_load_time"
"playback_failure_percentage"
"playback_success_score"
"player_startup_time"
"playing_time"
"rebuffer_count"
"rebuffer_duration"
"rebuffer_frequency"
"rebuffer_percentage"
"request_latency"
"request_throughput"
"rebuffer_score"
"requests_for_first_preroll"
"seek_latency"
"startup_time_score"
"unique_viewers"
"upscale_percentage"
"video_quality_score"
"video_startup_preroll_load_time"
"video_startup_preroll_request_time"
"video_startup_time"
"viewer_experience_score"
"views"
"weighted_average_bitrate"
"video_startup_failure_percentage"
"ad_attempt_count"
"ad_break_count"
"ad_break_error_count"
"ad_break_error_percentage"
"ad_error_count"
"ad_error_percentage"
"ad_exit_before_start_count"
"ad_exit_before_start_percentage"
"ad_impression_count"
"ad_startup_error_count"
"ad_startup_error_percentage"
"playback_business_exception_percentage"
"video_startup_business_exception_percentage"
"view_content_startup_time"
"ad_preroll_startup_time"
"view_dropped_percentage"
ID of the Metric

timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
measurement
string
Possible values:
"95th"
"median"
"avg"
"count"
"sum"
Measurement for the provided metric. If omitted, the default for the metric will be used.
The default measurement for each metric is:
"sum" : ad_attempt_count, ad_break_count, ad_break_error_count, ad_error_count, ad_impression_count, playing_time
"median" : ad_preroll_startup_time, aggregate_startup_time, content_startup_time, max_downscale_percentage, max_upscale_percentage, page_load_time, player_average_live_latency, player_startup_time, rebuffer_count, rebuffer_duration, requests_for_first_preroll, video_startup_preroll_load_time, video_startup_preroll_request_time, video_startup_time, view_average_request_latency, view_average_request_throughput, view_max_request_latency, weighted_average_bitrate
"avg" : ad_break_error_percentage, ad_error_percentage, ad_exit_before_start_count, ad_exit_before_start_percentage, ad_playback_failure_percentage, ad_startup_error_count, ad_startup_error_percentage, content_playback_failure_percentage, downscale_percentage, exits_before_video_start, playback_business_exception_percentage, playback_failure_percentage, playback_success_score, rebuffer_frequency, rebuffer_percentage, seek_latency, smoothness_score, startup_time_score, upscale_percentage, video_quality_score, video_startup_business_exception_percentage, video_startup_failure_percentage, view_dropped_percentage, viewer_experience_score
"count" : started_views, unique_viewers

get
200
/data/v1/metrics/{METRIC_ID}/overall
Response
(application/json)
copy
{
  "total_row_count": 1,
  "timeframe": [
    1610029525,
    1610115925
  ],
  "meta": {
    "aggregation": "view_end"
  },
  "data": {
    "value": 4,
    "total_watch_time": 513934,
    "total_playing_time": 413934,
    "total_views": 5,
    "global_value": 1169.1832095168065
  }
}
List Insights
get
Returns a list of insights for a metric. These are the worst performing values across all breakdowns sorted by how much they negatively impact a specific metric.

Request path & query params
METRIC_ID
string
Possible values:
"aggregate_startup_time"
"downscale_percentage"
"exits_before_video_start"
"live_stream_latency"
"max_downscale_percentage"
"max_request_latency"
"max_upscale_percentage"
"page_load_time"
"playback_failure_percentage"
"playback_success_score"
"player_startup_time"
"playing_time"
"rebuffer_count"
"rebuffer_duration"
"rebuffer_frequency"
"rebuffer_percentage"
"request_latency"
"request_throughput"
"rebuffer_score"
"requests_for_first_preroll"
"seek_latency"
"startup_time_score"
"unique_viewers"
"upscale_percentage"
"video_quality_score"
"video_startup_preroll_load_time"
"video_startup_preroll_request_time"
"video_startup_time"
"viewer_experience_score"
"views"
"weighted_average_bitrate"
"video_startup_failure_percentage"
"ad_attempt_count"
"ad_break_count"
"ad_break_error_count"
"ad_break_error_percentage"
"ad_error_count"
"ad_error_percentage"
"ad_exit_before_start_count"
"ad_exit_before_start_percentage"
"ad_impression_count"
"ad_startup_error_count"
"ad_startup_error_percentage"
"playback_business_exception_percentage"
"video_startup_business_exception_percentage"
"view_content_startup_time"
"ad_preroll_startup_time"
"view_dropped_percentage"
ID of the Metric

measurement
string
Possible values:
"95th"
"median"
"avg"
"count"
"sum"
Measurement for the provided metric. If omitted, the default for the metric will be used.
The default measurement for each metric is:
"sum" : ad_attempt_count, ad_break_count, ad_break_error_count, ad_error_count, ad_impression_count, playing_time
"median" : ad_preroll_startup_time, aggregate_startup_time, content_startup_time, max_downscale_percentage, max_upscale_percentage, page_load_time, player_average_live_latency, player_startup_time, rebuffer_count, rebuffer_duration, requests_for_first_preroll, video_startup_preroll_load_time, video_startup_preroll_request_time, video_startup_time, view_average_request_latency, view_average_request_throughput, view_max_request_latency, weighted_average_bitrate
"avg" : ad_break_error_percentage, ad_error_percentage, ad_exit_before_start_count, ad_exit_before_start_percentage, ad_playback_failure_percentage, ad_startup_error_count, ad_startup_error_percentage, content_playback_failure_percentage, downscale_percentage, exits_before_video_start, playback_business_exception_percentage, playback_failure_percentage, playback_success_score, rebuffer_frequency, rebuffer_percentage, seek_latency, smoothness_score, startup_time_score, upscale_percentage, video_quality_score, video_startup_business_exception_percentage, video_startup_failure_percentage, view_dropped_percentage, viewer_experience_score
"count" : started_views, unique_viewers

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
get
200
/data/v1/metrics/{METRIC_ID}/insights
Response
(application/json)
copy
{
  "total_row_count": 18,
  "timeframe": [
    1610029610,
    1610116010
  ],
  "meta": {
    "aggregation": "view_end"
  },
  "data": [
    {
      "total_watch_time": 351144,
      "total_playing_time": 341144,
      "total_views": 1,
      "negative_impact_score": -5,
      "metric": 9,
      "filter_value": "",
      "filter_column": "video_title"
    },
    {
      "total_watch_time": 513934,
      "total_views": 5,
      "negative_impact_score": 0,
      "metric": 4,
      "filter_value": "US",
      "filter_column": "country"
    }
  ]
}
Get metric timeseries data
get
Returns timeseries data for a specific metric.

Each interval represented in the data array contains an array with the following values:

the first element is the interval time
the second element is the calculated metric value
the third element is the number of views in the interval that have a valid metric value
Request path & query params
METRIC_ID
string
Possible values:
"aggregate_startup_time"
"downscale_percentage"
"exits_before_video_start"
"live_stream_latency"
"max_downscale_percentage"
"max_request_latency"
"max_upscale_percentage"
"page_load_time"
"playback_failure_percentage"
"playback_success_score"
"player_startup_time"
"playing_time"
"rebuffer_count"
"rebuffer_duration"
"rebuffer_frequency"
"rebuffer_percentage"
"request_latency"
"request_throughput"
"rebuffer_score"
"requests_for_first_preroll"
"seek_latency"
"startup_time_score"
"unique_viewers"
"upscale_percentage"
"video_quality_score"
"video_startup_preroll_load_time"
"video_startup_preroll_request_time"
"video_startup_time"
"viewer_experience_score"
"views"
"weighted_average_bitrate"
"video_startup_failure_percentage"
"ad_attempt_count"
"ad_break_count"
"ad_break_error_count"
"ad_break_error_percentage"
"ad_error_count"
"ad_error_percentage"
"ad_exit_before_start_count"
"ad_exit_before_start_percentage"
"ad_impression_count"
"ad_startup_error_count"
"ad_startup_error_percentage"
"playback_business_exception_percentage"
"video_startup_business_exception_percentage"
"view_content_startup_time"
"ad_preroll_startup_time"
"view_dropped_percentage"
ID of the Metric

timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
measurement
string
Possible values:
"95th"
"median"
"avg"
"count"
"sum"
Measurement for the provided metric. If omitted, the default for the metric will be used.
The default measurement for each metric is:
"sum" : ad_attempt_count, ad_break_count, ad_break_error_count, ad_error_count, ad_impression_count, playing_time
"median" : ad_preroll_startup_time, aggregate_startup_time, content_startup_time, max_downscale_percentage, max_upscale_percentage, page_load_time, player_average_live_latency, player_startup_time, rebuffer_count, rebuffer_duration, requests_for_first_preroll, video_startup_preroll_load_time, video_startup_preroll_request_time, video_startup_time, view_average_request_latency, view_average_request_throughput, view_max_request_latency, weighted_average_bitrate
"avg" : ad_break_error_percentage, ad_error_percentage, ad_exit_before_start_count, ad_exit_before_start_percentage, ad_playback_failure_percentage, ad_startup_error_count, ad_startup_error_percentage, content_playback_failure_percentage, downscale_percentage, exits_before_video_start, playback_business_exception_percentage, playback_failure_percentage, playback_success_score, rebuffer_frequency, rebuffer_percentage, seek_latency, smoothness_score, startup_time_score, upscale_percentage, video_quality_score, video_startup_business_exception_percentage, video_startup_failure_percentage, view_dropped_percentage, viewer_experience_score
"count" : started_views, unique_viewers

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

group_by
string
Possible values:
"minute"
"ten_minutes"
"hour"
"day"
Time granularity to group results by. If this value is omitted, a default granularity is chosen based on the timeframe.

For timeframes of less than 90 minutes, the default granularity is minute. Between 90 minutes and 6 hours, the default granularity is ten_minutes. Between 6 hours and 15 days inclusive, the default granularity is hour. The granularity of timeframes that exceed 15 days is day. This default behavior is subject to change; it is strongly suggested that you explicitly specify the granularity.

get
200
/data/v1/metrics/{METRIC_ID}/timeseries
Response
(application/json)
copy
{
  "total_row_count": 2,
  "timeframe": [
    1610029711,
    1610116111
  ],
  "meta": {
    "aggregation": "view_end"
  },
  "data": [
    [
      "2021-01-07T14:00:00Z",
      "0.8743536882994202",
      "154240"
    ],
    [
      "2021-01-07T15:00:00Z",
      "0.8929105055911401",
      "156056"
    ]
  ]
}
List all metric values
get
List all of the values across every breakdown for a specific metric.

Request path & query params
timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
dimension
string
Possible values:
"asn"
"asset_id"
"browser"
"browser_version"
"cdn"
"continent_code"
"country"
"custom_1"
"custom_2"
"custom_3"
"custom_4"
"custom_5"
"custom_6"
"custom_7"
"custom_8"
"custom_9"
"custom_10"
"exit_before_video_start"
"experiment_name"
"live_stream_id"
"operating_system"
"operating_system_version"
"page_type"
"playback_failure"
"playback_business_exception"
"playback_id"
"player_autoplay"
"player_error_code"
"player_mux_plugin_name"
"player_mux_plugin_version"
"player_name"
"player_preload"
"player_remote_played"
"player_software"
"player_software_version"
"player_version"
"preroll_ad_asset_hostname"
"preroll_ad_tag_hostname"
"preroll_played"
"preroll_requested"
"region"
"source_hostname"
"source_type"
"stream_type"
"sub_property_id"
"video_content_type"
"video_encoding_variant"
"video_id"
"video_series"
"video_startup_failure"
"video_startup_business_exception"
"video_title"
"view_drm_type"
"view_has_ad"
"view_session_id"
"viewer_connection_type"
"viewer_device_category"
"viewer_device_manufacturer"
"viewer_device_model"
"viewer_device_name"
"viewer_user_id"
"ad_playback_failure"
"content_playback_failure"
"view_dropped"
Dimension the specified value belongs to

value
string
Value to show all available metrics for

get
200
/data/v1/metrics/comparison
Response
(application/json)
copy
{
  "total_row_count": 1,
  "timeframe": [
    1610029906,
    1610116306
  ],
  "data": [
    {
      "watch_time": 513934,
      "view_count": 5,
      "started_views": 6,
      "ended_views": 5,
      "unique_viewers": 6,
      "total_playing_time": 503934,
      "name": "totals"
    },
    {
      "value": 6,
      "type": "number",
      "name": "Views",
      "metric": "views",
      "items": [
        {
          "value": 6,
          "type": "number",
          "name": "Unique Viewers",
          "metric": "unique_viewers"
        },
        {
          "value": 503934,
          "type": "milliseconds",
          "name": "Playing Time",
          "metric": "playing_time"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Attempts (total)",
          "metric": "ad_attempt_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Attempts (average)",
          "metric": "ad_attempt_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Breaks (total)",
          "metric": "ad_break_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Breaks (average)",
          "metric": "ad_break_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Impressions (total)",
          "metric": "ad_impression_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Impressions (average)",
          "metric": "ad_impression_count",
          "measurement": "avg"
        }
      ]
    },
    {
      "value": 0.7803472280502319,
      "type": "score",
      "name": "Overall Score",
      "metric": "viewer_experience_score"
    },
    {
      "value": 0.8,
      "type": "score",
      "name": "Playback Failure Score",
      "metric": "playback_failure_score",
      "items": [
        {
          "value": 0.2,
          "type": "percentage",
          "name": "Playback Failure Percentage",
          "metric": "playback_failure_percentage"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Video Startup Failure Percentage",
          "metric": "video_startup_failure_percentage"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Exits Before Video Start",
          "metric": "exits_before_video_start"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "View Dropped Percentage",
          "metric": "view_dropped_percentage"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Errors (total)",
          "metric": "ad_error_count",
          "measurement": "sum"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Errors (average)",
          "metric": "ad_error_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Ad Error Percentage (average)",
          "metric": "ad_error_percentage",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Break Errors (total)",
          "metric": "ad_break_error_count",
          "measurement": "sum"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Ad Break Errors (average)",
          "metric": "ad_break_error_count",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Ad Break Error Percentage (average)",
          "metric": "ad_break_error_percentage",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Ad Startup Error Percentage (average)",
          "metric": "ad_startup_error_percentage",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Ad Exit Before Start Percentage (average)",
          "metric": "ad_exit_before_start_percentage",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Playback Business Exception Percentage (average)",
          "metric": "playback_business_exception_percentage",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Video Startup Business Exception Percentage (average)",
          "metric": "video_startup_business_exception_percentage",
          "measurement": "avg"
        }
      ]
    },
    {
      "value": 0.9991008877754212,
      "type": "score",
      "name": "Startup Time Score",
      "metric": "startup_time_score",
      "items": [
        {
          "value": 4,
          "type": "milliseconds",
          "name": "Video Startup Time (median)",
          "metric": "video_startup_time",
          "measurement": "median"
        },
        {
          "value": 9,
          "type": "milliseconds",
          "name": "Video Startup Time (95th %)",
          "metric": "video_startup_time",
          "measurement": "95th"
        },
        {
          "value": 52.5625,
          "type": "milliseconds",
          "name": "Player Startup Time (median)",
          "metric": "player_startup_time",
          "measurement": "median"
        },
        {
          "value": 60.0625,
          "type": "milliseconds",
          "name": "Player Startup Time (95th %)",
          "metric": "player_startup_time",
          "measurement": "95th"
        },
        {
          "value": 122.37890625,
          "type": "milliseconds",
          "name": "Page Load Time (median)",
          "metric": "page_load_time",
          "measurement": "median"
        },
        {
          "value": 264.0625,
          "type": "milliseconds",
          "name": "Page Load Time (95th %)",
          "metric": "page_load_time",
          "measurement": "95th"
        },
        {
          "value": 182.25,
          "type": "milliseconds",
          "name": "Aggregate Startup Time (median)",
          "metric": "aggregate_startup_time",
          "measurement": "median"
        },
        {
          "value": 319.515625,
          "type": "milliseconds",
          "name": "Aggregate Startup Time (95th %)",
          "metric": "aggregate_startup_time",
          "measurement": "95th"
        },
        {
          "value": 3042,
          "type": "milliseconds",
          "name": "Seek Latency",
          "metric": "seek_latency"
        },
        {
          "value": 1000,
          "type": "milliseconds",
          "name": "Content Startup Time (median)",
          "metric": "view_content_startup_time",
          "measurement": "median"
        },
        {
          "value": 1403,
          "type": "milliseconds",
          "name": "Content Startup Time (95th %)",
          "metric": "view_content_startup_time",
          "measurement": "95th"
        },
        {
          "value": 800,
          "type": "milliseconds",
          "name": "Ad Preroll Startup Time (median)",
          "metric": "ad_preroll_startup_time",
          "measurement": "median"
        },
        {
          "value": 1243,
          "type": "milliseconds",
          "name": "Ad Preroll Startup Time (95th %)",
          "metric": "ad_preroll_startup_time",
          "measurement": "95th"
        }
      ]
    },
    {
      "value": 0.9523247838020324,
      "type": "score",
      "name": "Rebuffer Score",
      "metric": "rebuffer_score",
      "items": [
        {
          "value": 0.0005564916895943838,
          "type": "percentage",
          "name": "Rebuffer Percentage",
          "metric": "rebuffer_percentage"
        },
        {
          "value": 0.11674650830651406,
          "type": "per_minute",
          "name": "Rebuffer Frequency",
          "metric": "rebuffer_frequency"
        },
        {
          "value": 0,
          "type": "milliseconds",
          "name": "Rebuffer Duration (median)",
          "metric": "rebuffer_duration",
          "measurement": "median"
        },
        {
          "value": 256,
          "type": "milliseconds",
          "name": "Rebuffer Duration (95th %)",
          "metric": "rebuffer_duration",
          "measurement": "95th"
        },
        {
          "value": 0,
          "type": "number",
          "name": "Rebuffer Count (median)",
          "metric": "rebuffer_count",
          "measurement": "median"
        },
        {
          "value": 1,
          "type": "number",
          "name": "Rebuffer Count (95th %)",
          "metric": "rebuffer_count",
          "measurement": "95th"
        }
      ]
    },
    {
      "value": 1,
      "type": "score",
      "name": "Video Quality Score",
      "metric": "video_quality_score",
      "items": [
        {
          "value": 0,
          "type": "percentage",
          "name": "Upscale Percentage (median)",
          "metric": "upscale_percentage",
          "measurement": "median"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Upscale Percentage (95th %)",
          "metric": "upscale_percentage",
          "measurement": "95th"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Upscale Percentage (average)",
          "metric": "upscale_percentage",
          "measurement": "avg"
        },
        {
          "value": 0.007,
          "type": "percentage",
          "name": "Downscale Percentage (median)",
          "metric": "downscale_percentage",
          "measurement": "median"
        },
        {
          "value": 0.449,
          "type": "percentage",
          "name": "Downscale Percentage (95th %)",
          "metric": "downscale_percentage",
          "measurement": "95th"
        },
        {
          "value": 0.11813909473676262,
          "type": "percentage",
          "name": "Downscale Percentage (average)",
          "metric": "downscale_percentage",
          "measurement": "avg"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Max Upscale Percentage (median)",
          "metric": "max_upscale_percentage",
          "measurement": "median"
        },
        {
          "value": 0,
          "type": "percentage",
          "name": "Max Upscale Percentage (95th %)",
          "metric": "max_upscale_percentage",
          "measurement": "95th"
        },
        {
          "value": 0.007,
          "type": "percentage",
          "name": "Max Downscale Percentage (median)",
          "metric": "max_downscale_percentage",
          "measurement": "median"
        },
        {
          "value": 0.449,
          "type": "percentage",
          "name": "Max Downscale Percentage (95th %)",
          "metric": "max_downscale_percentage",
          "measurement": "95th"
        },
        {
          "value": 851582.91015625,
          "type": "mbps",
          "name": "Weighted Average Bitrate (median)",
          "metric": "weighted_average_bitrate",
          "measurement": "median"
        },
        {
          "value": 697016.265625,
          "type": "mbps",
          "name": "Weighted Average Bitrate (95th %)",
          "metric": "weighted_average_bitrate",
          "measurement": "95th"
        },
        {
          "value": 2195,
          "type": "milliseconds",
          "name": "Live Stream Latency (median)",
          "metric": "live_stream_latency",
          "measurement": "median"
        },
        {
          "value": 3523,
          "type": "milliseconds",
          "name": "Live Stream Latency (95th %)",
          "metric": "live_stream_latency",
          "measurement": "95th"
        }
      ]
    }
  ]
}
Monitoring
Monitoring metrics are used for operational monitoring of a video platform. The metrics are aggregated in five second intervals, across the views that are currently being watched. The real-time metrics' timeline, breakdown, and histogram representations are available via the APIs.

Monitoring metrics are similar but not directly comparable to the historical metrics in the Metrics APIs. These metrics are aggregated to provide the most operational detail possible used for resolving operational issues.

List Monitoring Dimensions
get
Lists available monitoring dimensions.

get
200
/data/v1/monitoring/dimensions
Response
(application/json)
copy
{
  "data": [
    {
      "display_name": "ASN",
      "name": "asn"
    },
    {
      "display_name": "CDN",
      "name": "cdn"
    },
    {
      "display_name": "Country",
      "name": "country"
    },
    {
      "display_name": "Operating system",
      "name": "operating_system"
    },
    {
      "display_name": "Player name",
      "name": "player_name"
    },
    {
      "display_name": "Region / State",
      "name": "region"
    },
    {
      "display_name": "Stream type",
      "name": "stream_type"
    },
    {
      "display_name": "Sub property ID",
      "name": "sub_property_id"
    },
    {
      "display_name": "Video series",
      "name": "video_series"
    },
    {
      "display_name": "Video title",
      "name": "video_title"
    },
    {
      "display_name": "View has ad",
      "name": "view_has_ad"
    }
  ],
  "timeframe": [
    1610034823,
    1610121223
  ],
  "total_row_count": 1
}
List Monitoring Metrics
get
Lists available monitoring metrics.

get
200
/data/v1/monitoring/metrics
Response
(application/json)
copy
{
  "data": [
    {
      "display_name": "Current Average Bitrate",
      "name": "current-average-bitrate"
    },
    {
      "display_name": "Current Concurrent Viewers (CCV)",
      "name": "current-concurrent-viewers"
    },
    {
      "display_name": "Current Rebuffering Percentage",
      "name": "current-rebuffering-percentage"
    },
    {
      "display_name": "Exits Before Video Start",
      "name": "exits-before-video-start"
    },
    {
      "display_name": "Playback Failure Percentage",
      "name": "playback-failure-percentage"
    },
    {
      "display_name": "Video Startup Failure Percentage",
      "name": "video-startup-failure-percentage"
    },
    {
      "display_name": "Video Startup Time",
      "name": "video-startup-time"
    }
  ],
  "timeframe": [
    1610034858,
    1610121258
  ],
  "total_row_count": 1
}
Get Monitoring Breakdown
get
Gets breakdown information for a specific dimension and metric along with the number of concurrent viewers and negative impact score.

Request path & query params
MONITORING_METRIC_ID
string
Possible values:
"current-concurrent-viewers"
"current-rebuffering-percentage"
"exits-before-video-start"
"playback-failure-percentage"
"current-average-bitrate"
"video-startup-failure-percentage"
ID of the Monitoring Metric

dimension
string
Possible values:
"asn"
"cdn"
"country"
"operating_system"
"player_name"
"region"
"stream_type"
"sub_property_id"
"video_series"
"video_title"
"view_has_ad"
Dimension the specified value belongs to

timestamp
integer
Timestamp to limit results by. This value must be provided as a unix timestamp. Defaults to the current unix timestamp.

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
order_by
string
Possible values:
"negative_impact"
"value"
"views"
"field"
Value to order the results by

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

get
200
/data/v1/monitoring/metrics/{MONITORING_METRIC_ID}/breakdown
Response
(application/json)
copy
{
  "data": [
    {
      "concurrent_viewers": 2680,
      "metric_value": 0.008195679660675846,
      "negative_impact": 1,
      "value": "FR"
    },
    {
      "concurrent_viewers": 36,
      "metric_value": 0.010317417106767573,
      "negative_impact": 4,
      "value": "ES"
    },
    {
      "concurrent_viewers": 30,
      "metric_value": 0.06408818534303201,
      "negative_impact": 2,
      "value": "RE"
    },
    {
      "concurrent_viewers": 26,
      "metric_value": 0.008232510579858339,
      "negative_impact": 7,
      "value": "GB"
    },
    {
      "concurrent_viewers": 10,
      "metric_value": 0,
      "negative_impact": 26,
      "value": "BE"
    }
  ],
  "timeframe": [
    1610121421,
    1610121421
  ],
  "total_row_count": 1
}
Get Monitoring Breakdown Timeseries
get
Gets timeseries of breakdown information for a specific dimension and metric. Each datapoint in the response represents 5 seconds worth of data.

Request path & query params
MONITORING_METRIC_ID
string
Possible values:
"current-concurrent-viewers"
"current-rebuffering-percentage"
"exits-before-video-start"
"playback-failure-percentage"
"current-average-bitrate"
"video-startup-failure-percentage"
ID of the Monitoring Metric

dimension
string
Possible values:
"asn"
"cdn"
"country"
"operating_system"
"player_name"
"region"
"stream_type"
"sub_property_id"
"video_series"
"video_title"
"view_has_ad"
Dimension the specified value belongs to

timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

The default for this is the last 60 seconds of available data. Timeframes larger than 10 minutes are not allowed, and must be within the last 24 hours.

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
limit
integer
(default: 10)
Number of items to include in each timestamp's value list.

The default is 10, and the maximum is 100.

order_by
string
Possible values:
"negative_impact"
"value"
"views"
"field"
Value to order the results by

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

get
200
/data/v1/monitoring/metrics/{MONITORING_METRIC_ID}/breakdown-timeseries
Response
(application/json)
copy
{
  "data": [
    {
      "values": [
        {
          "value": "FR",
          "metric_value": 0.008195679660675846,
          "concurrent_viewers": 2680,
          "starting_up_viewers": 10
        },
        {
          "value": "ES",
          "metric_value": 0.010317417106767573,
          "concurrent_viewers": 36,
          "starting_up_viewers": 1
        },
        {
          "value": "GB",
          "metric_value": 0.008232510579858339,
          "concurrent_viewers": 26,
          "starting_up_viewers": 1
        }
      ],
      "date": "2023-05-18T19:36:30Z"
    },
    {
      "values": [
        {
          "value": "FR",
          "metric_value": 0.00724579660675846,
          "concurrent_viewers": 2690,
          "starting_up_viewers": 1
        },
        {
          "value": "ES",
          "metric_value": 0.014317417106767573,
          "concurrent_viewers": 35,
          "starting_up_viewers": 15
        },
        {
          "value": "GB",
          "metric_value": 0.007232510579851874,
          "concurrent_viewers": 24,
          "starting_up_viewers": 1
        }
      ],
      "date": "2023-05-18T19:36:35Z"
    }
  ],
  "timeframe": [
    1684438590,
    1684438600
  ],
  "total_row_count": 2
}
Get Monitoring Histogram Timeseries
get
Gets histogram timeseries information for a specific metric.

Request path & query params
MONITORING_HISTOGRAM_METRIC_ID
string
Possible values:
"video-startup-time"
ID of the Monitoring Histogram Metric

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
get
200
/data/v1/monitoring/metrics/{MONITORING_HISTOGRAM_METRIC_ID}/histogram-timeseries
Response
(application/json)
copy
{
  "data": [
    {
      "average": 5298.1612903225805,
      "bucket_values": [
        {
          "count": 3,
          "percentage": 0.0967741935483871
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 1,
          "percentage": 0.03225806451612903
        },
        {
          "count": 16,
          "percentage": 0.5161290322580645
        },
        {
          "count": 7,
          "percentage": 0.22580645161290322
        },
        {
          "count": 4,
          "percentage": 0.12903225806451613
        }
      ],
      "max_percentage": 0.5161290322580645,
      "median": 4463,
      "p95": 14834,
      "sum": 31,
      "timestamp": "2021-01-08T15:30:00Z"
    },
    {
      "average": 3828.4146341463415,
      "bucket_values": [
        {
          "count": 5,
          "percentage": 0.12195121951219512
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 4,
          "percentage": 0.0975609756097561
        },
        {
          "count": 18,
          "percentage": 0.43902439024390244
        },
        {
          "count": 12,
          "percentage": 0.2926829268292683
        },
        {
          "count": 2,
          "percentage": 0.04878048780487805
        }
      ],
      "max_percentage": 0.43902439024390244,
      "median": 2625,
      "p95": 7378,
      "sum": 41,
      "timestamp": "2021-01-08T15:31:00Z"
    }
  ],
  "meta": {
    "bucket_unit": "milliseconds",
    "buckets": [
      {
        "end": 100,
        "start": 0
      },
      {
        "end": 500,
        "start": 100
      },
      {
        "end": 1000,
        "start": 500
      },
      {
        "end": 2000,
        "start": 1000
      },
      {
        "end": 5000,
        "start": 2000
      },
      {
        "end": 10000,
        "start": 5000
      },
      {
        "end": 15000,
        "start": 10000
      }
    ]
  },
  "timeframe": [
    1610119800,
    1610121540
  ],
  "total_row_count": 1
}
Get Monitoring Timeseries
get
Gets Time series information for a specific metric along with the number of concurrent viewers.

Request path & query params
MONITORING_METRIC_ID
string
Possible values:
"current-concurrent-viewers"
"current-rebuffering-percentage"
"exits-before-video-start"
"playback-failure-percentage"
"current-average-bitrate"
"video-startup-failure-percentage"
ID of the Monitoring Metric

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
timestamp
integer
Timestamp to use as the start of the timeseries data. This value must be provided as a unix timestamp. Defaults to 30 minutes ago.

get
200
/data/v1/monitoring/metrics/{MONITORING_METRIC_ID}/timeseries
Response
(application/json)
copy
{
  "data": [
    {
      "concurrent_viewers": 2790,
      "date": "2021-01-08T15:31:20Z",
      "value": 2790
    },
    {
      "concurrent_viewers": 2788,
      "date": "2021-01-08T15:31:25Z",
      "value": 2788
    },
    {
      "concurrent_viewers": 2791,
      "date": "2021-01-08T15:31:30Z",
      "value": 2791
    },
    {
      "concurrent_viewers": 2791,
      "date": "2021-01-08T15:31:35Z",
      "value": 2791
    },
    {
      "concurrent_viewers": 2792,
      "date": "2021-01-08T15:31:40Z",
      "value": 2792
    }
  ],
  "timeframe": [
    1610119880,
    1610121675
  ],
  "total_row_count": 1
}
Real-Time
The Mux Data Real-time API has been deprecated, please refer to the Mux Data Monitoring APIs which provide the same functionality.

List Real-Time Dimensions
get
Deprecated
Lists available real-time dimensions. This API is now deprecated, please use the List Monitoring Dimensions API.

get
200
/data/v1/realtime/dimensions
Response
(application/json)
copy
{
  "data": [
    {
      "display_name": "ASN",
      "name": "asn"
    },
    {
      "display_name": "CDN",
      "name": "cdn"
    },
    {
      "display_name": "Country",
      "name": "country"
    },
    {
      "display_name": "Operating system",
      "name": "operating_system"
    },
    {
      "display_name": "Player name",
      "name": "player_name"
    },
    {
      "display_name": "Region / State",
      "name": "region"
    },
    {
      "display_name": "Stream type",
      "name": "stream_type"
    },
    {
      "display_name": "Sub property ID",
      "name": "sub_property_id"
    },
    {
      "display_name": "Video series",
      "name": "video_series"
    },
    {
      "display_name": "Video title",
      "name": "video_title"
    }
  ],
  "timeframe": [
    1610034823,
    1610121223
  ],
  "total_row_count": 1
}
List Real-Time Metrics
get
Deprecated
Lists available real-time metrics. This API is now deprecated, please use the List Monitoring Metrics API.

get
200
/data/v1/realtime/metrics
Response
(application/json)
copy
{
  "data": [
    {
      "display_name": "Current Average Bitrate",
      "name": "current-average-bitrate"
    },
    {
      "display_name": "Current Concurrent Viewers (CCV)",
      "name": "current-concurrent-viewers"
    },
    {
      "display_name": "Current Rebuffering Percentage",
      "name": "current-rebuffering-percentage"
    },
    {
      "display_name": "Exits Before Video Start",
      "name": "exits-before-video-start"
    },
    {
      "display_name": "Playback Failure Percentage",
      "name": "playback-failure-percentage"
    },
    {
      "display_name": "Video Startup Time",
      "name": "video-startup-time"
    }
  ],
  "timeframe": [
    1610034858,
    1610121258
  ],
  "total_row_count": 1
}
Get Real-Time Breakdown
get
Deprecated
Gets breakdown information for a specific dimension and metric along with the number of concurrent viewers and negative impact score. This API is now deprecated, please use the Get Monitoring Breakdown API.

Request path & query params
REALTIME_METRIC_ID
string
Possible values:
"current-concurrent-viewers"
"current-rebuffering-percentage"
"exits-before-video-start"
"playback-failure-percentage"
"current-average-bitrate"
ID of the Realtime Metric

dimension
string
Possible values:
"asn"
"cdn"
"country"
"operating_system"
"player_name"
"region"
"stream_type"
"sub_property_id"
"video_series"
"video_title"
Dimension the specified value belongs to

timestamp
integer
Timestamp to limit results by. This value must be provided as a unix timestamp. Defaults to the current unix timestamp.

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
order_by
string
Possible values:
"negative_impact"
"value"
"views"
"field"
Value to order the results by

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

get
200
/data/v1/realtime/metrics/{REALTIME_METRIC_ID}/breakdown
Response
(application/json)
copy
{
  "data": [
    {
      "concurrent_viewers": 2680,
      "metric_value": 0.008195679660675846,
      "negative_impact": 1,
      "value": "FR"
    },
    {
      "concurrent_viewers": 36,
      "metric_value": 0.010317417106767573,
      "negative_impact": 4,
      "value": "ES"
    },
    {
      "concurrent_viewers": 30,
      "metric_value": 0.06408818534303201,
      "negative_impact": 2,
      "value": "RE"
    },
    {
      "concurrent_viewers": 26,
      "metric_value": 0.008232510579858339,
      "negative_impact": 7,
      "value": "GB"
    },
    {
      "concurrent_viewers": 10,
      "metric_value": 0,
      "negative_impact": 26,
      "value": "BE"
    }
  ],
  "timeframe": [
    1610121421,
    1610121421
  ],
  "total_row_count": 1
}
Get Real-Time Histogram Timeseries
get
Deprecated
Gets histogram timeseries information for a specific metric. This API is now deprecated, please use the Get Monitoring Histogram Timeseries API.

Request path & query params
REALTIME_HISTOGRAM_METRIC_ID
string
Possible values:
"video-startup-time"
ID of the Realtime Histogram Metric

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
get
200
/data/v1/realtime/metrics/{REALTIME_HISTOGRAM_METRIC_ID}/histogram-timeseries
Response
(application/json)
copy
{
  "data": [
    {
      "average": 5298.1612903225805,
      "bucket_values": [
        {
          "count": 3,
          "percentage": 0.0967741935483871
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 1,
          "percentage": 0.03225806451612903
        },
        {
          "count": 16,
          "percentage": 0.5161290322580645
        },
        {
          "count": 7,
          "percentage": 0.22580645161290322
        },
        {
          "count": 4,
          "percentage": 0.12903225806451613
        }
      ],
      "max_percentage": 0.5161290322580645,
      "median": 4463,
      "p95": 14834,
      "sum": 31,
      "timestamp": "2021-01-08T15:30:00Z"
    },
    {
      "average": 3828.4146341463415,
      "bucket_values": [
        {
          "count": 5,
          "percentage": 0.12195121951219512
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 0,
          "percentage": 0
        },
        {
          "count": 4,
          "percentage": 0.0975609756097561
        },
        {
          "count": 18,
          "percentage": 0.43902439024390244
        },
        {
          "count": 12,
          "percentage": 0.2926829268292683
        },
        {
          "count": 2,
          "percentage": 0.04878048780487805
        }
      ],
      "max_percentage": 0.43902439024390244,
      "median": 2625,
      "p95": 7378,
      "sum": 41,
      "timestamp": "2021-01-08T15:31:00Z"
    }
  ],
  "meta": {
    "bucket_unit": "milliseconds",
    "buckets": [
      {
        "end": 100,
        "start": 0
      },
      {
        "end": 500,
        "start": 100
      },
      {
        "end": 1000,
        "start": 500
      },
      {
        "end": 2000,
        "start": 1000
      },
      {
        "end": 5000,
        "start": 2000
      },
      {
        "end": 10000,
        "start": 5000
      },
      {
        "end": 15000,
        "start": 10000
      }
    ]
  },
  "timeframe": [
    1610119800,
    1610121540
  ],
  "total_row_count": 1
}
Get Real-Time Timeseries
get
Deprecated
Gets Time series information for a specific metric along with the number of concurrent viewers. This API is now deprecated, please use the Get Monitoring Timeseries API.

Request path & query params
REALTIME_METRIC_ID
string
Possible values:
"current-concurrent-viewers"
"current-rebuffering-percentage"
"exits-before-video-start"
"playback-failure-percentage"
"current-average-bitrate"
ID of the Realtime Metric

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Monitoring Dimensions endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
timestamp
integer
Timestamp to use as the start of the timeseries data. This value must be provided as a unix timestamp. Defaults to 30 minutes ago.

get
200
/data/v1/realtime/metrics/{REALTIME_METRIC_ID}/timeseries
Response
(application/json)
copy
{
  "data": [
    {
      "concurrent_viewers": 2790,
      "date": "2021-01-08T15:31:20Z",
      "value": 2790
    },
    {
      "concurrent_viewers": 2788,
      "date": "2021-01-08T15:31:25Z",
      "value": 2788
    },
    {
      "concurrent_viewers": 2791,
      "date": "2021-01-08T15:31:30Z",
      "value": 2791
    },
    {
      "concurrent_viewers": 2791,
      "date": "2021-01-08T15:31:35Z",
      "value": 2791
    },
    {
      "concurrent_viewers": 2792,
      "date": "2021-01-08T15:31:40Z",
      "value": 2792
    }
  ],
  "timeframe": [
    1610119880,
    1610121675
  ],
  "total_row_count": 1
}
Dimensions
Dimensions are the types of metadata that can be collected for a video view. Some dimensions are collected automatically based on the playback or device, such as the viewer's Country or the device information. Other dimensions are specified by the developer when configuring a Mux Data video view such as the video title. The Dimensions APIs allow you to get a list of the supported dimensions and their values.

List Dimensions
get
List all available dimensions.

Note: This API replaces the list-filters API call.

get
200
/data/v1/dimensions
Response
(application/json)
copy
{
  "data": {
    "advanced": [
      "browser_version",
      "operating_system_version",
      "viewer_device_name",
      "viewer_device_model",
      "viewer_device_category",
      "viewer_device_manufacturer",
      "player_name",
      "player_version",
      "video_series",
      "video_encoding_variant",
      "experiment_name",
      "sub_property_id",
      "asn",
      "cdn",
      "viewer_connection_type",
      "view_session_id",
      "region",
      "viewer_user_id",
      "exit_before_video_start",
      "video_startup_failure",
      "playback_failure",
      "preroll_ad_asset_hostname",
      "preroll_ad_tag_hostname",
      "preroll_played",
      "preroll_requested",
      "playback_business_exception",
      "video_startup_business_exception",
      "ad_playback_failure",
      "content_playback_failure"
    ],
    "basic": [
      "browser",
      "operating_system",
      "player_remote_played",
      "player_software",
      "player_software_version",
      "player_mux_plugin_name",
      "player_mux_plugin_version",
      "player_autoplay",
      "player_preload",
      "video_title",
      "video_id",
      "stream_type",
      "source_type",
      "source_hostname",
      "continent_code",
      "country",
      "player_error_code",
      "asset_id",
      "live_stream_id",
      "playback_id",
      "video_content_type",
      "page_type",
      "view_drm_type",
      "view_has_ad",
      "custom_1",
      "custom_2",
      "custom_3",
      "custom_4",
      "custom_5",
      "custom_6",
      "custom_7",
      "custom_8",
      "custom_9",
      "custom_10",
      "view_dropped"
    ]
  },
  "timeframe": [
    1610033879,
    1610120279
  ],
  "total_row_count": 1
}
Lists the values for a specific dimension
get
Lists the values for a dimension along with a total count of related views.

Note: This API replaces the list-filter-values API call.

Request path & query params
DIMENSION_ID
string
ID of the Dimension

limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

filters[]
array
Limit the results to rows that match conditions from provided key:value pairs. Must be provided as an array query string parameter.

To exclude rows that match a certain condition, prepend a ! character to the dimension.

Possible filter names are the same as returned by the List Filters endpoint.

Example:

filters[]=operating_system:windows&filters[]=!country:US
metric_filters[]
array
Limit the results to rows that match inequality conditions from provided metric comparison clauses. Must be provided as an array query string parameter.

Possible filterable metrics are the same as the set of metric ids, with the exceptions of exits_before_video_start, unique_viewers, video_startup_failure_percentage, view_dropped_percentage, and views.

Example:

metric_filters[]=aggregate_startup_time>=1000
timeframe[]
array
Timeframe window to limit results by. Must be provided as an array query string parameter (e.g. timeframe[]=).

Accepted formats are...

array of epoch timestamps e.g. timeframe[]=1498867200&timeframe[]=1498953600
duration string e.g. timeframe[]=24:hours or timeframe[]=7:days
get
200
/data/v1/dimensions/{DIMENSION_ID}
Response
(application/json)
copy
{
  "data": [
    {
      "total_count": 10000,
      "value": "FR"
    },
    {
      "total_count": 5000,
      "value": "ES"
    },
    {
      "total_count": 2000,
      "value": "PT"
    },
    {
      "total_count": 100,
      "value": "DE"
    },
    {
      "total_count": 1,
      "value": "BE"
    }
  ],
  "timeframe": [
    1610033976,
    1610120376
  ],
  "total_row_count": 5
}
Incidents
Incidents occur when an anomaly alert is triggered in Mux Data. The Incidents API provides operations related to the raising and managing of alerting incidents.

List Incidents
get
Returns a list of incidents.

Request path & query params
limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

order_by
string
Possible values:
"negative_impact"
"value"
"views"
"field"
Value to order the results by

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

status
string
Possible values:
"open"
"closed"
"expired"
Status to filter incidents by

severity
string
Possible values:
"warning"
"alert"
Severity to filter incidents by

get
200
/data/v1/incidents
Response
(application/json)
copy
{
  "data": [
    {
      "affected_views": 71,
      "affected_views_per_hour": 29,
      "affected_views_per_hour_on_open": 75,
      "breakdowns": [
        {
          "id": "abcdef",
          "name": "error_type_id",
          "value": "697070"
        }
      ],
      "description": "Something is broken",
      "error_description": "No seriously, something is really really broken :(",
      "id": "4u13td",
      "impact": "*71 views* were affected at a rate of *29 per hour*",
      "incident_key": "5312a7c0bbb5d8353bd88602f01fe58eb15e9febac8fd2f0d8ce8f1cb138145c",
      "measured_value": 5.9,
      "measured_value_on_close": 0.1,
      "measurement": "error_rate",
      "notification_rules": [],
      "notifications": [
        {
          "attempted_at": "2021-01-05T09:52:15.119040Z",
          "id": 103014,
          "queued_at": "2021-01-05T09:52:14.945157Z"
        },
        {
          "attempted_at": "2021-01-05T11:31:08.244462Z",
          "id": 102025,
          "queued_at": "2021-01-05T11:31:08.061924Z"
        }
      ],
      "resolved_at": "2021-01-05T11:31:04.000000Z",
      "sample_size": 1000,
      "sample_size_unit": "views",
      "severity": "alert",
      "started_at": "2021-01-05T09:04:46.000000Z",
      "status": "closed",
      "threshold": 5
    },
    {
      "affected_views": 132,
      "affected_views_per_hour": 11,
      "affected_views_per_hour_on_open": 65,
      "breakdowns": [
        {
          "id": "abcdef",
          "name": "video_title",
          "value": "Layla the dog video 1337"
        },
        {
          "id": "abcdef",
          "name": "error_type_id",
          "value": "697065"
        }
      ],
      "description": "Something else is broken",
      "error_description": "Detailed error: On no!",
      "id": "rd9579",
      "impact": "*132 views* were affected at a rate of *11 per hour*",
      "incident_key": "fd9add7a85a013d768f4039f9e726133eddb476c2f16b22ebfe56f18f7c03b27",
      "measured_value": 97,
      "measured_value_on_close": 1,
      "measurement": "error_rate",
      "notification_rules": [],
      "notifications": [
        {
          "attempted_at": "2020-12-31T09:26:19.416919Z",
          "id": 102198,
          "queued_at": "2020-12-31T09:26:18.987717Z"
        },
        {
          "attempted_at": "2020-12-31T20:23:57.279325Z",
          "id": 101269,
          "queued_at": "2020-12-31T20:23:56.997068Z"
        }
      ],
      "resolved_at": "2020-12-31T20:22:54.000000Z",
      "sample_size": 100,
      "sample_size_unit": "views",
      "severity": "alert",
      "started_at": "2020-12-31T07:56:22.000000Z",
      "status": "closed",
      "threshold": 96
    }
  ],
  "timeframe": [
    1610035979,
    1610122379
  ],
  "total_row_count": 2
}
Get an Incident
get
Returns the details of an incident.

Request path & query params
INCIDENT_ID
string
ID of the Incident

get
200
/data/v1/incidents/{INCIDENT_ID}
Response
(application/json)
copy
{
  "data": {
    "affected_views": 2026,
    "affected_views_per_hour": 84,
    "affected_views_per_hour_on_open": 12857,
    "breakdowns": [
      {
        "id": "abcdef",
        "name": "error_type_id",
        "value": "499680"
      },
      {
        "id": "abcdef",
        "name": "video_title",
        "value": "Cute dogs"
      }
    ],
    "description": "This video is erroring a lot",
    "error_description": "Error Type ID 499680",
    "id": "g7q2df",
    "impact": "*2026 views* were affected at a rate of *84 per hour*",
    "incident_key": "045dfcbefdb68c6003aaf3bf5ed217493772519f28f14d129f95eaff159ea6d6b",
    "measured_value": 100,
    "measured_value_on_close": 8,
    "measurement": "error_rate",
    "notification_rules": [],
    "notifications": [
      {
        "attempted_at": "2020-05-14T17:23:08.034662Z",
        "id": 63293,
        "queued_at": "2020-05-14T17:23:07.944457Z"
      },
      {
        "attempted_at": "2020-05-13T17:22:30.444389Z",
        "id": 62212,
        "queued_at": "2020-05-13T17:22:30.354828Z"
      }
    ],
    "resolved_at": "2020-05-14T17:22:30.000000Z",
    "sample_size": 100,
    "sample_size_unit": "views",
    "severity": "alert",
    "started_at": "2020-05-13T17:21:54.000000Z",
    "status": "closed",
    "threshold": 100
  },
  "timeframe": [
    1610036456,
    1610122856
  ],
  "total_row_count": 1
}
List Related Incidents
get
Returns all the incidents that seem related to a specific incident.

Request path & query params
INCIDENT_ID
string
ID of the Incident

limit
integer
(default: 25)
Number of items to include in the response

page
integer
(default: 1)
Offset by this many pages, of the size of limit

order_by
string
Possible values:
"negative_impact"
"value"
"views"
"field"
Value to order the results by

order_direction
string
Possible values:
"asc"
"desc"
Sort order.

get
200
/data/v1/incidents/{INCIDENT_ID}/related
Response
(application/json)
copy
{
  "data": [
    {
      "affected_views": 71,
      "affected_views_per_hour": 29,
      "affected_views_per_hour_on_open": 75,
      "breakdowns": [
        {
          "id": "abcdef",
          "name": "error_type_id",
          "value": "697070"
        }
      ],
      "description": "Something is broken",
      "error_description": "No seriously, something is really really broken :(",
      "id": "4u13td",
      "impact": "*71 views* were affected at a rate of *29 per hour*",
      "incident_key": "5312a7c0bbb5d8353bd88602f01fe58eb15e9febac8fd2f0d8ce8f1cb138145c",
      "measured_value": 5.9,
      "measured_value_on_close": 0.1,
      "measurement": "error_rate",
      "notification_rules": [],
      "notifications": [
        {
          "attempted_at": "2021-01-05T09:52:15.119040Z",
          "id": 103014,
          "queued_at": "2021-01-05T09:52:14.945157Z"
        },
        {
          "attempted_at": "2021-01-05T11:31:08.244462Z",
          "id": 102025,
          "queued_at": "2021-01-05T11:31:08.061924Z"
        }
      ],
      "resolved_at": "2021-01-05T11:31:04.000000Z",
      "sample_size": 1000,
      "sample_size_unit": "views",
      "severity": "alert",
      "started_at": "2021-01-05T09:04:46.000000Z",
      "status": "closed",
      "threshold": 5
    },
    {
      "affected_views": 132,
      "affected_views_per_hour": 11,
      "affected_views_per_hour_on_open": 65,
      "breakdowns": [
        {
          "id": "abcdef",
          "name": "video_title",
          "value": "Layla the dog video 1337"
        },
        {
          "id": "abcdef",
          "name": "error_type_id",
          "value": "697065"
        }
      ],
      "description": "Something else is broken",
      "error_description": "Detailed error: On no!",
      "id": "rd9579",
      "impact": "*132 views* were affected at a rate of *11 per hour*",
      "incident_key": "fd9add7a85a013d768f4039f9e726133eddb476c2f16b22ebfe56f18f7c03b27",
      "measured_value": 97,
      "measured_value_on_close": 1,
      "measurement": "error_rate",
      "notification_rules": [],
      "notifications": [
        {
          "attempted_at": "2020-12-31T09:26:19.416919Z",
          "id": 102198,
          "queued_at": "2020-12-31T09:26:18.987717Z"
        },
        {
          "attempted_at": "2020-12-31T20:23:57.279325Z",
          "id": 101269,
          "queued_at": "2020-12-31T20:23:56.997068Z"
        }
      ],
      "resolved_at": "2020-12-31T20:22:54.000000Z",
      "sample_size": 100,
      "sample_size_unit": "views",
      "severity": "alert",
      "started_at": "2020-12-31T07:56:22.000000Z",
      "status": "closed",
      "threshold": 96
    }
  ],
  "timeframe": [
    1610035979,
    1610122379
  ],
  "total_row_count": 2
}
Sign up for our newsletter
© 2025 Mux, Inc
Status:
Good
Mux Developer Console
BETA
✕
Welcome to the Mux developer console.
 
Here, you can try out Mux API capabilities and inspect the responses.
 

🛟 View supported Mux commands: mux help
📚 Manage video assets: mux assets [list|create]
📺 Work with live streams: mux live-streams [list|create]
🔔 Test webhooks: mux webhooks
 
To get started, log in with your Mux credentials: mux login
 
Note: All assets will be created in test mode and deleted after 24 hours.
Console input
$
Type Mux commands here...
Type Mux commands here. Use arrow up and down to navigate command history. Press Tab to autocomplete.
API Reference