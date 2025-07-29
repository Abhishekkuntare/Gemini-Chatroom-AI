"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateChatroomTitle } from "@/store/slices/chatSlice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit2, MessageSquare } from "lucide-react"

export default function EditChatroomDialog({ chatroom, isOpen, onClose }) {
  const [newTitle, setNewTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const { toast } = useToast()

  // Initialize title when dialog opens
  useEffect(() => {
    if (isOpen && chatroom) {
      setNewTitle(chatroom.title)
    }
  }, [isOpen, chatroom])

  const handleSave = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Invalid Name",
        description: "Chatroom name cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (newTitle.trim() === chatroom.title) {
      onClose()
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      dispatch(updateChatroomTitle({ id: chatroom.id, title: newTitle.trim() }))

      toast({
        title: "Chatroom Updated",
        description: `Chatroom renamed to "${newTitle.trim()}"`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chatroom name",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSave()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setNewTitle("")
      onClose()
    }
  }

  if (!chatroom) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Chatroom
              </DialogTitle>
              <DialogDescription>Update the name of your chatroom</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chatroom-name" className="text-sm font-medium">
              Chatroom Name
            </Label>
            <Input
              id="chatroom-name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter chatroom name"
              className="w-full"
              autoFocus
              disabled={isLoading}
              maxLength={50}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Choose a descriptive name for your chatroom</span>
              <span>{newTitle.length}/50</span>
            </div>
          </div>

          {/* Current vs New Preview */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Preview:</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">{newTitle || "Untitled Chatroom"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !newTitle.trim()}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
