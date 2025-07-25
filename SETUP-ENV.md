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