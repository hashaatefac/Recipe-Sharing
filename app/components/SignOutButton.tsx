"use client";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    // Navigate to the home page first
    router.push("/");
    // Then sign out
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      Sign Out
    </button>
  );
} 