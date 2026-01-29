import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { ensureSeedProducts } from "@/lib/seed";

export async function GET() {
  await dbConnect();
//   await ensureSeedProducts();

  const products = await Product.aggregate([{ $sample: { size: 10 } }]);
  return Response.json({ error: false, products });
}
