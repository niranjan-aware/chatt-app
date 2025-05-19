import { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useSocketStore } from "../store/useSocketStore"; // Assuming you have this

// Add this to your socket event listeners
export const useNotificationSocket = () => {
  const { socket } = useSocketStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (socket) {
      socket.on("notification", (notification) => {
        addNotification(notification);
      });

      // Fetch unread count when socket connects
      fetchUnreadCount();

      return () => {
        socket.off("notification");
      };
    }
  }, [socket, addNotification, fetchUnreadCount]);
};
