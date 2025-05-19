import { create } from "zustand";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Fetch all notifications
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        set({ notifications: data });
        // Calculate unread count
        const unreadCount = data.filter(notif => !notif.isRead).length;
        set({ unreadCount });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      set({ isLoading: false });
    }
  },

  // Get unread count
  fetchUnreadCount: async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        set({ unreadCount: data.count });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  // Add new notification (from socket)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
    // Show toast notification
    toast.success(notification.content, {
      duration: 4000,
      icon: "🔔",
    });
  },

  // Mark specific notifications as read
  markAsRead: async (notificationIds) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notificationIds }),
      });

      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notificationIds.includes(notif._id)
              ? { ...notif, isRead: true }
              : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - notificationIds.length),
        }));
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
          unreadCount: 0,
        }));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        set((state) => {
          const notification = state.notifications.find(n => n._id === notificationId);
          return {
            notifications: state.notifications.filter(n => n._id !== notificationId),
            unreadCount: notification && !notification.isRead 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          };
        });
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  },

  // Clear all notifications from store
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
