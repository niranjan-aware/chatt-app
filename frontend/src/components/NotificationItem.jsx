// components/notifications/NotificationItem.jsx
import { formatDistanceToNow } from "date-fns";
import { useNotificationStore } from "../store/useNotificationStore";
import { Trash } from "lucide-react";

const NotificationItem = ({ notification, children }) => {
  const { markAsRead, deleteNotification } = useNotificationStore();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
      deleteNotification(notification._id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNotification(notification._id);
  };

  return (
    <div 
      className={`p-3 flex items-start gap-3 hover:bg-base-200 transition-colors cursor-pointer relative group ${!notification.isRead ? "bg-base-200/30" : ""}`}
      onClick={handleClick}
    >
      <div className="avatar">
        <div className="w-10 h-10 rounded-full border">
          <img 
            src={notification.sender?.profilePic || "/avatar.png"} 
            alt={notification.sender?.username || "User"} 
          />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-medium">
            {notification.sender?.username || "User"}
          </p>
          <span className="text-xs text-base-content/70">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <p className="text-sm text-base-content/80 break-words line-clamp-2">
          {notification.content}
        </p>
        
        {children}
        
        {!notification.isRead && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"></div>
        )}
      </div>
      
      <button 
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 btn btn-ghost btn-xs"
        onClick={handleDelete}
      >
        <Trash className="size-4" />
      </button>
    </div>
  );
};

export default NotificationItem;