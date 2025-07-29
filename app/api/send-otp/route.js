import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { phoneNumber, otp } = await request.json()

    // Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    console.log("Twilio Config Check:", {
      accountSid: accountSid ? "✓ Set" : "✗ Missing",
      authToken: authToken ? "✓ Set" : "✗ Missing",
      twilioPhoneNumber: twilioPhoneNumber ? "✓ Set" : "✗ Missing",
    })

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Twilio credentials not configured properly",
          details: {
            accountSid: !!accountSid,
            authToken: !!authToken,
            twilioPhoneNumber: !!twilioPhoneNumber,
          },
        },
        { status: 500 },
      )
    }

    // Use Twilio REST API directly
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const formData = new URLSearchParams()
    formData.append("From", twilioPhoneNumber)
    formData.append("To", phoneNumber)
    formData.append(
      "Body",
      `Your Gemini Chat verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`,
    )

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Twilio API Error:", result)

      let errorMessage = "Failed to send SMS"
      let isTrialLimitation = false

      if (result.code) {
        switch (result.code) {
          case 21211:
            errorMessage = "Invalid phone number format. Please check the number and country code."
            break
          case 21614:
            errorMessage = "Phone number is not a valid mobile number"
            break
          case 21408:
            errorMessage = "Permission to send SMS has not been enabled for this region"
            break
          case 20003:
            errorMessage = "Authentication error - please check your Twilio credentials"
            break
          case 20404:
            errorMessage = "Twilio phone number not found or not configured"
            break
          case 21606:
            errorMessage =
              "⚠️ TRIAL ACCOUNT LIMITATION: This phone number is not verified in your Twilio account. In trial mode, you can only send SMS to verified numbers."
            isTrialLimitation = true
            break
          default:
            errorMessage = result.message || "Failed to send SMS"
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: result.code || "UNKNOWN_ERROR",
          isTrialLimitation,
          upgradeRequired: isTrialLimitation,
        },
        { status: 400 },
      )
    }

    console.log(`SMS sent successfully! Message SID: ${result.sid}`)

    return NextResponse.json({
      success: true,
      messageSid: result.sid,
      message: "SMS sent successfully",
    })
  } catch (error) {
    console.error("API Route Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while sending SMS",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
