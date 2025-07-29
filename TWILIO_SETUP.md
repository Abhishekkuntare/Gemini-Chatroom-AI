# Twilio SMS OTP Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Twilio Account
1. Go to [twilio.com](https://twilio.com)
2. Sign up for free account (gets $15 credit)
3. Verify your email and phone number

### Step 2: Get Your Credentials
1. Go to [Twilio Console](https://console.twilio.com)
2. Copy your **Account SID** and **Auth Token**
3. Go to Phone Numbers → Manage → Buy a number
4. Buy a phone number (costs ~$1/month)

### Step 3: Add to Environment Variables
\`\`\`env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

NEXT_PUBLIC_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+1234567890
\`\`\`

### Step 4: Test It!
1. Run your app: `npm run dev`
2. Enter your real phone number
3. You'll receive actual SMS with OTP
4. Enter the code to login

## 💰 Pricing
- **SMS**: ~$0.0075 per message (very cheap!)
- **Phone Number**: ~$1/month
- **Free Trial**: $15 credit (enough for 2000+ SMS)

## 🔧 Features
- ✅ Real SMS delivery worldwide
- ✅ 5-minute OTP expiry
- ✅ 3 attempt limit
- ✅ 60-second resend cooldown
- ✅ Professional SMS format
- ✅ Error handling for invalid numbers

## 🌍 International Support
Works with phone numbers from any country. Just select the country code in the app.

## 🔒 Security
- OTP expires automatically
- Rate limiting prevents spam
- Secure server-side validation
- No OTP stored in client

## 📱 SMS Format
"Your Gemini Chat verification code is: 123456. This code will expire in 5 minutes. Do not share this code with anyone."

Ready to receive real SMS codes on your phone! 🎉
