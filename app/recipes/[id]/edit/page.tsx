"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "../../../components/SessionProvider";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";
import Navigation from "../../../components/Navigation";

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
  const [recipe, setRecipe] = useState<any>(null);

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
            <button type="submit" disabled={saving} className="w-full bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-gray-400">
              {saving ? 'Saving...' : 'Update Recipe'}
            </button>
          </div>
          {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
        </form>
      </main>
    </div>
  );
} 