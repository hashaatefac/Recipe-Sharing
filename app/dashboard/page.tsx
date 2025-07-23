"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useSession } from "../components/SessionProvider";

export default function DashboardPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return; // Wait for session to load
    
    if (!user) {
      // Not logged in, redirect
      router.replace("/signin");
      return;
    }
    
    async function fetchRecipes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, user_id, ingredients, created_at")
        .order("created_at", { ascending: false });
      if (!error && data) setRecipes(data);
      setLoading(false);
    }
    fetchRecipes();
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex justify-center items-center">
        <div className="text-orange-500 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) return null; // Don't render until user is resolved

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
        <h2 className="text-xl font-semibold mb-4">All Recipes</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center text-gray-500">No recipes found.</div>
        ) : (
          <ul className="space-y-4">
            {recipes.map((recipe) => (
              <li key={recipe.id} className="bg-white rounded-lg shadow p-4">
                <div className="font-semibold text-lg">{recipe.title}</div>
                <div className="text-sm text-gray-500 mb-1">By: {recipe.user_id}</div>
                <div className="text-gray-700 text-sm line-clamp-2">
                  {recipe.ingredients.slice(0, 100)}{recipe.ingredients.length > 100 ? "..." : ""}
                </div>
                <div className="text-xs text-gray-400 mt-2">Created: {new Date(recipe.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 