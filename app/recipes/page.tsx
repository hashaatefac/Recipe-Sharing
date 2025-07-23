"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useSession } from "../components/SessionProvider";
import { useSearchParams } from "next/navigation";
import { RecipeGridSkeleton, SearchBarSkeleton, LoadingSpinner } from "../components/Skeleton";
import Navigation from "../components/Navigation";

interface Recipe {
  id: string;
  title: string;
  category: string;
  created_at: string;
  user_id: string;
  difficulty?: string;
  profiles: {
    username: string;
  };
}

export default function AllRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties");
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search');
  const { user } = useSession();
  
  console.log('Recipes page: URL searchParams =', searchParams.toString());
  console.log('Recipes page: searchQuery from URL =', urlSearchQuery);
  console.log('Recipes page: searchQuery type =', typeof urlSearchQuery);

  // Initialize search query from URL parameter
  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      console.log('Recipes page: searchQuery =', searchQuery);
      
      let query = supabase
        .from("recipes")
        .select(`id, title, category, created_at, user_id, difficulty`)
        .order("created_at", { ascending: false });
      
      // Add search filter if search query exists
      if (searchQuery && searchQuery.trim()) {
        console.log('Recipes page: Applying search filter for:', searchQuery);
        query = query.or(`title.ilike.%${searchQuery.trim()}%,ingredients.ilike.%${searchQuery.trim()}%,instructions.ilike.%${searchQuery.trim()}%`);
      }

      // Add category filter
      if (selectedCategory !== "All Categories") {
        query = query.eq("category", selectedCategory);
      }

      // Add difficulty filter
      if (selectedDifficulty !== "All Difficulties") {
        query = query.eq("difficulty", selectedDifficulty);
      }
      
      const { data, error } = await query;
      console.log('Recipes page: Query result =', data, 'error =', error);
      
      if (!error && data) {
        // Fetch usernames for all recipes
        const recipesWithUsernames = await Promise.all(
          data.map(async (recipe) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", recipe.user_id)
              .single();
            
            return {
              ...recipe,
              profiles: { username: profileData?.username || 'Unknown' }
            };
          })
        );
        setRecipes(recipesWithUsernames);
      }
      setLoading(false);
    }
    fetchRecipes();
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleSearch = () => {
    // This will trigger the useEffect to refetch recipes
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDifficulty("All Difficulties");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navigation currentPage="recipes" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Recipes"}
          </h1>
          <p className="text-gray-600">
            {searchQuery ? `Found ${recipes.length} recipes` : `Discover ${recipes.length} delicious recipes`}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="All Categories">All Categories</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>

            {/* Difficulty Dropdown */}
            <div className="md:w-48">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="All Difficulties">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Clear Search Button */}
          {(searchQuery || selectedCategory !== "All Categories" || selectedDifficulty !== "All Difficulties") && (
            <div className="mt-4">
              <button
                onClick={clearSearch}
                className="text-orange-500 hover:text-orange-700 font-medium"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <RecipeGridSkeleton />
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchQuery 
                ? `No recipes found for "${searchQuery}"` 
                : "No recipes found"}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 text-orange-500 hover:text-orange-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/recipes/${recipe.id}`} className="hover:text-orange-500 transition-colors">
                      {recipe.title}
                    </Link>
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>By: {recipe.profiles.username}</span>
                    <span>{recipe.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 