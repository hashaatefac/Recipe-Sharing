"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../components/SessionProvider";
import AuthForm from "../components/AuthForm";
import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function SignUpPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/my-dashboard");
    } else if (user === null) {
      setAuthChecked(true);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center">
        <div className="text-orange-500 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!authChecked) {
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
      <AuthForm mode="signup" />
      <div className="mt-4 text-sm text-gray-700">
        Already have an account?{' '}
        <Link href="/signin" className="text-orange-600 hover:underline">Sign in</Link>
      </div>
    </div>
  );
} 