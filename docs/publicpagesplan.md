Proposed Implementation
1. Database Changes
Add to the businesses table:
;
2. URL Structure
Published pages: /b/{slug} (e.g., /b/joes-coffee)
Admin/owner view: /businesses/{id}/profile (existing)
3. SEO Control
Add a robots.txt file:
/
And implement meta tags in the public business page layout:
>
4. Publishing Flow
Business owner enables publishing from settings
System generates URL slug from business name
Page becomes publicly accessible
Owner can customize URL slug (with uniqueness validation)
5. Security Considerations
Public pages should only show approved/moderated content
Sensitive business data must be filtered out
Rate limiting for public endpoints
Cache public pages for performance
6. Required Components
PublishToggle Component
}
Public Business Layout
Simplified version of the business profile
No edit controls
Clear "Claim this business" CTA for unclaimed businesses
7. API Endpoints
POST /api/businesses/{id}/publish
Toggle publish status
Generate/update slug
Update publish timestamp
GET /api/b/{slug}
Fetch public business data
Include caching headers
Rate limiting
8. Implementation Phases
Phase 1: Basic Publishing
Add database columns
Implement publish toggle
Create public route
Add robots.txt
Phase 2: Enhanced Features
Custom slug management
SEO improvements
Analytics tracking
Cache implementation
9. Monitoring & Analytics
Track page views
Monitor performance
Record engagement metrics
Log access patterns