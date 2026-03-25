import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardContent from "@/components/DashboardContent";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  if (!session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 glass p-8 rounded-3xl">
          <div className="flex items-center gap-6">
            {user.image && (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-20 h-20 rounded-full border-4 border-indigo-500/30"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </header>

        {/* Favorite Movie Section */}
        <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-1 rounded-3xl">
          <div className="bg-slate-950/80 backdrop-blur-xl p-8 rounded-[22px] space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Your Favorite Movie</h2>
            <div className="flex flex-col gap-4">
               <p className="text-5xl font-black italic tracking-tighter">
                {user.favoriteMovie}
               </p>
               <div className="h-0.5 w-24 bg-indigo-500 rounded-full"></div>
            </div>
            
            <DashboardContent initialMovie={user.favoriteMovie!} />
          </div>
        </section>
      </div>
    </main>
  );
}
