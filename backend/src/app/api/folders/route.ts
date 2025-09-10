import { prisma } from "@/lib/prisma";
import { corsHeaders, preflight } from "@/lib/cors";
import { z } from "zod";

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId") || "";
  if (!clientId)
    return new Response("clientId required", {
      status: 400,
      headers: corsHeaders(),
    });
  const folders = await prisma.folder.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(folders, { headers: corsHeaders() });
}

const Create = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1).max(120),
});
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parse = Create.safeParse(body);
  if (!parse.success)
    return new Response("Bad payload", { status: 400, headers: corsHeaders() });
  const folder = await prisma.folder.create({ data: parse.data });
  return Response.json(folder, { status: 201, headers: corsHeaders() });
}
