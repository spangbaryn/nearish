# **Nearish Database Schema Documentation**

This document provides a detailed explanation of the database schema for Nearish, including table definitions, relationships, and the context behind each design decision.

---

## **Schema Overview**

The schema is designed to support:

1. **Hierarchical Roles**: Customers, Business Users, and Admins.
2. **Dynamic Email Campaigns**: Using collections of posts as inputs for personalized, data-driven emails.
3. **Audience Segmentation**: Reusable and filterable audience definitions for targeted campaigns.
4. **Social Network Features**: Including posts, comments, and analytics at both campaign and post levels.
5. **AI-Driven Enhancements**: AI-generated responses and classifications, along with editable user-defined content.
6. **Transactional Emails**: Lightweight "fire-and-forget" emails with reusable templates.

---

## **Tables**

### **1. Profiles**

Holds all registered users, including Customers, Business Users, and Admins.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, References auth.users | User's unique identifier |
| `email` | VARCHAR(255) | Unique, Not Null | User's email address |
| `role` | TEXT | Not Null, CHECK | User role (`admin`, `business`, `customer`) |
| `created_at` | TIMESTAMPTZ | Default: NOW() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | | Last update timestamp |

**Context**:
- The `id` column links to Supabase's built-in auth.users table
- The `role` column supports hierarchical access control
- `business_role` and `business_id` are only populated for business users

---

### **10. Email Lists**

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the list |
| `name` | VARCHAR(255) | Not Null, Unique | Name of the list (e.g., "Weekly Roundup") |
| `description` | TEXT | | Description of the list |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | List creation date |
| `updated_at` | TIMESTAMP | | Last updated timestamp |

### **11. Profile List Subscriptions**

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the subscription |
| `profile_id` | UUID | Foreign Key -> profiles(id), Not Null | The subscribed profile |
| `list_id` | UUID | Foreign Key -> email_lists(id), Not Null | The list being subscribed to |
| `subscribed_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | When the subscription was created |
| `unsubscribed_at` | TIMESTAMP | | When the user unsubscribed (null if still subscribed) |

---

### **2. Businesses**

Stores business account information.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key | Business unique identifier |
| `name` | VARCHAR(255) | Not Null | Business name |
| `description` | TEXT | | Business description |
| `created_at` | TIMESTAMPTZ | Default: NOW() | Business creation timestamp |
| `updated_at` | TIMESTAMPTZ | | Last update timestamp |

**Context**:
- One-to-many relationship with profiles (one business can have multiple staff members)
- The `owner_id` references the profile who created/owns the business

---

### **3. Business Members**

Defines roles for users within businesses, including `Owners` and `Staff Members`.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key | Membership unique identifier |
| `profile_id` | UUID | References profiles(id) | Associated user profile |
| `business_id` | UUID | References businesses(id) | Associated business |
| `role` | TEXT | Not Null, CHECK | Member role (`owner`, `staff`) |
| `created_at` | TIMESTAMPTZ | Default: NOW() | Membership creation timestamp |
| `updated_at` | TIMESTAMPTZ | | Last update timestamp |

**Context**:

- `Owner` users have full control of the business, while `Staff` users have restricted access.

---

### **4. Posts**

Represents social posts created by businesses or users.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the post. |
| `business_id` | UUID | Foreign Key -> `businesses.id` | Business associated with the post. |
| `source` | ENUM | Not Null | Source of the post (`facebook`, `admin`, `platform`). |
| `external_id` | VARCHAR(255) | | External identifier (e.g., Facebook post ID). |
| `content` | TEXT | Not Null | Content of the post. |
| `final_content` | TEXT | | Editable version of the post content. |
| `final_type` | ENUM | | Post type ('Promotion', 'Event', 'Update'). |
| `ai_generated_type` | VARCHAR(255) | | Non-editable AI-generated classification of the post. |
| `included` | BOOLEAN | Default: false | Whether the post is included in the campaign. |
| `url` | TEXT | | URL to the original post. |
| `published_at` | TIMESTAMP | | When the post was published on the original platform. |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Post creation date in our system. |
| `updated_at` | TIMESTAMP | | Last updated timestamp. |

**Context**:

- The `final_type` field allows user edits to refine the classification.
- The `ai_generated_type` field preserves the original AI classification.
- `external_id` and `url` are used for tracking external platform posts.
- `published_at` tracks the original publication date from external platforms.

---

### **4.1 Posts Collections**

Links posts to collections for organizing content and campaigns.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the association |
| `post_id` | UUID | Foreign Key -> `posts.id`, Not Null | The associated post |
| `collection_id` | UUID | Foreign Key -> `collections.id`, Not Null | The collection containing the post |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | When the post was added to the collection |

**Context**:
- Many-to-many relationship between posts and collections
- Enables posts to be included in multiple collections
- Supports the campaign system by grouping related posts

---

### **5. AI Responses**

Stores AI-generated responses for posts.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the AI response. |
| `post_id` | UUID | Foreign Key -> `posts.id` | The associated post for the AI response. |
| `collection_id` | UUID | Foreign Key -> `collections.id` | The collection this response belongs to. |
| `response` | TEXT | Not Null | The initial AI-generated response content. |
| `final_response` | TEXT |  | Editable version of the AI-generated response. |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | When the response was generated. |
| `updated_at` | TIMESTAMP |  | When the response or final copy was last updated. |

**Context**:

- `response` preserves the original AI output.
- `final_response` supports user edits to refine the content.

---

### **6. Collections**

Groups posts together for use in campaigns.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the collection. |
| `name` | VARCHAR(255) | Not Null | Name of the collection (e.g., "Weekly Digest"). |
| `description` | TEXT |  | Description of the collection. |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Collection creation date. |

---

### **7. Campaigns**

Represents email campaigns using collections of posts.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the campaign. |
| `collection_id` | UUID | Foreign Key -> `collections.id` | Collection used in the campaign. |
| `template_id` | UUID | Foreign Key -> `email_templates.id` | Template used for the campaign. |
| `sent_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | When the campaign was sent. |

---

### **8. Campaign Post Analytics**

Tracks performance metrics for posts within campaigns.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the analytics entry. |
| `campaign_id` | UUID | Foreign Key -> `campaigns.id` | Associated campaign. |
| `post_id` | UUID | Foreign Key -> `posts.id` | Associated post. |
| `metric` | ENUM | Not Null | Metric type (`views`, `clicks`). |
| `count` | INTEGER | Default: 0 | Count of the metric. |
| `updated_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Last updated timestamp. |

---

### **9. Email Templates**

Reusable templates for campaigns and transactional emails.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the template. |
| `name` | VARCHAR(255) | Not Null | Template name (e.g., "Password Reset"). |
| `subject` | VARCHAR(255) | Not Null | Default subject line. |
| `content` | TEXT | Not Null | HTML or text content with placeholders. |
| `type` | ENUM | Not Null | Template type (`transactional`, `campaign`). |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Template creation date. |

---

### **AI Prompts**

Stores AI prompts used for generating responses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Not Null | Unique identifier for the prompt |
| `name` | VARCHAR(255) | Not Null | Name of the prompt |
| `description` | TEXT | | Description of the prompt's purpose |
| `prompt` | TEXT | Not Null | The actual prompt content |
| `is_active` | BOOLEAN | Default: true | Whether the prompt is currently active |
| `prompt_type` | ENUM | Not Null | Type of prompt ('content', 'type_id', null) |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | When the prompt was created |
| `updated_at` | TIMESTAMP | | Last updated timestamp |

**Context**:
- Used to store reusable AI prompts for generating responses
- `is_active` allows disabling prompts without deleting them
- Follows the same CRUD patterns as other admin-managed content

---

### **Database Functions and Triggers**

| Name | Type | Description |
| --- | --- | --- |
| `handle_new_profile_subscription()` | Function | Automatically subscribes new profiles to the Weekly Roundup list |
| `on_profile_created` | Trigger | Executes after INSERT on profiles table |

**Context**:
- Ensures all new users are automatically subscribed to the Weekly Roundup list
- Runs after profile creation to maintain referential integrity
- Uses SECURITY DEFINER to ensure proper permissions