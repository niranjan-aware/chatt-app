// components/notifications/NotificationBadge.jsx
import { Bell } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";

const NotificationBadge = ({ onClick }) => {
  const { unreadCount } = useNotificationStore();
  
  return (
    <button 
      className="btn btn-sm btn-circle relative"
      onClick={onClick}
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-error text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">
          {unreadCount > 10 ? "10+" : unreadCount}
        </div>
      )}
    </button>
  );
};

export default NotificationBadge;
