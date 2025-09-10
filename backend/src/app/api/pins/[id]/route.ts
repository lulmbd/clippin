/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { corsHeaders, preflight } from "@/lib/cors";

export async function OPTIONS() {
  return preflight();
}

// DELETE /api/pins/:id
export async function DELETE(_: Request, context: any) {
  const { params } = context as { params: { id: string } };
  await prisma.pin.delete({ where: { id: params.id } });
  return new Response(null, { status: 204, headers: corsHeaders() });
}
