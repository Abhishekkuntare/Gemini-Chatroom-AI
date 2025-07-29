"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { deleteChatroom } from "@/store/slices/chatSlice"
import { Trash2, ReplaceAllIcon as SelectAll, X } from "lucide-react"
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

export default function ChatroomManager({ isManaging, setIsManaging }) {
  const [selectedChatrooms, setSelectedChatrooms] = useState(new Set())
  const { chatrooms } = useSelector((state) => state.chat)
  const dispatch = useDispatch()
  const { toast } = useToast()

  const handleSelectChatroom = (chatroomId, checked) => {
    const newSelected = new Set(selectedChatrooms)
    if (checked) {
      newSelected.add(chatroomId)
    } else {
      newSelected.delete(chatroomId)
    }
    setSelectedChatrooms(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedChatrooms.size === chatrooms.length) {
      setSelectedChatrooms(new Set())
    } else {
      setSelectedChatrooms(new Set(chatrooms.map((room) => room.id)))
    }
  }

  const handleBulkDelete = () => {
    selectedChatrooms.forEach((chatroomId) => {
      dispatch(deleteChatroom(chatroomId))
    })

    toast({
      title: "Chatrooms Deleted",
      description: `${selectedChatrooms.size} chatroom(s) have been deleted`,
    })

    setSelectedChatrooms(new Set())
    setIsManaging(false)
  }

  const exitManageMode = () => {
    setSelectedChatrooms(new Set())
    setIsManaging(false)
  }

  if (!isManaging) return null

  return (
    <div className="p-4 border-b bg-muted/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            <SelectAll className="h-4 w-4 mr-1" />
            {selectedChatrooms.size === chatrooms.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-muted-foreground">{selectedChatrooms.size} selected</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedChatrooms.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedChatrooms.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Multiple Chatrooms</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedChatrooms.size} chatroom(s)? This will permanently delete
                    all messages in these chatrooms. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All Selected
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button variant="ghost" size="sm" onClick={exitManageMode}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">Select chatrooms to delete multiple at once</div>
    </div>
  )
}

export { ChatroomManager }
