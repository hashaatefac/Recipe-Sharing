"use client";

import Link from "next/link";
import { useSession } from "./SessionProvider";

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { user, profile } = useSession();

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <Link href="/" className="text-xl font-bold tracking-tight text-gray-800">
        RecipeShare
      </Link>
      <nav className="flex items-center gap-6">
        <Link 
          href="/" 
          className={`transition-colors ${
            currentPage === 'home' 
              ? 'text-orange-600 font-medium' 
              : 'text-gray-700 hover:text-orange-600'
          }`}
        >
          Home
        </Link>
        <Link 
          href="/recipes" 
          className={`transition-colors ${
            currentPage === 'recipes' 
              ? 'text-orange-600 font-medium' 
              : 'text-gray-700 hover:text-orange-600'
          }`}
        >
          All Recipes
        </Link>
        {user && (
          <Link 
            href="/my-dashboard" 
            className={`transition-colors ${
              currentPage === 'dashboard' 
                ? 'text-orange-600 font-medium' 
                : 'text-gray-700 hover:text-orange-600'
            }`}
          >
            Dashboard
          </Link>
        )}
        {user && (
          <div className="relative group">
            <Link 
              href="/profile" 
              className={`transition-colors ${
                currentPage === 'profile' 
                  ? 'text-orange-600 font-medium' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Profile
            </Link>
            {profile && (
              <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-white border border-gray-200 rounded shadow-sm text-xs text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {profile.username}
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
} 