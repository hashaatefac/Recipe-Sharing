"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../components/SessionProvider";
import { Heart } from "lucide-react";
import { RecipeDetailSkeleton, LoadingSpinner } from "../../components/Skeleton";
import Navigation from "../../components/Navigation";

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;
  const { user } = useSession();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!recipeId) {
      console.log('Recipe detail page: No recipeId provided');
      return;
    }
    async function fetchRecipe() {
      setLoading(true);
      console.log('Recipe detail page: recipeId =', recipeId);
      console.log('Recipe detail page: recipeId type =', typeof recipeId);
      
      // First, let's check if the recipe exists at all
      const { data: allRecipes, error: listError } = await supabase
        .from("recipes")
        .select("id, title")
        .limit(10);
      console.log('Recipe detail page: All recipes =', allRecipes, 'listError =', listError);
      
      const { data, error } = await supabase
        .from("recipes")
        .select(`*`)
        .eq("id", recipeId)
        .single();
      console.log('Recipe detail page: Supabase data =', data, 'error =', error);
      
      if (error) {
        console.log('Recipe detail page: Error details =', error.message, error.code);
      }
      
      if (!error && data) {
        // Fetch the username separately
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user_id)
          .single();
        
        setRecipe({
          ...data,
          profiles: { username: profileData?.username || 'Unknown' }
        });
        console.log('Recipe detail page: Image URL =', data.image_url);
      }
      setLoading(false);
    }
    fetchRecipe();
  }, [recipeId]);

  // Fetch comments
  useEffect(() => {
    if (!recipeId) return;
    async function fetchComments() {
      setCommentsLoading(true);
      console.log('Recipe detail page: Fetching comments for recipeId =', recipeId);
      
      // First, get comments without the profiles join
      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: true });
      
      console.log('Recipe detail page: Comments data =', commentsData, 'error =', error);
      
      if (!error && commentsData) {
        // Fetch usernames for all comments
        const commentsWithUsernames = await Promise.all(
          commentsData.map(async (comment) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", comment.user_id)
              .single();
            
            return {
              ...comment,
              profiles: { username: profileData?.username || 'Unknown' }
            };
          })
        );
        setComments(commentsWithUsernames);
        console.log('Recipe detail page: Comments with usernames =', commentsWithUsernames);
      }
      setCommentsLoading(false);
    }
    fetchComments();
  }, [recipeId]);

  // Fetch likes
  useEffect(() => {
    if (!recipeId) return;
    async function fetchLikes() {
      // Get total likes
      const { count } = await supabase
        .from("recipe_likes")
        .select("id", { count: "exact", head: true })
        .eq("recipe_id", recipeId);
      setLikes(count || 0);
      // Check if user liked
      if (user) {
        const { data } = await supabase
          .from("recipe_likes")
          .select("id")
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id)
          .single();
        setUserLiked(!!data);
      } else {
        setUserLiked(false);
      }
    }
    fetchLikes();
  }, [recipeId, user]);

  async function handleLike() {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    if (userLiked) {
      // Unlike
      await supabase
        .from("recipe_likes")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id);
    } else {
      // Like
      await supabase
        .from("recipe_likes")
        .insert({ recipe_id: recipeId, user_id: user.id });
    }
    // Refetch likes
    const { count } = await supabase
      .from("recipe_likes")
      .select("id", { count: "exact", head: true })
      .eq("recipe_id", recipeId);
    setLikes(count || 0);
    // Refetch user liked
    if (user) {
      const { data } = await supabase
        .from("recipe_likes")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)
        .single();
      setUserLiked(!!data);
    }
    setLikeLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <RecipeDetailSkeleton />
        </main>
      </div>
    );
  }
  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
            <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/recipes"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              Browse All Recipes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/recipes" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Back to All Recipes</Link>
        <div className="bg-white p-8 rounded-xl shadow-md">
          {recipe.image_url ? (
            <div>
              <img 
                src={recipe.image_url} 
                alt={recipe.title} 
                className="w-full h-64 object-cover rounded mb-6"
                onError={(e) => {
                  console.log('Image failed to load:', recipe.image_url);
                  const img = e.currentTarget as HTMLImageElement;
                  const placeholder = img.nextElementSibling as HTMLElement;
                  if (img && placeholder) {
                    img.style.display = 'none';
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="w-full h-64 bg-orange-100 flex items-center justify-center rounded mb-6 text-orange-300 text-6xl" style={{display: 'none'}}>
                <span role="img" aria-label="No image">🍽️</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-orange-100 flex items-center justify-center rounded mb-6 text-orange-300 text-6xl">
              <span role="img" aria-label="No image">🍽️</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 items-center">
            <span>By: <span className="text-orange-600">{recipe.profiles?.username || 'Unknown'}</span></span>
            <span>Category: {recipe.category || 'Uncategorized'}</span>
            <span>Difficulty: {recipe.difficulty || 'N/A'}</span>
            {recipe.cooking_time && <span>Cooking Time: {recipe.cooking_time} min</span>}
            <span>Created: {new Date(recipe.created_at).toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <button
                onClick={handleLike}
                disabled={!user || likeLoading}
                className={`focus:outline-none ${userLiked ? "text-red-500" : "text-gray-400"}`}
                title={user ? (userLiked ? "Unlike" : "Like") : "Sign in to like"}
              >
                <Heart className={`h-5 w-5 ${userLiked ? "fill-red-500" : ""}`} />
              </button>
              <span className="text-xs text-gray-700">{likes}</span>
            </span>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <pre className="bg-orange-50 p-4 rounded text-gray-800 whitespace-pre-wrap">{recipe.ingredients}</pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Instructions</h2>
            <pre className="bg-orange-50 p-4 rounded text-gray-800 whitespace-pre-wrap">{recipe.instructions}</pre>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          {commentsLoading ? (
            <div className="text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500">No comments yet. Be the first to comment!</div>
          ) : (
            <ul className="space-y-4 mb-6">
              {comments.map((c) => (
                <li key={c.id} className="bg-orange-50 rounded p-4">
                  <div className="text-sm text-gray-800 mb-1">{c.content}</div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span>{c.profiles?.username || 'Unknown'}</span>
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {user ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!commentInput.trim()) return;
                setCommentLoading(true);
                const { error } = await supabase.from("comments").insert({
                  recipe_id: recipeId,
                  user_id: user.id,
                  content: commentInput.trim(),
                });
                setCommentLoading(false);
                if (!error) {
                  setCommentInput("");
                  // Refetch comments with usernames
                  const { data: commentsData } = await supabase
                    .from("comments")
                    .select("id, content, created_at, user_id")
                    .eq("recipe_id", recipeId)
                    .order("created_at", { ascending: true });
                  
                  if (commentsData) {
                    // Fetch usernames for all comments
                    const commentsWithUsernames = await Promise.all(
                      commentsData.map(async (comment) => {
                        const { data: profileData } = await supabase
                          .from("profiles")
                          .select("username")
                          .eq("id", comment.user_id)
                          .single();
                        
                        return {
                          ...comment,
                          profiles: { username: profileData?.username || 'Unknown' }
                        };
                      })
                    );
                    setComments(commentsWithUsernames);
                  }
                }
              }}
              className="flex flex-col gap-2"
            >
              <textarea
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Add a comment..."
                disabled={commentLoading}
              />
              <button
                type="submit"
                disabled={commentLoading || !commentInput.trim()}
                className="self-end bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300"
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="text-gray-500">Sign in to add a comment.</div>
          )}
        </div>
      </main>
    </div>
  );
} 