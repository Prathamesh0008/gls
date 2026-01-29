import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";


export async function GET() {
  await dbConnect();


  const products = await Product.aggregate([{ $sample: { size: 10 } }]);
  return Response.json({ error: false, products });
}
