import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function POST(request: Request) {
  try {
    if (!accountSid || !authToken || !verifySid) {
      throw new Error("Missing Twilio credentials");
    }

    const client = twilio(accountSid, authToken);
    const { phoneNumber } = await request.json();

    // Format phone number to E.164 format if it's not already
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    console.log('Sending verification to:', formattedNumber);
    console.log('Using Verify SID:', verifySid);

    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: formattedNumber,
        channel: "sms"
      });

    console.log('Verification status:', verification.status);

    return NextResponse.json({ 
      success: true, 
      status: verification.status 
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { 
        error: "Failed to send verification code",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 