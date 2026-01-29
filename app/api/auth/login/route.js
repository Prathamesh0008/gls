import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => null);
    if (!body) {
      return Response.json(
        { error: true, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: true, message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { error: true, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return Response.json(
        { error: true, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return Response.json({
      error: false,
      token,
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    return Response.json(
      { error: true, message: "Login failed" },
      { status: 500 }
    );
  }
}
