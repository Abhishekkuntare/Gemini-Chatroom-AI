"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { addMessage, setIsTyping } from "@/store/slices/chatSlice"
import { toggleSidebar } from "@/store/slices/uiSlice"
import { Send, ImageIcon, Copy, Menu, Paperclip, Loader2, AlertCircle } from "lucide-react"
import MessageSkeleton from "./message-skeleton"
import { Textarea } from "@/components/ui/textarea"
import { generateResponse, testGeminiConnection } from "@/lib/gemini"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ChatInterface() {
  const [message, setMessage] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiError, setApiError] = useState("")

  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const fileInputRef = useRef(null)

  const { currentChatroom, messages, isTyping } = useSelector((state) => state.chat)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const { toast } = useToast()

  const currentMessages = messages[currentChatroom?.id] || []

  // Test Gemini API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const result = await testGeminiConnection()
      if (!result.success) {
        setApiError(`Gemini API Error: ${result.error}`)
        toast({
          title: "API Connection Failed",
          description: "There's an issue with the Gemini API connection",
          variant: "destructive",
        })
      } else {
        console.log("✅ Gemini API connected successfully")
        setApiError("")
      }
    }

    testConnection()
  }, [toast])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, isTyping])

  // Load more messages on scroll to top
  const handleScroll = (e) => {
    const { scrollTop } = e.target
    if (scrollTop === 0 && hasMore && !loadingMore) {
      loadMoreMessages()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMoreMessages = () => {
    if (!hasMore || loadingMore) return

    setLoadingMore(true)

    // Simulate loading older messages with realistic data
    setTimeout(() => {
      const olderMessages = Array.from({ length: 20 }, (_, i) => {
        const isUser = i % 3 !== 0 // More varied conversation
        const messageId = Date.now() - (page * 20 + i)

        const userMessages = [
          "Hello, how are you?",
          "Can you help me with something?",
          "What's the weather like today?",
          "Tell me a joke",
          "How does AI work?",
          "What's your favorite color?",
          "Can you write code?",
          "Explain quantum physics",
          "What's for dinner?",
          "How do I learn programming?",
        ]

        const aiMessages = [
          "Hello! I'm doing well, thank you for asking. How can I assist you today?",
          "Of course! I'd be happy to help you. What do you need assistance with?",
          "I don't have access to real-time weather data, but I can help you find weather information.",
          "Why don't scientists trust atoms? Because they make up everything!",
          "AI works through machine learning algorithms that process data to make predictions and decisions.",
          "I don't have personal preferences, but I find the concept of color fascinating!",
          "Yes, I can help with coding in many programming languages. What would you like to know?",
          "Quantum physics is the study of matter and energy at the smallest scales...",
          "I can't see what's available, but I can suggest some recipe ideas if you'd like!",
          "Start with the basics: choose a language, practice regularly, and build projects!",
        ]

        return {
          id: messageId,
          text: isUser
            ? userMessages[Math.floor(Math.random() * userMessages.length)]
            : aiMessages[Math.floor(Math.random() * aiMessages.length)],
          sender: isUser ? "user" : "ai",
          timestamp: new Date(Date.now() - (page * 20 + i) * 60000).toISOString(),
        }
      })

      // Add messages to the beginning of the array
      const currentChatroomMessages = messages[currentChatroom.id] || []
      const updatedMessages = [...olderMessages, ...currentChatroomMessages]

      dispatch(
        addMessage({
          chatroomId: currentChatroom.id,
          message: updatedMessages,
          replace: true,
        }),
      )

      setPage((prev) => prev + 1)
      setLoadingMore(false)

      // Stop loading more after 5 pages (100 messages)
      if (page >= 5) {
        setHasMore(false)
      }
    }, 1000)
  }

  const sendMessage = async () => {
    if (!message.trim() || isGenerating) return

    // Clear any previous API errors
    setApiError("")

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    dispatch(
      addMessage({
        chatroomId: currentChatroom.id,
        message: userMessage,
      }),
    )

    const currentMessageText = message
    setMessage("")
    setIsGenerating(true)

    // Show typing indicator
    dispatch(setIsTyping(true))

    try {
      // Add realistic delay before API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get response from Gemini API with the specified API key
      const response = await generateResponse(currentMessageText)

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      dispatch(setIsTyping(false))
      dispatch(
        addMessage({
          chatroomId: currentChatroom.id,
          message: aiMessage,
        }),
      )

      toast({
        title: "Message sent",
        description: "Gemini AI has responded to your message",
      })
    } catch (error) {
      dispatch(setIsTyping(false))
      setApiError(error.message)

      // Fallback response if API fails
      const fallbackMessage = {
        id: Date.now() + 1,
        text: `I apologize, but I'm having trouble connecting to Gemini AI right now. Error: ${error.message}`,
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      dispatch(
        addMessage({
          chatroomId: currentChatroom.id,
          message: fallbackMessage,
        }),
      )

      toast({
        title: "Gemini AI Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target.result

      const imageMessage = {
        id: Date.now(),
        text: "Shared an image",
        image: imageData,
        sender: "user",
        timestamp: new Date().toISOString(),
      }

      dispatch(
        addMessage({
          chatroomId: currentChatroom.id,
          message: imageMessage,
        }),
      )

      // Auto-analyze the image with Gemini
      if (message.trim() || !message.trim()) {
        const analysisPrompt = message.trim() || "What do you see in this image?"
        setMessage("")
        setIsGenerating(true)
        dispatch(setIsTyping(true))
        setApiError("")

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500))

          const response = await generateResponse(analysisPrompt, imageData)

          const aiMessage = {
            id: Date.now() + 1,
            text: response,
            sender: "ai",
            timestamp: new Date().toISOString(),
          }

          dispatch(setIsTyping(false))
          dispatch(
            addMessage({
              chatroomId: currentChatroom.id,
              message: aiMessage,
            }),
          )

          toast({
            title: "Image analyzed",
            description: "Gemini AI has analyzed your image",
          })
        } catch (error) {
          dispatch(setIsTyping(false))
          setApiError(error.message)

          const fallbackMessage = {
            id: Date.now() + 1,
            text: `I can see you've shared an image, but I'm having trouble analyzing it right now. Error: ${error.message}`,
            sender: "ai",
            timestamp: new Date().toISOString(),
          }

          dispatch(
            addMessage({
              chatroomId: currentChatroom.id,
              message: fallbackMessage,
            }),
          )

          toast({
            title: "Image Analysis Error",
            description: error.message,
            variant: "destructive",
          })
        } finally {
          setIsGenerating(false)
        }
      }

      toast({
        title: "Image uploaded",
        description: "Your image has been shared",
      })
    }
    reader.readAsDataURL(file)
  }

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(toggleSidebar())}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">G</span>
        </div>

        <div className="flex-1">
          <h2 className="font-semibold">{currentChatroom?.title}</h2>
          <p className="text-sm text-muted-foreground">
            {isTyping ? "Gemini is typing..." : isGenerating ? "Thinking..." : "Online"}
          </p>
        </div>

        {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
      </div>

      {/* API Error Alert */}
      {apiError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Gemini API Issue:</strong> {apiError}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} onScrollCapture={handleScroll}>
        {loadingMore && (
          <div className="flex justify-center mb-4">
            <MessageSkeleton />
          </div>
        )}

        <div className="space-y-4">
          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 group ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "ai" && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    G
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[70%] rounded-lg p-3 relative ${
                  msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image || "/placeholder.svg"}
                    alt="Shared image"
                    className="max-w-full h-auto rounded-lg mb-2 cursor-pointer"
                    onClick={() => window.open(msg.image, "_blank")}
                  />
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyMessage(msg.text)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {msg.sender === "user" && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">G</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20 min-h-[44px] max-h-32 resize-none"
              rows={1}
              disabled={isGenerating}
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isGenerating}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={sendMessage} disabled={!message.trim() || isTyping || isGenerating} size="icon">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
