import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  const user = await User.findOne({ email });
  if (!user) return Response.json({ error: true, message: "Invalid login" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return Response.json({ error: true, message: "Invalid login" }, { status: 401 });

  const token = signToken({ userId: user._id.toString(), email: user.email, name: user.name });

  return Response.json({ error: false, token });
}
