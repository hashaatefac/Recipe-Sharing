"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "../../../components/SessionProvider";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";
import Navigation from "../../../components/Navigation";

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time?: number;
  difficulty: string;
  category: string;
  image_url?: string;
  user_id: string;
}

const difficulties = ["Easy", "Medium", "Hard"];
const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Vegetarian",
  "Quick & Easy",
  "Seafood",
  "Asian",
  "Italian",
  "Other"
];

export default function EditRecipePage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;
  
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [category, setCategory] = useState(categories[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    
    async function fetchRecipe() {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .eq("user_id", user?.id)
        .single();
      
      if (error || !data) {
        setMessage("Recipe not found or you don't have permission to edit it.");
        setLoading(false);
        return;
      }
      
      setRecipe(data);
      setTitle(data.title || "");
      setIngredients(data.ingredients || "");
      setInstructions(data.instructions || "");
      setCookingTime(data.cooking_time ? data.cooking_time.toString() : "");
      setDifficulty(data.difficulty || difficulties[0]);
      setCategory(data.category || categories[0]);
      setImageUrl(data.image_url || "");
      setLoading(false);
    }
    
    if (user) {
      fetchRecipe();
    }
  }, [recipeId, user]);

  const handleImageUpload = async (file: File) => {
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage("Please select a valid image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage with timeout
      const uploadPromise = supabase.storage
        .from('recipe-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout')), 10000); // 10 second timeout
      });

      let uploadResult;
      try {
        uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
      } catch {
        throw new Error('Upload timeout');
      }

      const { error } = uploadResult as { error: unknown };

      if (error) {
        console.error('Upload error:', error);
        
        // If upload fails, use a fallback approach
        const errorMessage = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
        if (errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch')) {
          setMessage("Upload timed out. Using local preview instead. (Note: Set up 'recipe-images' storage bucket in Supabase for full functionality)");
          
          // Create local preview and use a placeholder URL
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
            // Use a more reliable placeholder URL for the database
            setImageUrl('https://picsum.photos/800/400?random=7');
          };
          reader.readAsDataURL(file);
          return;
        }
        
        setMessage("Failed to upload image. Please try again.");
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      setMessage("Image uploaded successfully!");
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      
      // If it's a timeout or network error, use fallback
      if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('Failed to fetch'))) {
        setMessage("Upload timed out. Using local preview instead. (Note: Set up 'recipe-images' storage bucket in Supabase for full functionality)");
        
        // Create local preview and use a placeholder URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          // Use a more reliable placeholder URL for the database
          setImageUrl('https://picsum.photos/800/400?random=8');
        };
        reader.readAsDataURL(file);
      } else {
        setMessage("Failed to upload image. Please try again. (Note: Set up 'recipe-images' storage bucket in Supabase for full functionality)");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center">
        <div className="text-orange-500 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.replace("/signin");
    return null;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center items-center">
        <div className="text-red-500 font-semibold mb-4">{message || "Recipe not found."}</div>
        <Link href="/my-dashboard" className="text-orange-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage("");
    
    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        ingredients,
        instructions,
        cooking_time: cookingTime ? parseInt(cookingTime) : null,
        difficulty,
        category,
        image_url: imageUrl,
      })
      .eq("id", recipeId)
      .eq("user_id", user.id);
    
    setSaving(false);
    
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Recipe updated successfully!");
      setTimeout(() => router.push("/my-dashboard"), 1200);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/my-dashboard" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Edit Recipe</h2>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredients</label>
            <textarea id="ingredients" value={ingredients} onChange={e => setIngredients(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="List ingredients, separated by commas or lines" />
          </div>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Step-by-step instructions" />
          </div>
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Image</label>
            
            {/* File Upload */}
            <div className="mb-4">
              <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image from Computer
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
              {uploading && (
                <p className="mt-2 text-sm text-orange-600">Uploading image...</p>
              )}
            </div>

            {/* Image Preview */}
            {(imagePreview || imageUrl) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || imageUrl}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmM2M3Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2Y1OWUwYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfh6nwn4epIFJlY2lwZSBJbWFnZTwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Or Use Image URL */}
            <div className="mt-4">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Or Use Image URL</label>
              <input 
                id="imageUrl" 
                type="url" 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)} 
                placeholder="https://..." 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">Cooking Time (min)</label>
              <input id="cookingTime" type="number" min="1" value={cookingTime} onChange={e => setCookingTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="text-center">
            <button type="submit" disabled={saving || uploading} className="w-full bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-gray-400">
              {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Update Recipe'}
            </button>
          </div>
          {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
        </form>
      </main>
    </div>
  );
} 