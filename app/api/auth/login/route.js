import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    console.log("🔐 LOGIN HIT");

    await dbConnect();

    const raw = await req.text();
    if (!raw) {
      return Response.json(
        { error: true, message: "Empty request body" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json(
        { error: true, message: "Invalid JSON" },
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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { error: true, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return Response.json(
        { error: true, message: "Invalid credentials" },
        { status: 401 }
      );
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
    console.error("❌ LOGIN CRASH:", err);
    return Response.json(
      { error: true, message: err.message || "Login failed" },
      { status: 500 }
    );
  }
}
