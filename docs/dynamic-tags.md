# Dynamic Email Tags

The email system supports dynamic content tags that automatically populate email templates with content from your collections. This allows you to create reusable templates that automatically include your latest updates, promotions, and events.

## Available Tags

The following dynamic tags are supported:

- `{{updates_list}}` - Displays all posts marked as "Update" type
- `{{promos_list}}` - Displays all posts marked as "Promotion" type
- `{{events_list}}` - Displays all posts marked as "Event" type

## How It Works

1. **Template Creation**
   - Place any of the supported tags in your email template where you want the dynamic content to appear
   - Tags can be placed anywhere in the HTML content
   - Multiple instances of the same tag are supported
   - Tags that have no matching content will be removed from the final email

2. **Content Population**
   - When previewing or sending an email:
     - The system fetches all posts from the associated collection
     - Posts are grouped by their type (Update, Promotion, Event)
     - Each tag is replaced with a formatted list of the corresponding posts
     - Content is displayed as a bulleted list with proper spacing

3. **Formatting**
   - Content is automatically formatted as an HTML unordered list (`<ul>`)
   - Each item includes:
     - Bullet point
     - Left padding (24px)
     - Bottom margin between items (8px)
     - Bottom margin for the list (16px)


## Technical Details

- Tags are processed by the `replaceEmailTags` function in `lib/email-utils.ts`
- Content is fetched from the Supabase `posts_collections` and `posts` tables
- Posts must have `final_type` and `final_content` fields populated
- Processing happens both in the preview component and before sending emails

## Best Practices

1. **Template Design**
   - Always preview your template before sending
   - Consider what happens when a tag has no content
   - Use appropriate headings and spacing around tags

2. **Content Management**
   - Ensure posts are properly categorized with the correct type
   - Review the final content field for each post
   - Keep collection content up to date

3. **Testing**
   - Test templates with various combinations of content
   - Verify formatting in different email clients
   - Send test emails before sending to your full list