# Gemini Chat App - Complete Setup 🚀

> **⚠️ Important Note – Please Read First**  
> 🔐 I'm using the **free version of Twilio**, which only supports a single verified phone number for OTP authentication.  
> 📞 **To test the OTP feature, please use this number: `+91 9156075536`**  
> ✅ After initiating the OTP, **call or message me** on the same number. I will share the OTP code I receive so you can verify the project.  
> ⚠️ **Please use your own Gemini API key** — mine has reached its free quota.  

---

# Gemini Chat App – Frontend Assignment (Kuvaka Tech)

A responsive, interactive, and full-featured Gemini-style conversational AI frontend built using **React**, **Next.js 15 (App Router)**, **Redux**, and **Tailwind CSS**.  
This project fulfills the assignment requirements including OTP auth, chatroom management, AI replies, image analysis, and modern UX features.

🔗 **Live Demo**: [https://gemini-chatroom-ai.vercel.app](https://gemini-chatroom-ai.vercel.app)

---

## ✨ Core Features

### ✅ Authentication
- OTP-based Login/Signup (simulated via `setTimeout`)
- Real Twilio SMS support for a verified phone number
- Country code dropdown using `restcountries.com`
- Form validation with **React Hook Form** + **Zod**

### 💬 Chatroom Interface
- Create/Delete chatrooms
- Real-time style messaging UI
- Simulated Gemini AI replies with:
  - Typing indicator: `"Gemini is typing..."`
  - Response throttling (delay using `setTimeout`)
- Infinite scroll (reverse direction)
- Pagination (20 messages per page)
- Timestamps and user distinction
- Upload & preview image messages (Base64/URL)
- Copy-to-clipboard on message hover
- Auto-scroll to latest message

### 🌐 Global UX
- Fully mobile responsive
- Dark/Light mode toggle
- Debounced search bar to filter chatrooms
- Toast notifications for actions (e.g., OTP sent, chatroom deleted)
- Loading skeletons for better UX
- Keyboard accessibility
- LocalStorage persistence (auth, chat state)

---

## 📁 Folder Structure

├── app/
│ ├── login/ # OTP login UI and logic
│ ├── dashboard/ # Chatroom management
│ ├── chatroom/[id]/ # Chat UI per room
│ ├── components/ # Shared reusable components
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utils like throttle, debounce
│ ├── store/ # Redux slices and configuration
│ └── styles/ # Tailwind CSS styling
├── public/ # Static assets
├── .env.local # Environment variables (not pushed)
├── tailwind.config.js # Tailwind setup
├── next.config.js # Next.js config
└── README.md # Documentation


---

## 🔧 Technical Details

### 🔐 Authentication
- Simulated OTP flow using `setTimeout`
- Form validation via **React Hook Form + Zod**
- Country codes fetched from `https://restcountries.com/v3.1/all`

### 💬 Chat
- Fake AI replies using `setTimeout` and lodash `throttle`
- Message pagination (client-side: 20 per page)
- Reverse infinite scroll with Intersection Observer
- Auto scroll on new message
- Image preview with `URL.createObjectURL()` or base64
- Clipboard copy via `navigator.clipboard`

### 🛠 UX Enhancements
- Dark/light mode toggle with localStorage sync
- Debounced search with `useDebounce`
- Skeleton loaders with conditional rendering
- Toast alerts using `shadcn/ui`
- Keyboard-friendly input handling

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Abhishekkuntare/Gemini-Chatroom-AI.git
cd Gemini-Chatroom-AI

2. Install Dependencies
npm install

3. Add Environment Variables
Create a .env.local file in root:

# Twilio Config (Real SMS OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

⚠️ Twilio free tier supports only 1 verified number. Use +91 9156075536 for testing and ping me for the OTP.
⚠️ Replace NEXT_PUBLIC_GEMINI_API_KEY with your own Gemini API key since my quota is exhausted

4. Run the App Locally
npm run dev

📱 How to Use
Select your country and enter your phone number.

Receive OTP (real SMS if number is +91 9156075536; otherwise simulated).

Enter OTP to login.

Create or join chatrooms.

Start chatting with Gemini AI.

Upload images, copy messages, and more.

🔐 Security Features
OTP expires in 5 minutes

Only 3 attempts allowed

60-second cooldown between resend attempts

Secrets stored in .env.local (never committed)

💰 Estimated Costs (Real Integration)
Service	Cost
Twilio SMS	~$0.0075 per message
Twilio Number	~$1/month
Gemini API	Free tier available
Total	✅ Affordable for testing

🛠️ Tech Stack
Feature	Library / Tool
Framework	Next.js 15 (App Router)
State Management	Redux Toolkit
Styling	Tailwind CSS, shadcn/ui
Form Handling	React Hook Form + Zod
OTP/Auth	Twilio API + simulation
AI Simulation	setTimeout + throttling
Image Handling	Base64 + File preview

✅ Project Status
All required features for Kuvaka Tech Frontend Assignment are implemented:

🔐 OTP Auth (Real + Simulated)

💬 Chat with simulated AI + UX polish

📁 Clean folder structure

📷 Image support

🌙 Dark mode, skeletons, responsive

🚀 Deployed & tested

📞 Contact for Testing OTP
To test OTP functionality, please use the number +91 9156075536 and contact me after triggering it. I’ll share the OTP received so you can verify functionality.

 2025 | Abhishek Kuntare