"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "../../components/SessionProvider";
import { supabase } from "../../../lib/supabase";
import Navigation from "../../components/Navigation";
import { LoadingSpinner } from "../../components/Skeleton";

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
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params?.id as string;
  const { user } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Function to get a reliable image URL
  const getReliableImageUrl = (originalUrl: string | undefined) => {
    if (!originalUrl) return null;
    
    // If it's already a relative URL or our own domain, return as is
    if (originalUrl.startsWith('/') || originalUrl.includes(window.location.hostname)) {
      return originalUrl;
    }
    
    // For Unsplash URLs, try a simpler approach
    if (originalUrl.includes('unsplash.com')) {
      // Use a simple, reliable Unsplash image as fallback
      return 'https://images.unsplash.com/photo-1565299624942-b28ea40a0ca6?auto=format&fit=crop&w=800&q=80&fm=jpg';
    }
    
    // For other external URLs, return as is
    return originalUrl;
  };

  // Function to get a placeholder image
  const getPlaceholderImage = () => {
    // Return a simple data URL for a placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmM2M3Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2Y1OWUwYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfh6nwn4epIFJlY2lwZSBJbWFnZTwvdGV4dD4KPC9zdmc+';
  };

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
              recipe_id: recipeId,
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
      try {
        // Get total likes
        const { count, error: countError } = await supabase
          .from("recipe_likes")
          .select("*", { count: "exact", head: true })
          .eq("recipe_id", recipeId);
        
        if (countError) {
          console.error('Error fetching likes count:', countError);
        } else {
          setLikes(count || 0);
        }

        // Check if user liked
        if (user) {
          const { data, error: userLikeError } = await supabase
            .from("recipe_likes")
            .select("id")
            .eq("recipe_id", recipeId)
            .eq("user_id", user.id)
            .single();
          
          if (userLikeError && userLikeError.code !== 'PGRST116') {
            console.error('Error checking user like:', userLikeError);
          } else {
            setUserLiked(!!data);
          }
        } else {
          setUserLiked(false);
        }
      } catch (error) {
        console.error('Error in fetchLikes:', error);
      }
    }
    fetchLikes();
  }, [recipeId, user]);

  async function handleLike() {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    
    try {
      if (userLiked) {
        // Unlike
        const { error: deleteError } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id);
        
        if (deleteError) {
          console.error('Error unliking recipe:', deleteError);
        }
      } else {
        // Like
        const { error: insertError } = await supabase
          .from("recipe_likes")
          .insert({ recipe_id: recipeId, user_id: user.id });
        
        if (insertError) {
          console.error('Error liking recipe:', insertError);
        }
      }

      // Refetch likes
      const { count, error: countError } = await supabase
        .from("recipe_likes")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", recipeId);
      
      if (countError) {
        console.error('Error refetching likes count:', countError);
      } else {
        setLikes(count || 0);
      }

      // Refetch user liked
      if (user) {
        const { data, error: userLikeError } = await supabase
          .from("recipe_likes")
          .select("id")
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id)
          .single();
        
        if (userLikeError && userLikeError.code !== 'PGRST116') {
          console.error('Error refetching user like:', userLikeError);
        } else {
          setUserLiked(!!data);
        }
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
    } finally {
      setLikeLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSpinner />
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
            <p className="text-gray-600 mb-6">The recipe you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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
            <div className="relative">
              <img 
                src={getReliableImageUrl(recipe.image_url) || getPlaceholderImage()} 
                alt={recipe.title} 
                className="w-full h-64 object-cover rounded mb-6"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  // Only set placeholder if the current src is not already the placeholder
                  if (!img.src.includes('data:image/svg+xml')) {
                    console.log('❌ Image failed to load, using placeholder');
                    img.src = getPlaceholderImage();
                    img.onerror = null; // Prevent infinite loop
                  }
                }}
                onLoad={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  // Only log success if it's not the placeholder
                  if (!img.src.includes('data:image/svg+xml')) {
                    console.log('✅ Image loaded successfully');
                  }
                }}
              />
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={userLiked ? "red" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${userLiked ? "fill-red-500" : ""}`}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
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
                          recipe_id: recipeId,
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