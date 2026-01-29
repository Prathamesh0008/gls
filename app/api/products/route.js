import { PRODUCTS } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  // Shuffle & return 10 (already 10, but keeps logic clean)
  const shuffled = [...PRODUCTS].sort(() => 0.5 - Math.random());
  return Response.json({
    error: false,
    products: shuffled.slice(0, 10),
  });
}
