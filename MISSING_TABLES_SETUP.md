# Missing Tables Setup Guide

## 🚨 Issue Identified

The 406 error is occurring because the `recipe_likes` and `comments` tables don't exist in your Supabase database. These tables are required for the like/unlike functionality and comments system.

## 📋 Required SQL Commands

Run these commands in your Supabase SQL Editor:

### 1. Create recipe_likes table
```sql
-- Create recipe_likes table
CREATE TABLE recipe_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id) -- Prevent duplicate likes
);
```

### 2. Create comments table
```sql
-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Enable RLS for new tables
```sql
-- Enable RLS (Row Level Security)
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

### 4. Create RLS policies for recipe_likes
```sql
-- Recipe likes policies
CREATE POLICY "Recipe likes are viewable by everyone" ON recipe_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON recipe_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON recipe_likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Create RLS policies for comments
```sql
-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

## 🔧 How to Apply

1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run each SQL command above** (one at a time or all together)
4. **Verify tables are created** by checking the Table Editor

## ✅ Expected Result

After running these commands:

- ✅ **No more 406 errors** for recipe_likes queries
- ✅ **Like/unlike functionality** will work properly
- ✅ **Comments system** will work properly
- ✅ **All RLS policies** will be in place for security

## 🚀 Verification

You can verify the tables are created by:

1. Going to **Table Editor** in Supabase
2. You should see `recipe_likes` and `comments` tables
3. Check that RLS is enabled for both tables
4. Check that the policies are applied

## 📝 Notes

- The `UNIQUE(user_id, recipe_id)` constraint prevents users from liking the same recipe multiple times
- All tables use UUID primary keys for consistency
- RLS policies ensure users can only modify their own data
- Foreign key constraints ensure data integrity 