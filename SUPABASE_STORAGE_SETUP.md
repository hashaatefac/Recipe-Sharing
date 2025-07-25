# Supabase Storage Setup for Recipe Images

## 🗂️ Storage Bucket Setup

To enable image uploads, you need to create a storage bucket in your Supabase project:

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Enter the following details:
   - **Name**: `recipe-images`
   - **Public bucket**: ✅ **Check this box** (so images can be accessed publicly)
   - **File size limit**: `5MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*`

### 2. Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

#### Policy 1: Allow authenticated users to upload images
```sql
-- Policy name: "Allow authenticated users to upload images"
-- Target: INSERT
-- Using expression: auth.uid() IS NOT NULL

CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'recipe-images' AND auth.uid() IS NOT NULL);
```

#### Policy 2: Allow users to update their own images
```sql
-- Policy name: "Allow users to update their own images"
-- Target: UPDATE
-- Using expression: auth.uid()::text = (storage.foldername(name))[1]

CREATE POLICY "Allow users to update their own images" ON storage.objects
FOR UPDATE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Policy 3: Allow users to delete their own images
```sql
-- Policy name: "Allow users to delete their own images"
-- Target: DELETE
-- Using expression: auth.uid()::text = (storage.foldername(name))[1]

CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Policy 4: Allow public read access to all images
```sql
-- Policy name: "Allow public read access to recipe images"
-- Target: SELECT
-- Using expression: bucket_id = 'recipe-images'

CREATE POLICY "Allow public read access to recipe images" ON storage.objects
FOR SELECT USING (bucket_id = 'recipe-images');
```

### 3. How It Works

The image upload system works as follows:

1. **File Selection**: User selects an image file from their computer
2. **Validation**: File type and size are validated (max 5MB, image types only)
3. **Upload**: File is uploaded to Supabase Storage in the `recipe-images` bucket
4. **File Naming**: Files are stored as `{user_id}/{timestamp}.{extension}`
5. **Public URL**: A public URL is generated and stored in the recipe's `image_url` field
6. **Preview**: User sees a preview of the uploaded image

### 4. File Structure

Images are organized in the storage bucket like this:
```
recipe-images/
├── user_id_1/
│   ├── 1703123456789.jpg
│   └── 1703123456790.png
├── user_id_2/
│   ├── 1703123456791.jpg
│   └── 1703123456792.gif
└── ...
```

### 5. Security Features

- ✅ **User isolation**: Each user's images are stored in their own folder
- ✅ **File validation**: Only image files under 5MB are accepted
- ✅ **Public access**: Images are publicly readable for display
- ✅ **User control**: Users can only modify their own images
- ✅ **Unique naming**: Timestamp-based naming prevents conflicts

### 6. Troubleshooting

If image uploads fail:

1. **Check bucket exists**: Ensure `recipe-images` bucket is created
2. **Check policies**: Verify all 4 policies are applied
3. **Check permissions**: Ensure bucket is public
4. **Check file size**: Ensure file is under 5MB
5. **Check file type**: Ensure file is an image (jpg, png, gif, etc.)

### 7. Environment Variables

Make sure your environment variables are set correctly:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The storage functionality uses the same Supabase client that's already configured in your app. 