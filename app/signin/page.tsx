"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../components/SessionProvider";
import AuthForm from "../components/AuthForm";
import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function SignInPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/my-dashboard");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center">
        <div className="text-orange-500 font-semibold">Loading...</div>
      </div>
    );
  }

  if (user) return null; // Should be redirected, but good to have a fallback

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50">
      <Link href="/" className="flex items-center space-x-2 mb-8 text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors">
        <ChefHat className="h-8 w-8 text-orange-500" />
        <span>RecipeShare</span>
      </Link>
      <AuthForm mode="signin" />
      <div className="mt-4 text-sm text-gray-700">
        Don't have an account?{' '}
        <Link href="/signup" className="text-orange-600 hover:underline">Sign up</Link>
      </div>
    </div>
  );
} 