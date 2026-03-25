"use client";

import { useState, useEffect } from "react";

export default function DashboardContent({ initialMovie }: { initialMovie: string }) {
  const [fact, setFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFact = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fact");
      const data = await res.json();
      if (res.ok) {
        setFact(data.fact);
      } else {
        setError(data.error || "Failed to load movie fact.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">✨</span> Fun Fact
        </h3>
        <button 
          onClick={fetchFact}
          disabled={loading}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Fact"}
        </button>
      </div>

      <div className="glass p-6 rounded-2xl min-h-[100px] flex items-center justify-center relative overflow-hidden group">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : fact ? (
          <p className="text-lg text-slate-200 italic leading-relaxed animate-in fade-in zoom-in duration-500">
            "{fact}"
          </p>
        ) : (
          <p className="text-slate-500 italic">No facts available yet.</p>
        )}
        
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
