import { prisma } from "@/lib/prisma";
import { corsHeaders, preflight } from "@/lib/cors";

export async function OPTIONS() {
  return preflight();
}

export async function GET() {
  try {
    const count = await prisma.folder.count();

    return Response.json(
      {
        ok: true,
        env: process.env.VERCEL_ENV || "local",
        foldersCount: count,
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return Response.json(
      {
        ok: false,
        env: process.env.VERCEL_ENV || "local",
        error: (err as Error).message,
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
