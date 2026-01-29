import Product from "@/models/Product";

export async function ensureSeedProducts() {
  const count = await Product.countDocuments();
  if (count >= 25) return;

  const items = Array.from({ length: 25 }).map((_, i) => {
    const idx = i + 1;
    return {
      name: `Demo Product ${idx}`,
      price: Number((Math.random() * 900 + 100).toFixed(0)),
      image: `https://picsum.photos/seed/demo${idx}/600/400`,
      sku: `SKU-DEMO-${String(idx).padStart(3, "0")}`,
    };
  });

  await Product.insertMany(items, { ordered: false }).catch(() => {});
}
