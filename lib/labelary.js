import "server-only";

/**
 * Convert ZPL to PDF using Labelary API
 * @param {string} zpl
 * @returns {Promise<Buffer>}
 */
export async function zplToPdf(zpl) {
  if (!zpl) {
    throw new Error("Missing ZPL data");
  }

  const res = await fetch(
    "https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/",
    {
      method: "POST",
      headers: {
        Accept: "application/pdf",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: zpl,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Labelary error: ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
