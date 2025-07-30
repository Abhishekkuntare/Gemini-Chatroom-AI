"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { addChatroom, deleteChatroom, setCurrentChatroom, setSearchQuery } from "@/store/slices/chatSlice"
import { logout, updateUserName } from "@/store/slices/authSlice"
import { toggleSidebar } from "@/store/slices/uiSlice"
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Settings,
  Edit2,
  User,
  MoreHorizontal,
} from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChatroomManager } from "./chatroom-manager"
import EditChatroomDialog from "./edit-chatroom-dialog"

export default function Sidebar() {
  const [searchInput, setSearchInput] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [editingChatroom, setEditingChatroom] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [isManaging, setIsManaging] = useState(false)

  const { chatrooms, currentChatroom, searchQuery } = useSelector((state) => state.chat)
  const { user } = useSelector((state) => state.auth)
  const { sidebarOpen } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Initialize user name when dialog opens
  useEffect(() => {
    if (isEditingUser) {
      setNewUserName(user?.name || "")
    }
  }, [isEditingUser, user?.name])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(searchInput))
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, dispatch])

  // Filter chatrooms based on search query
  const filteredChatrooms = useMemo(() => {
    if (!searchQuery) return chatrooms
    return chatrooms.filter((room) => room.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [chatrooms, searchQuery])

  const createChatroom = () => {
    const newChatroom = {
      id: Date.now(),
      title: `New Chat ${chatrooms.length + 1}`,
      createdAt: new Date().toISOString(),
      lastMessage: null,
    }

    dispatch(addChatroom(newChatroom))
    dispatch(setCurrentChatroom(newChatroom))

    toast({
      title: "Chatroom Created",
      description: `${newChatroom.title} has been created`,
    })
  }

  const handleDeleteChatroom = (id) => {
    const chatroom = chatrooms.find((room) => room.id === id)
    dispatch(deleteChatroom(id))

    toast({
      title: "Chatroom Deleted",
      description: `${chatroom?.title} has been deleted`,
    })
  }

  const handleEditChatroom = (chatroom) => {
    setEditingChatroom(chatroom)
    setIsEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingChatroom(null)
  }

  const handleUpdateUserName = () => {
    if (!newUserName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    const updatedUser = { ...user, name: newUserName.trim() }
    dispatch(updateUserName(newUserName.trim()))
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setIsEditingUser(false)

    toast({
      title: "Name Updated",
      description: `Your name has been updated to "${newUserName.trim()}"`,
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem("user")
    localStorage.removeItem("chatrooms")
    localStorage.removeItem("messages")

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
  }

  const handleUserNameKeyPress = (e) => {
    if (e.key === "Enter") {
      handleUpdateUserName()
    }
  }

  if (!sidebarOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => dispatch(toggleSidebar())} />

      <div className="w-80 bg-card border-r flex flex-col fixed md:relative h-full z-50">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Gemini Chat</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsManaging(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Manage Chatrooms
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(toggleSidebar())}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chatrooms..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ChatroomManager isManaging={isManaging} setIsManaging={setIsManaging} />

        {/* New Chat Button */}
        <div className="p-4">
          <Button onClick={createChatroom} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chatrooms List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChatrooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No chatrooms found" : "No chatrooms yet"}
              </div>
            ) : (
              filteredChatrooms.map((room) => (
                <div
                  key={room.id}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-all duration-200 ${
                    currentChatroom?.id === room.id ? "bg-accent" : ""
                  }`}
                  onClick={() => dispatch(setCurrentChatroom(room))}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate group-hover:text-foreground transition-colors">{room.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{room.lastMessage || "No messages yet"}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditChatroom(room)
                      }}
                      title="Edit chatroom name"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(room.id)
                          }}
                          title="Delete chatroom"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chatroom</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "<strong>{room.title}</strong>"?
                            <br />
                            This will permanently delete all messages in this chatroom. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteChatroom(room.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user?.phone}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <User className="mr-2 h-4 w-4" />
                    Edit Name
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Your Name</DialogTitle>
                    <DialogDescription>Update your display name for the chat.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        onKeyDown={handleUserNameKeyPress}
                        className="col-span-3"
                        placeholder="Enter your name"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditingUser(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateUserName}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Chatroom Dialog */}
      <EditChatroomDialog chatroom={editingChatroom} isOpen={isEditDialogOpen} onClose={handleCloseEditDialog} />
    </>
  )
}
