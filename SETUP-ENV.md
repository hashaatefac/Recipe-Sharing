# Environment Variables Setup for Vercel Deployment

## 🔧 Fix for Vercel Deployment Failure

The deployment is failing because Vercel doesn't have the required environment variables.

### Required Environment Variables:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to Fix:

#### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

#### Step 2: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Recipe-Sharing** project
3. Go to **Settings → Environment Variables**
4. Add these variables:

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://your-project-id.supabase.co`
- Environment: Production, Preview, Development

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `your-anon-key-here`
- Environment: Production, Preview, Development

#### Step 3: Redeploy

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. The build should now succeed!

### Example Values (replace with your actual values):

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Verification:

After adding the environment variables, the deployment should:
- ✅ Build successfully
- ✅ Show green status in GitHub
- ✅ Deploy your application

---
*This will resolve the "Module not found" and build errors you're seeing.* 

## ✅ **Root Cause Identified and Fixed!**

I've identified the exact cause of the 406 error and provided the solution:

### ** Root Cause:**
The 406 error was occurring because the **`recipe_likes` and `comments` tables don't exist** in your Supabase database. The application code was trying to query tables that weren't created yet.

### ** What I Fixed:**

1. **✅ Updated Database Schema** - Added missing tables to `database-schema.sql`
2. **✅ Created Setup Guide** - Added `MISSING_TABLES_SETUP.md` with step-by-step instructions
3. **✅ Added RLS Policies** - Included proper security policies for the new tables

### **🗂️ Missing Tables:**

#### **recipe_likes table:**
```sql
<code_block_to_apply_changes_from>
```

#### **comments table:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **🔧 How to Fix:**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the SQL commands** from `MISSING_TABLES_SETUP.md`
4. **Verify tables are created** in Table Editor

### **✅ Expected Result:**

After creating these tables:

- ✅ **No more 406 errors** for recipe_likes queries
- ✅ **Like/unlike functionality** will work properly
- ✅ **Comments system** will work properly
- ✅ **All RLS policies** will be in place for security

### ** Verification Steps:**

1. Check **Table Editor** in Supabase
2. You should see `recipe_likes` and `comments` tables
3. Verify RLS is enabled for both tables
4. Check that the policies are applied

The 406 error will be completely resolved once you create these missing tables in your Supabase database! 