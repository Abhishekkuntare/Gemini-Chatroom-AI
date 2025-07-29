# Gemini Chat App - Complete Setup

⚠️ Important Note (Please Read First)

🔐 I'm using  the free version of Twilio, which only supports a single verified phone number for OTP authentication.
📞 To test the OTP feature, please use this phone number: +91 9156075536

✅ After initiating the OTP, please call or message me on this number. I will share the OTP code I receive so you can verify the project works correctly.

⚠️ And Please your own Gemini api key because my quota is end please consider this 


## 🚀 Features

- **Real SMS OTP**: Twilio SMS authentication
- **Gemini AI Chat**: Google Gemini AI integration
- **Image Analysis**: Upload and analyze images with AI
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Mode**: Theme switching
- **Real-time Chat**: Interactive chat interface

## 🔧 Setup Instructions

### 1. Twilio SMS Setup
1. Create account at [twilio.com](https://twilio.com)
2. Get your credentials from Twilio Console
3. Buy a phone number (~$1/month)

### 2. Gemini AI Setup
✅ **Already Configured**: Using API key `AIzaSyAz2rd98oOvpz4ewNRjSBMQ8BCrahnaa6U`

### 3. Environment Variables
Add to `.env.local`:
\`\`\`env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Gemini AI (Already Set)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAz2rd98oOvpz4ewNRjSBMQ8BCrahnaa6U
\`\`\`

### 4. Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## 📱 How to Use

1. **Enter Phone Number**: Select country and enter your number
2. **Receive SMS**: Get 6-digit code via Twilio SMS
3. **Verify Code**: Enter the code to login
4. **Start Chatting**: Chat with Gemini AI
5. **Upload Images**: Analyze images with AI
6. **Create Chats**: Multiple chat rooms

## 🔒 Security Features

- **SMS OTP**: Real phone verification
- **5-minute expiry**: OTP expires automatically
- **3 attempt limit**: Prevents brute force
- **Rate limiting**: 60-second resend cooldown

## 💰 Costs

- **Twilio SMS**: ~$0.0075 per message
- **Twilio Number**: ~$1/month
- **Gemini AI**: Free tier available
- **Total**: Very affordable for personal use

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, Redux
- **Styling**: Tailwind CSS, shadcn/ui
- **SMS**: Twilio REST API
- **AI**: Google Gemini AI
- **Authentication**: Phone OTP

## ✅ Ready to Use

The app is fully configured with:
- ✅ Gemini AI API key set
- ✅ SMS OTP integration
- ✅ Image analysis
- ✅ Responsive design
- ✅ Error handling

Just add your Twilio credentials and start chatting with AI! 🎉
