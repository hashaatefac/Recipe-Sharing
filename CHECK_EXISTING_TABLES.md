# Check Existing Tables and Fix Issues

## 🔍 Step 1: Check Existing Tables

Run this SQL command to see what tables exist:

```sql
-- Check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('recipe_likes', 'comments');
```

## 🔍 Step 2: Check Table Structure

If the tables exist, check their structure:

```sql
-- Check recipe_likes table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'recipe_likes' 
AND table_schema = 'public';

-- Check comments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public';
```

## 🔍 Step 3: Check RLS Policies

Check if RLS is enabled and policies exist:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('recipe_likes', 'comments');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('recipe_likes', 'comments');
```

## 🔧 Step 4: Fix Missing Policies

If tables exist but policies are missing, run these:

### For recipe_likes:
```sql
-- Enable RLS (if not already enabled)
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Recipe likes are viewable by everyone') THEN
        CREATE POLICY "Recipe likes are viewable by everyone" ON recipe_likes
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can insert their own likes') THEN
        CREATE POLICY "Users can insert their own likes" ON recipe_likes
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can delete their own likes') THEN
        CREATE POLICY "Users can delete their own likes" ON recipe_likes
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
```

### For comments:
```sql
-- Enable RLS (if not already enabled)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Comments are viewable by everyone') THEN
        CREATE POLICY "Comments are viewable by everyone" ON comments
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert their own comments') THEN
        CREATE POLICY "Users can insert their own comments" ON comments
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can update their own comments') THEN
        CREATE POLICY "Users can update their own comments" ON comments
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments') THEN
        CREATE POLICY "Users can delete their own comments" ON comments
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
```

## 🔧 Step 5: Test the Tables

After fixing policies, test if the queries work:

```sql
-- Test recipe_likes query
SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = 'some-recipe-id';

-- Test comments query  
SELECT * FROM comments WHERE recipe_id = 'some-recipe-id';
```

## 🚨 If Tables Are Corrupted

If the tables exist but have wrong structure, you can drop and recreate them:

```sql
-- Drop existing tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS recipe_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;

-- Then run the creation commands from MISSING_TABLES_SETUP.md
```

## ✅ Expected Result

After running these commands:

- ✅ **Tables should exist** with correct structure
- ✅ **RLS should be enabled** for both tables
- ✅ **Policies should be in place** for security
- ✅ **No more 406 errors** when querying these tables

## 🔍 Troubleshooting

If you still get 406 errors after this:

1. **Check the exact error message** in the browser console
2. **Verify the table names** match exactly (case-sensitive)
3. **Test with a simple query** in Supabase SQL Editor
4. **Check if your user has proper permissions** 