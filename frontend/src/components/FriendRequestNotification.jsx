// components/notifications/FriendRequestNotification.jsx
import { useNotificationStore } from "../store/useNotificationStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import NotificationItem from "./NotificationItem";
import { useState } from "react";

const FriendRequestNotification = ({ notification }) => {
  const { acceptFriendRequest, declineFriendRequest } = useNotificationStore();
  const { setSelectedUser } = useChatStore();
  const { getUsers } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      // Accept the friend request
      const newFriend = await acceptFriendRequest(notification._id);
      
      // Refresh the friends list in chat store
      await getUsers();
      
      // Switch to the new friend's chat
      if (newFriend) {
        setSelectedUser(newFriend);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = (e) => {
    e.stopPropagation();
    declineFriendRequest(notification._id);
  };

  return (
    <NotificationItem notification={notification}>
      <div className="flex gap-2 mt-2">
        <button 
          className="btn btn-sm btn-primary flex-1"
          onClick={handleAccept}
          disabled={isLoading}
        >
          {isLoading ? <span className="loading loading-spinner loading-xs"></span> : "Accept"}
        </button>
        <button 
          className="btn btn-sm btn-outline flex-1"
          onClick={handleDecline}
          disabled={isLoading}
        >
          Decline
        </button>
      </div>
    </NotificationItem>
  );
};

export default FriendRequestNotification;