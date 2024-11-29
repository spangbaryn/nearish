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

### **1. Users**

Holds all registered users, including Customers, Business Users, and Admins.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for each user. |
| `email` | VARCHAR(255) | Unique, Not Null | User's email address. |
| `password` | VARCHAR(255) | Not Null | Encrypted password. |
| `role` | ENUM | Not Null | User role (`Customer`, `Business`, `Admin`). |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | User creation date. |
| `updated_at` | TIMESTAMP |  | Last updated timestamp. |

**Context**:

- The `role` column supports hierarchical access control, with `Business` users capable of creating posts and managing staff.
- Passwords should be encrypted using a secure hashing algorithm (e.g., bcrypt).

---

### **2. Businesses**

Stores information about businesses registered on Nearish.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the business. |
| `name` | VARCHAR(255) | Not Null | Business name. |
| `description` | TEXT |  | Description of the business. |
| `owner_id` | UUID | Foreign Key -> `users.id` | ID of the business owner. |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Business creation date. |
| `updated_at` | TIMESTAMP |  | Last updated timestamp. |

**Context**:

- The `owner_id` links to a user with the `Business` role. This user can manage staff and create posts.

---

### **3. Business Roles**

Defines roles for users within businesses, including `Owners` and `Staff Members`.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, Not Null | Unique identifier for the role entry. |
| `business_id` | UUID | Foreign Key -> `businesses.id` | The associated business. |
| `user_id` | UUID | Foreign Key -> `users.id` | The associated user. |
| `role` | ENUM | Default: `Staff` | Role within the business (`Owner`, `Staff`). |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Role assignment creation date. |

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
| `content` | TEXT | Not Null | Content of the post. |
| `type` | VARCHAR(255) |  | Editable type of the post (e.g., "Promotion", "Event"). |
| `ai_generated_type` | VARCHAR(255) |  | Non-editable AI-generated classification of the post. |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP | Post creation date. |
| `updated_at` | TIMESTAMP |  | Last updated timestamp. |

**Context**:

- The `type` field allows user edits to refine the classification.
- The `ai_generated_type` field preserves the original AI classification.

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