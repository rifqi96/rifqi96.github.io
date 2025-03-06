# Database Schema Documentation

This document provides a consolidated overview of your Supabase-based database schema. It merges the original schema concepts with the latest changes and migrations, presenting the current final structure. The schema is domain-driven and security-focused, featuring role-based access, row-level security (RLS), and custom functions to handle data consistency and automation.

---

## 1. Overview

- **Profiles & Roles**: Custom roles (`superadmin`, `whitelisted_user`) stored in a `profiles` table, extending Supabase’s `auth.users`.
- **Content Tables**:

  - `blog_posts` (posts with authorship)
  - `projects` (portfolio items)
  - `work_experiences` (professional experience)
- **Media Management**: A dedicated `media` table to handle file uploads and references.
- **Access Control**:

  - `whitelist` table for email-based feature control
  - `options` table for storing environment variables
- **Playground Features**: A `playground_features` table for experimental or restricted features.
- **Row Level Security**: Enforced at the table level with policies that differentiate public, whitelisted, authenticated, and superadmin access.
- **Triggers & Functions**: Automate user whitelisting, timestamps, and media cleanup.

---

## 2. Key Components

### 2.1 Roles & Permissions

A custom enum type `user_role` defines two roles:

1. **superadmin**  
2. **whitelisted_user**  

These roles drive the logic behind row-level security policies, granting `superadmin` broad privileges while restricting `whitelisted_user` to certain elevated privileges.

---

## 3. Tables & Relationships

### 3.1 `profiles`

**Purpose**: Extends `auth.users` with additional user data and roles.  
**Key Columns**:

- `id` (UUID PK, references `auth.users.id`)
- `email` (TEXT, unique)
- `role` (user_role, defaults to `whitelisted_user`)
- `created_at`, `updated_at` (timestamps)

**Notable Triggers/Functions**:

- **Auto-Whitelist Trigger**: If a new profile has a `superadmin` role, it automatically inserts the user’s email into the `whitelist`.

### 3.2 `blog_posts`

**Purpose**: Stores blog content and metadata.  
**Key Columns**:

- `id` (UUID PK)
- `title`, `content`, `excerpt` (TEXT)
- `slug` (TEXT, unique URL identifier)
- `featured_image` (TEXT)
- `tags` (TEXT[])
- `is_published` (BOOLEAN)
- `published_at` (TIMESTAMP)
- `author_id` (UUID, references `profiles.id`)
- `created_at`, `updated_at` (timestamps)

**RLS Policies**:

- **Public Read**: Anyone can read posts where `is_published = true`.
- **Author Policies**: Authors (matching `author_id`) can update or delete their own posts.
- **Superadmin**: Has full CRUD access.

### 3.3 `work_experiences`

**Purpose**: Records professional work experiences.  
**Key Columns**:

- `id` (UUID PK)
- `company`, `location`, `role` (TEXT)
- `start_date`, `end_date` (DATE)  
- `description` (TEXT)
- `technologies` (TEXT[])
- `company_logo_url` (TEXT, optional external URL)
- `company_logo_media_id` (UUID, references `media.id`)
- `created_at`, `updated_at` (timestamps)

**Constraints**:

- `check_date_order`: Ensures `end_date > start_date` if `end_date` is not null.
- `company_logo_check`: Enforces mutual exclusivity between `company_logo_url` and `company_logo_media_id` (or both null).

**RLS Policies**:

- **Authenticated Read**: Any authenticated user can select rows.
- **Superadmin CRUD**: Full access for superadmins.

**Triggers**:

- `update_work_experiences_modtime`: Updates `updated_at` timestamp on modification.
- `delete_media_on_work_experience_delete`: Removes associated media record (if any) after the experience is deleted.

### 3.4 `projects`

**Purpose**: Manages portfolio projects.  
**Key Columns**:

- `id` (UUID PK)
- `title`, `description` (TEXT)
- `image_url` (TEXT, optional external URL)
- `link` (TEXT, replaces `project_url`)
- `repo_url` (TEXT)
- `technologies` (TEXT[])
- `start_date`, `end_date` (DATE)
- `is_published` (BOOLEAN)
- `is_featured` (BOOLEAN)
- `is_available` (BOOLEAN)
- `is_coming_soon` (BOOLEAN)
- `media_id` (UUID, references `media.id`)
- `order` (INT, default 0, not null)
- `created_at`, `updated_at` (timestamps)

**Constraints**:

- `media_check`: Similar exclusivity constraint on `image_url` vs. `media_id`.

**RLS Policies**:

- **Public Read**: Anyone can read rows where `is_published = true`.
- **Superadmin CRUD**: Full access for superadmins.

**Triggers**:

- `update_projects_modtime`: Updates `updated_at` before modification.
- `delete_media_on_project_delete`: Removes associated media record after the project is deleted.

### 3.5 `media`

**Purpose**: A centralized table for file references.  
**Key Columns**:

- `id` (UUID PK, defaults to `gen_random_uuid()`)
- `bucket_name` (TEXT)
- `storage_path` (TEXT)
- `file_name` (TEXT)
- `mime_type` (TEXT)
- `size_bytes` (BIGINT)
- `created_by` (UUID, defaults to `auth.uid()`)
- `metadata` (JSONB, optional)
- `created_at`, `updated_at` (timestamps)

**Unique & Indexes**:

- `UNIQUE(bucket_name, storage_path)`
- Index on `(bucket_name, storage_path)` for fast lookups.

**RLS Policies**:

- **Public SELECT**: Everyone can read.
- **Superadmin ALL**: Only superadmins can insert/update/delete.

**Triggers**:

- `update_media_updated_at`: Maintains `updated_at`.
- `handle_media_deletion`: Deletes corresponding files from `storage.objects` after the `media` row is removed.
- `handle_storage_deletion`: If a file in `storage.objects` is deleted, the matching `media` row is also removed (and vice versa).

### 3.6 `whitelist`

**Purpose**: Controls access to certain features via email-based whitelisting.  
**Key Columns**:

- `id` (UUID PK)
- `email` (TEXT, unique)
- `added_by` (UUID references `profiles.id`)
- `created_at` (TIMESTAMP)

**Usage**:

- During signup, if a user’s email appears in the whitelist, they may receive an elevated role.

**RLS & View**:

- **Superadmin**: Full manage/view.
- `whitelist_with_profiles` (VIEW): Joins `whitelist` with `profiles` for an overview of who added whom.

### 3.7 `options`

**Purpose**: Dynamic storage for environment variables and configurations.  
**Key Columns**:

- `id` (UUID PK)
- `key` (TEXT, unique)
- `value` (TEXT)
- `description` (TEXT)
- `access_level` (TEXT: `superadmin_only`, `whitelisted`, `public`)
- `created_at`, `updated_at` (timestamps)

**RLS**:

- **Superadmin**: Full CRUD.
- **Whitelisted**: Can select rows with `access_level IN ('whitelisted', 'public')`.
- **Public**: Can select rows only if `access_level = 'public'`.

### 3.8 `playground_features`

**Purpose**: Stores experimental features that may be selectively rolled out.  
**Key Columns**:

- `id` (UUID PK)
- `name` (TEXT)
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (timestamps)

**RLS**:

- Generally accessible to whitelisted users and superadmins, or based on your custom logic.

---

## 4. Security & RLS

- **Row-Level Security** (RLS) is enabled on all key tables: `profiles`, `blog_posts`, `work_experiences`, `projects`, `media`, `whitelist`, `options`, and `playground_features`.
- **Policies**:
  - **Superadmin** can typically perform all operations.
  - **Authenticated** (or whitelisted users) have elevated read/write privileges in specific contexts.
  - **Public** read access is limited to published content or explicitly allowed resources.

---

## 5. Functions & Triggers (Summary)

- **Timestamps**: `update_modified_column`, `update_updated_at_column`, `update_{table}_modtime` keep `updated_at` accurate on updates.
- **Auto-Whitelist**: When a profile with role `superadmin` is created, insert it into `whitelist`.
- **Media Cleanups**:
  - **`handle_media_deletion`**: Removes an object from `storage.objects` if the corresponding `media` record is deleted.
  - **`handle_storage_deletion`**: Removes a `media` row if the underlying storage object is deleted.
  - **`delete_media_on_*_delete`**: Removes any attached media when a parent record (e.g., project, work_experience) is deleted.

These functions and triggers ensure consistency between the database tables and Supabase’s storage objects.

---

## 6. Conclusion

This schema is built for robust security, ease of content management, and flexibility in handling media assets. By combining **row-level security**, **role-based access**, and **automatic triggers**, it supports a scalable and maintainable portfolio and utility application. Future expansions can introduce additional roles, tables, and policies without disrupting the existing architecture.

For any further adjustments or clarifications, feel free to reach out!
