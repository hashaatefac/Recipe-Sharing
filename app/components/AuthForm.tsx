"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else {
        setMessage("Check your email for a confirmation link! Redirecting to sign in...");
        setTimeout(() => router.push("/signin"), 2000);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Supabase sign in response:", { data, error });
      if (error) setMessage(error.message);
      else {
        setMessage("Sign in successful! Redirecting to dashboard...");
        window.location.assign("/my-dashboard");
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-center">
        {mode === "signup" ? "Sign Up" : "Sign In"}
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
      <button
        type="submit"
        className="bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition-colors"
        disabled={loading}
      >
        {loading ? "Loading..." : mode === "signup" ? "Sign Up" : "Sign In"}
      </button>
      {message && <div className="text-center text-sm text-red-500">{message}</div>}
    </form>
  );
} 