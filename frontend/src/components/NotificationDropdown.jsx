// components/notifications/NotificationDropdown.jsx
import { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import NotificationItem from "./NotificationItem";
import FriendRequestNotification from "./FriendRequestNotification";
import MessageNotification from "./MessageNotification";
import FriendAcceptNotification from "./FriendAcceptNotification";
import { Trash, CheckCheck, Bell } from "lucide-react";

const NotificationDropdown = () => {
  const { 
    notifications, 
    isLoading, 
    getNotifications,
    markAllAsRead,
    unreadCount
  } = useNotificationStore();
  
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const handleMarkAllAsRead = async(e) => {
    e.preventDefault()
    markAllAsRead();
    notifications = [];
  }

  const renderNotification = (notification) => {
    switch (notification.type) {
      case "friend_request":
        return <FriendRequestNotification notification={notification} />;
      case "message":
        return <MessageNotification notification={notification} />;
      case "friend_accept":
        return <FriendAcceptNotification notification={notification} />;
      default:
        return <NotificationItem notification={notification} />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-3 border-b border-base-300 flex justify-between items-center bg-base-200">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button 
              className="btn btn-sm btn-ghost tooltip tooltip-left" 
              data-tip="Mark all as read"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="size-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 max-h-[60vh]">
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <span className="loading loading-spinner"></span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-base-content/70">
            <div className="rounded-full bg-base-200 p-3 mb-3">
              <Bell className="size-6" />
            </div>
            <p>You have no notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-base-200">
            {notifications.filter((n) => !n.isRead).map((notification) => (
              <div key={notification._id}>
                {renderNotification(notification)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;