import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/firebase/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    const authHeader = headers().get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { emailNotifications, smsEnabled } = await request.json();

    const settings = await prisma.user_settings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        emailNotifications,
        smsEnabled,
      },
      create: {
        id: crypto.randomUUID(),
        userId: user.id,
        emailNotifications,
        smsEnabled,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authHeader = headers().get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const settings = await prisma.user_settings.findUnique({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json(settings || { emailNotifications: true });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
} 