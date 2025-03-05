# Database Schema Documentation

## Overview

Your database schema is designed to support a portfolio and utility website using Supabase. It leverages a domain-driven approach with robust security and role-based access. The key elements include:

- **User Profiles & Roles:** Extends Supabase’s `auth.users` with a custom `profiles` table and a user role enumeration.
- **Content Tables:** For portfolio items, blog posts, and work experiences.
- **Access Control:** Via a whitelist for controlled feature access and an options table for environment variables.
- **Playground Features:** For experimental features accessible based on user roles.
- **Security Policies:** Using Row Level Security (RLS) and custom functions to enforce permissions.
- **Triggers & Functions:** To manage user registration, role assignment, and data consistency.

---

## Schema Components

### 1. UUID Extension & Custom User Role

- **UUID Extension:**  
  - **Purpose:** Enables the generation of universally unique identifiers (UUIDs) using `uuid_generate_v4()`.
  - **Usage:** All primary keys in various tables use UUIDs.

- **Custom Type: `user_role`**  
  - **Values:** `'superadmin'` and `'whitelisted_user'`.
  - **Usage:** Defines the role of a user in the `profiles` table, influencing access controls.

---

### 2. Tables

#### **a. `profiles` Table**

- **Purpose:**  
  - Extends the `auth.users` table by storing additional user data and roles.
- **Key Columns:**  
  - `id` (UUID): References `auth.users(id)`, primary key.  
  - `email` (TEXT): Unique email for the user.  
  - `role` (user_role): Indicates the user’s role with a default of `'whitelisted_user'`.  
  - `created_at` and `updated_at`: Timestamp fields to track record creation and modifications.
- **Relationship:**  
  - One-to-one mapping with Supabase’s `auth.users`.

---

#### **b. `portfolio_items` Table**

- **Purpose:**  
  - Stores portfolio data such as projects and work experiences.
- **Key Columns:**  
  - `id` (UUID): Primary key.  
  - `title`, `description`, `image_url`, `project_url`: Core information about a portfolio item.  
  - `technologies` (TEXT[]): An array listing technologies used.  
  - `start_date`, `end_date`: Dates related to the project duration.  
  - `is_published` (BOOLEAN): Determines if the item is visible publicly.  
  - Timestamps (`created_at`, `updated_at`).

---

#### **c. `blog_posts` Table**

- **Purpose:**  
  - Manages blog content including posts and metadata.
- **Key Columns:**  
  - `id` (UUID): Primary key.  
  - `title`, `content`, `excerpt`: Main content fields.  
  - `slug` (TEXT): Unique identifier for URL routing.  
  - `featured_image` (TEXT) and `tags` (TEXT[]): For visual appeal and categorization.  
  - `is_published` (BOOLEAN): Flag for public visibility.  
  - `published_at`: Timestamp for when the post is made public.  
  - Timestamps (`created_at`, `updated_at`).

---

#### **d. `whitelist` Table**

- **Purpose:**  
  - Controls access to the playground features by storing approved email addresses.
- **Key Columns:**  
  - `id` (UUID): Primary key.  
  - `email` (TEXT): Unique email of the whitelisted user.  
  - `added_by` (UUID): References the superadmin who added the email.  
  - `created_at`: Timestamp when the email was added.
- **Usage:**  
  - Used during the user registration process to determine if a new user should be assigned a role based on email.

---

#### **e. `options` Table**

- **Purpose:**  
  - Functions as a dynamic storage for environment variables and configuration values.
- **Key Columns:**  
  - `id` (UUID): Primary key.  
  - `key` (TEXT): Unique key identifier (e.g., `MC_ALEEERT_DEFAULT_SLOT`, `MC_ALEEERT_DEFAULT_API_SECRET`).  
  - `value` (TEXT): The actual configuration data.  
  - `description` (TEXT): Explains the purpose of the option.  
  - `access_level` (TEXT): Defines who can access the option; possible values include `'superadmin_only'`, `'whitelisted'`, and `'public'`.  
  - Timestamps (`created_at`, `updated_at`).

---

#### **f. `playground_features` Table**

- **Purpose:**  
  - Stores data related to experimental features that users can try.
- **Key Columns:**  
  - `id` (UUID): Primary key.  
  - `name` (TEXT): Name of the feature.  
  - `description` (TEXT): Details about the feature.  
  - `is_active` (BOOLEAN): Indicates if the feature is currently enabled.  
  - Timestamps (`created_at`, `updated_at`).

---

#### **g. `work_experience` Table**

- **Purpose:**  
  - Records professional work experiences for the portfolio.
- **Key Columns:**  
  - `id` (UUID): Primary key.  
  - `company`, `location`, `role`: Basic details of the work experience.  
  - `start_date`, `end_date`: Dates marking the duration of the role.  
  - `description`: Detailed account of responsibilities and achievements.  
  - `technologies` (TEXT[]): Lists the tools and technologies used.  
  - Timestamps (`created_at`, `updated_at`).
- **Constraints:**  
  - A check constraint ensures `end_date` (if provided) is after `start_date`.

---

## 3. Security Policies & Row Level Security (RLS)

- **Profiles Table Policies:**  
  - Users can view and update their own profile.
  - Superadmins have full visibility.

- **Portfolio & Blog Tables Policies:**  
  - Public read access to published content.
  - Superadmins are allowed full CRUD operations.

- **Whitelist Policies:**  
  - Only superadmins can view and manage whitelist entries.

- **Options Policies:**  
  - Superadmins can view and manage all options.
  - Whitelisted users can view options with access levels of `'whitelisted'` or `'public'`.
  - Public users are limited to viewing options marked as `'public'`.

- **Playground Features Policies:**  
  - Accessible by whitelisted users and superadmins.

- **Work Experience Policies:**  
  - Public can read.
  - Full access is reserved for superadmins.

---

This schema is structured to maintain security, scalability, and flexibility while ensuring a clean separation of concerns within your application. Let me know if you need any modifications!
