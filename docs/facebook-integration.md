# Facebook Integration

This document outlines how the Facebook integration works in our application.

## Overview

The integration allows businesses to:
- Connect their Facebook pages
- Import posts from connected pages
- Manage page connections

## Database Schema

### Tables

1. `business_social_connections`
   - Stores the connection between a business and a Facebook page
   - Fields:
     - `id`: UUID (primary key)
     - `business_id`: UUID (references businesses)
     - `platform`: 'facebook'
     - `external_id`: Facebook page ID
     - `name`: Page name
     - `created_at`: Timestamp

2. `social_credentials`
   - Stores access tokens securely
   - Fields:
     - `id`: UUID (primary key)
     - `connection_id`: UUID (references business_social_connections)
     - `token`: Access token
     - `expires_at`: Token expiration timestamp

3. `temp_facebook_pages`
   - Temporary storage for page selection process
   - Fields:
     - `id`: UUID (primary key)
     - `business_id`: UUID (references businesses)
     - `page_id`: Facebook page ID
     - `page_name`: Page name
     - `access_token`: Temporary access token
     - `expires_at`: Record expiration timestamp

## Authentication Flow

1. User initiates connection:
```typescript
window.location.href = `/api/auth/facebook?businessId=${businessId}`
```

2. Facebook OAuth process:
   - Redirects to Facebook login
   - User authorizes app permissions
   - Facebook redirects back with auth code

3. Callback handling:
   - Exchanges code for access token
   - Fetches available Facebook pages
   - Stores page data temporarily
   - Shows page selection UI

## API Routes

### `/api/auth/facebook`
- Initiates OAuth flow
- Required query params:
  - `businessId`: UUID of the business

### `/api/auth/facebook/callback`
- Handles OAuth callback
- Processes:
  1. Code exchange
  2. Page data fetching
  3. Temporary storage
  4. Redirect to selection UI

## Components

### FacebookPageSelector
- Allows users to select which pages to connect
- Handles:
  - Page selection
  - Connection creation
  - Access token storage

### Business Settings Integration
- Shows connected pages
- Provides disconnect functionality
- Displays connection status

## Environment Variables

Required variables:
```env
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security

- RLS policies ensure authenticated access
- Access tokens stored securely
- Temporary data automatically cleaned up
- OAuth state parameter prevents CSRF

## Usage Example

```typescript
// Connecting a page
const handleFacebookConnect = async () => {
  const redirectUri = `${window.location.origin}/api/auth/facebook?businessId=${businessId}`
  window.location.href = redirectUri
}

// Disconnecting a page
const handleDisconnect = async (connectionId: string) => {
  await supabase
    .from('business_social_connections')
    .delete()
    .eq('id', connectionId)
}
```

## Error Handling

The integration handles several error cases:
- Invalid OAuth responses
- Failed token exchanges
- Connection failures
- Page selection errors

Each error is handled gracefully with user feedback via toast notifications.

## Future Improvements

Potential enhancements:
1. Token refresh automation
2. Batch post importing
3. Page insights integration
4. Post scheduling
5. Analytics tracking

## Troubleshooting

Common issues and solutions:
1. Connection fails
   - Check Facebook App settings
   - Verify environment variables
   
2. Pages not showing
   - Confirm page admin status
   - Check token permissions

3. Token expiration
   - Implement refresh flow
   - Monitor token validity