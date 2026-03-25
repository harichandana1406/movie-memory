import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (!session.user.onboardingCompleted) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-950 to-indigo-950">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-extrabold tracking-tight text-center">
          Movie <span className="gradient-text">Memory</span>
        </h1>
        <p className="text-xl text-slate-400 text-center max-w-md">
          Capture your cinematic favorites and discover fascinating facts powered by AI.
        </p>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
    </main>
  );
}
