/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { corsHeaders, preflight } from "@/lib/cors";
import { z } from "zod";

export async function OPTIONS() {
  return preflight();
}

// DELETE /api/folders/:id
export async function DELETE(_: Request, context: any) {
  const { params } = context as { params: { id: string } };
  await prisma.folder.delete({ where: { id: params.id } });
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const Rename = z.object({ name: z.string().min(1).max(120) });

// PATCH /api/folders/:id
export async function PATCH(req: Request, context: any) {
  const { params } = context as { params: { id: string } };
  const body = await req.json().catch(() => ({}));
  const parse = Rename.safeParse(body);
  if (!parse.success) {
    return new Response("Bad payload", { status: 400, headers: corsHeaders() });
  }
  const folder = await prisma.folder.update({
    where: { id: params.id },
    data: { name: parse.data.name },
  });
  return Response.json(folder, { headers: corsHeaders() });
}
