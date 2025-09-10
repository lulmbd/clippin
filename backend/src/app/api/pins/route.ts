import { prisma } from "@/lib/prisma";
import { corsHeaders, preflight } from "@/lib/cors";
import { z } from "zod";

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const clientId = sp.get("clientId") || "";
  const folderId = sp.get("folderId") || undefined;
  if (!clientId)
    return new Response("clientId required", {
      status: 400,
      headers: corsHeaders(),
    });
  const pins = await prisma.pin.findMany({
    where: { clientId, ...(folderId ? { folderId } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(pins, { headers: corsHeaders() });
}

const Create = z.object({
  clientId: z.string().min(1),
  content: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  folderId: z.string().optional(),
});
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parse = Create.safeParse(body);
  if (!parse.success)
    return new Response("Bad payload", { status: 400, headers: corsHeaders() });
  const pin = await prisma.pin.create({ data: parse.data });
  return Response.json(pin, { status: 201, headers: corsHeaders() });
}
