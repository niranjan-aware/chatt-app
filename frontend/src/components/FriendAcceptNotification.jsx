// components/notifications/FriendAcceptNotification.jsx
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { MessageSquare, UserCheck } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { useNotificationStore } from "../store/useNotificationStore"

const FriendAcceptNotification = ({ notification }) => {
  const navigate = useNavigate();
  const { setSelectedUser, getMessages } = useChatStore();
  const { markAsRead, deleteNotification } = useNotificationStore();
  
  // Navigate to chat with the new friend
  const handleMessage = async (e) => {
    e.stopPropagation();
    
    try {
      // Set selected user to the person who accepted your request
      await setSelectedUser({
        _id: notification.sender._id,
        username: notification.sender.username,
        profilePic: notification.sender.profilePic,
      });
      
      // Get messages for this user
      await getMessages(notification.sender._id);
      
      // Navigate to chat page
      navigate("/");
      if (!notification.isRead) {
      markAsRead([notification._id]);
    }
      
    } catch (error) {
      console.error("Error navigating to chat:", error);
    }
  };
  
  // Navigate to profile page
  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/profile/${notification.sender._id}`);
  };
  
  return (
    <NotificationItem notification={notification}>
      <div className="flex gap-2 mt-2">
        <button 
          className="btn btn-sm btn-primary flex-1"
          onClick={handleMessage}
        >
          <MessageSquare className="size-4" />
          Message
        </button>
        <button 
          className="btn btn-sm btn-outline flex-1"
          onClick={handleViewProfile}
        >
          <UserCheck className="size-4" />
          View Profile
        </button>
      </div>
    </NotificationItem>
  );
};

export default FriendAcceptNotification;