"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Sidebar from "./sidebar"
import ChatInterface from "./chat-interface"
import { setSidebarOpen } from "@/store/slices/uiSlice"

export default function Dashboard() {
  const { sidebarOpen } = useSelector((state) => state.ui)
  const { currentChatroom } = useSelector((state) => state.chat)
  const dispatch = useDispatch()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        dispatch(setSidebarOpen(false))
      } else {
        dispatch(setSidebarOpen(true))
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [dispatch])

  // Save data to localStorage whenever it changes
  const { chatrooms, messages } = useSelector((state) => state.chat)

  useEffect(() => {
    localStorage.setItem("chatrooms", JSON.stringify(chatrooms))
  }, [chatrooms])

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages))
  }, [messages])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {currentChatroom ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">G</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Gemini</h2>
              <p className="text-muted-foreground">Select a chatroom to start conversing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
