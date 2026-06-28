import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  sport: string;
  type: string;
  message: string;
}

async function appendToGoogleSheet(data: ContactFormData): Promise<boolean> {
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    console.warn(
      "GOOGLE_SCRIPT_URL not configured. Skipping Google Sheets integration."
    );
    return false;
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        source: "AllSportsProfessionals Website",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Google Sheets error:", error);
    return false;
  }
}

async function sendNotificationEmail(
  data: ContactFormData
): Promise<boolean> {
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;
  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn(
      "EmailJS not configured. Skipping email notification."
    );
    return false;
  }

  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: NOTIFICATION_EMAIL || "info@allsportsprofessionals.com",
            from_name: data.name,
            from_email: data.email,
            phone: data.phone,
            sport: data.sport,
            inquiry_type: data.type,
            message: data.message || "No additional message",
            timestamp: new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            }),
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    if (!data.name || !data.email || !data.phone || !data.sport || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const [sheetResult, emailResult] = await Promise.allSettled([
      appendToGoogleSheet(data),
      sendNotificationEmail(data),
    ]);

    const sheetSuccess =
      sheetResult.status === "fulfilled" && sheetResult.value;
    const emailSuccess =
      emailResult.status === "fulfilled" && emailResult.value;

    return NextResponse.json({
      success: true,
      message: "Inquiry received successfully!",
      details: {
        googleSheet: sheetSuccess ? "saved" : "not_configured",
        emailNotification: emailSuccess ? "sent" : "not_configured",
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
