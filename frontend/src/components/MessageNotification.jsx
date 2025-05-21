// components/notifications/MessageNotification.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModalStore } from "../store/useModalStore";
import { useChatStore } from "../store/useChatStore";
import { MessageSquare, Reply } from "lucide-react";
import NotificationItem from "./NotificationItem";

const MessageNotification = ({ notification }) => {
  const navigate = useNavigate();
  const { getMessages, setSelectedUser } = useChatStore();
  const { openMessageModal } = useModalStore();
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  
  // Handle click to go to chat
  const handleGoToChat = async (e) => {
    e.stopPropagation();
    
    try {
      // Set the selected user to the sender
      await setSelectedUser({
        _id: notification.sender._id,
        username: notification.sender.username,
        profilePic: notification.sender.profilePic,
      });
      
      // Get messages for this user
      await getMessages(notification.sender._id);
      
      // Navigate to the chat page
      navigate("/");
    } catch (error) {
      console.error("Error navigating to chat:", error);
    }
  };
  
  // Open quick reply modal
  const handleQuickReply = (e) => {
    e.stopPropagation();
    
    // If you have a modal for quick replies
    openMessageModal({
      recipientId: notification.sender._id,
      recipientName: notification.sender.username,
      messagePreview: notification.metadata?.messagePreview,
    });
  };
  
  return (
    <NotificationItem notification={notification}>
      {notification.metadata?.messagePreview && (
        <div className="mt-1 text-xs italic text-base-content/70 bg-base-300/30 p-1.5 rounded-md">
          "{notification.metadata.messagePreview}
          {notification.metadata.messagePreview.length >= 50 ? "..." : ""}
          {notification.metadata.hasImage && " 📷"}
        </div>
      )}
      
      <div className="flex gap-2 mt-2">
        <button 
          className="btn btn-sm btn-primary flex-1"
          onClick={handleGoToChat}
        >
          <MessageSquare className="size-4" />
          Open Chat
        </button>
        <button 
          className="btn btn-sm btn-outline flex-1"
          onClick={handleQuickReply}
        >
          <Reply className="size-4" />
          Quick Reply
        </button>
      </div>
    </NotificationItem>
  );
};

export default MessageNotification;
