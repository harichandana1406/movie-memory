"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="px-8 py-4 bg-white text-black font-bold rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all active:scale-95 flex items-center gap-3"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      Sign in with Google
    </button>
  );
}
