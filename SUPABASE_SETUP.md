# Supabase Setup Guide

## 1. Database Setup

### Step 1: Run the SQL Schema
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Copy and paste the entire contents of `database-schema.sql` into the editor
4. Click **Run** to execute the schema

This will create:
- `profiles` table for user information
- `recipes` table for storing recipe data
- Row Level Security (RLS) policies
- Database indexes for performance
- Automatic timestamp updates

## 2. Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To find these values:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key

## 3. Authentication Setup

### Email Authentication (Already enabled)
- Email/password authentication is already enabled
- Users can sign up with email and password
- Email confirmation is enabled by default

## 4. Database Tables Overview

### Profiles Table
- `id` - References auth.users(id)
- `username` - Unique username
- `full_name` - User's full name
- `created_at` - When profile was created
- `updated_at` - When profile was last updated

### Recipes Table
- `id` - Unique recipe identifier
- `created_at` - When recipe was created
- `user_id` - References auth.users(id)
- `title` - Recipe title
- `ingredients` - Recipe ingredients (text)
- `instructions` - Cooking instructions (text)
- `cooking_time` - Time in minutes
- `difficulty` - Easy, Medium, or Hard
- `category` - Recipe category (string)
- `updated_at` - When recipe was last updated

## 5. Row Level Security (RLS)

The schema includes RLS policies:

- **Profiles** are viewable by everyone, but only editable by the owner
- **Recipes** are viewable by everyone, but only editable by the creator
- **Users can only** create, update, delete their own content

## 6. Testing the Setup

After running the schema, you can test with these queries:

```sql
-- Check if tables were created
SELECT * FROM profiles;
SELECT * FROM recipes;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('recipes', 'profiles');
```

## 7. Next Steps

Once the database is set up:
1. Configure your environment variables
2. Test the Supabase connection in your Next.js app
3. Implement authentication UI
4. Create recipe CRUD operations

The database is now ready for your recipe sharing platform! 🎉 