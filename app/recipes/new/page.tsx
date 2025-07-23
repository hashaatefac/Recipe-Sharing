"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../components/SessionProvider";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import Navigation from "../../components/Navigation";

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

export default function AddRecipePage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (isLoading) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    console.log('Recipe creation: Starting submission');
    console.log('Recipe creation: User ID =', user.id);
    console.log('Recipe creation: Form data =', { title, ingredients, instructions, cookingTime, difficulty, category, imageUrl });
    
    setLoading(true);
    setMessage("");
    
    // Test Supabase connection first
    try {
      console.log('Recipe creation: Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('recipes')
        .select('id')
        .limit(1);
      console.log('Recipe creation: Connection test result =', { testData, testError });
      
      // Test if user can read their own recipes (RLS policy test)
      console.log('Recipe creation: Testing RLS policies...');
      const { data: userRecipes, error: userRecipesError } = await supabase
        .from('recipes')
        .select('id, title')
        .eq('user_id', user.id)
        .limit(1);
      console.log('Recipe creation: User recipes test =', { userRecipes, userRecipesError });
      
      // Test if user profile exists
      console.log('Recipe creation: Testing user profile...');
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .single();
      console.log('Recipe creation: User profile test =', { userProfile, profileError });
      
    } catch (testErr) {
      console.error('Recipe creation: Connection test failed =', testErr);
    }
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('Recipe creation: Request timed out');
      setLoading(false);
      setMessage("Request timed out. Please try again.");
    }, 5000); // Reduced to 5 seconds for faster feedback
    
    try {
      console.log('Recipe creation: Attempting to insert recipe...');
      const { error } = await supabase.from("recipes").insert({
        user_id: user.id,
        title: title.trim(),
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        cooking_time: cookingTime ? parseInt(cookingTime) : null,
        difficulty,
        category,
        image_url: imageUrl.trim() || null,
      });
      
      clearTimeout(timeoutId);
      console.log('Recipe creation: Supabase insert response =', { error });
      
      if (error) {
        console.error('Recipe creation: Error details =', error);
        setMessage("Error: " + error.message);
      } else {
        console.log('Recipe creation: Success! Recipe inserted successfully');
        setMessage("Recipe created successfully!");
        setTimeout(() => router.push("/my-dashboard"), 1200);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Recipe creation: Unexpected error =', err);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Add a New Recipe</h2>
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
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input id="imageUrl" type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
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
            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-gray-400">
              {loading ? 'Saving...' : 'Add Recipe'}
            </button>
          </div>
          {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
        </form>
      </main>
    </div>
  );
} 