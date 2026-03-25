"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-6 py-2 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-white transition-all text-sm font-medium"
    >
      Sign Out
    </button>
  );
}
