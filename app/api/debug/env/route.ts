import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Present" : "Missing",
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Missing",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
