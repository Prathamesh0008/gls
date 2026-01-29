import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return Response.json({ error: true, message: "Missing fields" }, { status: 400 });
  }

  const exists = await User.findOne({ email });
  if (exists) return Response.json({ error: true, message: "Email already used" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash });

  return Response.json({ error: false, message: "Registered" });
}
