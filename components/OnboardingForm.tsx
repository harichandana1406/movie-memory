"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const [movie, setMovie] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (movie.trim().length < 2) {
      setError("Movie title must be at least 2 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: movie.trim() }),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl font-bold mb-6 text-center">First things first...</h2>
      <p className="text-slate-400 mb-8 text-center">What is your absolute favorite movie of all time?</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={movie}
            onChange={(e) => setMovie(e.target.value)}
            placeholder="e.g. Interstellar"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Start Exploring"}
        </button>
      </form>
    </div>
  );
}
