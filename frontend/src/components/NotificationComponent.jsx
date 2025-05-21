import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';

const NotificationComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    addNotification 
  } = useNotificationStore();
  const { socket } = useAuthStore();

  useEffect(() => {
    if (socket) {
      // Listen for new notifications
      socket.on('notification', (notification) => {
        console.log('New notification received:', notification);
        addNotification(notification);
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, addNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Mark notifications as read when opening dropdown
    if (!isOpen && unreadCount > 0) {
      const unreadIds = notifications
        .filter(notif => !notif.isRead)
        .map(notif => notif._id);
      
      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
        
        // Emit socket event to update read status
        if (socket) {
          socket.emit('mark-notifications-read', unreadIds);
        }
      }
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'message-circle';
      case 'friend_request':
        return 'user-plus';
      case 'friend_accept':
        return 'user-check';
      default:
        return 'bell';
    }
  };

  return (
    <div className="relative">
      <button 
        className="btn btn-ghost btn-circle relative" 
        onClick={handleToggleDropdown}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 shadow-lg rounded-lg py-2 z-50 border border-base-300">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-base-300">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="text-xs text-blue-500 hover:underline"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`px-4 py-2 hover:bg-base-200 flex items-start cursor-pointer ${
                    !notification.isRead ? 'bg-base-200/50' : ''
                  }`}
                >
                  {notification.sender?.profilePic ? (
                    <img 
                      src={notification.sender.profilePic} 
                      alt=""
                      className="w-10 h-10 rounded-full mr-3" 
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-blue-500 text-white`}>
                      <span className="text-lg">{notification.sender?.username?.charAt(0) || '?'}</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-sm">{notification.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <button 
                    className="text-gray-500 hover:text-red-500 ml-2"
                    onClick={(e) => handleDelete(notification._id, e)}
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;