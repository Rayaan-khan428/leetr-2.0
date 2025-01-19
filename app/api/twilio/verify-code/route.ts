import { NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/firebase/auth";
import { headers } from "next/headers";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function POST(request: Request) {
  try {
    // Get the authorization token from headers
    const authHeader = headers().get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization header");
    }

    // Verify the Firebase token
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.uid) {
      throw new Error("Invalid authorization");
    }

    if (!accountSid || !authToken || !verifySid) {
      throw new Error("Missing Twilio credentials");
    }

    const client = twilio(accountSid, authToken);
    const { phoneNumber, code } = await request.json();

    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    const verification = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: formattedNumber,
        code,
      });

    if (verification.valid) {
      // Update the user's phone number and verification status in the database
      await prisma.users.update({
        where: { firebaseUid: decodedToken.uid },
        data: {
          phoneNumber: formattedNumber,
          phoneVerified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: verification.status,
      valid: verification.valid,
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { 
        error: "Failed to verify code",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 