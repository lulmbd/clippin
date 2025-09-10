import { prisma } from "@/lib/prisma";
import { corsHeaders, preflight } from "@/lib/cors";

export async function OPTIONS() {
  return preflight();
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await prisma.pin.delete({ where: { id: params.id } });
  return new Response(null, { status: 204, headers: corsHeaders() });
}
