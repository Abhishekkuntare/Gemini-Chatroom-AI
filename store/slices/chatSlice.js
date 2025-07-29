import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  chatrooms: [],
  currentChatroom: null,
  messages: {},
  isTyping: false,
  searchQuery: "",
  loading: false,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatrooms: (state, action) => {
      state.chatrooms = action.payload
    },
    addChatroom: (state, action) => {
      state.chatrooms.unshift(action.payload)
    },
    deleteChatroom: (state, action) => {
      state.chatrooms = state.chatrooms.filter((room) => room.id !== action.payload)
      if (state.currentChatroom?.id === action.payload) {
        state.currentChatroom = null
      }
      delete state.messages[action.payload]
    },
    updateChatroomTitle: (state, action) => {
      const { id, title } = action.payload
      const chatroom = state.chatrooms.find((room) => room.id === id)
      if (chatroom) {
        chatroom.title = title
      }
      // Update current chatroom if it's the one being edited
      if (state.currentChatroom?.id === id) {
        state.currentChatroom.title = title
      }
    },
    setCurrentChatroom: (state, action) => {
      state.currentChatroom = action.payload
    },
    addMessage: (state, action) => {
      const { chatroomId, message, replace = false } = action.payload
      if (!state.messages[chatroomId]) {
        state.messages[chatroomId] = []
      }

      if (replace) {
        state.messages[chatroomId] = Array.isArray(message) ? message : [message]
      } else {
        if (Array.isArray(message)) {
          state.messages[chatroomId].unshift(...message)
        } else {
          state.messages[chatroomId].push(message)
        }
      }

      // Update last message in chatroom
      const chatroom = state.chatrooms.find((room) => room.id === chatroomId)
      if (chatroom && !Array.isArray(message)) {
        chatroom.lastMessage = message.text.length > 50 ? message.text.substring(0, 50) + "..." : message.text
        chatroom.lastMessageTime = message.timestamp
      }
    },
    setMessages: (state, action) => {
      const { chatroomId, messages } = action.payload
      state.messages[chatroomId] = messages
    },
    setIsTyping: (state, action) => {
      state.isTyping = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const {
  setChatrooms,
  addChatroom,
  deleteChatroom,
  updateChatroomTitle,
  setCurrentChatroom,
  addMessage,
  setMessages,
  setIsTyping,
  setSearchQuery,
  setLoading,
} = chatSlice.actions

export default chatSlice.reducer
