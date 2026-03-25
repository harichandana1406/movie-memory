import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function getOrGenerateMovieFact(userId: string, movieTitle: string) {
  // 1. Check for cached fact within 60 seconds
  const lastFact = await prisma.movieFact.findFirst({
    where: { userId, movieTitle },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  if (lastFact && now.getTime() - lastFact.createdAt.getTime() < 60000) {
    return lastFact.content;
  }

  // 2. Burst / Idempotency Protection
  // Check if a generation is already in progress for this user
  const lock = await prisma.generationLock.findUnique({
    where: { userId },
  });

  if (lock) {
    // If lock is older than 30 seconds, assume something went wrong and overwrite it
    if (now.getTime() - lock.lockedAt.getTime() < 30000) {
      return lastFact?.content || "Information being gathered... Please wait a few seconds.";
    }
  }

  // Set the lock
  await prisma.generationLock.upsert({
    where: { userId },
    update: { lockedAt: now },
    create: { userId, lockedAt: now },
  });

  try {
    // 3. Generate new fact using Gemini
    const prompt = `You are a movie expert. Provide a short, fun, and intriguing fact about the movie "${movieTitle}". Keep it under 200 characters.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const factContent = response.text() || "No fact available.";

    // 4. Store the fact
    const fact = await prisma.movieFact.create({
      data: {
        userId,
        movieTitle,
        content: factContent,
      },
    });

    return fact.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    // 5. Failure Handling: Return most recent cached fact if exists
    if (lastFact) {
      return lastFact.content;
    }
    throw new Error("Failed to generate movie fact. Please try again later.");
  } finally {
    // Release the lock
    await prisma.generationLock.delete({
      where: { userId },
    }).catch(() => {}); // Ignore if lock was already deleted
  }
}
