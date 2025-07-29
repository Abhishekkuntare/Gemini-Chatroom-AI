// Enhanced OTP Service with trial account handling
const otpStorage = new Map()

// Development mode - bypass SMS for testing
const DEVELOPMENT_MODE = process.env.NODE_ENV === "development"
const BYPASS_SMS = process.env.BYPASS_SMS === "true"

export const sendOTP = async (phoneNumber) => {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with expiration (5 minutes)
    otpStorage.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    })

    console.log(`Generated OTP ${otp} for ${phoneNumber}`)

    // In development mode or bypass mode, return success without sending SMS
    if (DEVELOPMENT_MODE && BYPASS_SMS) {
      console.log(`🔧 DEVELOPMENT MODE: OTP ${otp} for ${phoneNumber} (SMS bypassed)`)
      return {
        success: true,
        message: "SMS sent successfully (Development Mode)",
        developmentMode: true,
        otp: otp, // Only in development
      }
    }

    // Send SMS using Twilio API
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        otp,
      }),
    })

    const result = await response.json()
    console.log("API Response:", result)

    if (result.success) {
      return {
        success: true,
        message: "SMS sent successfully",
      }
    } else {
      // Handle trial account limitations
      if (result.isTrialLimitation) {
        return {
          success: false,
          error: result.error,
          isTrialLimitation: true,
          upgradeRequired: true,
          solutions: [
            "Upgrade your Twilio account to send SMS to any number",
            "Add this phone number to your Twilio verified numbers",
            "Use development mode for testing",
          ],
        }
      }

      throw new Error(result.error || "Failed to send SMS")
    }
  } catch (error) {
    console.error("Error in sendOTP:", error)
    return {
      success: false,
      error: error.message || "Failed to send SMS",
    }
  }
}

export const verifyOTP = async (phoneNumber, enteredOTP) => {
  try {
    const storedData = otpStorage.get(phoneNumber)

    console.log(`Verifying OTP for ${phoneNumber}:`, {
      hasStoredData: !!storedData,
      enteredOTP,
      storedOTP: storedData?.otp,
      expired: storedData ? Date.now() > storedData.expiresAt : false,
      attempts: storedData?.attempts || 0,
    })

    if (!storedData) {
      return {
        success: false,
        error: "OTP not found. Please request a new one.",
      }
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(phoneNumber)
      return {
        success: false,
        error: "OTP has expired. Please request a new one.",
      }
    }

    // Check attempts limit
    if (storedData.attempts >= 3) {
      otpStorage.delete(phoneNumber)
      return {
        success: false,
        error: "Too many failed attempts. Please request a new OTP.",
      }
    }

    // Verify OTP
    if (storedData.otp === enteredOTP) {
      otpStorage.delete(phoneNumber) // Clear OTP after successful verification
      console.log(`OTP verified successfully for ${phoneNumber}`)
      return {
        success: true,
        message: "OTP verified successfully",
      }
    } else {
      // Increment attempts
      storedData.attempts += 1
      otpStorage.set(phoneNumber, storedData)

      return {
        success: false,
        error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`,
      }
    }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return {
      success: false,
      error: "Failed to verify OTP",
    }
  }
}

// Development helper - get OTP for testing
export const getStoredOTP = (phoneNumber) => {
  if (DEVELOPMENT_MODE) {
    const storedData = otpStorage.get(phoneNumber)
    return storedData?.otp || null
  }
  return null
}
