"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { loginSuccess } from "@/store/slices/authSlice"
import { setChatrooms, setMessages } from "@/store/slices/chatSlice"
import AuthPage from "@/components/auth/auth-page"
import Dashboard from "@/components/dashboard/dashboard"

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem("user")
    const storedChatrooms = localStorage.getItem("chatrooms")
    const storedMessages = localStorage.getItem("messages")

    if (storedUser) {
      dispatch(loginSuccess(JSON.parse(storedUser)))
    }

    if (storedChatrooms) {
      dispatch(setChatrooms(JSON.parse(storedChatrooms)))
    }

    if (storedMessages) {
      const messages = JSON.parse(storedMessages)
      Object.keys(messages).forEach((chatroomId) => {
        dispatch(setMessages({ chatroomId, messages: messages[chatroomId] }))
      })
    }
  }, [dispatch])

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return <Dashboard />
}
