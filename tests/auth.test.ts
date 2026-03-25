import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/fact/route";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/facts", () => ({
  getOrGenerateMovieFact: vi.fn().mockResolvedValue("Some fact"),
}));

describe("API Authorization", () => {
  it("should return 401 if user is not authenticated", async () => {
    (getServerSession as any).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("should return 200 with fact if user is authenticated", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { id: "user-1", favoriteMovie: "Batman" },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fact).toBe("Some fact");
  });
});
