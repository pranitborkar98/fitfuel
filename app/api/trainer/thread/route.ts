import { auth } from "@/lib/auth";
import { loadLatestThread } from "@/lib/ai-trainer/store";
import { readWithDeadline } from "@/lib/read-with-deadline";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: "Sign in to read your conversation." },
      { status: 401, headers },
    );
  try {
    const thread = await readWithDeadline(
      loadLatestThread(session.user.id),
      8000,
    );
    return Response.json({ thread }, { headers });
  } catch {
    return Response.json(
      { error: "Your conversation could not be loaded." },
      { status: 503, headers },
    );
  }
}
