"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useSession } from "../components/SessionProvider";
import { RecipeGridSkeleton, LoadingSpinner } from "../components/Skeleton";
import Navigation from "../components/Navigation";

interface Recipe {
  id: string;
  title: string;
  category: string;
  created_at: string;
  user_id: string;
  difficulty?: string;
  image_url?: string;
}

export default function MyDashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      window.location.href = "/signin";
      return;
    }

    async function fetchMyRecipes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRecipes(data);
      }
      setLoading(false);
    }

    fetchMyRecipes();
  }, [user, isLoading]);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("user_id", user?.id);

    if (!error) {
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navigation currentPage="dashboard" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600 mb-4">
              Welcome to your dashboard! Here you can manage your recipes and track your cooking journey.
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Add Recipe
          </Link>
        </div>

        {loading ? (
          <RecipeGridSkeleton />
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven&apos;t created any recipes yet.</p>
            <Link
              href="/recipes/new"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              Create Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Recipe Image */}
                {recipe.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        const placeholder = img.nextElementSibling as HTMLElement;
                        if (img && placeholder) {
                          img.style.display = 'none';
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-orange-100 flex items-center justify-center text-orange-300 text-4xl" style={{display: 'none'}}>
                      <span role="img" aria-label="No image">🍽️</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-orange-100 flex items-center justify-center text-orange-300 text-4xl">
                    <span role="img" aria-label="No image">🍽️</span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/recipes/${recipe.id}`} className="hover:text-orange-500 transition-colors">
                      {recipe.title}
                    </Link>
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{recipe.category}</span>
                    {recipe.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/recipes/${recipe.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 